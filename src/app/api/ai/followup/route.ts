import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { draftFollowup } from "@/lib/ai/followup";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { leadId } = (await request.json().catch(() => ({}))) as { leadId?: string };
  if (!leadId) return NextResponse.json({ error: "leadId obrigatório" }, { status: 400 });

  const [{ data: prof }, { data: lead }] = await Promise.all([
    supabase.from("professionals").select("nome, especialidade").eq("id", user.id).single(),
    supabase
      .from("leads")
      .select("nome, resumo_ia, respostas")
      .eq("id", leadId)
      .eq("professional_id", user.id)
      .single(),
  ]);
  if (!lead) return NextResponse.json({ error: "lead não encontrado" }, { status: 404 });

  const texto = await draftFollowup({
    leadNome: lead.nome,
    profNome: prof?.nome ?? "",
    especialidade: prof?.especialidade ?? "",
    resumo: lead.resumo_ia,
    respostas: lead.respostas,
  });

  return NextResponse.json({ texto });
}
