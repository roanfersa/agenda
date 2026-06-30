"use client";

import * as React from "react";
import { Avatar, Button, Field, TypingDots } from "./ui";
import { Icon } from "./Icon";
import { waLink } from "@/lib/store";
import { DEFAULT_THEME, type Disponibilidade, type Funnel, type Professional, type Resposta } from "@/lib/types";
import type { PublicLeadInput } from "./LadoB";

type ChatTurn = { role: "bot" | "user"; text: string };
type Reply = {
  mensagem: string;
  opcoes?: string[];
  fase: "perguntando" | "recomendar";
  recomendacao?: { tipo: "agendar" | "link" | "whatsapp"; label: string; url?: string; motivo?: string };
};

/** Embute o Calendly inline (sem redirecionar) dentro do funil. */
function CalendlyEmbed({ url }: { url: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    let cancelled = false;
    const init = () => {
      const C = (window as unknown as {
        Calendly?: { initInlineWidget: (o: { url: string; parentElement: HTMLElement }) => void };
      }).Calendly;
      if (C && ref.current && !cancelled) {
        ref.current.innerHTML = "";
        C.initInlineWidget({ url, parentElement: ref.current });
      }
    };
    if (!document.getElementById("calendly-css")) {
      const l = document.createElement("link");
      l.id = "calendly-css";
      l.rel = "stylesheet";
      l.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(l);
    }
    const existing = document.getElementById("calendly-js") as HTMLScriptElement | null;
    if ((window as unknown as { Calendly?: unknown }).Calendly) init();
    else if (existing) existing.addEventListener("load", init);
    else {
      const s = document.createElement("script");
      s.id = "calendly-js";
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      s.onload = init;
      document.body.appendChild(s);
    }
    return () => {
      cancelled = true;
    };
  }, [url]);
  return <div ref={ref} style={{ minWidth: 280, height: 600, borderRadius: 16, overflow: "hidden" }} />;
}

/**
 * Funil conversacional com IA: a IA qualifica o visitante e recomenda o próximo
 * passo (agendar no chat, abrir um link de produto ou seguir no WhatsApp).
 */
