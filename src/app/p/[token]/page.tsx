import { notFound } from "next/navigation";
import { getFunnelByPreviewToken } from "@/lib/data/public-funnel";
import { PublicFunnelClient } from "@/app/f/[slug]/PublicFunnelClient";

/**
 * Preview de rascunho: renderiza o funil por preview_token (qualquer status),
 * sem criar lead. Link compartilhável com o cliente antes de publicar.
 */
export default async function PreviewFunnelPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getFunnelByPreviewToken(token);
  if (!data) notFound();

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#15211C",
          color: "#fff",
          textAlign: "center",
          fontSize: 12.5,
          fontWeight: 700,
          padding: "6px 12px",
        }}
      >
        Pré-visualização — esta página ainda não está publicada
      </div>
      <PublicFunnelClient
        funnel={data.funnel}
        professional={data.professional}
        disponibilidade={data.disponibilidade}
        aiEnabled={data.aiEnabled}
        instagramMedia={data.instagramMedia}
        preview
      />
    </>
  );
}
