"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { Avatar, TypingDots } from "./ui";
import { Overlay } from "./shared";
import { useStore } from "@/lib/store";
import type { Automation } from "@/lib/types";

type Comment = {
  user: string;
  text: string;
  reply?: boolean;
  mine?: boolean;
  pro?: boolean;
};

export function CommentDMSim({ rule, onClose }: { rule: Automation; onClose: () => void }) {
  const funnel = useStore((s) => s.funnel);
  const captureComment = useStore((s) => s.captureComment);
  const toast = useStore((s) => s.toast);
  const [comments, setComments] = React.useState<Comment[]>([
    { user: "ana.luagomes", text: "Que conteúdo lindo 😍" },
    { user: "pedro.hss", text: "Precisava ouvir isso hoje" },
  ]);
  const [draft, setDraft] = React.useState("");
  const [dm, setDm] = React.useState<"typing" | "sent" | null>(null);
  const [matched, setMatched] = React.useState(false);
  const me = "voce.exemplo";
  const kw = rule.keywords[0];

  const send = (txt?: string) => {
    const text = (txt || draft).trim();
    if (!text) return;
    setDraft("");
    const hit = rule.keywords.some((k) => text.toUpperCase().includes(k));
    setComments((c) => [...c, { user: me, text, mine: true }]);
    if (hit && !matched) {
      setMatched(true);
      captureComment(rule.id);
      if (rule.respostaPublica) {
        setTimeout(
          () =>
            setComments((c) => [
              ...c,
              { user: "osvaldo.terapia", text: `@${me} ${rule.respostaPublicaTexto}`, reply: true, pro: true },
            ]),
          700,
        );
      }
      setTimeout(() => setDm("typing"), 1100);
      setTimeout(() => setDm("sent"), 2100);
    } else if (!hit) {
      setTimeout(() => toast(`Sem a palavra "${kw}" — nada é enviado.`), 200);
    }
  };

  return (
    <Overlay
      onClose={onClose}
      title="Simulação ao vivo"
      sub="Comente a palavra-chave e veja a DM sair sozinha."
      wide
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {/* LEFT — Instagram post */}
        <div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 9,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="instagram" size={15} /> No Instagram
          </div>
          <div style={{ border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", background: "var(--card)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: 12 }}>
              <Avatar name="Osvaldo Reis" size={32} />
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>osvaldo.terapia</div>
              <span style={{ marginLeft: "auto", color: "var(--faint)" }}>
                <Icon name="dots" size={16} />
              </span>
            </div>
            <div
              style={{
                height: 150,
                background: "linear-gradient(135deg, #2A5D52, #0E8A6B)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 44 }}>{rule.postEmoji}</span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: 0.9,
                  padding: "0 20px",
                  textAlign: "center",
                  lineHeight: 1.3,
                }}
              >
                {rule.postLegenda}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "11px 13px", color: "var(--ink)" }}>
              <Icon name="heart" size={22} />
              <Icon name="chat" size={21} />
              <Icon name="send" size={21} />
              <span style={{ marginLeft: "auto" }}>
                <Icon name="bookmark" size={21} />
              </span>
            </div>
            <div
              className="no-sb"
              style={{
                borderTop: "1px solid var(--line-soft)",
                padding: "8px 13px 12px",
                maxHeight: 190,
                overflowY: "auto",
              }}
            >
              {comments.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 9,
                    padding: "6px 0",
                    animation: c.mine || c.reply ? "fadeUp .3s both" : "none",
                  }}
                >
                  <Avatar
                    name={c.user}
                    size={26}
                    bg={c.pro ? "var(--accent)" : "#C9C3B6"}
                    fg="#fff"
                    style={{ marginTop: 1 }}
                  />
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{c.user}</span>{" "}
                    <span style={{ color: "var(--text)" }}>{c.text}</span>
                    {c.pro && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          marginLeft: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        <Icon name="bolt" size={11} /> auto
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--line-soft)", padding: 10 }}>
              {!matched && (
                <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {rule.keywords.map((k) => (
                    <button
                      key={k}
                      onClick={() => send(k)}
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--accent-800)",
                        background: "var(--accent-050)",
                        border: "1px solid var(--accent-100)",
                        padding: "5px 10px",
                        borderRadius: 16,
                      }}
                    >
                      Comentar “{k}”
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Adicione um comentário…"
                  style={{
                    flex: 1,
                    border: "1.5px solid var(--line)",
                    borderRadius: 22,
                    padding: "9px 14px",
                    fontSize: 13.5,
                    outline: "none",
                    fontFamily: "var(--font)",
                    color: "var(--ink)",
                  }}
                />
                <button
                  onClick={() => send()}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="send" size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* RIGHT — the DM */}
        <div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 800,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: ".05em",
              marginBottom: 9,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="send" size={14} /> Na DM do lead
          </div>
          <div
            style={{
              border: "1px solid var(--line)",
              borderRadius: 16,
              overflow: "hidden",
              background: "#EBE7DF",
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: 12,
                background: "var(--card)",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <Avatar name="Osvaldo Reis" size={30} />
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>osvaldo.terapia</div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="bolt" size={12} /> automático
              </span>
            </div>
            <div
              style={{
                flex: 1,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                justifyContent: dm ? "flex-start" : "center",
              }}
            >
              {!dm && (
                <div style={{ textAlign: "center", color: "var(--muted)", padding: "20px 10px" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "rgba(255,255,255,.6)",
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                    }}
                  >
                    <Icon name="send" size={26} />
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, maxWidth: 220, margin: "0 auto" }}>
                    A DM aparece aqui assim que alguém comentar{" "}
                    <b style={{ color: "var(--accent-800)" }}>{kw}</b>.
                  </div>
                </div>
              )}
              {dm === "typing" && (
                <div
                  style={{
                    alignSelf: "flex-start",
                    background: "#fff",
                    padding: "13px 16px",
                    borderRadius: 16,
                    borderBottomLeftRadius: 5,
                    boxShadow: "var(--sh-sm)",
                  }}
                >
                  <TypingDots />
                </div>
              )}
              {dm === "sent" && (
                <>
                  <div
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "90%",
                      background: "#fff",
                      padding: "11px 14px",
                      borderRadius: 16,
                      borderBottomLeftRadius: 5,
                      fontSize: 14,
                      lineHeight: 1.45,
                      color: "var(--ink)",
                      boxShadow: "var(--sh-sm)",
                      animation: "popIn .3s both",
                    }}
                  >
                    {rule.dmMensagem}
                  </div>
                  <div style={{ alignSelf: "flex-start", maxWidth: "90%", width: "100%", animation: "popIn .3s .1s both" }}>
                    <a
                      href={`/f/${funnel.slug}`}
                      target="_blank"
                      rel="noopener"
                      style={{
                        textDecoration: "none",
                        width: "100%",
                        background: "var(--accent)",
                        color: "#fff",
                        borderRadius: 14,
                        padding: "13px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        boxShadow: "var(--sh-sm)",
                      }}
                    >
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 9,
                          background: "rgba(255,255,255,.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon name="link" size={18} />
                      </span>
                      <span style={{ textAlign: "left", flex: 1 }}>
                        <span style={{ display: "block", fontWeight: 700, fontSize: 14 }}>{rule.dmBotao}</span>
                        <span style={{ fontSize: 11.5, opacity: 0.85 }}>agendai.com.br/f/{funnel.slug}</span>
                      </span>
                      <Icon name="chevRight" size={18} />
                    </a>
                  </div>
                  <div
                    style={{
                      alignSelf: "center",
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,.7)",
                      padding: "6px 12px",
                      borderRadius: 20,
                      animation: "popIn .3s .2s both",
                    }}
                  >
                    <Icon name="checkCircle" size={14} /> DM enviada automaticamente
                  </div>
                </>
              )}
            </div>
          </div>
          {matched && (
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 10, lineHeight: 1.45, display: "flex", gap: 8 }}>
              <span style={{ color: "var(--accent)", flexShrink: 0 }}>
                <Icon name="arrowRight" size={15} />
              </span>
              Quando o lead toca no botão, cai no seu funil — qualifica, agenda e vira um lead no app.
            </div>
          )}
        </div>
      </div>
    </Overlay>
  );
}
