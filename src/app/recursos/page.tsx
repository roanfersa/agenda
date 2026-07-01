"use client";

import { AppLayout } from "@/components/AppLayout";
import { RecursosScreen } from "@/components/RecursosScreen";

export default function RecursosPage() {
  return (
    <AppLayout screen="recursos" title="Recursos" sub="Links, agenda, PDFs e materiais — reutilizados em todos os funis e pela IA">
      <RecursosScreen />
    </AppLayout>
  );
}
