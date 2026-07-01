"use client";

import * as React from "react";
import { LadoB, type PublicLeadInput } from "@/components/LadoB";
import { AiFunnelChat } from "@/components/AiFunnelChat";
import { ToastHost } from "@/components/ui";
import { track } from "@/lib/track";
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
  const [fonte, setFonte] = React.useState("");

  React.useEffect(() => {
    if (preview) return;
    const f = new URLSearchParams(window.location.search).get("fonte") || "";
    setFonte(f);
    track("view", { slug: funnel.slug, fonte: f });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          recursoId: input.recursoId,
          fonte: input.fonte ?? fonte,
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
          fonte={fonte}
        />
      ) : (
        <LadoB
          funnelOverride={funnel}
          professionalOverride={professional}
          disponibilidadeOverride={disponibilidade}
          objOverride={objOverride}
          onSubmitLead={onSubmitLead}
          fonte={fonte}
          key={`${funnel.slug}-${objOverride || "default"}`}
        />
      )}
      <ToastHost />
    </>
  );
}
