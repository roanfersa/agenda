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

// ── Mídia (posts) — para escolher o post da automação ───────────────────────

export type IgMedia = {
  id: string;
  caption: string;
  mediaType: string;
  thumbnail: string | null;
  permalink: string;
};

/** Lista as publicações recentes da conta conectada. */
export async function getMedia(token: string, igUserId: string, limit = 24): Promise<IgMedia[]> {
  const data = await gget<{
    data?: Array<{ id: string; caption?: string; media_type?: string; media_url?: string; thumbnail_url?: string; permalink?: string }>;
  }>(`${GRAPH}/${VERSION}/${igUserId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=${limit}&access_token=${token}`);
  return (data.data ?? []).map((m) => ({
    id: m.id,
    caption: m.caption ?? "",
    mediaType: m.media_type ?? "",
    thumbnail: m.thumbnail_url || m.media_url || null,
    permalink: m.permalink ?? "",
  }));
}

// ── Conversas (DM) — para o atendimento humano (Human Agent) ────────────────

async function gget<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Graph API error");
  return data as T;
}

export type IgConversation = { id: string; username: string; userId: string; updatedTime: string; avatarUrl?: string };
export type IgMessage = { id: string; fromId: string; text: string; createdTime: string };

/** Foto de perfil de um contato (User Profile API). Vazio se indisponível. */
async function getProfilePic(userId: string, token: string): Promise<string> {
  try {
    const d = await gget<{ profile_pic?: string }>(
      `${GRAPH}/${VERSION}/${userId}?fields=profile_pic&access_token=${token}`,
    );
    return d.profile_pic ?? "";
  } catch {
    return "";
  }
}

/** Lista as conversas de DM da conta. selfId = id da conta conectada. */
export async function getConversations(token: string, selfId: string): Promise<IgConversation[]> {
  const data = await gget<{
    data?: Array<{ id: string; updated_time: string; participants?: { data: Array<{ id: string; username?: string }> } }>;
  }>(`${GRAPH}/${VERSION}/me/conversations?platform=instagram&fields=id,updated_time,participants{id,username}&access_token=${token}`);
  const base = (data.data ?? []).map((c) => {
    const ps = c.participants?.data ?? [];
    const other = ps.find((p) => p.id !== selfId) ?? ps[0];
    return { id: c.id, username: other?.username ?? "", userId: other?.id ?? "", updatedTime: c.updated_time };
  });
  // Busca a foto de cada contato em paralelo.
  return Promise.all(
    base.map(async (c) => ({ ...c, avatarUrl: c.userId ? await getProfilePic(c.userId, token) : "" })),
  );
}

/** Mensagens de uma conversa (ordem cronológica). */
export async function getConversationMessages(conversationId: string, token: string): Promise<IgMessage[]> {
  const data = await gget<{
    messages?: { data: Array<{ id: string; from?: { id: string }; message?: string; created_time: string }> };
  }>(`${GRAPH}/${VERSION}/${conversationId}?fields=messages{id,from,message,created_time}&access_token=${token}`);
  return (data.messages?.data ?? [])
    .map((m) => ({ id: m.id, fromId: m.from?.id ?? "", text: m.message ?? "", createdTime: m.created_time }))
    .reverse();
}

/**
 * Envia uma DM. Com humanAgent=true usa a tag HUMAN_AGENT, que permite ao
 * atendente humano responder dentro da janela de 7 dias após a última mensagem.
 */
export async function sendMessage(recipientId: string, text: string, token: string, humanAgent = false): Promise<void> {
  const body: Record<string, unknown> = {
    recipient: { id: recipientId },
    message: { text },
    access_token: token,
  };
  if (humanAgent) {
    body.messaging_type = "MESSAGE_TAG";
    body.tag = "HUMAN_AGENT";
  }
  const res = await fetch(`${GRAPH}/${VERSION}/me/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message || "Falha ao enviar mensagem");
  }
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
