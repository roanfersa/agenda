import "server-only";
import { AI_MODEL, getAnthropic, parseJson, textOf } from "./client";
import type { Material, Produto } from "@/lib/types";

export type ChatTurn = { role: "bot" | "user"; text: string };

export type ChatReply = {
  /** Mensagem do bot. */
  mensagem: string;
  /** Respostas rápidas sugeridas (chips). */
  opcoes?: string[];
  /** "perguntando" = continua qualificando; "recomendar" = hora de fechar. */
  fase: "perguntando" | "recomendar";
  /** Quando fase = recomendar: o próximo passo sugerido. */
  recomendacao?: {
    tipo: "agendar" | "link" | "whatsapp";
    label: string;
    url?: string;
    motivo?: string;
  };
};

function fallback(): ChatReply {
  return {
    mensagem: "Me conta um pouco mais sobre o que você procura. 🙂",
    fase: "perguntando",
  };
}

/**
 * Decide o próximo turno do funil conversacional: faz a próxima pergunta de
 * qualificação OU, quando já há contexto suficiente, recomenda o próximo passo
 * (agendar, abrir um link de produto, ou seguir no WhatsApp) com base no
 * catálogo de produtos do profissional.
 */
export async function nextChatTurn(input: {
  nome: string;
  especialidade: string;
  objetivo: string;
  permiteAgendar: boolean;
  produtos: Produto[];
  materiais?: Material[];
  perguntasBase: string[];
  history: ChatTurn[];
}): Promise<ChatReply> {
  const client = getAnthropic();
  if (!client) return fallback();

  const produtos =
    input.produtos.length > 0
      ? input.produtos
          .map((p) => `- ${p.nome}: ${p.descricao}${p.preco ? ` (${p.preco})` : ""}${p.link ? ` [link: ${p.link}]` : ""}`)
          .join("\n")
      : "(nenhum produto cadastrado)";
  const materiais =
    input.materiais && input.materiais.length > 0
      ? "\nMATERIAIS DE REFERÊNCIA:\n" + input.materiais.map((m) => `- ${m.titulo}: ${m.descricao}`).join("\n")
      : "";

  const historico = input.history.map((t) => `${t.role === "bot" ? "Bot" : "Pessoa"}: ${t.text}`).join("\n") || "(início)";

  try {
    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      system:
        `Você é o assistente do profissional ${input.nome} (${input.especialidade}). ` +
        `Objetivo do funil: ${input.objetivo}. ` +
        `Você conversa com um visitante para qualificá-lo com poucas perguntas (1 por vez) e, quando tiver contexto suficiente (2-3 trocas), recomendar o melhor próximo passo. ` +
        (input.permiteAgendar ? "Agendar no próprio chat é permitido. " : "NÃO ofereça agendamento. ") +
        "Use os produtos abaixo para recomendar um link quando fizer sentido.\n\n" +
        `PRODUTOS:\n${produtos}${materiais}\n\n` +
        "Responda SEMPRE em JSON válido, sem texto fora dele: " +
        '{"mensagem":string (pt-BR, informal, curto),"opcoes"?:string[] (2-4 respostas rápidas, opcional),"fase":"perguntando"|"recomendar",' +
        '"recomendacao"?:{"tipo":"agendar"|"link"|"whatsapp","label":string,"url"?:string,"motivo"?:string}}. ' +
        "Enquanto estiver qualificando use fase=perguntando. Quando recomendar, fase=recomendar e preencha recomendacao (url = link do produto quando tipo=link).",
      messages: [
        {
          role: "user",
          content:
            `Perguntas-base sugeridas: ${input.perguntasBase.join(" | ") || "(livre)"}\n\n` +
            `Conversa até agora:\n${historico}\n\nGere o próximo turno do bot.`,
        },
      ],
    });
    const parsed = parseJson<Partial<ChatReply>>(textOf(msg));
    return {
      mensagem: parsed.mensagem || fallback().mensagem,
      opcoes: Array.isArray(parsed.opcoes) ? parsed.opcoes.slice(0, 4) : undefined,
      fase: parsed.fase === "recomendar" ? "recomendar" : "perguntando",
      recomendacao: parsed.recomendacao,
    };
  } catch {
    return fallback();
  }
}
