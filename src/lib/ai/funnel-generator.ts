import "server-only";
import { getAnthropic, parseJson, textOf } from "./client";
import type { Objetivo, Produto, Question } from "@/lib/types";

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
  recursos?: Produto[];
  recursoAlvo?: string;
}): Promise<GeneratedFunnel> {
  const client = getAnthropic();
  if (!client) throw new Error("IA não configurada (defina ANTHROPIC_API_KEY).");

  const objetivoDesc =
    input.objetivo === "agendar"
      ? "agendar um atendimento"
      : input.objetivo === "qualificar"
        ? "qualificar o lead pra um time de vendas"
        : "capturar o contato pra continuar no WhatsApp";

  const ativos = (input.recursos ?? []).filter((r) => r.ativo !== false);
  const recursosTxt = ativos.length
    ? "\nRecursos disponíveis: " +
      ativos.map((r) => `${r.nome} (${r.tipo ?? "link"})${r.descricao ? ` — ${r.descricao}` : ""}`).join("; ")
    : "";
  const alvoTxt = input.recursoAlvo ? `\nO funil deve levar ao recurso: "${input.recursoAlvo}".` : "";

  const msg = await client.messages.create({
    model: SONNET,
    max_tokens: 800,
    system:
      "Você cria funis de conversão CURTOS e objetivos pra profissionais autônomos no Brasil. " +
      "Responda SEMPRE em JSON válido, sem texto fora dele, no formato: " +
      '{"mensagemBoasVindas": string, "perguntas": [{"texto": string, "tipo": "opcoes"|"texto_livre", "opcoes"?: string[], "obrigatoria": boolean}], "consentimentoTexto": string}. ' +
      "Use NO MÁXIMO 2 perguntas (breves, 1 por vez), linguagem informal de WhatsApp (pt-BR), e um texto de consentimento LGPD curto. " +
      "Não tome o tempo do lead — poucas perguntas e direto ao ponto.",
    messages: [
      {
        role: "user",
        content:
          `Profissional: ${input.nome} — ${input.especialidade}. Objetivo do funil: ${objetivoDesc}.` +
          `${recursosTxt}${alvoTxt}`,
      },
    ],
  });

  const parsed = parseJson<{
    mensagemBoasVindas?: string;
    perguntas?: Array<Omit<Question, "id">>;
    consentimentoTexto?: string;
  }>(textOf(msg));

  return {
    mensagemBoasVindas: parsed.mensagemBoasVindas ?? "",
    consentimentoTexto: parsed.consentimentoTexto ?? "",
    perguntas: (parsed.perguntas ?? []).slice(0, 2).map((q, i) => ({
      id: `q_${i}_${Math.random().toString(36).slice(2, 7)}`,
      texto: q.texto ?? "",
      tipo: q.tipo === "texto_livre" ? "texto_livre" : "opcoes",
      opcoes: q.opcoes,
      obrigatoria: q.obrigatoria ?? true,
    })),
  };
}
