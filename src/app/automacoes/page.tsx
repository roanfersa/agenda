"use client";

import { AutomacoesScreen } from "@/components/LadoAExtras";
import { AppLayout } from "@/components/AppLayout";

export default function AutomacoesPage() {
  return (
    <AppLayout screen="automacoes" title="Automações" sub="Comentou no Instagram? Vira DM.">
      <AutomacoesScreen />
    </AppLayout>
  );
}
