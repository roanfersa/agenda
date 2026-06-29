import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/features";
import { getConnectionByProfessional } from "@/lib/data/instagram";
import { getConversations } from "@/lib/integrations/meta";

/** Lista as conversas de DM da conta Instagram conectada do profissional. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: prof } = await supabase
    .from("professionals")
    .select("plano, feature_flags")
    .eq("id", user.id)
    .single();
  if (!prof || !hasFeature({ plano: prof.plano, featureFlags: prof.feature_flags ?? {} }, "automacoes")) {
    return NextResponse.json({ error: "Recurso não habilitado." }, { status: 403 });
  }

  const conn = await getConnectionByProfessional(user.id);
  if (!conn) return NextResponse.json({ error: "Instagram não conectado." }, { status: 400 });

  try {
    const conversas = await getConversations(conn.access_token, conn.ig_user_id);
    return NextResponse.json({ conversas, selfId: conn.ig_user_id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "falha" }, { status: 502 });
  }
}
