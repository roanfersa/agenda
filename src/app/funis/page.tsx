"use client";

import { useRouter } from "next/navigation";
import { FunisList } from "@/components/LadoAExtras";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function FunisPage() {
  const router = useRouter();
  const setActiveFunnel = useStore((s) => s.setActiveFunnel);
  return (
    <AppLayout
      screen="funis"
      title="Funis"
      sub="Cada funil tem seu próprio link"
      rightAction={
        <Button icon="plus" onClick={() => router.push("/onboarding?novo=1")}>
          Novo funil
        </Button>
      }
    >
      <FunisList
        onEdit={(id) => {
          setActiveFunnel(id);
          router.push("/funil");
        }}
        onNew={() => router.push("/onboarding?novo=1")}
      />
    </AppLayout>
  );
}
