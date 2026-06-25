import "server-only";
import crypto from "crypto";

/**
 * Integração com o Instagram via "Login do Instagram" (Instagram API with
 * Instagram Login) — o profissional conecta com a PRÓPRIA conta do Instagram,
 * SEM precisar de Página do Facebook. Bem mais simples para criador solo.
 *
 * Pré-requisito do usuário: conta Instagram Profissional (Business/Creator).
 * App: developers.facebook.com → produto "Instagram" → "API setup with
 * Instagram login". Veja META_SETUP.md.
 *
 * Env: INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_WEBHOOK_VERIFY_TOKEN,
 *      INSTAGRAM_GRAPH_VERSION (opcional, default v21.0).
 */

const VERSION = process.env.INSTAGRAM_GRAPH_VERSION || "v21.0";
const GRAPH = `https://graph.instagram.com`;

export function isInstagramConfigured(): boolean {
  return Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET);
}

export const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
].join(",");

/** URL do diálogo OAuth do Instagram (login com a conta do próprio Instagram). */
export function getOAuthUrl(redirectUri: string, state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${p}`;
}

export type IgToken = { token: string; igUserId: string };

/** Troca o code por um token de curta duração + o IG user id. */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<IgToken> {
  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      client_secret: process.env.INSTAGRAM_APP_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error_message || "Falha na troca do code");
  return { token: data.access_token, igUserId: String(data.user_id) };
}

/** Converte para token de longa duração (~60 dias). */
export async function getLongLivedToken(token: string): Promise<{ token: string; expiresIn: number }> {
  const p = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    access_token: token,
  });
  const res = await fetch(`${GRAPH}/access_token?${p}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Falha no token longo");
  return { token: data.access_token, expiresIn: data.expires_in ?? 5184000 };
}

/** Dados da conta IG conectada (id + username). */
export async function getMe(token: string): Promise<{ igUserId: string; username: string }> {
  const res = await fetch(`${GRAPH}/me?fields=user_id,username&access_token=${token}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Falha ao ler perfil");
  return { igUserId: String(data.user_id ?? data.id), username: data.username ?? "" };
}

/** Inscreve o app nos webhooks da conta (comentários/mensagens). Best-effort. */
export async function subscribe(token: string): Promise<void> {
  await fetch(`${GRAPH}/${VERSION}/me/subscribed_apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscribed_fields: "comments,messages", access_token: token }),
  });
}

/** Resposta pública a um comentário. */
export async function replyToComment(commentId: string, message: string, token: string): Promise<void> {
  await fetch(`${GRAPH}/${commentId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, access_token: token }),
  });
}

/** Resposta privada (DM) a quem comentou — Instagram private replies. */
export async function sendPrivateReply(
  igUserId: string,
  commentId: string,
  text: string,
  token: string,
): Promise<void> {
  await fetch(`${GRAPH}/${igUserId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { comment_id: commentId },
      message: { text },
      access_token: token,
    }),
  });
}

/** Verifica a assinatura X-Hub-Signature-256 do webhook (HMAC com o app secret). */
export function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.INSTAGRAM_APP_SECRET;
  if (!signature || !secret) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Link wa.me — caminho de WhatsApp de saída sem API (interino). */
export function waMeLink(whats: string, text: string): string {
  return `https://wa.me/${(whats || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
