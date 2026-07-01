/**
 * Conversão entre as linhas do banco (snake_case) e os tipos da app
 * (camelCase em src/lib/types.ts). Mantém a UI inalterada.
 */
import {
  DEFAULT_THEME,
  type Appointment,
  type Automation,
  type Disponibilidade,
  type Funnel,
  type Lead,
  type Notification,
  type Professional,
  type Subscription,
} from "../types";
import type {
  AppointmentRow,
  AutomationRow,
  AvailabilityRow,
  FunnelRow,
  LeadRow,
  NotificationRow,
  ProfessionalRow,
  SubscriptionRow,
} from "./types";

export const toProfessional = (r: ProfessionalRow): Professional => ({
  id: r.id,
  nome: r.nome,
  handleInstagram: r.handle_instagram,
  especialidade: r.especialidade,
  atende: r.atende,
  fotoUrl: r.foto_url,
  cor: r.cor,
  whatsapp: r.whatsapp,
  googleCalendar: r.google_calendar,
  agendaMetodo: (r.agenda_metodo as "nativa" | "google" | "calendly") ?? "nativa",
  calendlyUrl: r.calendly_url ?? "",
  plano: r.plano,
  trialEndsAt: r.trial_ends_at ?? undefined,
  avisos: r.avisos,
  consentimentoTextoPadrao: r.consentimento_texto_padrao,
  featureFlags: r.feature_flags ?? {},
  produtos: r.produtos ?? [],
  materiais: r.materiais ?? [],
  criadoEm: r.criado_em,
});

export const fromProfessional = (
  p: Partial<Professional>,
): Partial<ProfessionalRow> => ({
  ...(p.nome !== undefined && { nome: p.nome }),
  ...(p.handleInstagram !== undefined && { handle_instagram: p.handleInstagram }),
  ...(p.especialidade !== undefined && { especialidade: p.especialidade }),
  ...(p.atende !== undefined && { atende: p.atende }),
  ...(p.fotoUrl !== undefined && { foto_url: p.fotoUrl }),
  ...(p.cor !== undefined && { cor: p.cor }),
  ...(p.whatsapp !== undefined && { whatsapp: p.whatsapp }),
  ...(p.googleCalendar !== undefined && { google_calendar: p.googleCalendar }),
  ...(p.agendaMetodo !== undefined && { agenda_metodo: p.agendaMetodo }),
  ...(p.calendlyUrl !== undefined && { calendly_url: p.calendlyUrl }),
  ...(p.plano !== undefined && { plano: p.plano }),
  ...(p.trialEndsAt !== undefined && { trial_ends_at: p.trialEndsAt }),
  ...(p.avisos !== undefined && { avisos: p.avisos }),
  ...(p.consentimentoTextoPadrao !== undefined && {
    consentimento_texto_padrao: p.consentimentoTextoPadrao,
  }),
  ...(p.produtos !== undefined && { produtos: p.produtos }),
  ...(p.materiais !== undefined && { materiais: p.materiais }),
});

export const toFunnel = (r: FunnelRow): Funnel => ({
  id: r.id,
  professionalId: r.professional_id,
  slug: r.slug,
  nome: r.nome,
  uso: r.uso,
  objetivo: r.objetivo,
  metodo: r.metodo,
  modo: r.modo,
  camposContato: r.campos_contato,
  contatoQuando: r.contato_quando,
  contexto: r.contexto,
  mensagemBoasVindas: r.mensagem_boas_vindas,
  perguntas: r.perguntas,
  consentimentoTexto: r.consentimento_texto,
  status: r.status,
  pageMode: (r.page_mode as "pagina" | "conversa") ?? "conversa",
  flowPreset: r.flow_preset ?? "bio_quiz",
  theme: { ...DEFAULT_THEME, ...(r.theme ?? {}) },
  blocks: r.blocks ?? [],
  produtos: r.produtos ?? [],
  previewToken: r.preview_token,
  criadoEm: r.criado_em,
});

