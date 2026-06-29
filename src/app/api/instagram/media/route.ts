import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConnectionByProfessional } from "@/lib/data/instagram";
import { getMedia } from "@/lib/integrations/meta";

/** Publicações recentes da conta Instagram conectada do profissional. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const conn = await getConnectionByProfessional(user.id);
  if (!conn) return NextResponse.json({ error: "Instagram não conectado." }, { status: 400 });

  try {
    const posts = await getMedia(conn.access_token, conn.ig_user_id);
    return NextResponse.json({ posts });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "falha" }, { status: 502 });
  }
}
