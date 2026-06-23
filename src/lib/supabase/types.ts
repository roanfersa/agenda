/**
 * Tipos do banco Supabase (mapeamento snake_case das tabelas).
 * Gerado/mantido à mão a partir de supabase/migrations/0001_initial_schema.sql.
 * Para regenerar a partir do projeto real:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts
 */
import type {
  Objetivo,
  Modo,
  Metodo,
  FunnelStatus,
  LeadStatus,
  Plano,
  SetupStatus,
  LgpdTipo,
  Resposta,
  Question,
  ContextoItem,
  FlowPreset,
  FunnelTheme,
  FunnelBlock,
  Produto,
} from "../types";

type Jsonb = unknown;

export type ProfessionalRow = {
  id: string;
  nome: string;
  handle_instagram: string;
  especialidade: string;
  atende: string;
  foto_url: string | null;
  cor: string;
  whatsapp: string;
  google_calendar: { conectado: boolean; email: string; calendarId: string };
  plano: Plano;
  avisos: { email: boolean; push: boolean };
  consentimento_texto_padrao: string;
  feature_flags: Record<string, boolean>;
  stripe_customer_id: string | null;
  onboarding_done: boolean;
  criado_em: string;
};

export type FunnelRow = {
  id: string;
  professional_id: string;
  slug: string;
  nome: string;
  uso: string;
  objetivo: Objetivo;
  metodo: Metodo;
  modo: Modo;
  campos_contato: { email: boolean; whatsapp: boolean };
  contato_quando: "inicio" | "fim";
  contexto: ContextoItem[];
  mensagem_boas_vindas: string;
  perguntas: Question[];
  consentimento_texto: string;
  status: FunnelStatus;
  flow_preset: FlowPreset;
  theme: Partial<FunnelTheme>;
  blocks: FunnelBlock[];
  produtos: Produto[];
  preview_token: string;
  criado_em: string;
};

export type LeadRow = {
  id: string;
  professional_id: string;
  funnel_id: string;
  nome: string;
  whatsapp: string;
  email: string | null;
  respostas: Resposta[];
  resumo_ia: string;
  resumo_editado: boolean;
  status: LeadStatus;
  consentimento: { dado: boolean; dataHora: string };
  origem: "instagram" | "link";
  novo: boolean;
  criado_em: string;
};

export type AppointmentRow = {
  id: string;
  professional_id: string;
  lead_id: string;
  dia_rotulo: string;
  data_hora: string;
  hora: string;
  tipo_atendimento: string;
  modalidade: "online" | "presencial";
  status: "confirmado" | "cancelado";
  google_event_id: string | null;
  criado_em: string;
};

export type AutomationRow = {
  id: string;
  professional_id: string;
  ativa: boolean;
  post_legenda: string;
  post_tipo: string;
  post_emoji: string;
  keywords: string[];
  resposta_publica: boolean;
  resposta_publica_texto: string;
  dm_mensagem: string;
  dm_botao: string;
  stats: { comentarios: number; dms: number; leads: number };
  criado_em: string;
};

export type NotificationRow = {
  id: string;
  professional_id: string;
  lead_id: string | null;
  nome: string;
  texto: string;
  canais: string;
  quando: string;
  lida: boolean;
  criado_em: string;
};

export type SubscriptionRow = {
  id: string;
  professional_id: string;
  plano: Plano;
  valor: number;
  ciclo: "mensal" | "unico";
  status: "em_dia" | "atrasado" | "cancelado" | "trial";
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  criado_em: string;
};

export type SetupTaskRow = {
  id: string;
  professional_id: string;
  status: SetupStatus;
  valor: number;
  responsavel_id: string | null;
  responsavel: string;
  criado_em: string;
};

export type LgpdRequestRow = {
  id: string;
  professional_id: string | null;
  lead_id: string | null;
  lead_nome: string;
  professional_nome: string;
  tipo: LgpdTipo;
  status: "pendente" | "concluido";
  prazo: string;
  criado_em: string;
};

export type AvailabilityRow = {
  id: string;
  professional_id: string;
  rotulo: string;
  dia: string;
  horarios: string[];
};

/** Helper: monta a entrada de uma tabela (Insert/Update parciais). */
type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      professionals: TableDef<ProfessionalRow>;
      funnels: TableDef<FunnelRow>;
      leads: TableDef<LeadRow>;
      appointments: TableDef<AppointmentRow>;
      availability: TableDef<AvailabilityRow>;
      automations: TableDef<AutomationRow>;
      notifications: TableDef<NotificationRow>;
      subscriptions: TableDef<SubscriptionRow>;
      setup_tasks: TableDef<SetupTaskRow>;
      lgpd_requests: TableDef<LgpdRequestRow>;
      consent_log: TableDef<{
        id: string;
        professional_id: string | null;
        lead_id: string | null;
        lead_nome: string;
        professional_nome: string;
        data_hora: string;
        texto: string;
      }>;
      internal_users: TableDef<{
        id: string;
        nome: string;
        email: string;
        papel: "admin" | "operacao" | "financeiro";
      }>;
      audit_log: TableDef<{
        id: string;
        internal_user: string;
        acao: string;
        data_hora: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: { is_internal: { Args: Record<string, never>; Returns: boolean } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
