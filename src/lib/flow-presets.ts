/**
 * Presets de fluxo do funil conversacional. Cada preset define o objetivo, um
 * conjunto de perguntas-base e o comportamento de recomendação. O editor parte
 * de um preset e permite editar tudo.
 */
import type { FlowPreset, Objetivo, Question } from "./types";

export type FlowPresetDef = {
  key: FlowPreset;
  label: string;
  descricao: string;
  objetivo: Objetivo;
  /** Mensagem de boas-vindas sugerida. */
  boasVindas: string;
  /** Perguntas-base (sem id; o editor gera ids). */
  perguntas: Omit<Question, "id">[];
  /** Como a IA fecha a conversa. */
  recomendacao: "agendar" | "link_produto" | "whatsapp";
};

let _q = 0;
const qid = () => `q_${(_q++).toString(36)}`;

export const FLOW_PRESETS: FlowPresetDef[] = [
  {
    key: "bio_quiz",
    label: "Quiz de recomendação",
    descricao: "Faz de 2 a 4 perguntas e a IA recomenda o produto ou link ideal. Indicado para link na bio com várias ofertas.",
    objetivo: "qualificar",
    boasVindas: "Oi! 🤍 Responde 3 perguntinhas que eu te mostro o melhor caminho pra você.",
    perguntas: [
      { texto: "Onde você está agora?", tipo: "opcoes", opcoes: ["Começando", "Já tentei mas travei", "Quero acelerar"], obrigatoria: true },
      { texto: "O que mais te interessa?", tipo: "opcoes", opcoes: ["Aprender do zero", "Aplicar no meu negócio", "Mentoria de perto"], obrigatoria: true },
      { texto: "Qual seu foco principal?", tipo: "texto_livre", obrigatoria: false },
    ],
    recomendacao: "link_produto",
  },
  {
    key: "agendamento",
    label: "Agendamento",
    descricao: "Conduz o visitante até escolher um horário e marcar o atendimento no próprio chat.",
    objetivo: "agendar",
    boasVindas: "Oi! Vou te ajudar a marcar seu horário em 1 minutinho. 🗓️",
    perguntas: [
      { texto: "O que você precisa?", tipo: "opcoes", opcoes: ["Primeira vez", "Retorno", "Tirar dúvida"], obrigatoria: true },
      { texto: "Prefere como?", tipo: "opcoes", opcoes: ["Online", "Presencial"], obrigatoria: true },
      { texto: "Qual período é melhor?", tipo: "opcoes", opcoes: ["Manhã", "Tarde", "Noite"], obrigatoria: true },
    ],
    recomendacao: "agendar",
  },
  {
    key: "captura",
    label: "Captura de contato",
    descricao: "Coleta nome e contato do visitante e direciona a conversa para o WhatsApp.",
    objetivo: "capturar",
    boasVindas: "Oi! Deixa seu contato que eu te chamo pra continuar por lá. 💬",
    perguntas: [
      { texto: "O que te trouxe aqui?", tipo: "opcoes", opcoes: ["Quero saber mais", "Tenho uma dúvida", "Quero começar"], obrigatoria: true },
    ],
    recomendacao: "whatsapp",
  },
  {
    key: "qualificar",
    label: "Qualificação",
    descricao: "Faz perguntas-chave, classifica o lead e encaminha os mais qualificados para o WhatsApp.",
    objetivo: "qualificar",
    boasVindas: "Oi! Me conta rapidinho seu cenário que eu te direciono certo. 🎯",
    perguntas: [
      { texto: "Qual seu principal objetivo?", tipo: "texto_livre", obrigatoria: true },
      { texto: "Qual seu momento?", tipo: "opcoes", opcoes: ["Pesquisando", "Quero decidir logo", "Pronto pra fechar"], obrigatoria: true },
    ],
    recomendacao: "whatsapp",
  },
];

export const getPreset = (key?: FlowPreset): FlowPresetDef =>
  FLOW_PRESETS.find((p) => p.key === key) || FLOW_PRESETS[0];

/** Materializa as perguntas-base do preset com ids. */
export const presetQuestions = (key: FlowPreset): Question[] =>
  getPreset(key).perguntas.map((q) => ({ ...q, id: qid() }));
