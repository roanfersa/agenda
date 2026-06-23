"use client";

import { create } from "zustand";
import type {
  Appointment,
  AuditEntry,
  Automation,
  ConsentLog,
  Disponibilidade,
  Funnel,
  InternalUser,
  Lead,
  LgpdRequest,
  Notification,
  Objetivo,
  ObjetivoDef,
  OtherPro,
  Professional,
  Resposta,
  SetupStatus,
  SetupTask,
  Subscription,
  Toast,
} from "./types";
import type { BootstrapData } from "./data/bootstrap";
import type { AdminData } from "./data/admin-bootstrap";
import { resolveLgpdAction, advanceSetupAction } from "./actions/admin";
import {
  saveFunnelAction,
  createFunnelAction,
  deleteFunnelAction,
} from "./actions/funnels";
import { updateLeadAction, markLeadReadAction, markNotifsReadAction } from "./actions/leads";
import {
  saveAutomationAction,
  toggleAutomationAction,
} from "./actions/automations";
import {
  updateProfessionalAction,
  setCalendarAction,
  completeOnboardingAction,
} from "./actions/professional";

let _uid = 0;
/** Id curto para entidades efêmeras (toasts, notificações locais). */
export const uid = (p: string) =>
  `${p}_${Date.now().toString(36)}_${(_uid++).toString(36)}`;

/** UUID v4 para entidades persistidas no Supabase (funis, automações). */
export const uuid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : uid("id");

const nowClock = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
};

// Dispara a action no servidor e mostra toast em caso de erro (fire-and-forget).
function persist(
  promise: Promise<{ error: string | null }>,
  onError?: (msg: string) => void,
) {
  promise
    .then((r) => {
      if (r?.error && onError) onError("Não foi possível salvar. Tente de novo.");
    })
    .catch(() => onError?.("Erro de conexão ao salvar."));
}

// ---- Objetivos (fonte única de verdade) ----------------------------------
export const OBJETIVOS: ObjetivoDef[] = [
  { id: "agendar", icon: "calendar", titulo: "Agendar", curto: "Agendar", beneficio: "Encher a agenda com horários marcados", desc: "A pessoa sai com o horário marcado.", exemplo: "Consultas, sessões, avaliações", cta: "Marcar horário", sched: true },
  { id: "qualificar", icon: "target", titulo: "Qualificar pra vender (SDR)", curto: "SDR", beneficio: "Falar só com quem tá pronto pra fechar", desc: "Filtra e encaminha o lead quente pro time de vendas.", exemplo: "Serviços, B2B, alto ticket", cta: "Falar com o time", sched: false },
  { id: "capturar", icon: "whatsapp", titulo: "Capturar contato", curto: "Capturar", beneficio: "Pegar o contato pra não perder ninguém", desc: "Pega o contato e continua a conversa no WhatsApp.", exemplo: "Dúvidas, lista de interesse", cta: "Falar no WhatsApp", sched: false },
];

export const OBJ = (id?: Objetivo) =>
  OBJETIVOS.find((o) => o.id === id) || OBJETIVOS[0];

export const inferObjetivo = (texto: string): Objetivo => {
  const t = (texto || "").toLowerCase();
  if (
    /(atend|paciente|consulta|sessão|sessao|terapia|psic|clínic|clinic|estétic|estetic|massag|fisio|nutri|odonto|dentista|médic|medic|avaliaç|consultório)/.test(
      t,
    )
  )
    return "agendar";
  if (
    /(vend|venda|orçament|orcament|consultoria|serviço|servico|b2b|empresa|projeto|orç|fech)/.test(
      t,
    )
  )
    return "qualificar";
  return "capturar";
};

// ---- Defaults vazios (pré-hidratação) ------------------------------------
const emptyProfessional: Professional = {
  id: "",
  nome: "",
  handleInstagram: "",
  especialidade: "",
  atende: "",
  fotoUrl: null,
  cor: "#0E8A6B",
  whatsapp: "",
  googleCalendar: { conectado: false, email: "", calendarId: "" },
  plano: "entrada",
  avisos: { email: true, push: true },
  consentimentoTextoPadrao: "",
  featureFlags: {},
  criadoEm: "",
};

