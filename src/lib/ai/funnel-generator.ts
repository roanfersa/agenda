import "server-only";
import { getAnthropic, textOf } from "./client";
import type { Objetivo, Question } from "@/lib/types";

export type GeneratedFunnel = {
  mensagemBoasVindas: string;
  perguntas: Question[];
  consentimentoTexto: string;
};

const SONNET = "claude-sonnet-4-6";

/**
 * Gera mensagem de boas-vindas, perguntas e texto de consentimento a partir da
 * especialidade do profissional e do objetivo do funil. Lança erro se a IA não
 * estiver configurada (a UI trata e mostra aviso).
 */
export async function generateFunnel(input: {
  especialidade: string;
  nome: string;
  objetivo: Objetivo;
}): Promise<GeneratedFunnel> {
  const client = getAnthropic();
  if (!client) throw new Error("IA não configurada (defina ANTHROPIC_API_KEY).");

  const objetivoDesc =
    input.objetivo === "agendar"
      ? "agendar um atendimento"
      : input.objetivo === "qualificar"
        ? "qualificar o lead pra um time de vendas"
        : "capturar o contato pra continuar no WhatsApp";

  const msg = await client.messages.create({
    model: SONNET,
    max_tokens: 1000,
    system:
      "Você cria funis de conversão curtos e acolhedores pra profissionais autônomos no Brasil. " +
      "Responda SEMPRE em JSON válido, sem texto fora dele, no formato: " +
      '{"mensagemBoasVindas": string, "perguntas": [{"texto": string, "tipo": "opcoes"|"texto_livre", "opcoes"?: string[], "obrigatoria": boolean}], "consentimentoTexto": string}. ' +
      "Use no máximo 4 perguntas, linguagem informal de WhatsApp (pt-BR), e um texto de consentimento LGPD curto.",
    messages: [
      {
        role: "user",
        content: `Profissional: ${input.nome} — ${input.especialidade}. Objetivo do funil: ${objetivoDesc}.`,
      },
    ],
  });

  const parsed = JSON.parse(textOf(msg)) as {
    mensagemBoasVindas?: string;
    perguntas?: Array<Omit<Question, "id">>;
    consentimentoTexto?: string;
  };

  return {
    mensagemBoasVindas: parsed.mensagemBoasVindas ?? "",
    consentimentoTexto: parsed.consentimentoTexto ?? "",
    perguntas: (parsed.perguntas ?? []).slice(0, 6).map((q, i) => ({
      id: `q_${i}_${Math.random().toString(36).slice(2, 7)}`,
      texto: q.texto ?? "",
      tipo: q.tipo === "texto_livre" ? "texto_livre" : "opcoes",
      opcoes: q.opcoes,
      obrigatoria: q.obrigatoria ?? true,
    })),
  };
}
