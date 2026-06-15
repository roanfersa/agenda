import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { toDisponibilidade, toFunnel, toProfessional } from "@/lib/supabase/mappers";
import type { Disponibilidade, Funnel, Professional } from "@/lib/types";

export type PublicFunnel = {
  funnel: Funnel;
  professional: Professional;
  disponibilidade: Disponibilidade[];
};

/**
 * Carrega um funil público por slug (somente publicados), com o profissional e
 * a disponibilidade. Usa service role pois o visitante não está logado.
 */
export async function getPublicFunnel(slug: string): Promise<PublicFunnel | null> {
  const db = createAdminClient();
  const { data: funnel } = await db
    .from("funnels")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .single();
  if (!funnel) return null;

  const [{ data: prof }, { data: dispo }] = await Promise.all([
    db.from("professionals").select("*").eq("id", funnel.professional_id).single(),
    db.from("availability").select("*").eq("professional_id", funnel.professional_id),
  ]);
  if (!prof) return null;

  return {
    funnel: toFunnel(funnel),
    professional: toProfessional(prof),
    disponibilidade: (dispo ?? []).map(toDisponibilidade),
  };
}
