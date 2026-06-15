"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { Button, Field, SectionLabel } from "./ui";
import { Overlay } from "./shared";
import { useStore } from "@/lib/store";
import type { Automation } from "@/lib/types";

const MOCK_POSTS = [
  { postLegenda: "3 sinais de que sua ansiedade pede ajuda", postTipo: "Reels", postEmoji: "🌿" },
  { postLegenda: "Carrossel: 5 práticas de autoconhecimento", postTipo: "Carrossel", postEmoji: "✨" },
  { postLegenda: "O que é terapia tântrica (sem tabu)", postTipo: "Reels", postEmoji: "🔥" },
  { postLegenda: "Como saber se é a hora de começar", postTipo: "Foto", postEmoji: "🧘" },
];

function PostThumb({ emoji, size = 40 }: { emoji: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        flexShrink: 0,
        background: "linear-gradient(135deg, #2A5D52, #0E8A6B)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.42,
      }}
    >
      {emoji}
    </div>
  );
}

export function AutomacaoEditor({
  rule,
  onClose,
  onTest,
}: {
  rule: Automation | null;
  onClose: () => void;
  onTest: (rule: Automation) => void;
}) {
  const saveAutomation = useStore((s) => s.saveAutomation);
  const toast = useStore((s) => s.toast);

  const [post, setPost] = React.useState(
    rule
      ? { postLegenda: rule.postLegenda, postTipo: rule.postTipo, postEmoji: rule.postEmoji }
      : MOCK_POSTS[0],
  );
  const [keywords, setKeywords] = React.useState<string[]>(rule ? [...rule.keywords] : ["QUERO"]);
  const [kwInput, setKwInput] = React.useState("");
  const [dmMensagem, setDmMensagem] = React.useState(
    rule?.dmMensagem ||
      "Oi! Que bom que você comentou 🌿 Aqui é o link pra você responder 2 perguntinhas e já marcar comigo:",
  );
  const [dmBotao, setDmBotao] = React.useState(rule?.dmBotao || "Marcar minha sessão");
  const [pub, setPub] = React.useState(rule ? rule.respostaPublica : true);
  const [pubTexto, setPubTexto] = React.useState(rule?.respostaPublicaTexto || "Te chamei no direct! 💚");

  const addKw = (v?: string) => {
    const k = (v || kwInput).trim().toUpperCase();
    if (k && !keywords.includes(k)) setKeywords([...keywords, k]);
    setKwInput("");
  };

  const built = (): Automation => ({
    id: rule?.id || "auto_" + Math.random().toString(36).slice(2, 7),
    ativa: rule ? rule.ativa : true,
    ...post,
    keywords,
    respostaPublica: pub,
    respostaPublicaTexto: pubTexto,
    dmMensagem,
    dmBotao,
    stats: rule ? rule.stats : { comentarios: 0, dms: 0, leads: 0 },
  });

  const save = () => {
    saveAutomation(built());
    toast(rule ? "Automação atualizada ✓" : "Automação criada ✓");
    onClose();
  };

  return (
    <Overlay
      onClose={onClose}
      title={rule ? "Editar automação" : "Nova automação"}
      wide
      footer={
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <Button variant="outline" onClick={() => onTest(built())} icon="bolt">
            Testar
          </Button>
          <Button full onClick={save} icon="check">
            {rule ? "Salvar" : "Criar automação"}
          </Button>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
        <div>
          <SectionLabel style={{ marginBottom: 9 }}>1 · Em qual post?</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 9 }}>
            {MOCK_POSTS.map((p) => {
              const on = p.postLegenda === post.postLegenda;
              return (
                <button
                  key={p.postLegenda}
                  onClick={() => setPost(p)}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    textAlign: "left",
                    padding: 10,
                    borderRadius: 12,
                    border: `2px solid ${on ? "var(--accent)" : "var(--line)"}`,
                    background: on ? "var(--accent-050)" : "var(--card)",
                  }}
                >
                  <PostThumb emoji={p.postEmoji} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)" }}>{p.postTipo}</div>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "var(--ink)",
                        lineHeight: 1.25,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.postLegenda}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <SectionLabel style={{ marginBottom: 9 }}>2 · Palavra-chave do comentário</SectionLabel>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              border: "1.5px solid var(--line)",
              borderRadius: 12,
              padding: 10,
              background: "var(--card)",
            }}
          >
            {keywords.map((k) => (
              <span
                key={k}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: "var(--accent-800)",
                  background: "var(--accent-050)",
                  padding: "6px 10px",
                  borderRadius: 8,
                }}
              >
                {k}
                <button
                  onClick={() => setKeywords(keywords.filter((x) => x !== k))}
                  style={{ color: "var(--accent)", display: "flex" }}
                >
                  <Icon name="x" size={13} sw={2.5} />
                </button>
              </span>
            ))}
            <input
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addKw();
                }
              }}
              placeholder="+ palavra"
              style={{
                border: "none",
                outline: "none",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink)",
                fontFamily: "var(--font)",
                minWidth: 90,
                flex: 1,
                background: "transparent",
                textTransform: "uppercase",
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 7 }}>
            Quem comentar qualquer uma dessas palavras recebe a DM. Enter pra adicionar.
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 9,
            }}
          >
            <SectionLabel>3 · Resposta pública no comentário</SectionLabel>
            <button
              onClick={() => setPub(!pub)}
              style={{
                width: 42,
                height: 25,
                borderRadius: 13,
                background: pub ? "var(--accent)" : "var(--line)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2.5,
                  left: pub ? 20 : 2.5,
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
          {pub && <Field value={pubTexto} onChange={setPubTexto} placeholder="Te chamei no direct! 💚" />}
        </div>
        <div>
          <SectionLabel style={{ marginBottom: 9 }}>4 · Mensagem da DM</SectionLabel>
          <Field as="textarea" rows={3} value={dmMensagem} onChange={setDmMensagem} />
          <div style={{ marginTop: 10 }}>
            <Field label="Texto do botão (abre o bio-funil)" value={dmBotao} onChange={setDmBotao} icon="link" />
          </div>
        </div>
      </div>
    </Overlay>
  );
}
