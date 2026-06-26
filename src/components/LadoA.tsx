"use client";

import * as React from "react";
import { Icon, type IconName } from "./Icon";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  SectionLabel,
} from "./ui";
import { BioLinkCard, Toggle, Logo } from "./shared";
import { fmtWhats, useStore, waLink } from "@/lib/store";
import { hasFeature } from "@/lib/features";
import type { Lead } from "@/lib/types";

/* ---- LoginScreen --------------------------------------------------------- */
export function LoginScreen({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  const [tab, setTab] = React.useState<"entrar" | "cadastrar">("entrar");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [erro, setErro] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const handleAuth = async () => {
    if (busy) return;
    setErro(null);
    if (!email || senha.length < 6) {
      setErro("Informe e-mail e uma senha de pelo menos 6 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      if (tab === "entrar") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        onLogin();
      } else {
        const { error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        onSignup();
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível autenticar.");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const next = tab === "entrar" ? "/inicio" : "/onboarding?novo=1";
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
    } catch {
      setErro("Não foi possível conectar com o Google.");
      setBusy(false);
    }
  };
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--card)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ flex: 1 }}>
          <Logo size={32} />
          <div style={{ marginTop: "min(12vh, 90px)" }}>
            <h1 style={{ fontSize: 32, lineHeight: 1.08, letterSpacing: "-.03em", marginBottom: 14 }}>
              O fim do<br />“chama no direct”.
            </h1>
            <p style={{ fontSize: 15.5, color: "var(--muted)", lineHeight: 1.5, maxWidth: 300 }}>
              Receba gente já qualificada e marcada. Direto da sua bio.
            </p>
          </div>
          <div style={{ marginTop: 36 }}>
            <div style={{ display: "flex", background: "var(--bg)", borderRadius: 12, padding: 4, marginBottom: 22 }}>
              {(
                [
                  ["entrar", "Entrar"],
                  ["cadastrar", "Criar conta"],
                ] as const
              ).map(([id, l]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 9,
                    fontWeight: 700,
                    fontSize: 14,
                    background: tab === id ? "var(--card)" : "transparent",
                    color: tab === id ? "var(--ink)" : "var(--muted)",
                    boxShadow: tab === id ? "var(--sh-sm)" : "none",
                    transition: "all .15s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <Button
              full
              size="lg"
              variant="outline"
              icon="google"
              onClick={handleGoogle}
              disabled={busy}
              style={{ marginBottom: 12 }}
            >
              {tab === "entrar" ? "Entrar com Google" : "Criar conta com Google"}
            </Button>
            <div style={{ textAlign: "center", fontSize: 12.5, color: "var(--faint)", fontWeight: 600, margin: "6px 0 14px" }}>
              já conecta sua agenda depois
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "6px 0 18px" }}>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              <span style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600 }}>ou com e-mail</span>
              <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>
            <Field placeholder="seu@email.com" icon="user" value={email} onChange={setEmail} />
            <Field placeholder="Senha" type="password" icon="lock" value={senha} onChange={setSenha} style={{ marginTop: 11 }} />
            <Button full size="lg" onClick={handleAuth} disabled={busy} style={{ marginTop: 16 }} iconRight="arrowRight">
              {tab === "entrar" ? "Entrar" : "Começar o setup"}
            </Button>
            {erro && (
              <div style={{ marginTop: 12, fontSize: 13, color: "var(--danger)", fontWeight: 600, textAlign: "center" }}>
                {erro}
              </div>
            )}
          </div>
        </div>
        <div style={{ padding: "24px 0 6px", textAlign: "center", fontSize: 12.5, color: "var(--faint)", lineHeight: 1.5 }}>
          Ao continuar você concorda com os{" "}
          <a href="/termos" style={{ color: "var(--muted)", fontWeight: 600 }}>Termos</a> e a{" "}
          <a href="/privacidade" style={{ color: "var(--muted)", fontWeight: 600 }}>Política de Privacidade</a>.
          <div style={{ marginTop: 8, fontSize: 11.5 }}>
            LEVERPEAK LTDA · CNPJ 67.097.696/0001-97
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- StatCard ------------------------------------------------------------ */
type Tone = "accent" | "info" | "amber";
function StatCard({ icon, value, label, tone = "accent" }: { icon: IconName; value: React.ReactNode; label: string; tone?: Tone }) {
  const tones: Record<Tone, [string, string]> = {
    accent: ["var(--accent-050)", "var(--accent)"],
    info: ["var(--info-bg)", "var(--info)"],
    amber: ["var(--amber-bg)", "var(--amber)"],
  };
  const [bg, fg] = tones[tone];
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 14, flex: 1 }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: bg,
          color: fg,
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
    </div>
  );
}

