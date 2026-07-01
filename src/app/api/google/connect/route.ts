import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGoogleOAuthUrl, isGoogleConfigured } from "@/lib/integrations/google";
import { publicOrigin } from "@/lib/http/public-url";

/** Inicia o OAuth do Google Calendar. */
export async function GET(request: Request) {
  const site = publicOrigin(request);
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
