import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type IgConnection = {
  professional_id: string;
  ig_user_id: string;
  ig_username: string;
  page_id: string | null;
  access_token: string;
  token_expires_at: string | null;
};

export async function saveConnection(c: Omit<IgConnection, "token_expires_at"> & { token_expires_at?: string | null }) {
  const db = createAdminClient();
  await db.from("instagram_connections").upsert({ ...c, connected_at: new Date().toISOString() });
}

export async function deleteConnection(professionalId: string) {
  const db = createAdminClient();
  await db.from("instagram_connections").delete().eq("professional_id", professionalId);
}

/** Status (sem token) para a UI. */
export async function getConnectionStatus(professionalId: string): Promise<{ connected: boolean; username: string }> {
  const db = createAdminClient();
  const { data } = await db
    .from("instagram_connections")
    .select("ig_username")
    .eq("professional_id", professionalId)
    .maybeSingle();
  return { connected: Boolean(data), username: data?.ig_username ?? "" };
}

/** Conexão completa (com token) do profissional logado — uso server-side. */
export async function getConnectionByProfessional(professionalId: string): Promise<IgConnection | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("instagram_connections")
    .select("*")
    .eq("professional_id", professionalId)
    .maybeSingle();
  return data ?? null;
}

export async function getConnectionByIgUserId(igUserId: string): Promise<IgConnection | null> {
  const db = createAdminClient();
  const { data } = await db
    .from("instagram_connections")
    .select("*")
    .eq("ig_user_id", igUserId)
    .maybeSingle();
  return data ?? null;
}

/** Idempotência: retorna true se o evento é novo (e o marca como processado). */
export async function claimEvent(eventId: string, professionalId: string): Promise<boolean> {
  const db = createAdminClient();
  const { error } = await db.from("instagram_events").insert({ id: eventId, professional_id: professionalId });
  return !error; // conflito de PK → já processado
}
