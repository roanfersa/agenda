import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFunnel } from "@/lib/ai/funnel-generator";
import { hasFeature } from "@/lib/features";
import type { Objetivo, Produto } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { objetivo, recursoId } = (await request.json().catch(() => ({}))) as {
    objetivo?: Objetivo;
    recursoId?: string;
  };

  const { data: prof } = await supabase
    .from("professionals")
    .select("nome, especialidade, plano, feature_flags, produtos")
    .eq("id", user.id)
    .single();

  if (!prof || !hasFeature({ plano: prof.plano, featureFlags: prof.feature_flags ?? {} }, "gerar_ia")) {
    return NextResponse.json({ error: "Recurso não habilitado no seu plano." }, { status: 403 });
  }

  const recursos = (prof.produtos ?? []) as Produto[];
  const alvo = recursoId ? recursos.find((r) => r.id === recursoId) : undefined;

  try {
    const result = await generateFunnel({
      nome: prof?.nome ?? "",
      especialidade: prof?.especialidade ?? "",
      objetivo: objetivo ?? "agendar",
      recursos,
      recursoAlvo: alvo?.nome,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "falha na IA" },
      { status: 502 },
    );
  }
}
