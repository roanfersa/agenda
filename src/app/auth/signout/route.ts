import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/** Logout server-side: encerra a sessão e limpa os cookies do Supabase. */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut().catch(() => {});

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const res = NextResponse.redirect(`${site}/entrar`, { status: 303 });

  // Garante a remoção dos cookies de auth (sb-*), inclusive os "chunked".
  const jar = await cookies();
  for (const c of jar.getAll()) {
    if (c.name.startsWith("sb-")) res.cookies.delete(c.name);
  }
  return res;
}
