import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { publicOrigin } from "@/lib/http/public-url";

/**
 * Callback do OAuth (ex.: Google). O Supabase redireciona pra cá com `?code=`;
 * trocamos o code por uma sessão e seguimos pro destino.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/inicio";
  // Atrás do proxy (Caddy → Next em localhost:3000), o origin da requisição vira
  // o host interno. Redireciona sempre para o host público (senão cai no localhost).
  const base = publicOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${base}${next}`);
    }
  }

  return NextResponse.redirect(`${base}/entrar?erro=auth`);
}
