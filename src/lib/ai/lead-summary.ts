import "server-only";
import { AI_MODEL, getAnthropic, textOf } from "./client";
import type { Resposta } from "@/lib/types";

export type LeadQualificacao = {
  resumo: string;
  score: number; // 0-100
  tags: string[];
};

function fallback(respostas: Resposta[]): LeadQualificacao {
  const resumo =
    respostas.map((r) => `${r.pergunta}: ${r.valor}`).join(". ") ||
    "Lead sem respostas registradas.";
  return { resumo, score: 50, tags: [] };
}

/**
 * Gera resumo + score de qualificação a partir das respostas do lead.
 * Cai num resumo simples se a IA não estiver configurada ou falhar.
 */
export async function summarizeLead(input: {
  nome: string;
  especialidade: string;
  objetivo: string;
  respostas: Resposta[];
}): Promise<LeadQualificacao> {
  const client = getAnthropic();
  if (!client) return fallback(input.respostas);

  const qa = input.respostas
    .map((r) => `- ${r.pergunta} → ${r.valor}`)
    .join("\n");

  try {
    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 400,
      system:
        "Você ajuda profissionais autônomos no Brasil a qualificar leads que chegam por um funil. " +
        "Responda SEMPRE em JSON válido: {\"resumo\": string (1-2 frases, pt-BR), \"score\": número 0-100 de quão pronto pra fechar/agendar, \"tags\": string[] curtas}. " +
        "Sem texto fora do JSON.",
      messages: [
        {
          role: "user",
          content:
            `Profissional: ${input.especialidade}. Objetivo do funil: ${input.objetivo}.\n` +
            `Lead: ${input.nome}.\nRespostas:\n${qa}`,
        },
      ],
    });
    const raw = textOf(msg);
    const parsed = JSON.parse(raw) as Partial<LeadQualificacao>;
    return {
      resumo: parsed.resumo || fallback(input.respostas).resumo,
      score: typeof parsed.score === "number" ? parsed.score : 50,
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    };
  } catch {
    return fallback(input.respostas);
  }
}