const emptyFunnel: Funnel = {
  id: "",
  professionalId: "",
  slug: "",
  nome: "",
  uso: "",
  objetivo: "agendar",
  metodo: "ia",
  modo: "ambos",
  camposContato: { email: true, whatsapp: true },
  contatoQuando: "fim",
  contexto: [],
  mensagemBoasVindas: "",
  perguntas: [],
  consentimentoTexto: "",
  status: "rascunho",
  criadoEm: "",
};

// ---- Zustand store --------------------------------------------------------
type State = {
  loaded: boolean;
  professional: Professional;
  funnel: Funnel;
  funnels: Funnel[];
  activeFunnelId: string;
  notifications: Notification[];
  automations: Automation[];
  disponibilidade: Disponibilidade[];
  leads: Lead[];
  appointments: Appointment[];
  otherPros: OtherPro[];
  subscriptions: Subscription[];
  setups: SetupTask[];
  lgpdRequests: LgpdRequest[];
  consentLogs: ConsentLog[];
  internalUsers: InternalUser[];
  auditLog: AuditEntry[];
  proFlags: Record<string, Record<string, boolean>>;
  onboardingDone: boolean;
  toastMsg: Toast;
};

type Actions = {
  hydrate: (data: BootstrapData) => void;
  hydrateAdmin: (data: AdminData) => void;
  addLeadFromFunnel: (input: {
    nome: string;
    whatsapp: string;
    email?: string;
    respostas: Resposta[];
    resumoIA: string;
    agendamento?: {
      dia: string;
      dataHora: string;
      hora: string;
      tipo: string;
      modalidade: "online" | "presencial";
    } | null;
    origem?: "instagram" | "link";
    funnelId?: string;
  }) => string;
  markNotifsRead: () => void;
  toggleAviso: (key: "email" | "push") => void;
  toggleAutomation: (id: string) => void;
  saveAutomation: (rule: Automation) => void;
  captureComment: (autoId: string) => void;
  updateFunnel: (patch: Partial<Funnel>) => void;
  setActiveFunnel: (id: string) => void;
  addFunnel: (f: Partial<Funnel>) => string;
  toggleFunnelStatus: (id: string) => void;
  deleteFunnel: (id: string) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  updateProfessional: (patch: Partial<Professional>) => void;
  finishOnboarding: (patch: Partial<Professional>) => void;
  connectCalendar: (email?: string) => void;
  disconnectCalendar: () => void;
  markLeadRead: (id: string) => void;
  resolveLgpd: (id: string) => void;
  advanceSetup: (id: string, status: SetupStatus) => void;
  toast: (msg: string) => void;
  reset: () => void;
};

const initialState: State = {
  loaded: false,
  professional: emptyProfessional,
  funnel: emptyFunnel,
  funnels: [],
  activeFunnelId: "",
  notifications: [],
  automations: [],
  disponibilidade: [],
  leads: [],
  appointments: [],
  otherPros: [],
  subscriptions: [],
  setups: [],
  lgpdRequests: [],
  consentLogs: [],
  internalUsers: [],
  auditLog: [],
  proFlags: {},
  onboardingDone: false,
  toastMsg: null,
};

