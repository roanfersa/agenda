"use client";

import { DeskShell, Lgpd } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function LgpdPage() {
  return (
    <>
      <DeskShell screen="lgpd">
        <Lgpd />
      </DeskShell>
      <ToastHost />
    </>
  );
}
