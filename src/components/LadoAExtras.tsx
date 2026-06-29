"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { Avatar, Badge, Button, Card, SectionLabel } from "./ui";
import { AutomacaoEditor } from "./AutomacaoEditor";
import { CommentDMSim } from "./CommentDMSim";
import { Overlay } from "./shared";
import { OBJ, useStore } from "@/lib/store";
import { hasFeature } from "@/lib/features";
import type { Automation, Funnel } from "@/lib/types";

/** Cartão de "recurso bloqueado" reutilizável quando a flag está off. */
function RecursoBloqueado({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div style={{ padding: "0 18px" }} className="lg:px-0">
      <Card>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10, padding: "18px 12px" }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "var(--accent-050)", color: "var(--accent-800)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="lock" size={22} />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17 }}>{titulo}</div>
          <div style={{ fontSize: 13.5, color: "var(--muted)", maxWidth: 320, lineHeight: 1.5 }}>{descricao}</div>
          <a href="/planos" style={{ textDecoration: "none", marginTop: 4 }}>
            <Button size="sm" icon="bolt">Ver planos</Button>
          </a>
        </div>
      </Card>
    </div>
  );
}

/* ---- PlanosScreen ------------------------------------------------------- */
export function PlanosScreen() {
  const professional = useStore((s) => s.professional);
  const toast = useStore((s) => s.toast);
  const [busy, setBusy] = React.useState(false);

  const irParaCheckout = async (plano: "entrada" | "pro" | "setup") => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plano }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast(data.error || "Não foi possível iniciar a cobrança.");
    } catch {
      toast("Erro de conexão com o pagamento.");
    } finally {
      setBusy(false);
    }
  };

  const abrirPortal = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else toast(data.error || "Sem assinatura para gerenciar.");
    } catch {
      toast("Erro de conexão com o pagamento.");
    } finally {
      setBusy(false);
    }
  };

  const planos = [
    {
      id: "entrada" as const,
      nome: "Entrada",
      preco: "R$97",
      periodo: "/mês",
      atual: professional.plano === "entrada",
      destaque: false,
      soon: false,
      features: [
        "Bio-funil + qualificação",
        "Agendamento no fluxo",
        "Resumo do lead no WhatsApp",
        "Leads e agenda ilimitados",
      ],
    },
    {
      id: "pro" as const,
      nome: 'Pro · "Secretária"',
      preco: "R$297",
      periodo: "/mês",
      atual: professional.plano === "pro",
      soon: false,
      destaque: true,
      features: [
        "Tudo do Entrada",
        "Automação de WhatsApp",
        "Comment → DM do Instagram",
        "Follow-up e lembrete por IA",
        "Reagendamento e multi-atendente",
      ],
    },
    {
      id: "setup" as const,
      nome: "Setup assistido",
      preco: "R$300–500",
      periodo: "única vez",
      atual: false,
      destaque: false,
      soon: false,
      features: [
        "A gente monta seu funil pra você",
        "Sessão de configuração",
        "Funil pronto pra publicar",
      ],
    },
  ];
  return (
    <div
      style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 14 }}
      className="lg:px-0"
    >
      <div
        style={{
          background: "var(--ink)",
          borderRadius: 16,
          padding: "16px 18px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span style={{ color: "var(--accent-200)" }}>
          <Icon name="bolt" size={22} />
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Uma secretária custa R$1.500+/mês.</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 2 }}>
            O Revo faz o filtro e marca por você.
          </div>
        </div>
      </div>
      <div className="lg:grid lg:grid-cols-3 lg:gap-4 flex flex-col gap-4">
      {planos.map((p) => (
        <div
          key={p.id}
          style={{
            background: "var(--card)",
            borderRadius: "var(--r-lg)",
            border: `2px solid ${p.destaque ? "var(--accent)" : "var(--line)"}`,
            padding: 18,
            position: "relative",
            boxShadow: p.destaque ? "var(--sh)" : "var(--sh-sm)",
          }}
        >
          {p.soon && (
            <span
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: 11,
                fontWeight: 800,
                color: "var(--amber-ink)",
                background: "var(--amber-bg)",
                padding: "4px 9px",
                borderRadius: 8,
              }}
            >
              EM BREVE
            </span>
          )}
          {p.atual && (
            <span
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                fontSize: 11,
                fontWeight: 800,
                color: "var(--accent-800)",
                background: "var(--accent-100)",
                padding: "4px 9px",
                borderRadius: 8,
              }}
            >
              SEU PLANO
            </span>
          )}
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--ink)" }}>
            {p.nome}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "8px 0 16px" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 30,
                color: "var(--ink)",
                letterSpacing: "-.02em",
              }}
            >
              {p.preco}
            </span>
            <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 600 }}>{p.periodo}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
            {p.features.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  fontSize: 13.5,
                  color: "var(--text)",
                  lineHeight: 1.35,
                }}
              >
                <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>
                  <Icon name="check" size={16} sw={2.5} />
                </span>
                {f}
              </div>
            ))}
          </div>
          <Button
            full
            variant={p.atual ? "soft" : p.destaque ? "primary" : "dark"}
            disabled={busy}
            onClick={() => (p.atual ? abrirPortal() : irParaCheckout(p.id))}
          >
            {p.atual
              ? "Gerenciar assinatura"
              : p.id === "setup"
              ? "Quero o setup assistido"
              : "Assinar"}
          </Button>
        </div>
      ))}
      </div>
      <div style={{ textAlign: "center", fontSize: 12, color: "var(--faint)", padding: "4px 0 8px" }}>
        Pagamento seguro processado pela Stripe. Cancele quando quiser.
      </div>
    </div>
  );
}

