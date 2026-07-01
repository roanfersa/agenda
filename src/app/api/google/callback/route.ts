import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeGoogleCode } from "@/lib/integrations/google";
import { saveGoogleConnection } from "@/lib/data/google";
import { publicOrigin } from "@/lib/http/public-url";

/** Callback do OAuth do Google: troca o code, guarda os tokens. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const site = publicOrigin(request);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const erro = searchParams.get("error");
  if (erro || !code) return NextResponse.redirect(`${site}/agenda?google=erro`);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/entrar`);
  if (state && state !== user.id) return NextResponse.redirect(`${site}/agenda?google=erro`);

  try {
    const redirectUri = `${site}/api/google/callback`;
    const tok = await exchangeGoogleCode(code, redirectUri);
    await saveGoogleConnection({
      professionalId: user.id,
      email: tok.email,
      accessToken: tok.accessToken,
      refreshToken: tok.refreshToken,
      expiresAt: tok.expiresAt,
    });
    return NextResponse.redirect(`${site}/agenda?google=conectado`);
  } catch {
    return NextResponse.redirect(`${site}/agenda?google=erro`);
  }
}
