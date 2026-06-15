import "server-only";
import { AI_MODEL, getAnthropic, textOf } from "./client";
import type { Resposta } from "@/lib/types";

/**
 * Sugere uma mensagem de follow-up de WhatsApp personalizada pro lead.
 * Cai numa mensagem genérica se a IA não estiver configurada.
 */
export async function draftFollowup(input: {
  leadNome: string;
  profNome: string;
  especialidade: string;
  resumo: string;
  respostas: Resposta[];
}): Promise<string> {
  const client = getAnthropic();
  const primeiroNome = input.leadNome.split(" ")[0] || "tudo bem";
  if (!client) {
    return `Oi, ${primeiroNome}! Aqui é ${input.profNome}. Vi que você se interessou — posso te ajudar a dar o próximo passo? 🌿`;
  }

  const qa = input.respostas.map((r) => `- ${r.pergunta}: ${r.valor}`).join("\n");
  const msg = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 300,
    system:
      "Você escreve mensagens de follow-up de WhatsApp pra profissionais autônomos no Brasil. " +
      "Tom caloroso, informal, curto (até 3 frases), em pt-BR, sem soar robótico. " +
      "Responda APENAS com o texto da mensagem, sem aspas nem comentários.",
    messages: [
      {
        role: "user",
        content:
          `Profissional: ${input.profNome} (${input.especialidade}).\n` +
          `Lead: ${input.leadNome}.\nResumo: ${input.resumo}\nRespostas:\n${qa}`,
      },
    ],
  });
  return textOf(msg) || `Oi, ${primeiroNome}! Posso te ajudar a seguir?`;
}
