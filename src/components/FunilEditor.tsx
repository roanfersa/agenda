"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { Button, Field, SectionLabel } from "./ui";
import {
  ContactConfig,
  EditableBlock,
  QuestionEditor,
  type QFull,
} from "./shared";
import { OBJETIVOS, useStore } from "@/lib/store";
import { hasFeature } from "@/lib/features";
import type { Objetivo } from "@/lib/types";

export function FunilEditor() {
  const funnel = useStore((s) => s.funnel);
  const professional = useStore((s) => s.professional);
  const updateFunnel = useStore((s) => s.updateFunnel);
  const toast = useStore((s) => s.toast);

  const [welcome, setWelcome] = React.useState(funnel.mensagemBoasVindas);
  const [questions, setQuestions] = React.useState<QFull[]>(
    funnel.perguntas.map((q) => ({
      id: q.id,
      texto: q.texto,
      tipo: q.tipo,
      opcoes: q.opcoes,
      obrigatoria: q.obrigatoria,
      ativa: true,
    })),
  );
  const [objetivo, setObjetivo] = React.useState<Objetivo>(funnel.objetivo);
  const [consent, setConsent] = React.useState(funnel.consentimentoTexto);
  const [campos, setCampos] = React.useState(funnel.camposContato);
  const [quando, setQuando] = React.useState<"inicio" | "fim">(funnel.contatoQuando);

  const setQ = (i: number, patch: Partial<QFull>) =>
    setQuestions((qs) => qs.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addQ = () =>
    setQuestions((qs) => [
      ...qs,
      {
        id: "q" + Date.now(),
        texto: "Nova pergunta",
        tipo: "opcoes",
        opcoes: ["Opção 1", "Opção 2"],
        obrigatoria: false,
        ativa: true,
      },
    ]);
  const rmQ = (i: number) => setQuestions((qs) => qs.filter((_, j) => j !== i));

  const [gerando, setGerando] = React.useState(false);
  const gerarComIA = async () => {
    if (gerando) return;
    setGerando(true);
    try {
      const res = await fetch("/api/ai/funnel-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objetivo }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Não foi possível gerar com IA.");
        return;
      }
      if (data.mensagemBoasVindas) setWelcome(data.mensagemBoasVindas);
      if (data.consentimentoTexto) setConsent(data.consentimentoTexto);
      if (Array.isArray(data.perguntas) && data.perguntas.length) {
        setQuestions(
          data.perguntas.map((q: { id: string; texto: string; tipo: "opcoes" | "texto_livre"; opcoes?: string[]; obrigatoria: boolean }) => ({
            id: q.id,
            texto: q.texto,
            tipo: q.tipo,
            opcoes: q.opcoes,
            obrigatoria: q.obrigatoria,
            ativa: true,
          })),
        );
      }
      toast("Funil gerado com IA ✨ — revise e salve.");
    } catch {
      toast("Erro de conexão com a IA.");
    } finally {
      setGerando(false);
    }
  };

  const save = () => {
    updateFunnel({
      objetivo,
      modo: objetivo === "agendar" ? "ambos" : "capturar",
      mensagemBoasVindas: welcome,
      consentimentoTexto: consent,
      camposContato: campos,
      contatoQuando: quando,
      perguntas: questions
        .filter((q) => q.ativa)
        .map(({ ativa, ...q }) => q),
    });
    toast("Funil republicado ✓");
  };

  const editor = (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <SectionLabel style={{ marginBottom: 4 }}>Objetivo do funil</SectionLabel>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "0 0 10px" }}>
          O que o visitante faz ao final do fluxo. Escolha uma opção:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {OBJETIVOS.map((m) => {
            const on = objetivo === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setObjetivo(m.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 11,
                  padding: "12px 13px",
                  borderRadius: 12,
                  textAlign: "left",
                  background: on ? "var(--accent-050)" : "var(--card)",
                  border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  transition: "all .15s",
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: on ? "var(--accent)" : "var(--bg)",
                    color: on ? "#fff" : "var(--muted)",
                  }}
                >
                  <Icon name={m.icon as never} size={16} />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, fontSize: 14, color: on ? "var(--accent-800)" : "var(--ink)" }}>
                    {m.titulo}
                  </span>
                  <span style={{ display: "block", fontSize: 12.5, color: "var(--muted)", marginTop: 1, lineHeight: 1.4 }}>
                    {m.beneficio} <span style={{ color: "var(--faint)" }}>· Ex.: {m.exemplo}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {hasFeature(professional, "gerar_ia") && (
        <div style={{ display: "flex" }}>
          <Button variant="outline" size="sm" icon="bolt" onClick={gerarComIA} disabled={gerando}>
            {gerando ? "Gerando…" : "Gerar funil com IA"}
          </Button>
        </div>
      )}
      <div>
        <SectionLabel style={{ marginBottom: 8 }}>Mensagem de boas-vindas</SectionLabel>
        <EditableBlock value={welcome} onChange={setWelcome} multiline />
      </div>
      <div>
        <SectionLabel style={{ marginBottom: 8 }}>Perguntas de qualificação</SectionLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {questions.map((q, i) => (
            <QuestionEditor
              key={q.id}
              q={q}
              onChange={(patch) => setQ(i, patch)}
              onRemove={questions.length > 1 ? () => rmQ(i) : null}
            />
          ))}
        </div>
        <button
          onClick={addQ}
          style={{
            marginTop: 10,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "12px 0",
            borderRadius: 12,
            border: "1.5px dashed var(--accent-200)",
            color: "var(--accent-800)",
            background: "var(--accent-050)",
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          <Icon name="plus" size={17} /> Adicionar pergunta
        </button>
      </div>
      <div>
        <SectionLabel style={{ marginBottom: 8 }}>Dados de contato</SectionLabel>
        <ContactConfig
          campos={campos}
          setCampos={setCampos}
          quando={quando}
          setQuando={setQuando}
          objetivo={objetivo}
        />
      </div>
      <div>
        <SectionLabel style={{ marginBottom: 8 }}>Texto de consentimento (LGPD)</SectionLabel>
        <EditableBlock value={consent} onChange={setConsent} multiline />
      </div>
      <Button full size="lg" icon="refresh" onClick={save}>
        Salvar e republicar
      </Button>
    </div>
  );

  // A prévia é renderizada pelo BioLinkEditor (painel fixo à direita no desktop
  // e aba "Prévia" no mobile), então aqui mostramos só o formulário de edição.
  return <div style={{ padding: "0 16px" }} className="lg:px-0">{editor}</div>;
}
