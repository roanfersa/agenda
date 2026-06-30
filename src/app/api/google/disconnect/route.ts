import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteGoogleConnection } from "@/lib/data/google";

/** Desconecta o Google Calendar do profissional. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  await deleteGoogleConnection(user.id);
  return NextResponse.json({ ok: true });
}
