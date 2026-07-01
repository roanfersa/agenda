"use client";

import { AppLayout } from "@/components/AppLayout";
import { AnalisesScreen } from "@/components/AnalisesScreen";

export default function AnalisesPage() {
  return (
    <AppLayout screen="analises" title="Análises" sub="Cliques, conversão e origem">
      <AnalisesScreen />
    </AppLayout>
  );
}
