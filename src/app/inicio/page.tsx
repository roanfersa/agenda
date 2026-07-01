"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/LadoA";
import { AnalisesScreen } from "@/components/AnalisesScreen";
import { AppLayout } from "@/components/AppLayout";
import { NotificationsSheet } from "@/components/NotificationsSheet";
import { RoundBtn } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function InicioPage() {
  const router = useRouter();
  const professional = useStore((s) => s.professional);
  const notifications = useStore((s) => s.notifications);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const naoLidas = notifications.filter((n) => !n.lida).length;
  return (
    <AppLayout
      screen="inicio"
      title={`Oi, ${professional.nome.split(" ")[0]} 👋`}
      sub="Aqui está o seu dia"
      rightAction={
        <RoundBtn icon="bell" badge={naoLidas || undefined} onClick={() => setNotifOpen(true)} />
      }
    >
      <Dashboard openLead={(id) => router.push(`/leads/${id}`)} go={(s) => router.push(`/${s}`)} />
      <div style={{ marginTop: 22 }}>
        <AnalisesScreen />
      </div>
      {notifOpen && (
        <NotificationsSheet
          onClose={() => setNotifOpen(false)}
          onOpen={(id) => {
            setNotifOpen(false);
            router.push(`/leads/${id}`);
          }}
        />
      )}
    </AppLayout>
  );
}
