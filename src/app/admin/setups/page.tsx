"use client";

import { DeskShell, Setups } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function SetupsPage() {
  return (
    <>
      <DeskShell screen="setups">
        <Setups />
      </DeskShell>
      <ToastHost />
    </>
  );
}
