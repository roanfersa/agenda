"use client";

import { Assinaturas, DeskShell } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function AssinaturasPage() {
  return (
    <>
      <DeskShell screen="assinaturas">
        <Assinaturas />
      </DeskShell>
      <ToastHost />
    </>
  );
}
