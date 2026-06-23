"use client";

import { BioLinkEditor } from "@/components/BioLinkEditor";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export default function FunilEditPage() {
  const funnel = useStore((s) => s.funnel);
  return (
    <AppLayout screen="funil" title={`Editar · ${funnel.nome}`} sub="Personalize visual, blocos, fluxo e publique">
      <BioLinkEditor />
    </AppLayout>
  );
}