export const useStore = create<State & Actions>()((set, get) => ({
  ...initialState,

  hydrate: (data) =>
    set({
      loaded: true,
      professional: data.professional,
      funnels: data.funnels,
      funnel: data.funnels.find((f) => f.id === data.activeFunnelId) || data.funnels[0] || emptyFunnel,
      activeFunnelId: data.activeFunnelId,
      leads: data.leads,
      appointments: data.appointments,
      automations: data.automations,
      notifications: data.notifications,
      disponibilidade: data.disponibilidade,
      subscriptions: data.subscription ? [data.subscription] : [],
      onboardingDone: data.onboardingDone,
    }),

  hydrateAdmin: (data) =>
    set({
      otherPros: data.otherPros,
      subscriptions: data.subscriptions,
      setups: data.setups,
      lgpdRequests: data.lgpdRequests,
      consentLogs: data.consentLogs,
      internalUsers: data.internalUsers,
      auditLog: data.auditLog,
      proFlags: data.proFlags,
    }),

  // Uso interno (preview no app). O funil público persiste via /api/lead.
  addLeadFromFunnel: ({
    nome,
    whatsapp,
    email,
    respostas,
    resumoIA,
    agendamento,
    origem = "link",
    funnelId,
  }) => {
    const leadId = uid("lead");
    const pid = get().professional.id;
    const status: Lead["status"] = agendamento ? "agendado" : "novo";
    const dataHora = `${new Date().toLocaleDateString("pt-BR")} ${nowClock()}`;
    const lead: Lead = {
      id: leadId,
      professionalId: pid,
      funnelId: funnelId || get().activeFunnelId,
      nome,
      whatsapp,
      email,
      respostas,
      resumoIA,
      status,
      consentimento: { dado: true, dataHora },
      origem,
      criadoEm: "Agora mesmo",
      _t: 999,
      _novo: true,
    };
    set((s) => {
      const next: Partial<State> = { leads: [lead, ...s.leads] };
      if (agendamento) {
        next.appointments = [
          ...s.appointments,
          {
            id: uid("apt"),
            leadId,
            professionalId: pid,
            diaRotulo: agendamento.dia,
            dataHora: agendamento.dataHora,
            hora: agendamento.hora,
            tipoAtendimento: agendamento.tipo,
            modalidade: agendamento.modalidade,
            status: "confirmado",
          },
        ];
      }
      next.notifications = [
        {
          id: uid("ntf"),
          leadId,
          nome,
          texto: agendamento ? `marcou ${agendamento.dia}, ${agendamento.hora}` : "entrou pelo seu funil",
          canais: "app",
          quando: "Agora mesmo",
          lida: false,
        },
        ...s.notifications,
      ];
      return next as State;
    });
    get().toast(`🔔 Lead novo: ${nome.split(" ")[0]}`);
    return leadId;
  },

  markNotifsRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, lida: true })) }));
    persist(markNotifsReadAction());
  },

  toggleAviso: (key) => {
    const avisos = { ...get().professional.avisos, [key]: !get().professional.avisos[key] };
    set((s) => ({ professional: { ...s.professional, avisos } }));
    persist(updateProfessionalAction({ avisos }), get().toast);
  },

  toggleAutomation: (id) => {
    const cur = get().automations.find((a) => a.id === id);
    const ativa = !cur?.ativa;
    set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, ativa } : a)) }));
    persist(toggleAutomationAction(id, ativa), get().toast);
  },

  saveAutomation: (rule) => {
    const exists = get().automations.some((a) => a.id === rule.id);
    const final = exists ? rule : { ...rule, id: uuid() };
    set((s) => ({
      automations: exists
        ? s.automations.map((a) => (a.id === rule.id ? rule : a))
        : [final, ...s.automations],
    }));
    persist(saveAutomationAction(final, !exists), get().toast);
  },

  captureComment: (autoId) =>
    set((s) => ({
      automations: s.automations.map((a) =>
        a.id === autoId
          ? { ...a, stats: { ...a.stats, comentarios: a.stats.comentarios + 1, dms: a.stats.dms + 1 } }
          : a,
      ),
    })),

  updateFunnel: (patch) => {
    const funnel: Funnel = { ...get().funnel, ...patch };
    set((s) => ({ funnel, funnels: s.funnels.map((f) => (f.id === funnel.id ? funnel : f)) }));
    if (funnel.id) persist(saveFunnelAction(funnel.id, patch), get().toast);
  },

  setActiveFunnel: (id) =>
    set((s) => ({ activeFunnelId: id, funnel: s.funnels.find((f) => f.id === id) || s.funnel })),

  addFunnel: (f) => {
    const pid = get().professional.id;
    const funnel: Funnel = {
      id: uuid(),
      professionalId: pid,
      status: "publicado",
      criadoEm: new Date().toISOString(),
      contexto: [],
      camposContato: { email: true, whatsapp: true },
      contatoQuando: "fim",
      uso: "Outro",
      metodo: "ia",
      modo: "ambos",
      slug: f.slug || `${(get().professional.handleInstagram || "funil").replace(/\W/g, "")}-${Math.random().toString(36).slice(2, 6)}`,
      nome: "Novo funil",
      objetivo: "agendar",
      mensagemBoasVindas: "",
      perguntas: [],
      consentimentoTexto: "",
      ...f,
    } as Funnel;
    set((s) => ({ funnels: [...s.funnels, funnel], funnel, activeFunnelId: funnel.id }));
    persist(createFunnelAction(funnel), get().toast);
    return funnel.id;
  },

  toggleFunnelStatus: (id) => {
    const cur = get().funnels.find((f) => f.id === id);
    const status: Funnel["status"] = cur?.status === "publicado" ? "pausado" : "publicado";
    set((s) => ({ funnels: s.funnels.map((f) => (f.id === id ? { ...f, status } : f)) }));
    persist(saveFunnelAction(id, { status }), get().toast);
  },

  deleteFunnel: (id) => {
    set((s) => {
      const funnels = s.funnels.filter((f) => f.id !== id);
      const active = s.activeFunnelId === id ? funnels[0] : s.funnel;
      return { funnels, activeFunnelId: active?.id ?? "", funnel: active ?? emptyFunnel };
    });
    persist(deleteFunnelAction(id), get().toast);
  },

  updateLead: (id, patch) => {
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    persist(updateLeadAction(id, patch), get().toast);
  },

  updateProfessional: (patch) => {
    set((s) => ({ professional: { ...s.professional, ...patch } }));
    persist(updateProfessionalAction(patch), get().toast);
  },

  finishOnboarding: (patch) => {
    set((s) => ({ professional: { ...s.professional, ...patch }, onboardingDone: true }));
    persist(completeOnboardingAction(patch), get().toast);
  },

  connectCalendar: (email) => {
    set((s) => ({
      professional: {
        ...s.professional,
        googleCalendar: {
          conectado: true,
          email: email || s.professional.googleCalendar.email,
          calendarId: s.professional.googleCalendar.calendarId,
        },
      },
    }));
    persist(setCalendarAction(true, email), get().toast);
  },

  disconnectCalendar: () => {
    set((s) => ({
      professional: { ...s.professional, googleCalendar: { ...s.professional.googleCalendar, conectado: false } },
    }));
    persist(setCalendarAction(false), get().toast);
  },

  markLeadRead: (id) => {
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, _novo: false } : l)) }));
    persist(markLeadReadAction(id));
  },

  resolveLgpd: (id) => {
    set((s) => ({
      lgpdRequests: s.lgpdRequests.map((r) => (r.id === id ? { ...r, status: "concluido" } : r)),
    }));
    persist(resolveLgpdAction(id), get().toast);
  },

  advanceSetup: (id, status) => {
    set((s) => ({ setups: s.setups.map((t) => (t.id === id ? { ...t, status } : t)) }));
    persist(advanceSetupAction(id, status), get().toast);
  },

  toast: (msg) => {
    const id = uid("t");
    set({ toastMsg: { id, msg } });
    setTimeout(() => {
      const cur = get().toastMsg;
      if (cur && cur.id === id) set({ toastMsg: null });
    }, 2600);
  },

  reset: () => set(initialState),
}));

// Selectors
export const leadsFor = (pid: string, all: Lead[]) =>
  all.filter((l) => l.professionalId === pid);
export const apptFor = (pid: string, all: Appointment[]) =>
  all.filter((a) => a.professionalId === pid);
export const leadById = (id: string, all: Lead[]) =>
  all.find((l) => l.id === id);
export const apptByLead = (id: string, all: Appointment[]) =>
  all.find((a) => a.leadId === id);

// Helpers
export const fmtWhats = (raw: string) => {
  const d = (raw || "").replace(/\D/g, "");
  if (d.length < 12) return raw;
  const cc = d.slice(0, 2);
  const ddd = d.slice(2, 4);
  const p1 = d.slice(4, 9);
  const p2 = d.slice(9, 13);
  return `+${cc} (${ddd}) ${p1}-${p2}`;
};

export const waLink = (whats: string, text: string) =>
  `https://wa.me/${(whats || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export const initials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
};