/* ---- FunisList --------------------------------------------------------- */
function FunilCard({ f, active, onEdit }: { f: Funnel; active: boolean; onEdit: () => void }) {
  const leads = useStore((s) => s.leads.filter((l) => l.funnelId === f.id).length);
  const setActiveFunnel = useStore((s) => s.setActiveFunnel);
  const toggleFunnelStatus = useStore((s) => s.toggleFunnelStatus);
  const deleteFunnel = useStore((s) => s.deleteFunnel);
  const toast = useStore((s) => s.toast);
  const obj = OBJ(f.objetivo);
  return (
    <div
      style={{
        background: "var(--card)",
        border: `1.5px solid ${active ? "var(--accent-200)" : "var(--line)"}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "var(--sh-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "var(--accent-050)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={obj.icon as never} size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5, color: "var(--ink)" }}>
              {f.nome}
            </span>
            {active && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "var(--accent-800)",
                  background: "var(--accent-100)",
                  padding: "2px 6px",
                  borderRadius: 5,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Icon name="link" size={10} /> NA BIO
              </span>
            )}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 1 }}>
            {obj.titulo} · <span style={{ color: "var(--accent)", fontWeight: 600 }}>{f.uso || "Outro"}</span>
          </div>
        </div>
        <Badge status={f.status === "publicado" ? "ativo" : "cancelado"}>
          {f.status === "publicado" ? "Publicado" : "Pausado"}
        </Badge>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          margin: "13px 0",
          background: "var(--bg)",
          borderRadius: 10,
          padding: "9px 11px",
        }}
      >
        <Icon name="link" size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          agendai.com.br/f/{f.slug}
        </span>
        <button onClick={() => toast("Link copiado!")} style={{ color: "var(--muted)", display: "flex", flexShrink: 0 }}>
          <Icon name="copy" size={15} />
        </button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, fontSize: 13 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)" }}>
          <Icon name="users" size={15} />
          <b style={{ color: "var(--ink)" }}>{leads}</b> leads
        </span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Button full size="sm" variant="dark" icon="edit" onClick={onEdit}>
          Editar
        </Button>
        {!active && (
          <Button size="sm" variant="outline" onClick={() => setActiveFunnel(f.id)}>
            Usar na bio
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => toggleFunnelStatus(f.id)}>
          {f.status === "publicado" ? "Pausar" : "Publicar"}
        </Button>
        {!active && (
          <Button size="sm" variant="ghost" onClick={() => deleteFunnel(f.id)}>
            <Icon name="trash" size={16} />
          </Button>
        )}
      </div>
    </div>
  );
}

export function FunisList({ onEdit, onNew }: { onEdit: (id: string) => void; onNew: () => void }) {
  const funnels = useStore((s) => s.funnels);
  const activeFunnelId = useStore((s) => s.activeFunnelId);
  return (
    <div style={{ padding: "0 18px" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          background: "var(--accent-050)",
          border: "1px solid var(--accent-100)",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 14,
        }}
      >
        <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>
          <Icon name="link" size={17} />
        </span>
        <span style={{ fontSize: 12.5, color: "var(--accent-800)", lineHeight: 1.5, fontWeight: 500 }}>
          Cada funil tem seu próprio link. O marcado <b>NA BIO</b> é o que vai no seu Instagram; os outros você usa em{" "}
          <b>campanha paga, stories ou anúncio</b> — e vê os leads separados por origem.
        </span>
      </div>
      <button
        onClick={onNew}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "13px 0",
          borderRadius: 14,
          background: "var(--accent)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 14.5,
          marginBottom: 14,
          boxShadow: "var(--sh-sm)",
        }}
      >
        <Icon name="plus" size={18} sw={2.4} /> Novo funil
      </button>
      <div
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
        className="lg:grid lg:grid-cols-2 lg:gap-4"
      >
        {funnels.map((f) => (
          <FunilCard key={f.id} f={f} active={f.id === activeFunnelId} onEdit={() => onEdit(f.id)} />
        ))}
      </div>
    </div>
  );
}

/* ---- Automações (full editor + simulator) ------------------------------ */
export function AutomacoesScreen() {
  const automations = useStore((s) => s.automations);
  const toggleAutomation = useStore((s) => s.toggleAutomation);
  const professional = useStore((s) => s.professional);
  const instagram = useStore((s) => s.instagram);
  const toast = useStore((s) => s.toast);
  const [editing, setEditing] = React.useState<Automation | "new" | null>(null);
  const [simRule, setSimRule] = React.useState<Automation | null>(null);
  const [showConnect, setShowConnect] = React.useState(false);
  const totalDms = automations.reduce((a, r) => a + r.stats.dms, 0);
  const totalLeads = automations.reduce((a, r) => a + r.stats.leads, 0);

  // Resultado da conexão do Instagram (?ig=...).
  React.useEffect(() => {
    const ig = new URLSearchParams(window.location.search).get("ig");
    if (!ig) return;
    const msg: Record<string, string> = {
      conectado: "Instagram conectado ✓",
      erro: "Não consegui conectar. Confirme que sua conta é Profissional (Comercial/Criador) e tente de novo.",
      semconta: "Sua conta do Instagram precisa ser Profissional (Comercial/Criador).",
      naoconfigurado: "Integração do Instagram ainda não configurada (App).",
    };
    toast(msg[ig] || "Conexão do Instagram atualizada.");
    window.history.replaceState({}, "", "/automacoes");
  }, [toast]);

  const desconectarIg = async () => {
    await fetch("/api/instagram/disconnect", { method: "POST" });
    window.location.reload();
  };
  if (!hasFeature(professional, "automacoes")) {
    return (
      <RecursoBloqueado
        titulo="Automações não estão no seu plano"
        descricao="Comment→DM no Instagram e disparos de WhatsApp ficam disponíveis no plano Pro ou liberando o recurso com o time."
      />
    );
  }
  return (
    <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 14 }} className="lg:px-0">
      <div
        style={{
          background: "linear-gradient(120deg, #1B231F, #244038)",
          borderRadius: 16,
          padding: 16,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,255,255,.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name="instagram" size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14.5 }}>
              {instagram.connected ? `@${instagram.username}` : professional.handleInstagram || "Sua conta"}
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 800,
                background: instagram.connected ? "rgba(46,209,143,.22)" : "rgba(255,255,255,.16)",
                color: instagram.connected ? "#7CF0C0" : "#fff",
                padding: "3px 7px",
                borderRadius: 6,
              }}
            >
              {instagram.connected ? "CONECTADO" : "NÃO CONECTADO"}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.65)", marginTop: 2 }}>
            {totalDms} DMs enviadas · {totalLeads} viraram leads no funil
          </div>
        </div>
        {instagram.connected ? (
          <button onClick={desconectarIg} style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,.7)", flexShrink: 0 }}>
            Desconectar
          </button>
        ) : (
          <Button size="sm" icon="instagram" onClick={() => setShowConnect(true)} style={{ flexShrink: 0 }}>
            Conectar Instagram
          </Button>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <SectionLabel>Suas automações</SectionLabel>
        <Button size="sm" icon="plus" onClick={() => setEditing("new")}>
          Nova
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="lg:grid lg:grid-cols-2 lg:gap-4">
        {automations.map((r) => (
          <Card key={r.id} style={{ opacity: r.ativa ? 1 : 0.72 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #2A5D52, #0E8A6B)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                <span>{r.postEmoji}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--muted)",
                    marginBottom: 3,
                  }}
                >
                  <Icon name="instagram" size={13} /> {r.postTipo}
                </div>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 14.5, lineHeight: 1.3 }}>
                  {r.postLegenda}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>Gatilho:</span>
                  {r.keywords.map((k) => (
                    <span
                      key={k}
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "var(--accent-800)",
                        background: "var(--accent-050)",
                        border: "1px solid var(--accent-100)",
                        padding: "3px 8px",
                        borderRadius: 7,
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleAutomation(r.id)}
                style={{
                  width: 42,
                  height: 25,
                  borderRadius: 13,
                  background: r.ativa ? "var(--accent)" : "var(--line)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2.5,
                    left: r.ativa ? 20 : 2.5,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#fff",
                    boxShadow: "0 1px 3px rgba(0,0,0,.2)",
                    transition: "left .2s",
                  }}
                />
              </button>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "var(--bg)",
                borderRadius: 12,
                padding: "10px 12px",
                marginTop: 12,
              }}
            >
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>
                <Icon name="send" size={16} />
              </span>
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--text)",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {r.dmMensagem}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
              {(
                [
                  ["comentarios", "comentários", "chat"],
                  ["dms", "DMs", "send"],
                  ["leads", "leads", "users"],
                ] as ["comentarios" | "dms" | "leads", string, "chat" | "send" | "users"][]
              ).map(([k, l, ic]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--faint)" }}>
                    <Icon name={ic} size={14} />
                  </span>
                  <span style={{ fontWeight: 800, color: "var(--ink)", fontSize: 14 }}>{r.stats[k]}</span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <Button full size="sm" variant="dark" icon="bolt" onClick={() => setSimRule(r)}>
                Testar ao vivo
              </Button>
              <Button size="sm" variant="outline" icon="edit" onClick={() => setEditing(r)}>
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontSize: 12.5,
          color: "var(--faint)",
          padding: "8px 0 4px",
        }}
      >
        <Icon name="shield" size={14} />A DM só é enviada a quem comentou — sem disparo em massa.
      </div>
      {editing && (
        <AutomacaoEditor
          rule={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onTest={(r) => {
            setEditing(null);
            setSimRule(r);
          }}
        />
      )}
      {simRule && <CommentDMSim rule={simRule} onClose={() => setSimRule(null)} />}
      {showConnect && (
        <Overlay
          onClose={() => setShowConnect(false)}
          title="Conectar seu Instagram"
          footer={
            <a href="/api/instagram/connect" style={{ textDecoration: "none", width: "100%" }}>
              <Button full icon="instagram">Conectar agora</Button>
            </a>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
              Você vai conectar com o login do <b>próprio Instagram</b> — sem precisar de Página do Facebook.
              Antes, confira:
            </p>
            {[
              ["Conta Profissional", "Seu Instagram precisa ser Comercial ou de Criador de conteúdo (em Configurações → Conta → Mudar para conta profissional)."],
              ["Você é admin da conta", "Faça o login com a conta que administra o perfil."],
              ["Permissões", "Vamos pedir acesso a comentários e mensagens — é o que permite responder e enviar a DM automática."],
            ].map(([t, d]) => (
              <div key={t} style={{ display: "flex", gap: 10 }}>
                <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}><Icon name="check" size={18} /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t}</div>
                  <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </Overlay>
      )}
    </div>
  );
}

/* ---- Avatar export for convenience ------------------------------------- */
export { Avatar };