/* ---- LeadRow ------------------------------------------------------------- */
export function LeadRow({ lead, onClick }: { lead: Lead; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        textAlign: "left",
        background: "transparent",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar name={lead.nome} size={44} bg="var(--accent-100)" fg="var(--accent-800)" />
        {lead._novo && (
          <span
            style={{
              position: "absolute",
              top: -1,
              right: -1,
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "var(--danger)",
              border: "2px solid var(--card)",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>{lead.nome}</span>
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginTop: 2,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {lead.resumoEditado && (
            <span title="resumo editado" style={{ color: "var(--accent)", display: "inline-flex", flexShrink: 0 }}>
              <Icon name="edit" size={12} />
            </span>
          )}
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.resumoIA}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <Badge status={lead.status} />
        <span style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 600 }}>
          {lead.criadoEm.replace("Agora mesmo", "agora").replace(",", "")}
        </span>
      </div>
    </button>
  );
}

/* ---- Dashboard ----------------------------------------------------------- */
export function Dashboard({
  openLead,
  go,
}: {
  openLead: (id: string) => void;
  go: (s: string) => void;
}) {
  const leads = useStore((s) => s.leads);
  const appointments = useStore((s) => s.appointments);
  const funnel = useStore((s) => s.funnel);
  const toast = useStore((s) => s.toast);
  const novos = leads.filter((l) => l._novo || l.status === "novo").length;
  const recent = leads.slice(0, 4);
  return (
    <div
      style={{ padding: "4px 18px 0", display: "flex", flexDirection: "column", gap: 18 }}
      className="lg:px-0"
    >
      <div className="lg:hidden">
        <BioLinkCard
          slug={funnel.slug}
          onCopy={() => toast("Link copiado!")}
          onShare={() => toast("Abrindo compartilhamento…")}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }} className="lg:grid lg:grid-cols-4 lg:gap-4">
        <StatCard icon="bell" value={novos} label="Leads novos" tone="accent" />
        <StatCard icon="calendar" value={appointments.length} label="Agendamentos" tone="info" />
        <StatCard icon="users" value={leads.length} label="Leads na semana" tone="amber" />
        <div className="hidden lg:block">
          <StatCard icon="chat" value="68%" label="Taxa de qualificação" tone="accent" />
        </div>
      </div>
      <button
        onClick={() => go("automacoes")}
        style={{
          width: "100%",
          textAlign: "left",
          background: "linear-gradient(120deg, #1B231F, #244038)",
          borderRadius: "var(--r-lg)",
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#fff",
        }}
      >
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            background: "rgba(255,255,255,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="instagram" size={22} />
        </span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>Comentou? Vira DM.</span>
            <span style={{ fontSize: 9.5, fontWeight: 800, background: "#FFB35C", color: "#3a2400", padding: "2px 6px", borderRadius: 5 }}>
              PRO
            </span>
          </span>
          <span style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,.65)", marginTop: 1 }}>
            Responda comentários do Insta no automático
          </span>
        </span>
        <Icon name="chevRight" size={18} style={{ opacity: 0.6 }} />
      </button>
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
            padding: "0 2px",
          }}
        >
          <SectionLabel>Últimos leads</SectionLabel>
          <button onClick={() => go("leads")} style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
            Ver todos
          </button>
        </div>
        {leads.length ? (
          <Card pad={6}>
            {recent.map((l, i) => (
              <React.Fragment key={l.id}>
                {i > 0 && <div style={{ height: 1, background: "var(--line-soft)", margin: "0 14px" }} />}
                <div style={{ padding: "0 8px" }}>
                  <LeadRow lead={l} onClick={() => openLead(l.id)} />
                </div>
              </React.Fragment>
            ))}
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon="link"
              title="Seu link tá no ar"
              body="Assim que alguém clicar, o lead aparece aqui."
              action={
                <Button variant="soft" icon="copy" onClick={() => toast("Link copiado!")}>
                  Copiar link da bio
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---- LeadsScreen --------------------------------------------------------- */
export function LeadsScreen({ openLead }: { openLead: (id: string) => void }) {
  const leads = useStore((s) => s.leads);
  const [filter, setFilter] = React.useState<"todos" | "novo" | "agendado" | "em_conversa">("todos");
  const [q, setQ] = React.useState("");
  const filters: [typeof filter, string][] = [
    ["todos", "Todos"],
    ["novo", "Novos"],
    ["agendado", "Agendados"],
    ["em_conversa", "Em conversa"],
  ];
  let list = leads;
  if (filter !== "todos") list = list.filter((l) => l.status === filter);
  if (q.trim()) list = list.filter((l) => l.nome.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ padding: "0 18px" }}>
      <div style={{ position: "sticky", top: 0, background: "var(--bg)", paddingBottom: 10, zIndex: 2 }}>
        <Field placeholder="Buscar por nome" icon="search" value={q} onChange={setQ} />
        <div className="no-sb" style={{ display: "flex", gap: 7, overflowX: "auto", marginTop: 12 }}>
          {filters.map(([id, l]) => {
            const on = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  background: on ? "var(--ink)" : "var(--card)",
                  color: on ? "#fff" : "var(--text)",
                  border: `1.5px solid ${on ? "var(--ink)" : "var(--line)"}`,
                  flexShrink: 0,
                  transition: "all .15s",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>
      {list.length ? (
        <Card pad={6} style={{ marginTop: 4 }}>
          {list.map((l, i) => (
            <React.Fragment key={l.id}>
              {i > 0 && <div style={{ height: 1, background: "var(--line-soft)", margin: "0 14px" }} />}
              <div style={{ padding: "0 8px" }}>
                <LeadRow lead={l} onClick={() => openLead(l.id)} />
              </div>
            </React.Fragment>
          ))}
        </Card>
      ) : (
        <EmptyState icon="users" title="Nada por aqui" body="Nenhum lead com esse filtro." />
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "center",
          padding: "18px 0 8px",
          color: "var(--faint)",
          fontSize: 12.5,
          fontWeight: 600,
        }}
      >
        <Icon name="lock" size={14} /> Seu histórico fica salvo aqui, sempre.
      </div>
    </div>
  );
}

/* ---- ResumoIA ------------------------------------------------------------ */
export function ResumoIA({ lead, desk }: { lead: Lead; desk?: boolean }) {
  const [editing, setEditing] = React.useState(false);
  const [txt, setTxt] = React.useState(lead.resumoIA);
  const updateLead = useStore((s) => s.updateLead);
  const toast = useStore((s) => s.toast);
  React.useEffect(() => {
    setTxt(lead.resumoIA);
  }, [lead.id, lead.resumoIA]);
  const save = () => {
    if (txt.trim()) updateLead(lead.id, { resumoIA: txt.trim(), resumoEditado: true });
    setEditing(false);
    toast("Resumo salvo ✓");
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, padding: desk ? 0 : "0 2px" }}>
        <span style={{ color: "var(--accent)", display: "flex" }}>
          <Icon name="sparkles" size={16} />
        </span>
        <SectionLabel>Resumo da IA</SectionLabel>
        {lead.resumoEditado && (
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: "var(--muted)",
              background: "var(--bg)",
              padding: "2px 7px",
              borderRadius: 6,
            }}
          >
            editado por você
          </span>
        )}
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, color: "var(--accent)", fontWeight: 700, fontSize: 12.5 }}
          >
            <Icon name="edit" size={14} /> Editar
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <Field as="textarea" rows={4} value={txt} onChange={setTxt} autoFocus />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button size="sm" onClick={save} icon="check">
              Salvar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setTxt(lead.resumoIA);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: "var(--accent-050)",
            border: "1px solid var(--accent-100)",
            borderRadius: 16,
            padding: 16,
            fontSize: desk ? 14.5 : 15,
            lineHeight: 1.55,
            color: "var(--accent-800)",
            fontWeight: 500,
          }}
        >
          {lead.resumoIA}
        </div>
      )}
    </div>
  );
}