export function AiFunnelChat({
  funnel,
  professional,
  disponibilidade,
  onSubmitLead,
  preview = false,
}: {
  funnel: Funnel;
  professional: Professional;
  disponibilidade: Disponibilidade[];
  onSubmitLead?: (input: PublicLeadInput) => void | Promise<void>;
  preview?: boolean;
}) {
  const theme = { ...DEFAULT_THEME, ...(funnel.theme || {}) };
  const [turns, setTurns] = React.useState<ChatTurn[]>([]);
  const [opcoes, setOpcoes] = React.useState<string[] | null>(null);
  const [rec, setRec] = React.useState<Reply["recomendacao"] | null>(null);
  const [typing, setTyping] = React.useState(false);
  const [stage, setStage] = React.useState<"chat" | "agenda" | "contato" | "done">("chat");
  const [agendamento, setAgendamento] = React.useState<{ dia: string; dataHora: string; hora: string } | null>(null);
  const [nome, setNome] = React.useState("");
  const [whats, setWhats] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [consent, setConsent] = React.useState(false);
  const [text, setText] = React.useState("");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const started = React.useRef(false);

  const scrollDown = React.useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);
  React.useEffect(scrollDown, [turns, typing, stage, scrollDown]);

  const fetchTurn = React.useCallback(
    async (history: ChatTurn[]) => {
      setTyping(true);
      setOpcoes(null);
      try {
        const res = await fetch("/api/ai/funnel-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: funnel.slug, history, preview }),
        });
        const data: Reply = await res.json();
        setTurns((t) => [...t, { role: "bot", text: data.mensagem }]);
        if (data.fase === "recomendar") {
          setRec(data.recomendacao ?? null);
          // agendar abre seleção de horário; demais vão direto pro contato.
          setStage(data.recomendacao?.tipo === "agendar" && disponibilidade.length > 0 ? "agenda" : "contato");
        } else {
          setOpcoes(data.opcoes ?? null);
        }
      } catch {
        setTurns((t) => [...t, { role: "bot", text: "Tive um probleminha aqui 😅 pode repetir?" }]);
      } finally {
        setTyping(false);
      }
    },
    [funnel.slug, preview, disponibilidade.length],
  );

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetchTurn([]);
  }, [fetchTurn]);

  const send = (msg: string) => {
    if (!msg.trim() || typing) return;
    const next: ChatTurn[] = [...turns, { role: "user", text: msg.trim() }];
    setTurns(next);
    setText("");
    fetchTurn(next);
  };

  // Monta respostas pareando cada resposta do usuário com a pergunta anterior do bot.
  const buildRespostas = (): Resposta[] => {
    const out: Resposta[] = [];
    for (let i = 0; i < turns.length; i++) {
      if (turns[i].role === "user") {
        const pergunta = turns[i - 1]?.role === "bot" ? turns[i - 1].text : "Resposta";
        out.push({ perguntaId: `t${i}`, pergunta, valor: turns[i].text });
      }
    }
    return out;
  };

  const finalize = async () => {
    if (!consent || !nome.trim()) return;
    const d = whats.replace(/\D/g, "");
    const w55 = d.length >= 10 ? (d.startsWith("55") ? d : "55" + d) : "";
    const input: PublicLeadInput = {
      nome: nome.trim(),
      whatsapp: w55,
      email: email.trim(),
      respostas: buildRespostas(),
      resumoIA: "",
      agendamento: agendamento
        ? { ...agendamento, tipo: funnel.nome || "Atendimento", modalidade: "online" }
        : null,
      origem: "link",
      funnelId: funnel.id,
      slug: funnel.slug,
    };
    await onSubmitLead?.(input);
    setStage("done");
  };

  const accent = theme.brandColor;
  const wrap: React.CSSProperties = {
    minHeight: "100dvh",
    background: theme.bgImageUrl ? `url(${theme.bgImageUrl}) center/cover` : theme.bgColor,
    fontFamily: `"${theme.fontFamily}", var(--font-jakarta), sans-serif`,
    display: "flex",
    flexDirection: "column",
    ["--accent" as string]: accent,
  } as React.CSSProperties;

  return (
    <div style={wrap}>
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ background: accent, padding: "16px", display: "flex", alignItems: "center", gap: 12, color: "#fff" }}>
          {theme.logoUrl || theme.avatarUrl || professional.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={(theme.avatarUrl || theme.logoUrl || professional.fotoUrl) as string} alt="" width={44} height={44} style={{ borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <Avatar name={professional.nome} size={44} bg="rgba(255,255,255,.22)" fg="#fff" />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{theme.headline || professional.nome}</div>
            <div style={{ fontSize: 12.5, opacity: 0.85 }}>{theme.subheadline || professional.especialidade}</div>
          </div>
        </div>

        {/* Chat */}
        <div ref={scrollRef} className="no-sb" style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {turns.map((t, i) => (
            <div key={i} style={{ display: "flex", justifyContent: t.role === "bot" ? "flex-start" : "flex-end" }}>
              <div
                style={{
                  maxWidth: "82%",
                  padding: "11px 14px",
                  borderRadius: 18,
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  background: t.role === "bot" ? "#fff" : accent,
                  color: t.role === "bot" ? "#15211C" : "#fff",
                  boxShadow: "0 1px 2px rgba(21,33,28,.07)",
                }}
              >
                {t.text}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{ display: "flex" }}>
              <div style={{ background: "#fff", padding: "13px 16px", borderRadius: 18 }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Seleção de horário (recomendação = agendar) */}
          {stage === "agenda" && professional.calendlyUrl && (
            <CalendlyEmbed url={professional.calendlyUrl} />
          )}
          {stage === "agenda" && !professional.calendlyUrl && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {disponibilidade.map((d) => (
                <div key={d.id}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6E7A73", margin: "4px 0" }}>{d.dia}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {d.horarios.map((h) => (
                      <button
                        key={h}
                        onClick={() => {
                          setAgendamento({ dia: d.dia, dataHora: `${d.dia} ${h}`, hora: h });
                          setStage("contato");
                        }}
                        style={{ padding: "7px 12px", borderRadius: 10, border: `1.5px solid ${accent}`, color: accent, background: "#fff", fontWeight: 700, fontSize: 13 }}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coleta de contato + consentimento */}
          {stage === "contato" && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>Só pra finalizar, como te encontro?</div>
              <Field placeholder="Seu nome" value={nome} onChange={setNome} />
              <Field placeholder="WhatsApp" value={whats} onChange={setWhats} />
              {funnel.camposContato?.email && <Field placeholder="E-mail (opcional)" value={email} onChange={setEmail} />}
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "#6E7A73" }}>
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{funnel.consentimentoTexto || "Autorizo o contato conforme a LGPD."}</span>
              </label>
              <Button full onClick={finalize} disabled={!consent || !nome.trim()}>
                {agendamento ? `Confirmar ${agendamento.hora}` : "Enviar"}
              </Button>
            </div>
          )}

          {/* Final + recomendação */}
          {stage === "done" && (
            <div style={{ background: "#fff", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", textAlign: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>Prontinho! 🎉</div>
              {rec?.motivo && <div style={{ fontSize: 13.5, color: "#6E7A73" }}>{rec.motivo}</div>}
              {rec?.tipo === "link" && rec.url && (
                <a href={rec.url} target="_blank" rel="noopener" style={{ textDecoration: "none", width: "100%" }}>
                  <Button full icon="arrowRight">{rec.label || "Ver agora"}</Button>
                </a>
              )}
              {(rec?.tipo === "whatsapp" || !rec) && (
                <a href={waLink(professional.whatsapp, `Oi! Sou ${nome.split(" ")[0] || "eu"}, vim pelo seu link.`)} target="_blank" rel="noopener" style={{ textDecoration: "none", width: "100%" }}>
                  <Button full variant="whats" icon="whatsapp">{rec?.label || "Falar no WhatsApp"}</Button>
                </a>
              )}
              {rec?.tipo === "agendar" && <div style={{ fontSize: 13.5, color: "#6E7A73" }}>Seu horário foi reservado. Te enviamos a confirmação 💬</div>}
            </div>
          )}
        </div>

        {/* Composer (só na fase de perguntas) */}
        {stage === "chat" && (
          <div style={{ padding: "8px 14px calc(env(safe-area-inset-bottom,0px) + 16px)", background: theme.bgColor }}>
            {opcoes && opcoes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
                {opcoes.map((o) => (
                  <button key={o} onClick={() => send(o)} style={{ padding: "9px 14px", borderRadius: 20, border: `1.5px solid ${accent}`, color: accent, background: "#fff", fontWeight: 700, fontSize: 13.5 }}>
                    {o}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send(text)}
                placeholder="Escreva aqui…"
                style={{ flex: 1, padding: "12px 14px", borderRadius: 12, border: "1px solid rgba(21,33,28,.12)", fontSize: 14.5, background: "#fff" }}
              />
              <button onClick={() => send(text)} disabled={typing} style={{ width: 46, borderRadius: 12, background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
