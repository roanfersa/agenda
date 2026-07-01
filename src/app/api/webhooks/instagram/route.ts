import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  replyToComment,
  sendPrivateReply,
  verifySignature,
} from "@/lib/integrations/meta";
import { claimEvent, getConnectionByIgUserId } from "@/lib/data/instagram";

/** Verificação do webhook (Meta envia um GET com hub.challenge). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("forbidden", { status: 403 });
}

type CommentChange = {
  field: string;
  value: { id: string; text?: string; from?: { id: string; username?: string }; media?: { id: string } };
};
type Entry = { id: string; changes?: CommentChange[] };

function matchKeyword(text: string, keywords: string[]): boolean {
  const t = (text || "").toLowerCase();
  return keywords.some((k) => k && t.includes(k.toLowerCase()));
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-hub-signature-256"))) {
    console.warn("[IG webhook] assinatura inválida — verifique o App Secret");
    return new Response("invalid signature", { status: 401 });
  }

  let body: { object?: string; entry?: Entry[] };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("bad request", { status: 400 });
  }

  const db = createAdminClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  for (const entry of body.entry ?? []) {
    const igUserId = entry.id;
    for (const change of entry.changes ?? []) {
      if (change.field !== "comments") continue;
      const c = change.value;
      const commentId = c.id;
      const text = c.text ?? "";
      // Ignora os próprios comentários (evita loop).
      if (!commentId || c.from?.id === igUserId) continue;

      const conn = await getConnectionByIgUserId(igUserId);
      if (!conn) {
        console.warn("[IG webhook] sem conexão para igUserId", igUserId);
        continue;
      }

      // Idempotência: processa cada comentário uma vez.
      if (!(await claimEvent(commentId, conn.professional_id))) continue;

      // Automações ativas do profissional.
      const { data: autos } = await db
        .from("automations")
        .select("*")
        .eq("professional_id", conn.professional_id)
        .eq("ativa", true);

      // Casa por palavra-chave e, quando a automação tem post definido, pelo post.
      const mediaId = c.media?.id;
      const auto = (autos ?? []).find(
        (a) =>
          matchKeyword(text, (a.keywords as string[]) ?? []) &&
          (!a.post_id || a.post_id === mediaId),
      );
      console.log("[IG webhook] comments recebido, mediaId=", mediaId, "→", auto ? "casou" : "não casou");
      if (!auto) continue;

      // Link do funil pra mandar no DM.
      let slug: string | null = null;
      if (auto.funnel_id) {
        const { data: f } = await db.from("funnels").select("slug").eq("id", auto.funnel_id).maybeSingle();
        slug = f?.slug ?? null;
      }
      if (!slug) {
        const { data: f } = await db
          .from("funnels")
          .select("slug")
          .eq("professional_id", conn.professional_id)
          .eq("status", "publicado")
          .limit(1)
          .maybeSingle();
        slug = f?.slug ?? null;
      }
      const link = slug ? `${site}/f/${slug}` : site;
      const dm = `${auto.dm_mensagem}\n\n${link}`;

      try {
        if (auto.resposta_publica && auto.resposta_publica_texto) {
          await replyToComment(commentId, auto.resposta_publica_texto, conn.access_token);
        }
        await sendPrivateReply(igUserId, commentId, dm, conn.access_token);
        console.log("[IG webhook] resposta pública + DM enviadas ✓");
        const stats = (auto.stats as { comentarios: number; dms: number; leads: number }) ?? {
          comentarios: 0,
          dms: 0,
          leads: 0,
        };
        await db
          .from("automations")
          .update({ stats: { ...stats, comentarios: stats.comentarios + 1, dms: stats.dms + 1 } })
          .eq("id", auto.id);
      } catch (e) {
        // Não falha o webhook: Meta reentrega; idempotência já registrou.
        console.error("[IG webhook] falha ao responder/DM", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
