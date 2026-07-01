import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AuditEntry,
  ConsentLog,
  InternalUser,
  LgpdRequest,
  OtherPro,
  ProStatus,
  SetupTask,
  Subscription,
} from "@/lib/types";

export type AdminAlerta = {
  professionalId: string;
  tone: "danger" | "amber" | "info";
  icon: string;
  title: string;
  label: string;
};

export type AdminData = {
  otherPros: OtherPro[];
  subscriptions: Subscription[];
  setups: SetupTask[];
  lgpdRequests: LgpdRequest[];
  consentLogs: ConsentLog[];
  internalUsers: InternalUser[];
  auditLog: AuditEntry[];
  /** Overrides de feature flags por profissional (proId → flags). */
  proFlags: Record<string, Record<string, boolean>>;
  /** MRR: soma das assinaturas ativas normalizada por mês (arredondada). */
  mrr: number;
  /** Contagem de profissionais criados por mês nos últimos 12 meses. */
  crescimento: { valores: number[]; meses: string[] };
  /** professionalId → nº de appointments. */
  agendadosPorPro: Record<string, number>;
  /** Alertas operacionais derivados de dados reais. */
  alertas: AdminAlerta[];
};

const subToProStatus = (s?: string): ProStatus =>
  s === "atrasado" ? "inadimplente" : s === "cancelado" ? "cancelado" : s === "trial" ? "trial" : "ativo";

/**
 * Carrega os dados globais do painel admin. Só retorna se o usuário logado for
 * interno (is_internal). Usa service role para ler entre tenants.
 */
