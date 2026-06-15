"use client";

import { DeskShell, Overview } from "@/components/LadoC";
import { ToastHost } from "@/components/ui";

export default function AdminOverviewPage() {
  return (
    <>
      <DeskShell screen="overview">
        <Overview />
      </DeskShell>
      <ToastHost />
    </>
  );
}