/* ---- LeadDetail ---------------------------------------------------------- */
export function LeadDetail({
  lead,
  go,
}: {
  lead: Lead | undefined;
  go: (s: string) => void;
}) {
  const appointments = useStore((s) => s.appointments);
  const professional = useStore((s) => s.professional);
  const toast = useStore((s) => s.toast);
  const [iaMsg, setIaMsg] = React.useState<string | null>(null);
  const [draftingIa, setDraftingIa] = React.useState(false);
  const sugerirFollowup = async () => {
    if (!lead || draftingIa) return;
    setDraftingIa(true);
    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (res.ok && data.texto) {
        setIaMsg(data.texto);
        toast("Mensagem sugerida ✨ — revise antes de enviar.");
      } else {
        toast(data.error || "Não foi possível sugerir.");
      }
    } catch {
      toast("Erro de conexão com a IA.");
    } finally {
      setDraftingIa(false);
    }
  };
  if (!lead) return <EmptyState icon="users" title="Lead não encontrado" />;
  const appt = appointments.find((a) => a.leadId === lead.id);
  const waMsg = iaMsg || `Oi ${lead.nome.split(" ")[0]}! Aqui é o ${professional.nome.split(" ")[0]}. Recebi seu contato pelo link 🌿`;
  return (
    <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Avatar name={lead.nome} size={52} bg="var(--accent-100)" fg="var(--accent-800)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>{lead.nome}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 1 }}>
              {lead.whatsapp && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon name="whatsapp" size={13} /> {fmtWhats(lead.whatsapp)}
                </span>
              )}
              {lead.email && (
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon name="chat" size={13} /> {lead.email}
                </span>
              )}
            </div>
          </div>
          <Badge status={lead.status} />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {lead.whatsapp ? (
            <a href={waLink(lead.whatsapp, waMsg)} target="_blank" rel="noopener" style={{ flex: 1, textDecoration: "none" }}>
              <Button full variant="whats" icon="whatsapp">
                Abrir no WhatsApp
              </Button>
            </a>
          ) : lead.email ? (
            <a href={`mailto:${lead.email}`} style={{ flex: 1, textDecoration: "none" }}>
              <Button full variant="dark" icon="chat">
                Enviar e-mail
              </Button>
            </a>
          ) : null}
        </div>
        {lead.whatsapp && hasFeature(professional, "gerar_ia") && (
          <div style={{ marginTop: 8 }}>
            <Button full size="sm" variant="outline" icon="bolt" onClick={sugerirFollowup} disabled={draftingIa}>
              {draftingIa ? "Escrevendo…" : iaMsg ? "Refazer sugestão de follow-up" : "Sugerir follow-up com IA"}
            </Button>
            {iaMsg && (
              <div style={{ marginTop: 8, padding: "10px 12px", background: "var(--accent-050)", borderRadius: 10, fontSize: 13, color: "var(--ink)", lineHeight: 1.45 }}>
                {iaMsg}
              </div>
            )}
          </div>
        )}
      </Card>
      <ResumoIA lead={lead} />
      {appt && (
        <Card style={{ borderColor: "var(--accent-200)" }} onClick={() => go("agenda")} hover>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.85 }}>
                {appt.diaRotulo.split(",")[1]?.trim().split(" ")[1] || ""}
              </span>
              <span style={{ fontSize: 18, fontWeight: 800 }}>
                {appt.diaRotulo.split(",")[1]?.trim().split(" ")[0] || ""}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>
                {appt.diaRotulo}, {appt.hora}
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                <Icon name={appt.modalidade === "online" ? "video" : "mappin"} size={14} /> {appt.tipoAtendimento} ·{" "}
                {appt.modalidade === "online" ? "Online" : "Presencial"}
              </div>
            </div>
            <span style={{ color: "var(--faint)" }}>
              <Icon name="chevRight" size={18} />
            </span>
          </div>
        </Card>
      )}
      <div>
        <SectionLabel style={{ marginBottom: 8, paddingLeft: 2 }}>Respostas do funil</SectionLabel>
        <Card pad={4}>
          {lead.respostas.map((r, i) => (
            <div key={i} style={{ padding: "12px 14px", borderTop: i > 0 ? "1px solid var(--line-soft)" : "none" }}>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 4 }}>{r.pergunta}</div>
              <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14.5 }}>{r.valor}</div>
            </div>
          ))}
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "12px 14px",
        }}
      >
        <span style={{ color: "var(--accent)" }}>
          <Icon name="shield" size={18} />
        </span>
        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
          Consentimento registrado em {lead.consentimento.dataHora}
        </span>
      </div>
    </div>
  );
}

