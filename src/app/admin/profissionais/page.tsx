"use client";

import { DeskShell, Profissionais } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function ProfissionaisPage() {
  return (
    <>
      <DeskShell screen="profissionais">
        <Profissionais />
      </DeskShell>
      <ToastHost />
    </>
  );
}
