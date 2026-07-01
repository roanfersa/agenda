import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { toDisponibilidade, toFunnel, toProfessional } from "@/lib/supabase/mappers";
import { hasFeature } from "@/lib/features";
import { getMedia } from "@/lib/integrations/meta";
import type { Disponibilidade, Funnel, Professional } from "@/lib/types";

export type PublicFunnel = {
  funnel: Funnel;
  professional: Professional;
  disponibilidade: Disponibilidade[];
  /** Modo "conversa" (e plano com chat_ia) → usa o funil conversacional com IA; senão, página de blocos. */
  aiEnabled: boolean;
  /** Posts recentes do Instagram do pro (só quando há bloco "instagram" + conexão). */
  instagramMedia: { id: string; url: string; permalink: string }[];
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
  const mapped = toFunnel(funnel);
  // "conversa" só quando o plano tem chat_ia; senão cai pra página de blocos.
  const aiEnabled = mapped.pageMode === "conversa" && hasFeature(professional, "chat_ia");
  const instagramMedia = await loadInstagramMedia(db, funnel.professional_id, mapped);

  return {
    funnel: mapped,
    professional,
    disponibilidade: (dispo ?? []).map(toDisponibilidade),
    aiEnabled,
    instagramMedia,
  };
}

/** Busca posts recentes do IG só quando o funil usa um bloco "instagram" e há conexão. */
async function loadInstagramMedia(
  db: ReturnType<typeof createAdminClient>,
  professionalId: string,
  funnel: Funnel,
): Promise<{ id: string; url: string; permalink: string }[]> {
  const temBloco = funnel.blocks.some((b) => b.tipo === "instagram");
  if (!temBloco) return [];
  try {
    const { data: conn } = await db
      .from("instagram_connections")
      .select("access_token, ig_user_id")
      .eq("professional_id", professionalId)
      .single();
    if (!conn?.access_token || !conn?.ig_user_id) return [];
    const posts = await getMedia(conn.access_token, conn.ig_user_id, 6);
    return posts
      .filter((p) => p.thumbnail)
      .map((p) => ({ id: p.id, url: p.thumbnail as string, permalink: p.permalink }));
  } catch {
    return [];
  }
}
