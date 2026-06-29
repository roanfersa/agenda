"use client";

import * as React from "react";
import { Avatar, Button, EmptyState } from "./ui";
import { Icon } from "./Icon";
import { useStore } from "@/lib/store";

type Conversa = { id: string; username: string; userId: string; updatedTime: string };
type Mensagem = { id: string; fromId: string; text: string; createdTime: string };

export function ConversasScreen() {
  const instagram = useStore((s) => s.instagram);
  const [conversas, setConversas] = React.useState<Conversa[]>([]);
  const [sel, setSel] = React.useState<Conversa | null>(null);
  const [mensagens, setMensagens] = React.useState<Mensagem[]>([]);
  const [selfId, setSelfId] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [erro, setErro] = React.useState<string | null>(null);
  const [text, setText] = React.useState("");
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/instagram/conversations");
        const data = await res.json();
        if (res.ok) {
          setConversas(data.conversas ?? []);
          setSelfId(data.selfId ?? "");
        } else setErro(data.error || "Não foi possível carregar as conversas.");
      } catch {
        setErro("Erro de conexão.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const abrir = async (c: Conversa) => {
    setSel(c);
    setMensagens([]);
    try {
      const res = await fetch(`/api/instagram/messages?conversationId=${encodeURIComponent(c.id)}`);
      const data = await res.json();
      if (res.ok) {
        setMensagens(data.mensagens ?? []);
        setSelfId(data.selfId ?? selfId);
      }
    } catch {
      /* ignora */
    }
  };

  const enviar = async () => {
    if (!sel || !text.trim() || sending) return;
    setSending(true);
    const txt = text.trim();
    try {
      const res = await fetch("/api/instagram/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: sel.userId, text: txt }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagens((m) => [...m, { id: "tmp" + Date.now(), fromId: selfId, text: txt, createdTime: new Date().toISOString() }]);
        setText("");
      } else {
        setErro(data.error || "Falha ao enviar.");
      }
    } catch {
      setErro("Erro de conexão ao enviar.");
    } finally {
      setSending(false);
    }
  };

  if (!instagram.connected) {
    return (
      <div style={{ padding: "0 18px" }} className="lg:px-0">
        <EmptyState icon="instagram" title="Conecte seu Instagram" body="Conecte sua conta em Automações para ver e responder suas DMs aqui." />
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href="/automacoes" style={{ textDecoration: "none" }}><Button icon="instagram">Ir para Automações</Button></a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 14px" }} className="lg:px-0">
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-4 lg:h-[600px]">
        {/* Lista de conversas */}
        <div style={{ display: sel ? "none" : "block", borderRight: "1px solid var(--line)" }} className="lg:!block">
          {loading && <p style={{ fontSize: 13.5, color: "var(--muted)", padding: 12 }}>Carregando conversas…</p>}
          {!loading && erro && <p style={{ fontSize: 13.5, color: "var(--danger)", padding: 12 }}>{erro}</p>}
          {!loading && !erro && conversas.length === 0 && (
            <p style={{ fontSize: 13.5, color: "var(--muted)", padding: 12 }}>Nenhuma conversa ainda.</p>
          )}
          {conversas.map((c) => (
            <button
              key={c.id}
              onClick={() => abrir(c)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 10px",
                textAlign: "left",
                borderRadius: 12,
                background: sel?.id === c.id ? "var(--accent-050)" : "transparent",
              }}
            >
              <Avatar name={c.username || "?"} size={40} bg="var(--accent-100)" fg="var(--accent-800)" />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>@{c.username || "usuário"}</div>
                <div style={{ fontSize: 12, color: "var(--faint)" }}>{new Date(c.updatedTime).toLocaleDateString("pt-BR")}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Conversa aberta */}
        <div style={{ display: !sel ? "none" : "flex", flexDirection: "column", minHeight: 420 }} className={sel ? "lg:!flex" : "lg:!flex"}>
          {!sel ? (
            <div className="hidden lg:flex" style={{ flex: 1, alignItems: "center", justifyContent: "center", color: "var(--faint)", fontSize: 13.5 }}>
              Selecione uma conversa
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 4px", borderBottom: "1px solid var(--line)" }}>
                <button onClick={() => setSel(null)} className="lg:hidden" style={{ color: "var(--muted)" }}><Icon name="arrowLeft" size={18} /></button>
                <Avatar name={sel.username || "?"} size={34} bg="var(--accent-100)" fg="var(--accent-800)" />
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>@{sel.username || "usuário"}</div>
                <span style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 800, background: "var(--accent-050)", color: "var(--accent-800)", padding: "3px 7px", borderRadius: 6 }}>
                  ATENDIMENTO HUMANO
                </span>
              </div>
              <div className="no-sb" style={{ flex: 1, overflowY: "auto", padding: "12px 4px", display: "flex", flexDirection: "column", gap: 8, minHeight: 280 }}>
                {mensagens.map((m) => {
                  const mine = m.fromId === selfId;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: 16, fontSize: 14, lineHeight: 1.4, background: mine ? "var(--accent)" : "#fff", color: mine ? "#fff" : "var(--ink)", border: mine ? "none" : "1px solid var(--line)" }}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                {mensagens.length === 0 && <p style={{ fontSize: 13, color: "var(--faint)", textAlign: "center" }}>Sem mensagens.</p>}
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && enviar()}
                  placeholder="Responder como você…"
                  style={{ flex: 1, padding: "11px 13px", borderRadius: 12, border: "1px solid var(--line)", fontSize: 14 }}
                />
                <Button onClick={enviar} disabled={sending || !text.trim()} icon="arrowRight">Enviar</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
