export type Objetivo = "agendar" | "qualificar" | "capturar";
export type Modo = "agendar" | "capturar" | "ambos";
export type Metodo = "ia" | "manual";
export type FunnelStatus = "rascunho" | "publicado" | "pausado";
export type LeadStatus = "novo" | "agendado" | "em_conversa";
export type ProStatus = "ativo" | "trial" | "inadimplente" | "cancelado";
export type Plano = "entrada" | "pro" | "setup";
export type SetupStatus =
  | "solicitado"
  | "em_montagem"
  | "aguardando_cliente"
  | "concluido";
export type LgpdTipo = "acesso" | "correcao" | "exclusao";

export type Question = {
  id: string;
  texto: string;
  tipo: "opcoes" | "texto_livre";
  opcoes?: string[];
  obrigatoria: boolean;
};

export type ContextoItem = {
  id: string;
  tipo: "texto" | "pdf" | "link";
  label: string;
};

export type FlowPreset = "bio_quiz" | "agendamento" | "captura" | "qualificar";

export type SocialLink = { rede: string; url: string };

export type FunnelTheme = {
  brandColor: string;
  fontFamily: string;
  logoUrl: string | null;
  avatarUrl: string | null;
  bgColor: string;
  bgImageUrl: string | null;
  headline: string;
  subheadline: string;
  socialLinks: SocialLink[];
};

export type FunnelBlock =
  | { id: string; tipo: "funil"; titulo: string; cta: string }
  | { id: string; tipo: "link"; titulo: string; url: string; emoji?: string }
  | { id: string; tipo: "oferta"; titulo: string; descricao?: string; preco?: string; url: string; emoji?: string }
  | { id: string; tipo: "recurso"; titulo: string; descricao?: string; url: string; emoji?: string }
  | { id: string; tipo: "recomendador"; titulo: string; cta: string }
  | { id: string; tipo: "social"; links: SocialLink[] }
  | { id: string; tipo: "texto"; texto: string };

/** Tipo de recurso = forma de acesso que o profissional oferece ao lead. */
export type RecursoTipo = "link" | "agenda" | "pdf" | "whatsapp";

/**
 * Recurso: o que o lead acessa (link, agenda, PDF, WhatsApp).
 * Evolui o antigo `Produto` — os campos novos são opcionais para retrocompat
 * (registros antigos = `tipo` "link", `ativo` true).
 */
export type Produto = {
  nome: string;
  descricao: string;
  link?: string; // URL do link externo ou do PDF no Storage
  preco?: string;
  id?: string;
  tipo?: RecursoTipo;
  emoji?: string;
  ativo?: boolean;
  /** PDF: conteúdo lido/resumido pela IA (cache). */
  conteudo?: string;
  status?: "pendente" | "pronto" | "erro";
  /** Funil próprio opcional; se ausente, o botão entrega o recurso direto. */
  funnelId?: string;
};

export type Recurso = Produto;

/** Material de referência reutilizável (arquivo, nota de texto ou link). */
export type Material = {
  id: string;
  tipo: "arquivo" | "texto" | "link";
  titulo: string;
  descricao: string;
  url?: string;
  /** Conteúdo lido/resumido pela IA (PDF/DOCX/HTML/imagem). Cacheado. */
  conteudo?: string;
  status?: "pendente" | "pronto" | "erro";
};

export type Funnel = {
  id: string;
  professionalId: string;
  slug: string;
  nome: string;
  uso: string;
  objetivo: Objetivo;
  metodo: Metodo;
  modo: Modo;
  camposContato: { email: boolean; whatsapp: boolean };
  contatoQuando: "inicio" | "fim";
  contexto: ContextoItem[];
  mensagemBoasVindas: string;
  perguntas: Question[];
  consentimentoTexto: string;
  status: FunnelStatus;
  // Bio-link SaaS:
  flowPreset: FlowPreset;
  theme: FunnelTheme;
  blocks: FunnelBlock[];
  produtos: Produto[];
  previewToken: string;
  criadoEm: string;
};

