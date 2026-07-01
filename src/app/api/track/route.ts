import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Body = {
  slug: string;
  tipo: string;
  recursoId?: string;
  fonte?: string;
};

/**
 * Tracking público de eventos (view/click/recommend) — SEM auth.
 * Gravação via service role (RLS só permite SELECT ao dono). Fire-and-forget:
 * responde 204 mesmo em erro tolerável.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  if (!body.slug || !body.tipo) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const db = createAdminClient();
    const { data: funnel } = await db
      .from("funnels")
      .select("id, professional_id")
      .eq("slug", body.slug)
      .single();
    if (funnel) {
      await db.from("events").insert({
        professional_id: funnel.professional_id,
        funnel_id: funnel.id,
        recurso_id: body.recursoId ?? null,
        tipo: body.tipo,
        fonte: body.fonte ?? "",
      });
    }
  } catch {
    // Tracking nunca deve quebrar o fluxo público.
  }

  return new NextResponse(null, { status: 204 });
}
