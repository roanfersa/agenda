import "server-only";

const SCOPES = "openid email https://www.googleapis.com/auth/calendar.events";

export function isGoogleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function getGoogleOAuthUrl(redirectUri: string, state: string): string {
  const p = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

export type GoogleToken = { accessToken: string; refreshToken: string; expiresAt: string; email: string };

export async function exchangeGoogleCode(code: string, redirectUri: string): Promise<GoogleToken> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error_description || d.error || "Falha no token do Google");
  const email = await getGoogleEmail(d.access_token);
  return {
    accessToken: d.access_token,
    refreshToken: d.refresh_token ?? "",
    expiresAt: new Date(Date.now() + (d.expires_in ?? 3600) * 1000).toISOString(),
    email,
  };
}

async function getGoogleEmail(token: string): Promise<string> {
  try {
    const r = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await r.json();
    return d.email ?? "";
  } catch {
    return "";
  }
}

export async function refreshGoogleToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error_description || "Falha ao renovar o token do Google");
  return { accessToken: d.access_token, expiresAt: new Date(Date.now() + (d.expires_in ?? 3600) * 1000).toISOString() };
}

export async function createCalendarEvent(
  token: string,
  calendarId: string,
  ev: { summary: string; description?: string; start: string; end: string; timeZone?: string },
): Promise<string> {
  const tz = ev.timeZone ?? "America/Sao_Paulo";
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      summary: ev.summary,
      description: ev.description ?? "",
      start: { dateTime: ev.start, timeZone: tz },
      end: { dateTime: ev.end, timeZone: tz },
    }),
  });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error?.message || "Falha ao criar evento no Google Agenda");
  return d.id as string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Próxima ocorrência de um dia da semana (rótulo pt-BR) + hora "HH:MM".
 * Retorna strings de data-hora locais (sem fuso) para uso com timeZone.
 */
export function proximaOcorrencia(diaSemana: string, hora: string): { start: string; end: string } | null {
  const dias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const norm = diaSemana.toLowerCase();
  const alvo = dias.findIndex((d) => norm.startsWith(d.slice(0, 3)));
  const m = /^(\d{1,2}):(\d{2})$/.exec(hora.trim());
  if (alvo < 0 || !m) return null;
  const now = new Date();
  let diff = (alvo - now.getUTCDay() + 7) % 7;
  if (diff === 0) diff = 7; // se for hoje, agenda para a próxima semana
  const d = new Date(now.getTime() + diff * 86400000);
  const y = d.getUTCFullYear();
  const mo = pad(d.getUTCMonth() + 1);
  const da = pad(d.getUTCDate());
  const h = pad(+m[1]);
  const mi = m[2];
  const endH = pad((+m[1] + 1) % 24);
  return { start: `${y}-${mo}-${da}T${h}:${mi}:00`, end: `${y}-${mo}-${da}T${endH}:${mi}:00` };
}
