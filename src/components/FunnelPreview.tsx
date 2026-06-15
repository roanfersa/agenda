"use client";

import { Avatar } from "./ui";
import type { Funnel } from "@/lib/types";

export function FunnelPreview({
  funnel,
  pro,
}: {
  funnel: Pick<Funnel, "mensagemBoasVindas" | "perguntas">;
  pro: { nome: string; especialidade: string };
}) {
  return (
    <div style={{ background: "#EBE7DF", borderRadius: 16, padding: 14, border: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
        <Avatar name={pro.nome} size={32} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{pro.nome}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{pro.especialidade}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            alignSelf: "flex-start",
            maxWidth: "88%",
            background: "#fff",
            padding: "9px 12px",
            borderRadius: 14,
            borderBottomLeftRadius: 4,
            fontSize: 13,
            color: "var(--ink)",
            lineHeight: 1.4,
            boxShadow: "var(--sh-sm)",
          }}
        >
          {funnel.mensagemBoasVindas}
        </div>
        {funnel.perguntas[0] && (
          <div
            style={{
              alignSelf: "flex-start",
              maxWidth: "88%",
              background: "#fff",
              padding: "9px 12px",
              borderRadius: 14,
              borderBottomLeftRadius: 4,
              fontSize: 13,
              color: "var(--ink)",
              boxShadow: "var(--sh-sm)",
            }}
          >
            {funnel.perguntas[0].texto}
          </div>
        )}
        {funnel.perguntas[0]?.opcoes && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
            {funnel.perguntas[0].opcoes!.map((o, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--accent-800)",
                  background: "#fff",
                  border: "1.5px solid var(--accent-200)",
                  padding: "6px 11px",
                  borderRadius: 16,
                }}
              >
                {o}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
