import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente Supabase com a service_role key. IGNORA RLS — uso EXCLUSIVO em
 * código server-side confiável: submit de lead pelo funil público (sem login)
 * e webhooks do Stripe. NUNCA importe isto em Client Components.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
