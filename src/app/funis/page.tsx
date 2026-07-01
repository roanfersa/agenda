"use client";

import { useRouter } from "next/navigation";
import { FunisList } from "@/components/LadoAExtras";
import { AppLayout } from "@/components/AppLayout";
import { useStore } from "@/lib/store";

export default function FunisPage() {
  const router = useRouter();
  const setActiveFunnel = useStore((s) => s.setActiveFunnel);
  return (
    <AppLayout screen="funis" title="Funis" sub="Cada funil tem seu próprio link">
      <FunisList
        onEdit={(id) => {
          setActiveFunnel(id);
          router.push("/funil");
        }}
      />
    </AppLayout>
  );
}
