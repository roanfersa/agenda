"use client";

import { FunilEditor } from "@/components/FunilEditor";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export default function FunilEditPage() {
  const funnel = useStore((s) => s.funnel);
  return (
    <AppLayout screen="funil" title={`Editar · ${funnel.nome}`} sub="Mude as mensagens e republique">
      <FunilEditor />
    </AppLayout>
  );
}
