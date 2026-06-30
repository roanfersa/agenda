import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshGoogleToken } from "@/lib/integrations/google";

export type GoogleConnection = {
  professional_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string | null;
  calendar_id: string;
};

export async function saveGoogleConnection(c: {
  professionalId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  calendarId?: string;
}) {
  const db = createAdminClient();
  await db.from("google_connections").upsert({
    professional_id: c.professionalId,
    email: c.email,
    access_token: c.accessToken,
    refresh_token: c.refreshToken,
    token_expires_at: c.expiresAt,
    calendar_id: c.calendarId ?? "primary",
    connected_at: new Date().toISOString(),
  });
  // Espelha o status (sem token) no professionals para a UI.
  await db
    .from("professionals")
    .update({ google_calendar: { conectado: true, email: c.email, calendarId: c.calendarId ?? "primary" } })
    .eq("id", c.professionalId);
}

export async function deleteGoogleConnection(professionalId: string) {
  const db = createAdminClient();
  await db.from("google_connections").delete().eq("professional_id", professionalId);
  await db
    .from("professionals")
    .update({ google_calendar: { conectado: false, email: "", calendarId: "" } })
    .eq("id", professionalId);
}

export async function getGoogleConnection(professionalId: string): Promise<GoogleConnection | null> {
  const db = createAdminClient();
  const { data } = await db.from("google_connections").select("*").eq("professional_id", professionalId).maybeSingle();
  return data ?? null;
}

/** Retorna um access_token válido, renovando via refresh_token se expirado. */
export async function getValidGoogleToken(professionalId: string): Promise<{ token: string; calendarId: string } | null> {
  const conn = await getGoogleConnection(professionalId);
  if (!conn) return null;
  const expira = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
  if (expira > Date.now() + 60000) return { token: conn.access_token, calendarId: conn.calendar_id };
  if (!conn.refresh_token) return { token: conn.access_token, calendarId: conn.calendar_id };
  try {
    const fresh = await refreshGoogleToken(conn.refresh_token);
    const db = createAdminClient();
    await db
      .from("google_connections")
      .update({ access_token: fresh.accessToken, token_expires_at: fresh.expiresAt })
      .eq("professional_id", professionalId);
    return { token: fresh.accessToken, calendarId: conn.calendar_id };
  } catch {
    return { token: conn.access_token, calendarId: conn.calendar_id };
  }
}
