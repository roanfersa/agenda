import "server-only";
import { getAnthropic, parseJson, textOf } from "./client";
import type { FlowPreset, Produto } from "@/lib/types";

const SONNET = "claude-sonnet-4-6";

export type PageRecommendation = {
  flowPreset: FlowPreset;
  boasVindas: string;
  headline: string;
  subheadline: string;
  brandColor: string;
  perguntas: { texto: string; tipo: "opcoes" | "texto_livre"; opcoes?: string[]; obrigatoria: boolean }[];
  blocks: {
    tipo: "link" | "oferta" | "recurso" | "texto" | "social";
    titulo?: string;
    descricao?: string;
    preco?: string;
    url?: string;
    emoji?: string;
    texto?: string;
  }[];
};

/**
 * A IA analisa especialidade + objetivo + catálogo de produtos e propõe uma
 * página de bio-link (tema, headline, fluxo, perguntas e blocos). O dono aceita
 * ou edita. Lança se a IA não estiver configurada.
 */
export async function recommendPage(input: {
  nome: string;
  especialidade: string;
  objetivo: string;
  produtos: Produto[];
}): Promise<PageRecommendation> {
  const client = getAnthropic();
  if (!client) throw new Error("IA não configurada (defina ANTHROPIC_API_KEY).");

  const produtos =
    input.produtos.length > 0
      ? input.produtos.map((p) => `- ${p.nome}: ${p.descricao}${p.preco ? ` (${p.preco})` : ""}${p.link ? ` [${p.link}]` : ""}`).join("\n")
      : "(nenhum produto informado)";

  const msg = await client.messages.create({
    model: SONNET,
    max_tokens: 1500,
    system:
      "Você cria páginas de bio-link (estilo Linktree + quiz conversacional) para profissionais autônomos no Brasil. " +
      "Responda SEMPRE em JSON válido, sem texto fora dele, no formato: " +
      '{"flowPreset":"bio_quiz"|"agendamento"|"captura"|"qualificar","boasVindas":string,"headline":string,"subheadline":string,"brandColor":string(hex),' +
      '"perguntas":[{"texto":string,"tipo":"opcoes"|"texto_livre","opcoes"?:string[],"obrigatoria":boolean}],' +
      '"blocks":[{"tipo":"link"|"oferta"|"recurso"|"texto"|"social","titulo"?:string,"descricao"?:string,"preco"?:string,"url"?:string,"emoji"?:string,"texto"?:string}]}. ' +
      "Máx 4 perguntas e até 5 blocos. Linguagem informal de WhatsApp (pt-BR). Use os produtos informados como blocos de oferta. brandColor combinando com a área.",
    messages: [
      {
        role: "user",
        content:
          `Profissional: ${input.nome} — ${input.especialidade}. Objetivo: ${input.objetivo}.\n` +
          `Produtos/ofertas:\n${produtos}`,
      },
    ],
  });

  const parsed = parseJson<Partial<PageRecommendation>>(textOf(msg));
  return {
    flowPreset: (parsed.flowPreset as FlowPreset) || "bio_quiz",
    boasVindas: parsed.boasVindas || "",
    headline: parsed.headline || "",
    subheadline: parsed.subheadline || "",
    brandColor: parsed.brandColor || "#0E8A6B",
    perguntas: Array.isArray(parsed.perguntas) ? parsed.perguntas.slice(0, 4) : [],
    blocks: Array.isArray(parsed.blocks) ? parsed.blocks.slice(0, 6) : [],
  };
}
