import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nextChatTurn, type ChatTurn } from "@/lib/ai/funnel-chat";
import { hasFeature } from "@/lib/features";
import { getPreset } from "@/lib/flow-presets";
import type { FlowPreset, Produto, Question } from "@/lib/types";

/**
 * Turno do funil conversacional (público). Carrega o funil por slug via service
 * role, valida que está publicado e que o dono tem a flag chat_ia, e devolve o
 * próximo turno do bot.
 */
export async function POST(request: Request) {
  const { slug, history, preview } = (await request.json().catch(() => ({}))) as {
    slug?: string;
    history?: ChatTurn[];
    preview?: boolean;
  };
  if (!slug) return NextResponse.json({ error: "slug obrigatório" }, { status: 400 });

  const db = createAdminClient();
  let q = db.from("funnels").select("*").eq("slug", slug);
  if (!preview) q = q.eq("status", "publicado");
  const { data: funnel } = await q.single();
  if (!funnel) return NextResponse.json({ error: "funil indisponível" }, { status: 404 });

  const { data: prof } = await db
    .from("professionals")
    .select("nome, especialidade, plano, feature_flags, whatsapp")
    .eq("id", funnel.professional_id)
    .single();
  if (!prof) return NextResponse.json({ error: "indisponível" }, { status: 404 });

  if (!hasFeature({ plano: prof.plano, featureFlags: prof.feature_flags ?? {} }, "chat_ia")) {
    return NextResponse.json({ error: "chat_indisponivel" }, { status: 403 });
  }

  const preset = getPreset(funnel.flow_preset as FlowPreset);
  const perguntas = (funnel.perguntas as Question[]) ?? [];
  const reply = await nextChatTurn({
    nome: prof.nome ?? "",
    especialidade: prof.especialidade ?? "",
    objetivo: funnel.objetivo,
    permiteAgendar: preset.recomendacao === "agendar" || funnel.objetivo === "agendar",
    produtos: (funnel.produtos as Produto[]) ?? [],
    perguntasBase: perguntas.map((p) => p.texto),
    history: history ?? [],
  });

  return NextResponse.json(reply);
}
