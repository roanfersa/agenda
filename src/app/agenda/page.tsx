"use client";

import { useRouter } from "next/navigation";
import { AgendaScreen } from "@/components/LadoA";
import { AppLayout } from "@/components/AppLayout";

export default function AgendaPage() {
  const router = useRouter();
  return (
    <AppLayout screen="agenda" title="Agenda" sub="Próximos atendimentos">
      <AgendaScreen openLead={(id) => router.push(`/leads/${id}`)} />
    </AppLayout>
  );
}
