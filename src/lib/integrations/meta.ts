import "server-only";
import crypto from "crypto";

/**
 * Camada de integração com a Meta (Instagram Graph API) — comentário → DM.
 *
 * Pronta-para-ativar: requer um App na Meta com Instagram Graph API e as
 * permissões instagram_basic, instagram_manage_comments,
 * instagram_manage_messages, pages_show_list, pages_manage_metadata,
 * business_management (App Review). Veja META_SETUP.md.
 *
 * Env: META_APP_ID, META_APP_SECRET, META_WEBHOOK_VERIFY_TOKEN,
 *      META_GRAPH_VERSION (opcional, default v21.0).
 */

const VERSION = process.env.META_GRAPH_VERSION || "v21.0";
const GRAPH = `https://graph.facebook.com/${VERSION}`;

export function isMetaConfigured(): boolean {
  return Boolean(process.env.META_APP_ID && process.env.META_APP_SECRET);
}

export const SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "pages_show_list",
  "pages_manage_metadata",
  "business_management",
].join(",");

/** URL do diálogo OAuth do Facebook (Login do usuário pra conectar o IG). */
export function getOAuthUrl(redirectUri: string, state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    state,
    scope: SCOPES,
    response_type: "code",
  });
  return `https://www.facebook.com/${VERSION}/dialog/oauth?${p}`;
}

async function gget<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Graph API error");
  return data as T;
}

/** Troca o `code` por um token de curta duração. */
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const p = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });
  const data = await gget<{ access_token: string }>(`${GRAPH}/oauth/access_token?${p}`);
  return data.access_token;
}

/** Converte para token de longa duração (~60 dias). */
export async function getLongLivedToken(token: string): Promise<{ token: string; expiresIn: number }> {
  const p = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: token,
  });
  const data = await gget<{ access_token: string; expires_in: number }>(
    `${GRAPH}/oauth/access_token?${p}`,
  );
  return { token: data.access_token, expiresIn: data.expires_in ?? 5184000 };
}

export type IgAccount = {
  pageId: string;
  pageToken: string;
  igUserId: string;
  igUsername: string;
};

/** Descobre a Página + a conta IG Business conectada (usa o token do usuário). */
export async function getPageAndIg(userToken: string): Promise<IgAccount | null> {
  const data = await gget<{
    data: Array<{
      id: string;
      access_token: string;
      instagram_business_account?: { id: string; username?: string };
    }>;
  }>(`${GRAPH}/me/accounts?fields=id,access_token,instagram_business_account{id,username}&access_token=${userToken}`);

  const page = data.data.find((p) => p.instagram_business_account);
  if (!page || !page.instagram_business_account) return null;
  return {
    pageId: page.id,
    pageToken: page.access_token,
    igUserId: page.instagram_business_account.id,
    igUsername: page.instagram_business_account.username ?? "",
  };
}

/** Inscreve o app nos webhooks da Página (campos de comentários/mensagens). */
export async function subscribePage(pageId: string, pageToken: string): Promise<void> {
  const res = await fetch(`${GRAPH}/${pageId}/subscribed_apps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscribed_fields: "comments,messages", access_token: pageToken }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || "Falha ao inscrever webhooks");
  }
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
  if (!signature || !process.env.META_APP_SECRET) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", process.env.META_APP_SECRET).update(rawBody).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Link wa.me — caminho de WhatsApp de saída sem API (interino). */
export function waMeLink(whats: string, text: string): string {
  return `https://wa.me/${(whats || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
