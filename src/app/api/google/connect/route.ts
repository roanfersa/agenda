import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleOAuthUrl, isGoogleConfigured } from "@/lib/integrations/google";

/** Inicia o OAuth do Google Calendar. */
export async function GET(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(`${site}/agenda?google=indisponivel`);
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/entrar`);

  const redirectUri = `${site}/api/google/callback`;
  return NextResponse.redirect(getGoogleOAuthUrl(redirectUri, user.id));
}
