import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/features";
import { getConnectionByProfessional } from "@/lib/data/instagram";
import { sendMessage } from "@/lib/integrations/meta";

/**
 * Envia uma resposta manual (atendente humano) numa conversa de DM.
 * Usa a tag HUMAN_AGENT para permitir resposta dentro da janela de 7 dias.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: prof } = await supabase
    .from("professionals")
    .select("plano, feature_flags")
    .eq("id", user.id)
    .single();
  if (!prof || !hasFeature({ plano: prof.plano, featureFlags: prof.feature_flags ?? {} }, "automacoes")) {
    return NextResponse.json({ error: "Recurso não habilitado." }, { status: 403 });
  }

  const { recipientId, text } = (await request.json().catch(() => ({}))) as {
    recipientId?: string;
    text?: string;
  };
  if (!recipientId || !text?.trim()) {
    return NextResponse.json({ error: "Mensagem ou destinatário ausente." }, { status: 400 });
  }

  const conn = await getConnectionByProfessional(user.id);
  if (!conn) return NextResponse.json({ error: "Instagram não conectado." }, { status: 400 });

  try {
    await sendMessage(recipientId, text.trim(), conn.access_token, true);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "falha ao enviar" }, { status: 502 });
  }
}
