"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { Card, Progress, SectionLabel } from "./ui";
import { useStore } from "@/lib/store";

type Period = "7" | "30" | "all";

type Analytics = {
  totais: { views: number; cliques: number; leads: number; conversao: number };
  cliquesPorRecurso: { recursoId: string; cliques: number }[];
  conversaoPorFunil: { funnelId: string; views: number; leads: number; taxa: number }[];
  conversaoPorRecurso: { recursoId: string; leads: number }[];
  origemLeads: { chave: string; leads: number }[];
};

/* ---- StatCard numérico simples ----------------------------------------- */
function StatCard({ icon, value, label }: { icon: React.ComponentProps<typeof Icon>["name"]; value: React.ReactNode; label: string }) {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: "var(--accent-050)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        <Icon name={icon} size={19} />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, color: "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
    </Card>
  );
}

/* ---- Lista de barras ---------------------------------------------------- */
function BarList({
  itens,
}: {
  itens: { label: string; valor: number; sufixo?: string; max: number }[];
}) {
  if (itens.length === 0) {
    return <div style={{ fontSize: 13, color: "var(--faint)", padding: "6px 2px" }}>Sem dados no período.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {itens.map((it, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5, gap: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-800)", flexShrink: 0 }}>{it.valor}{it.sufixo || ""}</span>
          </div>
          <Progress value={it.max > 0 ? it.valor / it.max : 0} />
        </div>
      ))}
    </div>
  );
}

const CHIPS: { id: Period; label: string }[] = [
  { id: "7", label: "7 dias" },
  { id: "30", label: "30 dias" },
  { id: "all", label: "Tudo" },
];

export function AnalisesScreen() {
  const funnels = useStore((s) => s.funnels);
  const produtos = useStore((s) => s.professional.produtos);
  const [period, setPeriod] = React.useState<Period>("7");
  const [data, setData] = React.useState<Analytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErro(false);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => {
        if (!r.ok) throw new Error("erro");
        return r.json();
      })
      .then((d: Analytics) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {
        if (!cancelled) setErro(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const nomeRecurso = React.useCallback(
    (id: string) => (produtos || []).find((r) => r.id === id)?.nome || "Recurso",
    [produtos],
  );
  const nomeFunil = React.useCallback(
    (id: string) => funnels.find((f) => f.id === id)?.nome || "Funil",
    [funnels],
  );

  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 16 }} className="lg:px-0">
      {/* Chips de período */}
      <div style={{ display: "flex", gap: 8 }}>
        {CHIPS.map((c) => {
          const on = period === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setPeriod(c.id)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                fontWeight: 700,
                fontSize: 13.5,
                border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
                background: on ? "var(--accent-050)" : "var(--card)",
                color: on ? "var(--accent-800)" : "var(--muted)",
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {loading && <div style={{ fontSize: 13.5, color: "var(--muted)", padding: "20px 2px" }}>Carregando…</div>}
      {erro && !loading && <div style={{ fontSize: 13.5, color: "var(--danger)", padding: "20px 2px" }}>Não consegui carregar as análises. Tente de novo.</div>}

      {data && !loading && !erro && (
        <>
          {/* Totais */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard icon="eye" value={data.totais.views} label="Visualizações" />
            <StatCard icon="link" value={data.totais.cliques} label="Cliques" />
            <StatCard icon="users" value={data.totais.leads} label="Leads" />
            <StatCard icon="target" value={pct(data.totais.conversao)} label="Conversão" />
          </div>

          {/* Cliques por recurso */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Cliques por recurso</SectionLabel>
            <Card>
              <BarList
                itens={data.cliquesPorRecurso.map((c) => ({
                  label: nomeRecurso(c.recursoId),
                  valor: c.cliques,
                  max: Math.max(...data.cliquesPorRecurso.map((x) => x.cliques), 1),
                }))}
              />
            </Card>
          </div>

          {/* Conversão por funil */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Conversão por funil</SectionLabel>
            <Card>
              <BarList
                itens={data.conversaoPorFunil.map((c) => ({
                  label: `${nomeFunil(c.funnelId)} · ${c.leads}/${c.views}`,
                  valor: Math.round(c.taxa * 100),
                  sufixo: "%",
                  max: 100,
                }))}
              />
            </Card>
          </div>

          {/* Conversão por recurso */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Leads por recurso</SectionLabel>
            <Card>
              <BarList
                itens={data.conversaoPorRecurso.map((c) => ({
                  label: nomeRecurso(c.recursoId),
                  valor: c.leads,
                  max: Math.max(...data.conversaoPorRecurso.map((x) => x.leads), 1),
                }))}
              />
            </Card>
          </div>

          {/* Origem dos leads */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Origem dos leads</SectionLabel>
            <Card>
              <BarList
                itens={data.origemLeads.map((o) => ({
                  label: o.chave,
                  valor: o.leads,
                  max: Math.max(...data.origemLeads.map((x) => x.leads), 1),
                }))}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
