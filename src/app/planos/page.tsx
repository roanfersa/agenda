"use client";

import { PlanosScreen } from "@/components/LadoAExtras";
import { AppLayout } from "@/components/AppLayout";

export default function PlanosPage() {
  return (
    <AppLayout screen="planos" title="Planos" sub="Escolha o plano que melhor se encaixa">
      <PlanosScreen />
    </AppLayout>
  );
}