export async function getAdminBootstrap(): Promise<AdminData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: interno } = await supabase.rpc("is_internal");
  if (!interno) return null;

  const db = createAdminClient();
  const [pros, subs, leads, appts, setups, lgpd, consent, team, audit] = await Promise.all([
    db.from("professionals").select("id, nome, handle_instagram, especialidade, plano, google_calendar, feature_flags, criado_em"),
    db.from("subscriptions").select("*"),
    db.from("leads").select("professional_id, criado_em"),
    db.from("appointments").select("professional_id"),
    db.from("setup_tasks").select("*"),
    db.from("lgpd_requests").select("*").order("criado_em", { ascending: false }),
    db.from("consent_log").select("*"),
    db.from("internal_users").select("*"),
    db.from("audit_log").select("*").order("data_hora", { ascending: false }),
  ]);

  const nomePorPro = new Map((pros.data ?? []).map((p) => [p.id, p.nome]));
  const proFlags: Record<string, Record<string, boolean>> = {};
  for (const p of pros.data ?? []) proFlags[p.id] = p.feature_flags ?? {};
  const subPorPro = new Map((subs.data ?? []).map((s) => [s.professional_id, s]));
  const leadsPorPro = new Map<string, number>();
  for (const l of leads.data ?? [])
    leadsPorPro.set(l.professional_id, (leadsPorPro.get(l.professional_id) ?? 0) + 1);

  const otherPros: OtherPro[] = (pros.data ?? []).map((p) => ({
    id: p.id,
    nome: p.nome,
    handleInstagram: p.handle_instagram,
    especialidade: p.especialidade,
    plano: p.plano,
    status: subToProStatus(subPorPro.get(p.id)?.status),
    agenda: Boolean(p.google_calendar?.conectado),
    leads: leadsPorPro.get(p.id) ?? 0,
    criadoEm: p.criado_em,
  }));

  const subscriptions: Subscription[] = (subs.data ?? []).map((s) => ({
    id: s.id,
    professionalId: s.professional_id,
    nome: nomePorPro.get(s.professional_id) ?? "",
    plano: s.plano,
    valor: s.valor,
    ciclo: s.ciclo,
    proximoVencimento: s.current_period_end
      ? new Date(s.current_period_end).toLocaleDateString("pt-BR")
      : "—",
    status: s.status === "trial" ? "em_dia" : s.status,
  }));

  // MRR: assinaturas ativas/em_dia normalizadas por mês.
  const ativa = (st?: string) => st === "ativo" || st === "em_dia" || st === "trial";
  const mrr = Math.round(
    (subs.data ?? []).reduce((acc, s) => {
      if (!ativa(s.status)) return acc;
      const v = Number(s.valor) || 0;
      if (s.ciclo === "anual") return acc + v / 12;
      if (s.ciclo === "unico") return acc; // única vez não entra no recorrente
      return acc + v;
    }, 0),
  );

  // Crescimento: profissionais criados por mês, últimos 12 meses.
  const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const agora = new Date();
  const bucketKeys: string[] = [];
  const crescMeses: string[] = [];
  const crescMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    bucketKeys.push(key);
    crescMeses.push(MESES_ABREV[d.getMonth()]);
    crescMap.set(key, 0);
  }
  for (const p of pros.data ?? []) {
    if (!p.criado_em) continue;
    const d = new Date(p.criado_em);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (crescMap.has(key)) crescMap.set(key, (crescMap.get(key) ?? 0) + 1);
  }
  const crescValores = bucketKeys.map((k) => crescMap.get(k) ?? 0);

  // Agendados por pro: contagem real de appointments.
  const agendadosPorPro: Record<string, number> = {};
  for (const a of appts.data ?? [])
    if (a.professional_id) agendadosPorPro[a.professional_id] = (agendadosPorPro[a.professional_id] ?? 0) + 1;

  // Leads recentes (últimos 30 dias) por pro, para alerta de churn.
  const limiteRecente = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
  const leadsRecentesPorPro = new Set<string>();
  for (const l of leads.data ?? []) {
    if (!l.professional_id) continue;
    const d = l.criado_em ? new Date(l.criado_em) : null;
    if (d && !Number.isNaN(d.getTime()) && d >= limiteRecente) leadsRecentesPorPro.add(l.professional_id);
  }

  // Alertas derivados de dados reais.
  const alertas: AdminData["alertas"] = [];
  for (const s of subs.data ?? []) {
    if (s.status === "atrasado") {
      const nome = nomePorPro.get(s.professional_id) ?? "Profissional";
      alertas.push({
        professionalId: s.professional_id,
        tone: "danger",
        icon: "card",
        title: "Pagamento em atraso",
        label: `${nome} · R$${Number(s.valor) || 0}`,
      });
    }
  }
  for (const p of otherPros) {
    if (!p.agenda) {
      alertas.push({
        professionalId: p.id,
        tone: "amber",
        icon: "calendar",
        title: "Sem agenda conectada",
        label: p.nome,
      });
    }
  }
  for (const p of otherPros) {
    if (p.status === "ativo" && !leadsRecentesPorPro.has(p.id)) {
      alertas.push({
        professionalId: p.id,
        tone: "info",
        icon: "funnel",
        title: "Sem leads recentes",
        label: `${p.nome} · risco de churn`,
      });
    }
  }

  const setupTasks: SetupTask[] = (setups.data ?? []).map((t) => ({
    id: t.id,
    professionalId: t.professional_id,
    nome: nomePorPro.get(t.professional_id) ?? "",
    especialidade: "",
    responsavelId: t.responsavel_id,
    responsavel: t.responsavel,
    status: t.status,
    valor: t.valor,
    criadoEm: t.criado_em,
  }));

  return {
    otherPros,
    subscriptions,
    setups: setupTasks,
    lgpdRequests: (lgpd.data ?? []).map((r) => ({
      id: r.id,
      leadNome: r.lead_nome,
      professionalNome: r.professional_nome,
      tipo: r.tipo,
      status: r.status,
      prazo: r.prazo,
      criadoEm: r.criado_em,
    })),
    consentLogs: (consent.data ?? []).map((c) => ({
      id: c.id,
      leadNome: c.lead_nome,
      professionalNome: c.professional_nome,
      dataHora: c.data_hora,
      texto: c.texto,
    })),
    internalUsers: (team.data ?? []).map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      papel: u.papel,
    })),
    auditLog: (audit.data ?? []).map((a) => ({
      id: a.id,
      internalUser: a.internal_user,
      acao: a.acao,
      dataHora: new Date(a.data_hora).toLocaleString("pt-BR"),
    })),
    proFlags,
    mrr,
    crescimento: { valores: crescValores, meses: crescMeses },
    agendadosPorPro,
    alertas,
  };
}
