import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getOAuthUrl, isInstagramConfigured } from "@/lib/integrations/meta";

/** Inicia a conexão: redireciona pro diálogo OAuth do Instagram (sem FB Page). */
export async function GET(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  if (!isInstagramConfigured()) {
    return NextResponse.redirect(`${site}/automacoes?ig=naoconfigurado`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/entrar`);

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${site}/api/instagram/callback`;
  const res = NextResponse.redirect(getOAuthUrl(redirectUri, state));
  // CSRF: guarda o state num cookie httpOnly pra conferir no callback.
  res.cookies.set("ig_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