/* ---- AgendaScreen -------------------------------------------------------- */
export function AgendaScreen({ openLead }: { openLead: (id: string) => void }) {
  const appointments = useStore((s) => s.appointments);
  const leads = useStore((s) => s.leads);
  const professional = useStore((s) => s.professional);
  const appts = [...appointments].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
  const groups: Record<string, typeof appts> = {};
  appts.forEach((a) => {
    (groups[a.diaRotulo] = groups[a.diaRotulo] || []).push(a);
  });
  const keys = Object.keys(groups);
  if (!appts.length)
    return (
      <div style={{ padding: "0 18px" }}>
        <EmptyState
          icon="calendar"
          title="Agenda livre"
          body="Quando alguém marcar pelo funil, aparece aqui — e no seu Google Agenda."
        />
      </div>
    );
  return (
    <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          background: "var(--accent-050)",
          borderRadius: 12,
          padding: "11px 14px",
        }}
      >
        <Icon name="google" size={18} />
        <span style={{ fontSize: 13, color: "var(--accent-800)", fontWeight: 600 }}>
          Sincronizado com {professional.googleCalendar.calendarId}
        </span>
      </div>
      {keys.map((k) => (
        <div key={k}>
          <SectionLabel style={{ marginBottom: 8, paddingLeft: 2 }}>{k}</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {groups[k].map((a) => {
              const lead = leads.find((l) => l.id === a.leadId);
              return (
                <Card key={a.id} onClick={() => lead && openLead(lead.id)} hover pad={14}>
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--accent)" }}>{a.hora}</div>
                    </div>
                    <div style={{ width: 1, alignSelf: "stretch", background: "var(--line)" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>{lead?.nome || "Lead"}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <Icon name={a.modalidade === "online" ? "video" : "mappin"} size={14} /> {a.tipoAtendimento} ·{" "}
                        {a.modalidade === "online" ? "Online" : "Presencial"}
                      </div>
                    </div>
                    <Badge status="agendado">Confirmado</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- ConfigScreen -------------------------------------------------------- */
function SettingsRow({
  icon,
  label,
  value,
  onClick,
  right,
  danger,
}: {
  icon: IconName;
  label: string;
  value?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "13px 14px",
        textAlign: "left",
        cursor: onClick ? "pointer" : "default",
        background: h && onClick ? "var(--bg)" : "transparent",
        transition: "background .12s",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: danger ? "var(--danger-bg)" : "var(--accent-050)",
          color: danger ? "var(--danger)" : "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5, color: danger ? "var(--danger)" : "var(--ink)" }}>{label}</div>
        {value && (
          <div
            style={{
              fontSize: 12.5,
              color: "var(--muted)",
              marginTop: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </div>
        )}
      </div>
      {right ||
        (onClick && (
          <span style={{ color: "var(--faint)" }}>
            <Icon name="chevRight" size={17} />
          </span>
        ))}
    </div>
  );
}

function SettingsGroup({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <SectionLabel style={{ marginBottom: 8, paddingLeft: 2 }}>{title}</SectionLabel>}
      <Card pad={0} style={{ overflow: "hidden" }}>
        {children}
      </Card>
    </div>
  );
}

export function ConfigScreen({ go }: { go: (s: string) => void }) {
  const professional = useStore((s) => s.professional);
  const funnels = useStore((s) => s.funnels);
  const funnel = useStore((s) => s.funnel);
  const toast = useStore((s) => s.toast);
  const updateProfessional = useStore((s) => s.updateProfessional);
  const disconnectCalendar = useStore((s) => s.disconnectCalendar);
  const connectCalendar = useStore((s) => s.connectCalendar);
  const toggleAviso = useStore((s) => s.toggleAviso);
  const [editConsent, setEditConsent] = React.useState(false);
  const [consent, setConsent] = React.useState(professional.consentimentoTextoPadrao);
  const [editPerfil, setEditPerfil] = React.useState(false);
  const [editWa, setEditWa] = React.useState(false);
  const cal = professional.googleCalendar;
  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
    window.location.href = "/entrar";
  };
  return (
    <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 18 }} className="lg:px-0 lg:max-w-2xl">
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name={professional.nome} size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>
              {professional.nome}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{professional.especialidade}</div>
            <div style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 600, marginTop: 2 }}>
              {professional.handleInstagram}
            </div>
          </div>
        </div>
      </Card>
      <SettingsGroup title="Conta">
        <SettingsRow
          icon="user"
          label="Perfil"
          value={`${professional.nome} · ${professional.especialidade}`}
          onClick={() => setEditPerfil(true)}
        />
        <SettingsRow
          icon="whatsapp"
          label="WhatsApp"
          value={fmtWhats(professional.whatsapp)}
          onClick={() => setEditWa(true)}
        />
        <SettingsRow
          icon="funnel"
          label="Meus funis"
          value={`${funnels.length} funis · ativo: ${funnel.nome}`}
          onClick={() => go("funis")}
        />
      </SettingsGroup>
      <SettingsGroup title="Integrações">
        <SettingsRow
          icon="calendar"
          label="Google Agenda"
          value={cal.conectado ? `Conectado · ${cal.email}` : "Não conectado"}
          right={
            cal.conectado ? (
              <button onClick={() => disconnectCalendar()} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }}>
                Desconectar
              </button>
            ) : (
              <button onClick={() => connectCalendar()} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}>
                Conectar
              </button>
            )
          }
        />
        <SettingsRow
          icon="instagram"
          label="Automações do Instagram"
          value="Comentário → DM · 2 ativas"
          onClick={() => go("automacoes")}
        />
      </SettingsGroup>
      <SettingsGroup title="Avisos de lead novo">
        <div style={{ padding: "4px 0" }}>
          {(
            [
              ["email", "chat", "Por e-mail", professional.avisos?.email],
              ["push", "bell", "Push no celular", professional.avisos?.push],
            ] as [keyof typeof professional.avisos, IconName, string, boolean | undefined][]
          ).map(([key, ic, label, on], i) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "11px 14px",
                borderTop: i ? "1px solid var(--line-soft)" : "none",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "var(--accent-050)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={ic} size={18} />
              </span>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: "var(--ink)" }}>{label}</div>
              <Toggle on={!!on} onClick={() => toggleAviso(key)} />
            </div>
          ))}
          <div style={{ fontSize: 12, color: "var(--muted)", padding: "4px 14px 10px", lineHeight: 1.4 }}>
            Te avisamos na hora que entra um lead — você não precisa ficar de olho no app.
          </div>
        </div>
      </SettingsGroup>
      <SettingsGroup title="Privacidade · LGPD">
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "var(--accent-050)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="shield" size={18} />
            </span>
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14.5, color: "var(--ink)" }}>Texto de consentimento</div>
            <button
              onClick={() => {
                if (editConsent) {
                  updateProfessional({ consentimentoTextoPadrao: consent });
                  toast("Texto LGPD atualizado ✓");
                }
                setEditConsent(!editConsent);
              }}
              style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}
            >
              {editConsent ? "Salvar" : "Editar"}
            </button>
          </div>
          {editConsent ? (
            <Field as="textarea" rows={4} value={consent} onChange={setConsent} />
          ) : (
            <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, margin: 0, paddingLeft: 44 }}>{consent}</p>
          )}
        </div>
        <SettingsRow icon="user" label="Encarregado / DPO" value="osvaldo.reis@gmail.com" />
      </SettingsGroup>
      <SettingsGroup title="Plano">
        <SettingsRow icon="bolt" label="Meu plano" value="Entrada · R$97/mês" onClick={() => go("planos")} />
      </SettingsGroup>
      <Card pad={0}>
        <SettingsRow icon="logout" label="Sair" danger onClick={handleSignOut} />
      </Card>
      {editPerfil && (
        <PerfilModal
          professional={professional}
          onClose={() => setEditPerfil(false)}
          onSave={(patch) => {
            updateProfessional(patch);
            setEditPerfil(false);
            toast("Perfil atualizado ✓");
          }}
        />
      )}
      {editWa && (
        <WhatsAppModal
          current={professional.whatsapp}
          onClose={() => setEditWa(false)}
          onSave={(whatsapp) => {
            updateProfessional({ whatsapp });
            setEditWa(false);
            toast("WhatsApp atualizado ✓");
          }}
        />
      )}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        background: "rgba(21,33,28,.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn .18s both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 18,
          padding: 24,
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--sh-lg)",
          animation: "popIn .26s both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, letterSpacing: "-.02em" }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "var(--bg)",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PerfilModal({
  professional,
  onClose,
  onSave,
}: {
  professional: { nome: string; especialidade: string; handleInstagram: string };
  onClose: () => void;
  onSave: (patch: { nome: string; especialidade: string; handleInstagram: string }) => void;
}) {
  const [nome, setNome] = React.useState(professional.nome);
  const [esp, setEsp] = React.useState(professional.especialidade);
  const [handle, setHandle] = React.useState(professional.handleInstagram);
  return (
    <ModalShell title="Editar perfil" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Nome de exibição" value={nome} onChange={setNome} icon="user" />
        <Field label="Especialidade" value={esp} onChange={setEsp} icon="sparkles" />
        <Field label="Instagram" value={handle} onChange={setHandle} icon="instagram" />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button full variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            full
            disabled={!nome.trim()}
            onClick={() => onSave({ nome: nome.trim(), especialidade: esp.trim(), handleInstagram: handle.trim() })}
          >
            Salvar
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function WhatsAppModal({
  current,
  onClose,
  onSave,
}: {
  current: string;
  onClose: () => void;
  onSave: (whatsapp: string) => void;
}) {
  const [value, setValue] = React.useState(current.replace(/^55/, ""));
  const digits = value.replace(/\D/g, "");
  const valid = digits.length >= 10;
  return (
    <ModalShell title="WhatsApp" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field
          label="Número (com DDD)"
          value={value}
          onChange={setValue}
          prefix="+55"
          icon="whatsapp"
          type="tel"
          hint="É pra onde o lead é direcionado."
        />
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <Button full variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button full disabled={!valid} onClick={() => onSave("55" + digits.slice(-11))}>
            Salvar
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

