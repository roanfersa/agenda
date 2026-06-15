"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { Avatar, Badge, Button, EmptyState, Field, SectionLabel } from "./ui";
import { DeskCard, Logo, PageHead, Td, Th, ConfirmModal } from "./shared";
import { OBJ, useStore } from "@/lib/store";
import type { OtherPro, Professional, Funnel } from "@/lib/types";

const PLANO_LABEL = { entrada: "Entrada", pro: "Pro", setup: "Setup" } as const;

type AdminScreen = "overview" | "profissionais" | "detalhe" | "setups" | "assinaturas" | "lgpd" | "equipe";

export function AdminLogin({ onLogin }: { onLogin: (email: string, senha: string) => void | Promise<void> }) {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1B231F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: 400,
          maxWidth: "100%",
          background: "var(--card)",
          borderRadius: 20,
          padding: 32,
          boxShadow: "0 30px 70px rgba(0,0,0,.4)",
        }}
      >
        <Logo size={28} />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--amber-bg)",
            color: "var(--amber-ink)",
            fontSize: 12,
            fontWeight: 700,
            padding: "5px 10px",
            borderRadius: 8,
            margin: "22px 0 6px",
          }}
        >
          <Icon name="lock" size={13} /> Backoffice — acesso restrito
        </div>
        <h1 style={{ fontSize: 23, letterSpacing: "-.02em", margin: "6px 0 6px" }}>Entrar na operação</h1>
        <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "0 0 22px", lineHeight: 1.5 }}>
          Use seu e-mail corporativo. Não há cadastro aberto.
        </p>
        <Field label="E-mail corporativo" icon="user" value={email} onChange={setEmail} />
        <Field label="Senha" type="password" icon="lock" value={senha} onChange={setSenha} style={{ marginTop: 14 }} />
        <Button full size="lg" variant="dark" onClick={() => onLogin(email, senha)} style={{ marginTop: 20 }} iconRight="arrowRight">
          Entrar
        </Button>
      </div>
    </div>
  );
}

