/**
 * Catálogo central de feature flags.
 *
 * Regra de acesso: a flag é a fonte de verdade. O PLANO define o conjunto
 * PADRÃO de flags ligadas; o admin pode SOBRESCREVER por usuário (a coluna
 * professionals.feature_flags guarda só os overrides).
 *
 *   acesso(feature) = overrides[feature] ?? PLAN_DEFAULTS[plano][feature]
 */
import type { Plano } from "./types";

export type FeatureKey =
  | "automacoes"
  | "chat_ia"
  | "multi_funil"
  | "branding"
  | "blocos_links"
  | "agendamento"
  | "analytics"
  | "gerar_ia";

export type FeatureDef = {
  key: FeatureKey;
  label: string;
  descricao: string;
};

export const FEATURES: FeatureDef[] = [
  { key: "agendamento", label: "Agendamento", descricao: "Marcar atendimentos no próprio fluxo." },
  { key: "multi_funil", label: "Múltiplos funis/links", descricao: "Criar mais de uma página de bio-link." },
  { key: "branding", label: "Identidade visual", descricao: "Personalizar cores, fonte, logo e fundo." },
  { key: "blocos_links", label: "Construtor de blocos", descricao: "Blocos estilo Linktree (links, ofertas, recursos)." },
  { key: "chat_ia", label: "Chat com IA", descricao: "Funil conversacional que qualifica e recomenda." },
  { key: "gerar_ia", label: "Geração com IA", descricao: "IA gera funil/página e textos." },
  { key: "automacoes", label: "Automações", descricao: "Comment→DM e WhatsApp (após conexão Meta)." },
  { key: "analytics", label: "Analytics", descricao: "Métricas avançadas de leads e funis." },
];

export const FEATURE_KEYS: FeatureKey[] = FEATURES.map((f) => f.key);

/** O que cada plano liga por padrão. */
export const PLAN_DEFAULTS: Record<Plano, Record<FeatureKey, boolean>> = {
  entrada: {
    agendamento: true,
    multi_funil: false,
    branding: false,
    blocos_links: true,
    chat_ia: true,
    gerar_ia: true,
    automacoes: false,
    analytics: false,
  },
  pro: {
    agendamento: true,
    multi_funil: true,
    branding: true,
    blocos_links: true,
    chat_ia: true,
    gerar_ia: true,
    automacoes: true,
    analytics: true,
  },
  // "setup" é serviço avulso; herda o conjunto do entrada.
  setup: {
    agendamento: true,
    multi_funil: false,
    branding: false,
    blocos_links: true,
    chat_ia: true,
    gerar_ia: true,
    automacoes: false,
    analytics: false,
  },
};

export type FeatureOverrides = Partial<Record<FeatureKey, boolean>>;

/** Mapa efetivo de flags = default do plano sobrescrito pelos overrides. */
export function resolveFeatures(
  plano: Plano,
  overrides: FeatureOverrides = {},
): Record<FeatureKey, boolean> {
  const base = PLAN_DEFAULTS[plano] ?? PLAN_DEFAULTS.entrada;
  const out = { ...base };
  for (const k of FEATURE_KEYS) {
    if (overrides[k] !== undefined) out[k] = overrides[k] as boolean;
  }
  return out;
}

/** Booleano efetivo de uma feature para um profissional. */
export function hasFeature(
  professional: { plano: Plano; featureFlags?: FeatureOverrides },
  key: FeatureKey,
): boolean {
  return resolveFeatures(professional.plano, professional.featureFlags ?? {})[key];
}
