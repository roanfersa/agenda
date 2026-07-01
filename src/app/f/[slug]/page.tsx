import { notFound } from "next/navigation";
import { getPublicFunnel } from "@/lib/data/public-funnel";
import { PublicFunnelClient } from "./PublicFunnelClient";
import type { Objetivo } from "@/lib/types";

export default async function PublicFunnelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ obj?: string }>;
}) {
  const { slug } = await params;
  const { obj } = await searchParams;

  const data = await getPublicFunnel(slug);
  if (!data) notFound();

  const objOverride =
    obj && ["agendar", "qualificar", "capturar"].includes(obj)
      ? (obj as Objetivo)
      : undefined;

  return (
    <PublicFunnelClient
      funnel={data.funnel}
      professional={data.professional}
      disponibilidade={data.disponibilidade}
      objOverride={objOverride}
      aiEnabled={data.aiEnabled}
      instagramMedia={data.instagramMedia}
    />
  );
}
