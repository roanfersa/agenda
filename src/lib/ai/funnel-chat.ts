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
    /** id do recurso recomendado (quando aplicável). */
    recursoId?: string;
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

  const ativos = input.produtos.filter((p) => p.ativo !== false);
  const produtos =
    ativos.length > 0
      ? ativos
          .map(
            (p) =>
              `- id=${p.id ?? ""} tipo=${p.tipo ?? "link"} | ${p.nome}: ${p.descricao}` +
              `${p.preco ? ` (${p.preco})` : ""}${p.link ? ` [url: ${p.link}]` : ""}`,
          )
          .join("\n")
      : "(nenhum recurso cadastrado)";
  const materiais =
    input.materiais && input.materiais.length > 0
      ? "\nMATERIAIS DE REFERÊNCIA:\n" +
        input.materiais
          .map((m) => `- ${m.titulo}: ${m.descricao}${m.conteudo ? `\n  Conteúdo lido: ${m.conteudo.slice(0, 1500)}` : ""}`)
          .join("\n")
      : "";

  const historico = input.history.map((t) => `${t.role === "bot" ? "Bot" : "Pessoa"}: ${t.text}`).join("\n") || "(início)";

  try {
    const msg = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 500,
      system:
        `Você é o assistente do profissional ${input.nome} (${input.especialidade}). ` +
        `Objetivo do funil: ${input.objetivo}. ` +
        `Seu papel: em NO MÁXIMO 1-2 perguntas curtas (1 por vez), entender a necessidade e recomendar UM recurso da lista. Seja breve e objetivo — não tome o tempo da pessoa. ` +
        (input.permiteAgendar ? "Agendar é permitido. " : "NÃO ofereça agendamento. ") +
        "Recomende sempre UM recurso da lista abaixo (o mais adequado).\n\n" +
        `RECURSOS:\n${produtos}${materiais}\n\n` +
        "Responda SEMPRE em JSON válido, sem texto fora dele: " +
        '{"mensagem":string (pt-BR, informal, curto),"opcoes"?:string[] (2-4 respostas rápidas, opcional),"fase":"perguntando"|"recomendar",' +
        '"recomendacao"?:{"tipo":"agendar"|"link"|"whatsapp","label":string,"url"?:string,"motivo"?:string,"recursoId":string}}. ' +
        "Faça no máximo 2 perguntas (fase=perguntando); a partir daí, fase=recomendar e preencha recomendacao. " +
        "Mapeie o tipo do recurso: tipo=agenda→\"agendar\"; tipo=link ou pdf→\"link\" (url = a url do recurso); tipo=whatsapp→\"whatsapp\". Preencha recursoId com o id do recurso escolhido.",
      messages: [
        {
          role: "user",
          content:
            `Perguntas-base sugeridas: ${input.perguntasBase.join(" | ") || "(livre)"}\n\n` +
            `Conversa até agora:\n${historico}\n\nGere o próximo turno do bot (lembre: no máximo 2 perguntas antes de recomendar).`,
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
