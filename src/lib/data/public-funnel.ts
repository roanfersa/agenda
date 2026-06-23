import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { toDisponibilidade, toFunnel, toProfessional } from "@/lib/supabase/mappers";
import { hasFeature } from "@/lib/features";
import type { Disponibilidade, Funnel, Professional } from "@/lib/types";

export type PublicFunnel = {
  funnel: Funnel;
  professional: Professional;
  disponibilidade: Disponibilidade[];
  /** Dono tem a flag chat_ia → usa o funil conversacional com IA. */
  aiEnabled: boolean;
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

  return hydrate(funnel);
}

/**
 * Carrega um funil por preview_token (qualquer status) para o dono revisar antes
 * de publicar. O token funciona como segredo de compartilhamento.
 */
export async function getFunnelByPreviewToken(token: string): Promise<PublicFunnel | null> {
  const db = createAdminClient();
  const { data: funnel } = await db
    .from("funnels")
    .select("*")
    .eq("preview_token", token)
    .single();
  if (!funnel) return null;
  return hydrate(funnel);
}

async function hydrate(
  funnel: Parameters<typeof toFunnel>[0],
): Promise<PublicFunnel | null> {
  const db = createAdminClient();
  const [{ data: prof }, { data: dispo }] = await Promise.all([
    db.from("professionals").select("*").eq("id", funnel.professional_id).single(),
    db.from("availability").select("*").eq("professional_id", funnel.professional_id),
  ]);
  if (!prof) return null;

  const professional = toProfessional(prof);
  return {
    funnel: toFunnel(funnel),
    professional,
    disponibilidade: (dispo ?? []).map(toDisponibilidade),
    aiEnabled: hasFeature(professional, "chat_ia"),
  };
}