export const DEFAULT_THEME: FunnelTheme = {
  brandColor: "#0E8A6B",
  fontFamily: "Plus Jakarta Sans",
  logoUrl: null,
  avatarUrl: null,
  bgColor: "#F6F4EE",
  bgImageUrl: null,
  headline: "",
  subheadline: "",
  socialLinks: [],
};

export type Professional = {
  id: string;
  nome: string;
  handleInstagram: string;
  especialidade: string;
  atende: string;
  fotoUrl: string | null;
  cor: string;
  whatsapp: string;
  googleCalendar: { conectado: boolean; email: string; calendarId: string };
  /** Link do Calendly (se preenchido, o funil usa o Calendly no lugar da agenda nativa). */
  calendlyUrl: string;
  plano: Plano;
  avisos: { email: boolean; push: boolean };
  consentimentoTextoPadrao: string;
  /** Overrides de feature flags definidos pelo admin (default vem do plano). */
  featureFlags: Record<string, boolean>;
  /** Biblioteca de contexto reutilizável em todos os links/funis. */
  produtos: Produto[];
  materiais: Material[];
  criadoEm: string;
};

export type Resposta = {
  perguntaId: string;
  pergunta: string;
  valor: string;
};

export type Lead = {
  id: string;
  professionalId: string;
  funnelId: string;
  nome: string;
  whatsapp: string;
  email?: string;
  respostas: Resposta[];
  resumoIA: string;
  resumoEditado?: boolean;
  status: LeadStatus;
  consentimento: { dado: boolean; dataHora: string };
  origem: "instagram" | "link";
  recursoId?: string;
  fonte?: string;
  criadoEm: string;
  _t: number;
  _novo?: boolean;
};

export type Appointment = {
  id: string;
  leadId: string;
  professionalId: string;
  diaRotulo: string;
  dataHora: string;
  hora: string;
  tipoAtendimento: string;
  modalidade: "online" | "presencial";
  status: "confirmado" | "cancelado";
  googleEventId?: string;
};

export type Disponibilidade = {
  id: string;
  rotulo: string;
  dia: string;
  horarios: string[];
};

export type OtherPro = {
  id: string;
  nome: string;
  handleInstagram: string;
  especialidade: string;
  plano: Plano;
  status: ProStatus;
  agenda: boolean;
  leads: number;
  criadoEm: string;
};

export type Subscription = {
  id: string;
  professionalId: string;
  nome: string;
  plano: Plano;
  valor: number;
  ciclo: "mensal" | "unico";
  proximoVencimento: string;
  status: "em_dia" | "atrasado" | "cancelado";
};

export type SetupTask = {
  id: string;
  professionalId: string;
  nome: string;
  especialidade: string;
  responsavelId: string | null;
  responsavel: string;
  status: SetupStatus;
  valor: number;
  criadoEm: string;
};

export type LgpdRequest = {
  id: string;
  leadNome: string;
  professionalNome: string;
  tipo: LgpdTipo;
  status: "pendente" | "concluido";
  prazo: string;
  criadoEm: string;
};

export type ConsentLog = {
  id: string;
  leadNome: string;
  professionalNome: string;
  dataHora: string;
  texto: string;
};

export type InternalUser = {
  id: string;
  nome: string;
  email: string;
  papel: "admin" | "operacao" | "financeiro";
};

export type AuditEntry = {
  id: string;
  internalUser: string;
  acao: string;
  dataHora: string;
};

export type Automation = {
  id: string;
  ativa: boolean;
  funnelId?: string | null;
  postId?: string | null;
  postLegenda: string;
  postTipo: string;
  postEmoji: string;
  keywords: string[];
  respostaPublica: boolean;
  respostaPublicaTexto: string;
  dmMensagem: string;
  dmBotao: string;
  stats: { comentarios: number; dms: number; leads: number };
};

export type Notification = {
  id: string;
  leadId: string;
  nome: string;
  texto: string;
  canais: string;
  quando: string;
  lida: boolean;
};

export type Toast = { id: string; msg: string } | null;

export type ObjetivoDef = {
  id: Objetivo;
  icon: string;
  titulo: string;
  curto: string;
  beneficio: string;
  desc: string;
  exemplo: string;
  cta: string;
  sched: boolean;
};
