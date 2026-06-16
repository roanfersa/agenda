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

export type AdminData = {
  otherPros: OtherPro[];
  subscriptions: Subscription[];
  setups: SetupTask[];
  lgpdRequests: LgpdRequest[];
  consentLogs: ConsentLog[];
  internalUsers: InternalUser[];
  auditLog: AuditEntry[];
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
  const [pros, subs, leads, setups, lgpd, consent, team, audit] = await Promise.all([
    db.from("professionals").select("id, nome, handle_instagram, especialidade, plano, google_calendar, criado_em"),
    db.from("subscriptions").select("*"),
    db.from("leads").select("professional_id"),
    db.from("setup_tasks").select("*"),
    db.from("lgpd_requests").select("*").order("criado_em", { ascending: false }),
    db.from("consent_log").select("*"),
    db.from("internal_users").select("*"),
    db.from("audit_log").select("*").order("data_hora", { ascending: false }),
  ]);

  const nomePorPro = new Map((pros.data ?? []).map((p) => [p.id, p.nome]));
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
  };
}
