import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getMe,
  subscribe,
} from "@/lib/integrations/meta";
import { saveConnection } from "@/lib/data/instagram";

/** Callback OAuth do Instagram: troca o code, lê o perfil, inscreve e salva. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const jar = await cookies();
  const expected = jar.get("ig_oauth_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(`${site}/automacoes?ig=erro`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/entrar`);

  try {
    const redirectUri = `${site}/api/instagram/callback`;
    const short = await exchangeCodeForToken(code, redirectUri);
    const { token, expiresIn } = await getLongLivedToken(short.token);
    const me = await getMe(token);
    await subscribe(token).catch(() => {}); // best-effort

    await saveConnection({
      professional_id: user.id,
      ig_user_id: me.igUserId || short.igUserId,
      ig_username: me.username,
      page_id: null, // fluxo Instagram Login não usa Página do Facebook
      access_token: token,
      token_expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });

    const res = NextResponse.redirect(`${site}/automacoes?ig=conectado`);
    res.cookies.delete("ig_oauth_state");
    return res;
  } catch {
    return NextResponse.redirect(`${site}/automacoes?ig=erro`);
  }
}
