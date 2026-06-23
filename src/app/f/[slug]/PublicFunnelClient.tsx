"use client";

import { LadoB, type PublicLeadInput } from "@/components/LadoB";
import { AiFunnelChat } from "@/components/AiFunnelChat";
import { ToastHost } from "@/components/ui";
import type { Disponibilidade, Funnel, Objetivo, Professional } from "@/lib/types";

export function PublicFunnelClient({
  funnel,
  professional,
  disponibilidade,
  objOverride,
  preview = false,
  aiEnabled = false,
}: {
  funnel: Funnel;
  professional: Professional;
  disponibilidade: Disponibilidade[];
  objOverride?: Objetivo;
  preview?: boolean;
  aiEnabled?: boolean;
}) {
  const onSubmitLead = async (input: PublicLeadInput) => {
    if (preview) return; // rascunho: não cria lead real
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: input.slug,
          nome: input.nome,
          whatsapp: input.whatsapp,
          email: input.email,
          respostas: input.respostas,
          agendamento: input.agendamento,
          origem: input.origem,
        }),
      });
    } catch {
      // O fluxo visual segue mesmo se a rede falhar; o lead pode ser reenviado.
    }
  };

  return (
    <>
      {aiEnabled ? (
        <AiFunnelChat
          funnel={funnel}
          professional={professional}
          disponibilidade={disponibilidade}
          onSubmitLead={onSubmitLead}
          preview={preview}
        />
      ) : (
        <LadoB
          funnelOverride={funnel}
          professionalOverride={professional}
          disponibilidadeOverride={disponibilidade}
          objOverride={objOverride}
          onSubmitLead={onSubmitLead}
          key={`${funnel.slug}-${objOverride || "default"}`}
        />
      )}
      <ToastHost />
    </>
  );
}
