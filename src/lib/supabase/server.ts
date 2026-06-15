import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Cliente Supabase para Server Components, Server Actions e Route Handlers.
 * Lê/grava a sessão nos cookies (Next.js 16: `cookies()` é assíncrono).
 * Respeita RLS — opera no contexto do usuário logado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll chamado de um Server Component — ignorável quando o
            // refresh de sessão é feito no proxy.
          }
        },
      },
    },
  );
}
