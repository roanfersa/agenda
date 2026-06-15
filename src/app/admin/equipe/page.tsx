"use client";

import { DeskShell, Equipe } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function EquipePage() {
  return (
    <>
      <DeskShell screen="equipe">
        <Equipe />
      </DeskShell>
      <ToastHost />
    </>
  );
}
