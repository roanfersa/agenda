"use client";

import { use } from "react";
import { DeskShell, DetalheConta } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function DetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <>
      <DeskShell screen="detalhe">
        <DetalheConta proId={id} />
      </DeskShell>
      <ToastHost />
    </>
  );
}