export const fromFunnel = (f: Partial<Funnel>): Partial<FunnelRow> => ({
  ...(f.slug !== undefined && { slug: f.slug }),
  ...(f.nome !== undefined && { nome: f.nome }),
  ...(f.uso !== undefined && { uso: f.uso }),
  ...(f.objetivo !== undefined && { objetivo: f.objetivo }),
  ...(f.metodo !== undefined && { metodo: f.metodo }),
  ...(f.modo !== undefined && { modo: f.modo }),
  ...(f.camposContato !== undefined && { campos_contato: f.camposContato }),
  ...(f.contatoQuando !== undefined && { contato_quando: f.contatoQuando }),
  ...(f.contexto !== undefined && { contexto: f.contexto }),
  ...(f.mensagemBoasVindas !== undefined && {
    mensagem_boas_vindas: f.mensagemBoasVindas,
  }),
  ...(f.perguntas !== undefined && { perguntas: f.perguntas }),
  ...(f.consentimentoTexto !== undefined && {
    consentimento_texto: f.consentimentoTexto,
  }),
  ...(f.status !== undefined && { status: f.status }),
  ...(f.pageMode !== undefined && { page_mode: f.pageMode }),
  ...(f.flowPreset !== undefined && { flow_preset: f.flowPreset }),
  ...(f.theme !== undefined && { theme: f.theme }),
  ...(f.blocks !== undefined && { blocks: f.blocks }),
  ...(f.produtos !== undefined && { produtos: f.produtos }),
});

export const toLead = (r: LeadRow): Lead => ({
  id: r.id,
  professionalId: r.professional_id,
  funnelId: r.funnel_id,
  nome: r.nome,
  whatsapp: r.whatsapp,
  email: r.email ?? undefined,
  respostas: r.respostas,
  resumoIA: r.resumo_ia,
  resumoEditado: r.resumo_editado,
  status: r.status,
  consentimento: r.consentimento,
  origem: r.origem,
  recursoId: r.recurso_id ?? undefined,
  fonte: r.fonte ?? "",
  criadoEm: r.criado_em,
  _t: new Date(r.criado_em).getTime() || 0,
  _novo: r.novo,
});

export const toAppointment = (r: AppointmentRow): Appointment => ({
  id: r.id,
  leadId: r.lead_id,
  professionalId: r.professional_id,
  diaRotulo: r.dia_rotulo,
  dataHora: r.data_hora,
  hora: r.hora,
  tipoAtendimento: r.tipo_atendimento,
  modalidade: r.modalidade,
  status: r.status,
  googleEventId: r.google_event_id ?? undefined,
});

export const toAutomation = (r: AutomationRow): Automation => ({
  id: r.id,
  ativa: r.ativa,
  funnelId: r.funnel_id,
  postId: r.post_id,
  postLegenda: r.post_legenda,
  postTipo: r.post_tipo,
  postEmoji: r.post_emoji,
  keywords: r.keywords,
  respostaPublica: r.resposta_publica,
  respostaPublicaTexto: r.resposta_publica_texto,
  dmMensagem: r.dm_mensagem,
  dmBotao: r.dm_botao,
  stats: r.stats,
});

export const fromAutomation = (
  a: Partial<Automation>,
): Partial<AutomationRow> => ({
  ...(a.ativa !== undefined && { ativa: a.ativa }),
  ...(a.funnelId !== undefined && { funnel_id: a.funnelId }),
  ...(a.postId !== undefined && { post_id: a.postId }),
  ...(a.postLegenda !== undefined && { post_legenda: a.postLegenda }),
  ...(a.postTipo !== undefined && { post_tipo: a.postTipo }),
  ...(a.postEmoji !== undefined && { post_emoji: a.postEmoji }),
  ...(a.keywords !== undefined && { keywords: a.keywords }),
  ...(a.respostaPublica !== undefined && { resposta_publica: a.respostaPublica }),
  ...(a.respostaPublicaTexto !== undefined && {
    resposta_publica_texto: a.respostaPublicaTexto,
  }),
  ...(a.dmMensagem !== undefined && { dm_mensagem: a.dmMensagem }),
  ...(a.dmBotao !== undefined && { dm_botao: a.dmBotao }),
  ...(a.stats !== undefined && { stats: a.stats }),
});

export const toNotification = (r: NotificationRow): Notification => ({
  id: r.id,
  leadId: r.lead_id ?? "",
  nome: r.nome,
  texto: r.texto,
  canais: r.canais,
  quando: r.quando,
  lida: r.lida,
});

export const toSubscription = (r: SubscriptionRow): Subscription => ({
  id: r.id,
  professionalId: r.professional_id,
  nome: "",
  plano: r.plano,
  valor: r.valor,
  ciclo: r.ciclo,
  proximoVencimento: r.current_period_end
    ? new Date(r.current_period_end).toLocaleDateString("pt-BR")
    : "—",
  status: r.status === "trial" ? "em_dia" : r.status,
});

export const toDisponibilidade = (r: AvailabilityRow): Disponibilidade => ({
  id: r.id,
  rotulo: r.rotulo,
  dia: r.dia,
  horarios: r.horarios,
});
