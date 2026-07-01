import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Period = "7" | "30" | "all";

/** Painel de análises do profissional autenticado. RLS filtra por dono. */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const url = new URL(request.url);
  const periodParam = url.searchParams.get("period");
  const period: Period = periodParam === "30" ? "30" : periodParam === "all" ? "all" : "7";

  let desde: string | null = null;
  if (period !== "all") {
    const dias = period === "30" ? 30 : 7;
    desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
  }

  let evQ = supabase.from("events").select("tipo, recurso_id, funnel_id, fonte, criado_em");
  let leadQ = supabase.from("leads").select("funnel_id, recurso_id, fonte, origem, criado_em");
  if (desde) {
    evQ = evQ.gte("criado_em", desde);
    leadQ = leadQ.gte("criado_em", desde);
  }

  const [{ data: events }, { data: leads }] = await Promise.all([evQ, leadQ]);
  const evs = events ?? [];
  const lds = leads ?? [];

  const views = evs.filter((e) => e.tipo === "view").length;
  const cliques = evs.filter((e) => e.tipo === "click").length;
  const totalLeads = lds.length;
  const conversao = views > 0 ? totalLeads / views : 0;

  // Cliques por recurso.
  const cliquesRec = new Map<string, number>();
  for (const e of evs) {
    if (e.tipo === "click" && e.recurso_id) {
      cliquesRec.set(e.recurso_id, (cliquesRec.get(e.recurso_id) ?? 0) + 1);
    }
  }
  const cliquesPorRecurso = [...cliquesRec.entries()]
    .map(([recursoId, c]) => ({ recursoId, cliques: c }))
    .sort((a, b) => b.cliques - a.cliques);

  // Conversão por funil (views x leads).
  const viewsFunil = new Map<string, number>();
  for (const e of evs) {
    if (e.tipo === "view" && e.funnel_id) {
      viewsFunil.set(e.funnel_id, (viewsFunil.get(e.funnel_id) ?? 0) + 1);
    }
  }
  const leadsFunil = new Map<string, number>();
  for (const l of lds) {
    if (l.funnel_id) leadsFunil.set(l.funnel_id, (leadsFunil.get(l.funnel_id) ?? 0) + 1);
  }
  const funnelIds = new Set<string>([...viewsFunil.keys(), ...leadsFunil.keys()]);
  const conversaoPorFunil = [...funnelIds]
    .map((funnelId) => {
      const v = viewsFunil.get(funnelId) ?? 0;
      const lo = leadsFunil.get(funnelId) ?? 0;
      return { funnelId, views: v, leads: lo, taxa: v > 0 ? lo / v : 0 };
    })
    .sort((a, b) => b.leads - a.leads);

  // Conversão por recurso (leads atribuídos a um recurso).
  const leadsRec = new Map<string, number>();
  for (const l of lds) {
    if (l.recurso_id) leadsRec.set(l.recurso_id, (leadsRec.get(l.recurso_id) ?? 0) + 1);
  }
  const conversaoPorRecurso = [...leadsRec.entries()]
    .map(([recursoId, lo]) => ({ recursoId, leads: lo }))
    .sort((a, b) => b.leads - a.leads);

  // Origem dos leads (por origem "instagram/link" e por fonte).
  const origemMap = new Map<string, number>();
  for (const l of lds) {
    const orig = l.origem || "link";
    origemMap.set(orig, (origemMap.get(orig) ?? 0) + 1);
    if (l.fonte) origemMap.set(l.fonte, (origemMap.get(l.fonte) ?? 0) + 1);
  }
  const origemLeads = [...origemMap.entries()]
    .map(([chave, lo]) => ({ chave, leads: lo }))
    .sort((a, b) => b.leads - a.leads);

  return NextResponse.json({
    totais: { views, cliques, leads: totalLeads, conversao },
    cliquesPorRecurso,
    conversaoPorFunil,
    conversaoPorRecurso,
    origemLeads,
  });
}
