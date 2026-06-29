import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getConnectionByProfessional } from "@/lib/data/instagram";
import { getConversationMessages } from "@/lib/integrations/meta";

/** Mensagens de uma conversa (?conversationId=...). */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "conversationId obrigatório" }, { status: 400 });

  const conn = await getConnectionByProfessional(user.id);
  if (!conn) return NextResponse.json({ error: "Instagram não conectado." }, { status: 400 });

  try {
    const mensagens = await getConversationMessages(conversationId, conn.access_token);
    return NextResponse.json({ mensagens, selfId: conn.ig_user_id });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "falha" }, { status: 502 });
  }
}
