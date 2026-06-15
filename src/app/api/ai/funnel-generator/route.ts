import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateFunnel } from "@/lib/ai/funnel-generator";
import type { Objetivo } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { objetivo } = (await request.json().catch(() => ({}))) as { objetivo?: Objetivo };

  const { data: prof } = await supabase
    .from("professionals")
    .select("nome, especialidade")
    .eq("id", user.id)
    .single();

  try {
    const result = await generateFunnel({
      nome: prof?.nome ?? "",
      especialidade: prof?.especialidade ?? "",
      objetivo: objetivo ?? "agendar",
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "falha na IA" },
      { status: 502 },
    );
  }
}
