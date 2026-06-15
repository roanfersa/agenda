"use client";

import { useRouter } from "next/navigation";
import { ConfigScreen } from "@/components/LadoA";
import { AppLayout } from "@/components/AppLayout";

export default function ConfigPage() {
  const router = useRouter();
  return (
    <AppLayout screen="config" title="Ajustes">
      <ConfigScreen go={(s) => router.push(`/${s}`)} />
    </AppLayout>
  );
}
