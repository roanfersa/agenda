import "server-only";

/**
 * Fronteira de integração com a Meta (WhatsApp Cloud API + Instagram Graph API).
 *
 * MODO DEMO: enquanto a conta não está aprovada/verificada na Meta Business, as
 * funções abaixo apenas registram a intenção e retornam `connected: false`. A
 * UI mostra o badge "Conexão Meta pendente". Quando as credenciais existirem,
 * implemente as chamadas reais aqui — nenhum outro arquivo precisa mudar.
 *
 * Variáveis de ambiente esperadas no futuro:
 *   META_WHATSAPP_TOKEN, META_WHATSAPP_PHONE_ID, META_IG_TOKEN, META_APP_SECRET
 */

export function isMetaConfigured(): boolean {
  return Boolean(process.env.META_WHATSAPP_TOKEN && process.env.META_WHATSAPP_PHONE_ID);
}

export type SendResult = { connected: boolean; id?: string };

/** Envia mensagem de WhatsApp (Cloud API). Demo: no-op até configurar a Meta. */
export async function sendWhatsApp(_to: string, _text: string): Promise<SendResult> {
  void _to;
  void _text;
  if (!isMetaConfigured()) return { connected: false };
  // TODO: POST https://graph.facebook.com/v21.0/{phone_id}/messages
  throw new Error("Integração Meta ainda não implementada.");
}

/** Responde comentário + envia DM no Instagram. Demo: no-op até configurar. */
export async function replyAndDM(_commentId: string, _dm: string): Promise<SendResult> {
  void _commentId;
  void _dm;
  if (!isMetaConfigured()) return { connected: false };
  // TODO: Instagram Graph API (replies + private_replies)
  throw new Error("Integração Meta ainda não implementada.");
}

/** Link wa.me — caminho real interino para WhatsApp de saída (sem API). */
export function waMeLink(whats: string, text: string): string {
  return `https://wa.me/${(whats || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