/* ---- DeskShell — chrome + sidebar -------------------------------------- */
export function DeskShell({
  screen,
  children,
}: {
  screen: AdminScreen;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const nav: { id: AdminScreen; label: string; icon: IconName }[] = [
    { id: "overview", label: "Visão geral", icon: "grid" },
    { id: "profissionais", label: "Profissionais", icon: "users" },
    { id: "setups", label: "Setups assistidos", icon: "sparkles" },
    { id: "assinaturas", label: "Assinaturas", icon: "card" },
    { id: "lgpd", label: "LGPD", icon: "shield" },
    { id: "equipe", label: "Equipe interna", icon: "user" },
  ];
  const activeNav = screen === "detalhe" ? "profissionais" : screen;
  const go = (s: AdminScreen) => router.push(s === "overview" ? "/admin" : `/admin/${s}`);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#222B26",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1320,
          minHeight: "calc(100vh - 48px)",
          background: "var(--bg)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(0,0,0,.4)",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(0,0,0,.2)",
        }}
      >
        <div
          style={{
            height: 44,
            background: "#EDEAE3",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 7 }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
              <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />
            ))}
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 460,
              height: 26,
              background: "#fff",
              borderRadius: 7,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "0 12px",
              fontSize: 12.5,
              color: "var(--muted)",
              margin: "0 auto",
              fontWeight: 600,
            }}
          >
            <Icon name="lock" size={12} /> backoffice.agendai.com.br/admin/{screen === "overview" ? "" : screen}
          </div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          <div
            style={{
              width: 234,
              background: "#1B231F",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              padding: "18px 14px",
            }}
          >
            <div
              style={{
                padding: "0 8px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Logo size={24} light />
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                alignSelf: "flex-start",
                margin: "0 8px 16px",
                background: "rgba(255,159,67,.15)",
                color: "#FFB35C",
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 9px",
                borderRadius: 7,
              }}
            >
              <Icon name="lock" size={12} /> Acesso restrito
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {nav.map((n) => {
                const on = activeNav === n.id;
                return (
                  <button
                    key={n.id}
                    onClick={() => go(n.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "10px 12px",
                      borderRadius: 9,
                      textAlign: "left",
                      fontSize: 13.5,
                      fontWeight: on ? 700 : 600,
                      transition: "all .14s",
                      background: on ? "rgba(255,255,255,.1)" : "transparent",
                      color: on ? "#fff" : "rgba(255,255,255,.55)",
                    }}
                  >
                    <Icon name={n.icon} size={18} />
                    {n.label}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                marginTop: "auto",
                padding: 10,
                borderRadius: 11,
                background: "rgba(255,255,255,.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Avatar name="Ana Beatriz" size={32} bg="var(--accent)" />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Ana Beatriz
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Admin</div>
              </div>
            </div>
          </div>
          <div className="no-sb" style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
            <div style={{ padding: "26px 30px 40px" }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Metric ------------------------------------------------------------ */
function Metric({
  icon,
  value,
  label,
  delta,
  tone = "accent",
}: {
  icon: IconName;
  value: React.ReactNode;
  label: string;
  delta?: string;
  tone?: "accent" | "info" | "amber" | "ink";
}) {
  const tones: Record<typeof tone, [string, string]> = {
    accent: ["var(--accent-050)", "var(--accent)"],
    info: ["var(--info-bg)", "var(--info)"],
    amber: ["var(--amber-bg)", "var(--amber)"],
    ink: ["#EEECE6", "var(--ink)"],
  };
  const [bg, fg] = tones[tone];
  return (
    <DeskCard pad={18} style={{ flex: "1 1 180px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            background: bg,
            color: fg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={20} />
        </span>
        {delta && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>{delta}</span>}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 28,
          color: "var(--ink)",
          lineHeight: 1,
          letterSpacing: "-.02em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 6, fontWeight: 600 }}>{label}</div>
    </DeskCard>
  );
}

function GrowthChart() {
  const data = [12, 18, 23, 29, 38, 44, 51, 58, 67, 79, 92, 104];
  const meses = ["jul", "ago", "set", "out", "nov", "dez", "jan", "fev", "mar", "abr", "mai", "jun"];
  const max = 110,
    W = 640,
    H = 180,
    pad = 8;
  const pts = data.map((d, i) => [pad + (i * (W - pad * 2)) / (data.length - 1), H - (d / max) * (H - 20)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  return (
    <DeskCard>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <h3 style={{ fontSize: 16 }}>Profissionais ao longo do tempo</h3>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>Últimos 12 meses</div>
        </div>
        <Badge bg="var(--accent-100)" fg="var(--accent-800)">
          +18% no mês
        </Badge>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 18}`} style={{ width: "100%", height: "auto", display: "block", marginTop: 8 }}>
        <defs>
          <linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.18" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#cgrad)" />
        <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 0} fill="var(--accent)" stroke="#fff" strokeWidth="2" />
        ))}
        {meses.map((m, i) => (
          <text
            key={i}
            x={pts[i][0]}
            y={H + 13}
            fontSize="10"
            fill="var(--faint)"
            textAnchor="middle"
            fontFamily="var(--font)"
            fontWeight="600"
          >
            {m}
          </text>
        ))}
      </svg>
    </DeskCard>
  );
}

function AlertItem({
  icon,
  tone,
  title,
  sub,
  action,
  onAction,
}: {
  icon: IconName;
  tone: "danger" | "amber" | "info";
  title: string;
  sub: string;
  action: string;
  onAction: () => void;
}) {
  const map: Record<typeof tone, [string, string]> = {
    danger: ["var(--danger-bg)", "var(--danger)"],
    amber: ["var(--amber-bg)", "var(--amber)"],
    info: ["var(--info-bg)", "var(--info)"],
  };
  const [bg, fg] = map[tone];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 0", borderTop: "1px solid var(--line-soft)" }}>
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: bg,
          color: fg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{sub}</div>
      </div>
      <button
        onClick={onAction}
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--accent)",
          whiteSpace: "nowrap",
          padding: "7px 12px",
          borderRadius: 9,
          border: "1.5px solid var(--line)",
        }}
      >
        {action}
      </button>
    </div>
  );
}

/* ---- Overview ---------------------------------------------------------- */
export function Overview() {
  const router = useRouter();
  const otherPros = useStore((s) => s.otherPros);
  const ativos = otherPros.filter((p) => p.status === "ativo").length + 1;
  const openPro = (id: string) => router.push(`/admin/profissionais/${id}`);
  return (
    <div>
      <PageHead title="Visão geral" sub="Sexta, 13 de junho de 2026" />
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 22 }}>
        <Metric icon="users" value={ativos} label="Profissionais ativos" delta="+18%" tone="accent" />
        <Metric icon="money" value="R$ 9.847" label="MRR estimado" delta="+12%" tone="ink" />
        <Metric icon="sparkles" value="14" label="Novos no mês" tone="info" />
        <Metric icon="bolt" value="2" label="Setups na fila" tone="amber" />
        <Metric icon="chat" value="312" label="Leads (semana)" tone="accent" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start" }}>
        <GrowthChart />
        <DeskCard>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
            <span style={{ color: "var(--amber)" }}>
              <Icon name="alert" size={18} />
            </span>
            <h3 style={{ fontSize: 16 }}>Alertas operacionais</h3>
          </div>
          <AlertItem
            tone="danger"
            icon="card"
            title="Pagamento falhou"
            sub="Renata Aragão · Entrada R$97"
            action="Ver"
            onAction={() => openPro("pro_renata")}
          />
          <AlertItem
            tone="amber"
            icon="calendar"
            title="Sem agenda conectada"
            sub="Thiago Barros · há 5 dias"
            action="Ver"
            onAction={() => openPro("pro_thiago")}
          />
          <AlertItem
            tone="info"
            icon="funnel"
            title="Funil sem leads há 9 dias"
            sub="Sandra Vidal · risco de churn"
            action="Ver"
            onAction={() => openPro("pro_sandra")}
          />
          <AlertItem
            tone="amber"
            icon="shield"
            title="2 pedidos LGPD pendentes"
            sub="Prazo mais próximo: 18/06"
            action="Abrir"
            onAction={() => router.push("/admin/lgpd")}
          />
        </DeskCard>
      </div>
    </div>
  );
}

/* ---- helpers ----------------------------------------------------------- */
function buildPros(professional: Professional, leadsCount: number, agendaConn: boolean, otherPros: OtherPro[]): (OtherPro & { id: string })[] {
  return [
    {
      id: "pro_osvaldo",
      nome: professional.nome,
      handleInstagram: professional.handleInstagram,
      especialidade: professional.especialidade,
      plano: "entrada",
      status: "ativo",
      agenda: agendaConn,
      leads: leadsCount,
      criadoEm: professional.criadoEm,
    },
    ...otherPros,
  ];
}

/* ---- Profissionais ----------------------------------------------------- */
export function Profissionais() {
  const router = useRouter();
  const professional = useStore((s) => s.professional);
  const leads = useStore((s) => s.leads);
  const otherPros = useStore((s) => s.otherPros);
  const [status, setStatus] = React.useState<string>("todos");
  const [q, setQ] = React.useState("");
  const all = buildPros(professional, leads.length, professional.googleCalendar.conectado, otherPros);
  let rows = all;
  if (status !== "todos") rows = rows.filter((r) => r.status === status);
  if (q.trim()) rows = rows.filter((r) => (r.nome + r.handleInstagram).toLowerCase().includes(q.toLowerCase()));
  const filters: [string, string][] = [
    ["todos", "Todos"],
    ["ativo", "Ativos"],
    ["trial", "Trial"],
    ["inadimplente", "Inadimplentes"],
    ["cancelado", "Cancelados"],
  ];
  return (
    <div>
      <PageHead title="Profissionais" sub={`${all.length} contas`} />
      <DeskCard pad={0}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: 16,
            borderBottom: "1px solid var(--line-soft)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
            <Field placeholder="Buscar nome ou @" icon="search" value={q} onChange={setQ} />
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            {filters.map(([id, l]) => {
              const on = status === id;
              return (
                <button
                  key={id}
                  onClick={() => setStatus(id)}
                  style={{
                    padding: "8px 13px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 700,
                    background: on ? "var(--ink)" : "var(--bg)",
                    color: on ? "#fff" : "var(--muted)",
                    border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                    transition: "all .14s",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr>
                <Th>Profissional</Th>
                <Th>Especialidade</Th>
                <Th>Plano</Th>
                <Th>Status</Th>
                <Th>Agenda</Th>
                <Th style={{ textAlign: "right" }}>Leads</Th>
                <Th>Cadastro</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => router.push(`/admin/profissionais/${r.id}`)}
                  style={{ cursor: "pointer", transition: "background .12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                      <Avatar name={r.nome} size={36} bg="var(--accent-100)" fg="var(--accent-800)" />
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--ink)" }}>{r.nome}</div>
                        <div style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600 }}>{r.handleInstagram}</div>
                      </div>
                    </div>
                  </Td>
                  <Td>{r.especialidade}</Td>
                  <Td>
                    <Badge
                      bg={r.plano === "pro" ? "var(--info-bg)" : "var(--accent-050)"}
                      fg={r.plano === "pro" ? "var(--info)" : "var(--accent-800)"}
                    >
                      {PLANO_LABEL[r.plano]}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge status={r.status} dot />
                  </Td>
                  <Td>
                    {r.agenda ? (
                      <span style={{ color: "var(--accent)", display: "inline-flex" }}>
                        <Icon name="checkCircle" size={19} />
                      </span>
                    ) : (
                      <span style={{ color: "var(--faint)", display: "inline-flex" }}>
                        <Icon name="x" size={18} />
                      </span>
                    )}
                  </Td>
                  <Td style={{ textAlign: "right", fontWeight: 700, color: "var(--ink)" }}>{r.leads}</Td>
                  <Td style={{ color: "var(--muted)", fontSize: 13 }}>{r.criadoEm}</Td>
                  <Td style={{ textAlign: "right", color: "var(--faint)" }}>
                    <Icon name="chevRight" size={17} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DeskCard>
    </div>
  );
}

/* ---- FunnelPreview ----------------------------------------------------- */
function FunnelPreview({ funnel, pro }: { funnel: Funnel | { mensagemBoasVindas: string; perguntas: { texto: string; opcoes?: string[] }[] }; pro: { nome: string; especialidade: string } }) {
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
            {funnel.perguntas[0].opcoes.map((o, i) => (
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

/* ---- Detalhe da conta ------------------------------------------------- */
function ActionBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 13.5,
        fontWeight: 700,
        border: `1.5px solid ${danger ? "var(--danger-bg)" : "var(--line)"}`,
        color: danger ? "var(--danger)" : "var(--ink)",
        background: h ? (danger ? "var(--danger-bg)" : "var(--bg)") : "var(--card)",
        transition: "background .14s",
      }}
    >
      <Icon name={icon} size={17} />
      {label}
    </button>
  );
}

function InfoRow({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: last ? "none" : "1px solid var(--line-soft)",
      }}
    >
      <span style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export function DetalheConta({ proId }: { proId: string }) {
  const router = useRouter();
  const professional = useStore((s) => s.professional);
  const leads = useStore((s) => s.leads);
  const otherPros = useStore((s) => s.otherPros);
  const subscriptions = useStore((s) => s.subscriptions);
  const appointments = useStore((s) => s.appointments);
  const funnel = useStore((s) => s.funnel);
  const auditLog = useStore((s) => s.auditLog);
  const toast = useStore((s) => s.toast);
  const all = buildPros(professional, leads.length, professional.googleCalendar.conectado, otherPros);
  const pro = all.find((p) => p.id === proId) || all[0];
  const isOsvaldo = pro.id === "pro_osvaldo";
  const sub = subscriptions.find((s) => s.professionalId === pro.id);
  const [impersonate, setImpersonate] = React.useState(false);
  return (
    <div>
      <button
        onClick={() => router.push("/admin/profissionais")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13.5,
          fontWeight: 700,
          color: "var(--muted)",
          marginBottom: 16,
        }}
      >
        <Icon name="arrowLeft" size={16} /> Profissionais
      </button>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24, flexWrap: "wrap" }}>
        <Avatar name={pro.nome} size={64} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 25, letterSpacing: "-.02em" }}>{pro.nome}</h1>
            <Badge status={pro.status} dot />
          </div>
          <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
            {pro.especialidade} ·{" "}
            <span style={{ color: "var(--accent)", fontWeight: 600 }}>{pro.handleInstagram}</span> · desde {pro.criadoEm}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <ActionBtn icon="bolt" label="Alterar plano" onClick={() => toast("Alterar plano (mock)")} />
        <ActionBtn icon="refresh" label="Reenviar convite" onClick={() => toast("Convite reenviado")} />
        <ActionBtn icon="sparkles" label="Abrir setup assistido" onClick={() => router.push("/admin/setups")} />
        <ActionBtn icon="eye" label="Entrar como" onClick={() => setImpersonate(true)} />
        <ActionBtn
          icon="lock"
          label={pro.status === "cancelado" ? "Reativar" : "Suspender"}
          danger
          onClick={() => toast("Ação registrada no log")}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Conta & pagamento</h3>
            <InfoRow
              label="Plano"
              value={
                <Badge
                  bg={pro.plano === "pro" ? "var(--info-bg)" : "var(--accent-050)"}
                  fg={pro.plano === "pro" ? "var(--info)" : "var(--accent-800)"}
                >
                  {PLANO_LABEL[pro.plano]}
                </Badge>
              }
            />
            <InfoRow label="Pagamento" value={sub ? <Badge status={sub.status} dot /> : "—"} />
            <InfoRow label="Valor" value={sub ? `R$${sub.valor}/${sub.ciclo === "mensal" ? "mês" : "única vez"}` : "—"} />
            <InfoRow label="Próx. vencimento" value={sub?.proximoVencimento || "—"} last />
          </DeskCard>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Leads & agenda</h3>
            <div style={{ display: "flex", gap: 22 }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--ink)" }}>{pro.leads}</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>leads</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--ink)" }}>
                  {isOsvaldo ? appointments.length : Math.round(pro.leads * 0.4)}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>agendados</div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 26,
                    color: pro.agenda ? "var(--accent)" : "var(--faint)",
                  }}
                >
                  {pro.agenda ? "Sim" : "Não"}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600 }}>agenda conectada</div>
              </div>
            </div>
          </DeskCard>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <DeskCard>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 15 }}>Funil publicado</h3>
              <Badge bg="var(--accent-100)" fg="var(--accent-800)">
                {OBJ(isOsvaldo ? funnel.objetivo : "agendar").titulo}
              </Badge>
            </div>
            <FunnelPreview
              funnel={
                isOsvaldo
                  ? funnel
                  : {
                      mensagemBoasVindas: `Oi! Sou ${pro.nome.split(" ")[0]} 🌿 Me conta rapidinho como posso ajudar.`,
                      perguntas: [{ texto: "O que te interessa?", opcoes: ["Primeira vez", "Retorno"] }],
                    }
              }
              pro={isOsvaldo ? professional : { nome: pro.nome, especialidade: pro.especialidade }}
            />
          </DeskCard>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Histórico / auditoria</h3>
            {auditLog.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 11, padding: "9px 0", borderTop: "1px solid var(--line-soft)" }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 8,
                    background: "var(--accent)",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 600 }}>{a.acao}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
                    {a.internalUser} · {a.dataHora}
                  </div>
                </div>
              </div>
            ))}
          </DeskCard>
        </div>
      </div>
      {impersonate && (
        <ConfirmModal
          icon="eye"
          title={`Entrar como ${pro.nome}?`}
          body="Você verá o app exatamente como o profissional. A ação fica registrada no log de auditoria, com data e hora."
          confirm="Entrar como"
          onConfirm={() => {
            setImpersonate(false);
            toast("Sessão de suporte registrada no log");
          }}
          onClose={() => setImpersonate(false)}
        />
      )}
    </div>
  );
}

/* ---- Setups Kanban ---------------------------------------------------- */
const SETUP_COLS: [string, string][] = [
  ["solicitado", "Solicitado"],
  ["em_montagem", "Em montagem"],
  ["aguardando_cliente", "Aguardando cliente"],
  ["concluido", "Concluído"],
];
const NEXT_STATUS: Record<string, "em_montagem" | "aguardando_cliente" | "concluido"> = {
  solicitado: "em_montagem",
  em_montagem: "aguardando_cliente",
  aguardando_cliente: "concluido",
};

export function Setups() {
  const setups = useStore((s) => s.setups);
  const advanceSetup = useStore((s) => s.advanceSetup);
  return (
    <div>
      <PageHead title="Setups assistidos" sub="Done-for-you · R$300–500 por conta" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, alignItems: "start" }}>
        {SETUP_COLS.map(([id, label]) => {
          const cards = setups.filter((s) => s.status === id);
          return (
            <div
              key={id}
              style={{
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: 12,
                minHeight: 200,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "2px 6px 12px",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{label}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--muted)",
                    background: "var(--bg)",
                    borderRadius: 7,
                    padding: "2px 8px",
                  }}
                >
                  {cards.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {cards.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                      <Avatar name={c.nome} size={30} bg="var(--accent-100)" fg="var(--accent-800)" />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {c.nome}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{c.especialidade}</div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--muted)",
                        marginBottom: 10,
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "var(--ink)" }}>R${c.valor}</span>
                      <span>{c.responsavel}</span>
                    </div>
                    {NEXT_STATUS[c.status] ? (
                      <button
                        onClick={() => advanceSetup(c.id, NEXT_STATUS[c.status]!)}
                        style={{
                          width: "100%",
                          padding: "7px 0",
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 700,
                          background: "var(--accent-050)",
                          color: "var(--accent-800)",
                          border: "1px solid var(--accent-100)",
                        }}
                      >
                        Avançar →
                      </button>
                    ) : (
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        <Icon name="check" size={14} /> Entregue
                      </div>
                    )}
                  </div>
                ))}
                {!cards.length && (
                  <div style={{ textAlign: "center", fontSize: 12, color: "var(--faint)", padding: "16px 0" }}>vazio</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Assinaturas ------------------------------------------------------ */
export function Assinaturas() {
  const subscriptions = useStore((s) => s.subscriptions);
  const toast = useStore((s) => s.toast);
  const total = subscriptions
    .filter((s) => s.status !== "cancelado" && s.ciclo === "mensal")
    .reduce((a, s) => a + s.valor, 0);
  return (
    <div>
      <PageHead
        title="Assinaturas"
        sub={`MRR R$ ${total.toLocaleString("pt-BR")} · ${subscriptions.length} contratos`}
        action={
          <Badge bg="var(--danger-bg)" fg="var(--danger-ink)" dot>
            1 atrasada
          </Badge>
        }
      />
      <DeskCard pad={0}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr>
                <Th>Profissional</Th>
                <Th>Plano</Th>
                <Th>Valor</Th>
                <Th>Ciclo</Th>
                <Th>Próx. vencimento</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((s) => (
                <tr key={s.id}>
                  <Td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Avatar name={s.nome} size={32} bg="var(--accent-100)" fg="var(--accent-800)" />
                      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{s.nome}</span>
                    </div>
                  </Td>
                  <Td>
                    <Badge
                      bg={
                        s.plano === "pro"
                          ? "var(--info-bg)"
                          : s.plano === "setup"
                          ? "var(--amber-bg)"
                          : "var(--accent-050)"
                      }
                      fg={
                        s.plano === "pro"
                          ? "var(--info)"
                          : s.plano === "setup"
                          ? "var(--amber-ink)"
                          : "var(--accent-800)"
                      }
                    >
                      {PLANO_LABEL[s.plano]}
                    </Badge>
                  </Td>
                  <Td style={{ fontWeight: 700, color: "var(--ink)" }}>R${s.valor}</Td>
                  <Td>{s.ciclo === "mensal" ? "Mensal" : "Única"}</Td>
                  <Td>{s.proximoVencimento}</Td>
                  <Td>
                    <Badge status={s.status} dot />
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    {s.status === "atrasado" ? (
                      <button
                        onClick={() => toast("Cobrança marcada como resolvida (mock)")}
                        style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap" }}
                      >
                        Marcar resolvida
                      </button>
                    ) : (
                      <button
                        onClick={() => toast("Histórico de cobranças (mock)")}
                        style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", whiteSpace: "nowrap" }}
                      >
                        Ver histórico
                      </button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DeskCard>
      <div
        style={{
          marginTop: 14,
          fontSize: 12.5,
          color: "var(--faint)",
          display: "flex",
          alignItems: "center",
          gap: 7,
        }}
      >
        <Icon name="lock" size={14} /> Sem gateway real — só visualização e gestão.
      </div>
    </div>
  );
}

/* ---- LGPD ------------------------------------------------------------- */
const TIPO_LGPD = { acesso: "Acesso", correcao: "Correção", exclusao: "Exclusão" } as const;

export function Lgpd() {
  const lgpdRequests = useStore((s) => s.lgpdRequests);
  const consentLogs = useStore((s) => s.consentLogs);
  const resolveLgpd = useStore((s) => s.resolveLgpd);
  const toast = useStore((s) => s.toast);
  const [excluir, setExcluir] = React.useState<(typeof lgpdRequests)[number] | null>(null);
  return (
    <div>
      <PageHead title="LGPD" sub="Pedidos de titular, logs de consentimento e exclusão de dados" />
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 18, alignItems: "start" }}>
        <DeskCard pad={0}>
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid var(--line-soft)",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span style={{ color: "var(--accent)" }}>
              <Icon name="shield" size={18} />
            </span>
            <h3 style={{ fontSize: 15 }}>Pedidos de titular</h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <Th>Titular</Th>
                <Th>Profissional</Th>
                <Th>Tipo</Th>
                <Th>Prazo</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {lgpdRequests.map((r) => (
                <tr key={r.id}>
                  <Td style={{ fontWeight: 700, color: "var(--ink)" }}>{r.leadNome}</Td>
                  <Td style={{ fontSize: 13 }}>{r.professionalNome}</Td>
                  <Td>
                    <Badge
                      bg={r.tipo === "exclusao" ? "var(--danger-bg)" : "var(--bg)"}
                      fg={r.tipo === "exclusao" ? "var(--danger-ink)" : "var(--muted)"}
                    >
                      {TIPO_LGPD[r.tipo]}
                    </Badge>
                  </Td>
                  <Td style={{ fontSize: 13 }}>{r.prazo}</Td>
                  <Td>
                    <Badge status={r.status} dot />
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    {r.status === "pendente" &&
                      (r.tipo === "exclusao" ? (
                        <button
                          onClick={() => setExcluir(r)}
                          style={{ fontSize: 12.5, fontWeight: 700, color: "var(--danger)" }}
                        >
                          Excluir dados
                        </button>
                      ) : (
                        <button
                          onClick={() => resolveLgpd(r.id)}
                          style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}
                        >
                          Atender
                        </button>
                      ))}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </DeskCard>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 12 }}>Logs de consentimento</h3>
            <div className="no-sb" style={{ maxHeight: 260, overflowY: "auto" }}>
              {consentLogs.map((c) => (
                <div key={c.id} style={{ padding: "10px 0", borderTop: "1px solid var(--line-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{c.leadNome}</span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{c.dataHora}</span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 3,
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    “{c.texto}”
                  </div>
                </div>
              ))}
            </div>
          </DeskCard>
          <DeskCard>
            <h3 style={{ fontSize: 15, marginBottom: 4 }}>Encarregado / DPO</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 10 }}>
              <Avatar name="Ana Beatriz" size={38} bg="var(--accent)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>Ana Beatriz</div>
                <div style={{ fontSize: 12.5, color: "var(--muted)" }}>dpo@biofunil.com.br</div>
              </div>
            </div>
          </DeskCard>
        </div>
      </div>
      {excluir && (
        <ConfirmModal
          danger
          icon="trash"
          title={`Excluir os dados de ${excluir.leadNome}?`}
          body="Esta ação anonimiza nome e WhatsApp e remove as respostas do lead. É irreversível e fica registrada no log de auditoria. Só Admin pode executar."
          confirm="Confirmar exclusão"
          doubleConfirm
          onConfirm={() => {
            resolveLgpd(excluir.id);
            setExcluir(null);
            toast("Dados anonimizados e registrados");
          }}
          onClose={() => setExcluir(null)}
        />
      )}
    </div>
  );
}

/* ---- Equipe ----------------------------------------------------------- */
const PAPEL: Record<string, [string, string, string]> = {
  admin: ["Admin", "var(--accent-100)", "var(--accent-800)"],
  operacao: ["Operação / Suporte", "var(--info-bg)", "var(--info)"],
  financeiro: ["Financeiro", "var(--amber-bg)", "var(--amber-ink)"],
};
const PERMS: Record<string, string> = {
  admin: "Tudo, incl. “entrar como” e exclusão LGPD",
  operacao: "Profissionais, setups e suporte",
  financeiro: "Assinaturas e cobranças",
};

export function Equipe() {
  const internalUsers = useStore((s) => s.internalUsers);
  const toast = useStore((s) => s.toast);
  return (
    <div>
      <PageHead
        title="Equipe interna"
        sub="Usuários e papéis"
        action={
          <Button variant="dark" icon="plus" onClick={() => toast("Convidar membro (mock)")}>
            Convidar membro
          </Button>
        }
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {internalUsers.map((u) => {
          const [label, bg, fg] = PAPEL[u.papel];
          return (
            <DeskCard key={u.id} pad={18}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar name={u.nome} size={42} bg="var(--accent)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{u.nome}</div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {u.email}
                  </div>
                </div>
                <button onClick={() => toast("Remover membro (mock)")} style={{ color: "var(--faint)", display: "flex" }}>
                  <Icon name="dots" size={18} />
                </button>
              </div>
              <Badge bg={bg} fg={fg}>
                {label}
              </Badge>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.45 }}>
                {PERMS[u.papel]}
              </div>
            </DeskCard>
          );
        })}
      </div>
      <DeskCard style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ color: "var(--accent)", flexShrink: 0 }}>
          <Icon name="shield" size={20} />
        </span>
        <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--ink)" }}>Papéis definem o acesso.</b> Apenas <b>Admin</b> pode usar “entrar como” e
          executar exclusões de dados (LGPD). Operação cuida de contas e setups; Financeiro vê assinaturas e cobranças.
        </div>
      </DeskCard>
    </div>
  );
}
