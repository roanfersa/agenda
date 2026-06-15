import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Modelo Claude usado pelos recursos de IA. Mantido num único lugar para
 * facilitar troca. (Consulte console.anthropic.com para o id mais recente.)
 */
export const AI_MODEL = "claude-haiku-4-5-20251001";

let _client: Anthropic | null = null;

/** Retorna o cliente Anthropic, ou null se a chave não estiver configurada. */
export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

/** Extrai texto simples da resposta do modelo. */
export function textOf(msg: Anthropic.Message): string {
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
