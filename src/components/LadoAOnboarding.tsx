"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { Avatar, Button, Field, Progress, RoundBtn, SectionLabel } from "./ui";
import {
  ContactConfig,
  EditableBlock,
  QuestionEditor,
  StepWrap,
  type QFull,
} from "./shared";
import { inferObjetivo, OBJ, OBJETIVOS, useStore } from "@/lib/store";
import type { ContextoItem, Objetivo } from "@/lib/types";

function OnbHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <div style={{ padding: "6px 16px 14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, minHeight: 40 }}>
        {step > 0 ? <RoundBtn icon="arrowLeft" onClick={onBack} /> : <div style={{ width: 40 }} />}
        <div style={{ flex: 1, textAlign: "center", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>
          Etapa {step + 1} de {total}
        </div>
        <div style={{ width: 40 }} />
      </div>
      <Progress value={(step + 1) / total} />
    </div>
  );
}

function periodPicks(periodo: string | null): string[] {
  if (periodo === "manha") return ["Início da manhã", "Fim da manhã"];
  if (periodo === "tarde") return ["Início da tarde", "Fim da tarde"];
  if (periodo === "noite") return ["Começo da noite", "Mais tarde"];
  return ["Manhã", "Tarde", "Noite"];
}

function iaFunnel(objetivo: Objetivo, extras: { atende: string | null; periodo: string | null }) {
  const { atende, periodo } = extras;
  const base: Record<Objetivo, { welcome: string; qs: { texto: string; opcoes: string[] }[] }> = {
    agendar: {
      welcome: "Oi! Sou o Osvaldo 🌿 Me responde rapidinho pra eu entender como posso te ajudar e já deixar tudo pronto.",
      qs: [
        { texto: "O que te interessa?", opcoes: ["Primeira sessão", "Retorno", "Só tirar uma dúvida"] },
        ...(atende === "ambos" || !atende ? [{ texto: "Prefere como?", opcoes: ["Online", "Presencial"] }] : []),
        { texto: "Qual período é melhor pra você?", opcoes: periodPicks(periodo) },
      ],
    },
    qualificar: {
      welcome: "Oi! Antes de te conectar com o time, me ajuda com 3 perguntinhas rápidas? 🙌",
      qs: [
        { texto: "Qual o seu interesse?", opcoes: ["Contratar serviço", "Orçamento", "Parceria"] },
        { texto: "Você fala por você ou por uma empresa?", opcoes: ["Pessoa física", "Empresa"] },
        { texto: "Pra quando você precisa?", opcoes: ["É urgente", "Nas próximas semanas", "Só pesquisando"] },
      ],
    },
    capturar: {
      welcome: "Oi! Que bom te ver por aqui 😊 Me conta uma coisinha que já te chamo no WhatsApp.",
      qs: [
        { texto: "O que te trouxe aqui?", opcoes: ["Quero saber mais", "Tenho uma dúvida", "Quero começar"] },
        { texto: "Qual o melhor horário pra falar?", opcoes: periodPicks(periodo) },
      ],
    },
  };
  const conf = base[objetivo];
  return {
    welcome: conf.welcome,
    questions: conf.qs.map((q, i) => ({
      id: "q" + (i + 1),
      texto: q.texto,
      tipo: "opcoes" as const,
      opcoes: q.opcoes,
      obrigatoria: true,
      ativa: true,
    })),
  };
}

const MANUAL_START = {
  welcome: "Oi! Que bom que você chegou aqui 🙌 Responde rapidinho pra eu te ajudar melhor.",
  questions: [
    {
      id: "mq1",
      texto: "Sua primeira pergunta",
      tipo: "opcoes" as const,
      opcoes: ["Opção 1", "Opção 2"],
      obrigatoria: true,
      ativa: true,
    },
  ],
};

function ContextEditor({
  items,
  setItems,
}: {
  items: ContextoItem[];
  setItems: (items: ContextoItem[]) => void;
}) {
  const [linking, setLinking] = React.useState(false);
  const [link, setLink] = React.useState("");
  const PDFS = ["ementa-do-programa.pdf", "tabela-de-precos.pdf", "sobre-meu-trabalho.pdf", "perguntas-frequentes.pdf"];
  const add = (tipo: ContextoItem["tipo"], label: string) =>
    setItems([...items, { id: "ctx" + Date.now() + Math.random().toString(36).slice(2, 5), tipo, label }]);
  const rm = (id: string) => setItems(items.filter((i) => i.id !== id));
  const addPdf = () => add("pdf", PDFS[items.filter((i) => i.tipo === "pdf").length % PDFS.length]);
  const addLink = () => {
    if (!link.trim()) return;
    add("link", link.trim().replace(/^https?:\/\//, ""));
    setLink("");
    setLinking(false);
  };
  const ICON = { pdf: "file", link: "link", texto: "chat" } as const;
  return (
    <div>
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--card)",
                border: "1.5px solid var(--line)",
                borderRadius: 12,
                padding: "10px 12px",
              }}
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "var(--accent-050)",
                  color: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={ICON[it.tipo]} size={17} />
              </span>
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--ink)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {it.label}
              </span>
              <button onClick={() => rm(it.id)} style={{ color: "var(--faint)", display: "flex", flexShrink: 0 }}>
                <Icon name="x" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      {linking ? (
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Field value={link} onChange={setLink} placeholder="cole o link aqui" icon="link" autoFocus />
          </div>
          <Button onClick={addLink} icon="check">
            Add
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={addPdf}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "12px 0",
              borderRadius: 12,
              border: "1.5px dashed var(--accent-200)",
              background: "var(--accent-050)",
              color: "var(--accent-800)",
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            <Icon name="paperclip" size={16} /> Anexar PDF
          </button>
          <button
            onClick={() => setLinking(true)}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              padding: "12px 0",
              borderRadius: 12,
              border: "1.5px dashed var(--line)",
              background: "var(--card)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 13.5,
            }}
          >
            <Icon name="link" size={16} /> Adicionar link
          </button>
        </div>
      )}
      <div
        style={{
          marginTop: 10,
          fontSize: 12.5,
          color: "var(--muted)",
          lineHeight: 1.45,
          display: "flex",
          gap: 7,
        }}
      >
        <span style={{ color: "var(--accent)", flexShrink: 0 }}>
          <Icon name="sparkles" size={15} />
        </span>
        A IA lê esses materiais pra escrever o funil com a sua linguagem — preços, serviços, jeito de falar.
      </div>
    </div>
  );
}

function GoogleConnectCard({ onConnect, connecting }: { onConnect: () => void; connecting: boolean }) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1.5px solid var(--line)",
        borderRadius: 18,
        padding: 20,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          boxShadow: "var(--sh-sm)",
        }}
      >
        <Icon name="google" size={30} />
      </div>
      <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 16, marginBottom: 6 }}>Google Agenda</div>
      <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.45, marginBottom: 18 }}>
        Vamos ler só sua disponibilidade (livre/ocupado) e criar os eventos das sessões.
      </p>
      <Button full size="lg" variant="outline" onClick={onConnect} disabled={connecting} icon={connecting ? undefined : "google"}>
        {connecting ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2.5px solid var(--accent)",
                borderTopColor: "transparent",
                animation: "spin .8s linear infinite",
              }}
            />
            Conectando…
          </span>
        ) : (
          "Conectar Google Agenda"
        )}
      </Button>
    </div>
  );
}

export function LadoAOnboarding({
  onDone,
  onExit,
  mode = "editar",
}: {
  onDone: () => void;
  onExit: () => void;
  mode?: "editar" | "novo";
}) {
  const professional = useStore((s) => s.professional);
  const funnel = useStore((s) => s.funnel);
  const updateFunnel = useStore((s) => s.updateFunnel);
  const addFunnel = useStore((s) => s.addFunnel);
  const updateProfessional = useStore((s) => s.updateProfessional);
  const connectCalendar = useStore((s) => s.connectCalendar);
  const isNovo = mode === "novo";

  const [step, setStep] = React.useState(0);
  const [bio, setBio] = React.useState(isNovo ? "" : "Sou terapeuta tântrico e atendo ansiedade e autoconhecimento.");
  const [handle, setHandle] = React.useState(professional.handleInstagram);
  const [objetivo, setObjetivo] = React.useState<Objetivo>("agendar");
  const [metodo, setMetodo] = React.useState<"ia" | "manual">("ia");
  const [generating, setGenerating] = React.useState(false);
  const [built, setBuilt] = React.useState<{ welcome: string; questions: QFull[] } | null>(null);
  const [cal, setCal] = React.useState({ connecting: false, done: professional.googleCalendar.conectado });
  const [whats, setWhats] = React.useState("(11) 9 9887-7665");
  const [nome, setNome] = React.useState(professional.nome);
  const [contexto, setContexto] = React.useState<ContextoItem[]>(isNovo ? [] : funnel.contexto || []);
  const [funilNome, setFunilNome] = React.useState(isNovo ? "" : funnel.nome || "");
  const [campos, setCampos] = React.useState(isNovo ? { email: true, whatsapp: true } : funnel.camposContato || { email: true, whatsapp: true });
  const [quando, setQuando] = React.useState<"inicio" | "fim">(isNovo ? "fim" : funnel.contatoQuando || "fim");
  const [objInferido, setObjInferido] = React.useState(false);
  const [preIA, setPreIA] = React.useState<{ atende: string | null; periodo: string | null }>({
    atende: null,
    periodo: null,
  });

  const obj = OBJ(objetivo);
  const steps = [
    "bio",
    "objetivo",
    "metodo",
    ...(metodo === "ia" ? ["preIA"] : []),
    "editor",
    ...(obj.sched ? ["agenda"] : []),
    "perfil",
    "publicar",
  ];
  const total = steps.length;
  const cur = steps[step];
  const back = () => setStep((s) => Math.max(0, s - 1));
  const next = () => setStep((s) => Math.min(total - 1, s + 1));

  React.useEffect(() => {
    if (cur !== "editor") return;
    if (metodo === "ia") {
      setGenerating(true);
      const t = setTimeout(() => {
        setBuilt(iaFunnel(objetivo, preIA));
        setGenerating(false);
      }, 1500);
      return () => clearTimeout(t);
    } else if (!built) {
      setBuilt({ welcome: MANUAL_START.welcome, questions: MANUAL_START.questions.map((q) => ({ ...q })) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  const setQ = (i: number, patch: Partial<QFull>) =>
    setBuilt((b) => (b ? { ...b, questions: b.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) } : b));
  const addQ = () =>
    setBuilt((b) =>
      b
        ? {
            ...b,
            questions: [
              ...b.questions,
              {
                id: "q" + Date.now(),
                texto: "Nova pergunta",
                tipo: "opcoes",
                opcoes: ["Opção 1", "Opção 2"],
                obrigatoria: false,
                ativa: true,
              },
            ],
          }
        : b
    );
  const rmQ = (i: number) =>
    setBuilt((b) => (b ? { ...b, questions: b.questions.filter((_, j) => j !== i) } : b));

  function publish() {
    if (!built) return;
    const payload = {
      nome: funilNome.trim() || `Funil de ${obj.curto.toLowerCase()}`,
      objetivo,
      metodo,
      modo: (objetivo === "agendar" ? "ambos" : "capturar") as "ambos" | "capturar",
      contexto,
      camposContato: campos,
      contatoQuando: quando,
      mensagemBoasVindas: built.welcome,
      perguntas: built.questions
        .filter((q) => q.ativa)
        .map(({ ativa, ...q }) => q),
      consentimentoTexto: professional.consentimentoTextoPadrao,
    };
    if (isNovo) addFunnel(payload);
    else updateFunnel(payload);
    updateProfessional({ nome });
    if (cal.done) connectCalendar();
  }

  const header = <OnbHeader step={step} total={total} onBack={step === 0 ? onExit : back} />;
  let body: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (cur === "bio") {
    body = (
      <StepWrap
        eyebrow="Etapa 1 · Seu perfil"
        titulo="O que você faz?"
        sub="Cola seu @ e descreve em uma frase. É com isso que a IA entende o seu trabalho."
      >
        <Field label="Seu @ no Instagram" icon="instagram" value={handle} onChange={setHandle} placeholder="@seu.perfil" />
        <Field
          as="textarea"
          rows={4}
          label="Em uma frase, o que você faz?"
          value={bio}
          onChange={setBio}
          hint='Ex.: "Sou psicóloga e atendo ansiedade e burnout."'
          style={{ marginTop: 16 }}
        />
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
            background: "var(--bg)",
            borderRadius: 12,
            padding: "11px 13px",
          }}
        >
          <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>
            <Icon name="sparkles" size={16} />
          </span>
          <span style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 }}>
            Não precisa dizer se é online ou presencial, preços ou horários — isso o funil pergunta pro lead no próximo passo.
          </span>
        </div>
      </StepWrap>
    );
    footer = (
      <Button
        full
        size="lg"
        iconRight="arrowRight"
        disabled={!bio.trim()}
        onClick={() => {
          if (!objInferido) {
            setObjetivo(inferObjetivo(bio));
            setObjInferido(true);
          }
          next();
        }}
      >
        Continuar
      </Button>
    );
  } else if (cur === "objetivo") {
    const rec = OBJ(objetivo);
    const outros = OBJETIVOS.filter((m) => m.id !== objetivo);
    body = (
      <StepWrap
        eyebrow="Etapa 2 · Criar o funil"
        titulo="Pelo que você faz, seu funil vai…"
        sub="Deixei isso pronto a partir da sua frase. Se não for bem isso, troca embaixo."
      >
        <div
          style={{
            background: "var(--accent-050)",
            border: "2px solid var(--accent)",
            borderRadius: 18,
            padding: 17,
            boxShadow: "var(--sh-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                flexShrink: 0,
                background: "var(--accent)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={rec.icon as never} size={26} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: "var(--accent-800)",
                    background: "var(--accent-100)",
                    padding: "3px 7px",
                    borderRadius: 6,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Icon name="sparkles" size={11} /> SUGESTÃO
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 17,
                  color: "var(--ink)",
                  letterSpacing: "-.01em",
                }}
              >
                {rec.beneficio}
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <SectionLabel style={{ marginBottom: 8 }}>Não é isso? Use pra…</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {outros.map((m) => (
              <button
                key={m.id}
                onClick={() => setObjetivo(m.id)}
                style={{
                  display: "flex",
                  gap: 11,
                  alignItems: "center",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 13,
                  background: "var(--card)",
                  border: "1.5px solid var(--line)",
                  transition: "all .15s",
                }}
              >
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: "var(--bg)",
                    color: "var(--muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={m.icon as never} size={19} />
                </span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{m.beneficio}</span>
                <span style={{ color: "var(--faint)" }}>
                  <Icon name="chevRight" size={16} />
                </span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <SectionLabel style={{ marginBottom: 8 }}>
            Materiais pra IA{" "}
            <span style={{ textTransform: "none", fontWeight: 600, color: "var(--faint)" }}>· opcional</span>
          </SectionLabel>
          <ContextEditor items={contexto} setItems={setContexto} />
        </div>
      </StepWrap>
    );
    footer = (
      <Button full size="lg" iconRight="arrowRight" onClick={next}>
        Continuar
      </Button>
    );
  } else if (cur === "metodo") {
    const cards = [
      {
        id: "ia" as const,
        icon: "sparkles" as const,
        tag: "Recomendado",
        titulo: "Montar com a IA",
        desc: "Eu escrevo a mensagem e as perguntas pra você. Em segundos, pronto pra ajustar.",
      },
      {
        id: "manual" as const,
        icon: "pencilPlus" as const,
        titulo: "Montar manualmente",
        desc: "Você escreve as mensagens e perguntas do seu jeito, do zero.",
      },
    ];
    body = (
      <StepWrap
        eyebrow="Etapa 2 · Criar o funil"
        titulo="Quer que a IA monte ou prefere fazer você?"
        sub="Os dois caem no mesmo editor — dá pra ajustar tudo depois."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {cards.map((c) => {
            const on = metodo === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setMetodo(c.id)}
                style={{
                  position: "relative",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  textAlign: "left",
                  padding: 18,
                  borderRadius: 18,
                  background: on ? "var(--accent-050)" : "var(--card)",
                  border: `2px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    flexShrink: 0,
                    background: on ? "var(--accent)" : "var(--bg)",
                    color: on ? "#fff" : "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all .15s",
                  }}
                >
                  <Icon name={c.icon} size={26} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 16.5,
                        color: "var(--ink)",
                      }}
                    >
                      {c.titulo}
                    </span>
                    {c.tag && (
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          color: "var(--accent-800)",
                          background: "var(--accent-100)",
                          padding: "3px 7px",
                          borderRadius: 6,
                        }}
                      >
                        {c.tag.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.45 }}>{c.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </StepWrap>
    );
    footer = (
      <Button full size="lg" iconRight="arrowRight" onClick={next}>
        {metodo === "ia" ? "Continuar" : "Montar do zero"}
      </Button>
    );
  } else if (cur === "preIA") {
    const atendeOpts: [string, string][] = [
      ["online", "Só online"],
      ["presencial", "Só presencial"],
      ["ambos", "Os dois"],
    ];
    const periodoOpts: [string, string][] = [
      ["manha", "De manhã"],
      ["tarde", "À tarde"],
      ["noite", "À noite"],
      ["todos", "Vários horários"],
    ];
    const ready = !!preIA.atende && !!preIA.periodo;
    body = (
      <StepWrap
        eyebrow="Etapa 2 · Criar o funil"
        titulo="Só 2 perguntas pra eu acertar"
        sub="Com isso eu escrevo as perguntas certas — sem chutar nem inventar."
      >
        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "center",
            background: "var(--accent-050)",
            borderRadius: 12,
            padding: "11px 14px",
            marginBottom: 20,
          }}
        >
          <span style={{ color: "var(--accent)" }}>
            <Icon name="sparkles" size={18} />
          </span>
          <span style={{ fontSize: 13, color: "var(--accent-800)", fontWeight: 600 }}>A IA pergunta antes de montar</span>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
          Você atende como?
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {atendeOpts.map(([id, l]) => {
            const on = preIA.atende === id;
            return (
              <button
                key={id}
                onClick={() => setPreIA((p) => ({ ...p, atende: id }))}
                style={{
                  flex: "1 1 30%",
                  padding: "13px 8px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 13.5,
                  background: on ? "var(--accent-050)" : "var(--card)",
                  color: on ? "var(--accent-800)" : "var(--text)",
                  border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  transition: "all .15s",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", marginBottom: 10 }}>
          Quando você costuma atender?
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {periodoOpts.map(([id, l]) => {
            const on = preIA.periodo === id;
            return (
              <button
                key={id}
                onClick={() => setPreIA((p) => ({ ...p, periodo: id }))}
                style={{
                  flex: "1 1 44%",
                  padding: "13px 8px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 13.5,
                  background: on ? "var(--accent-050)" : "var(--card)",
                  color: on ? "var(--accent-800)" : "var(--text)",
                  border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
                  transition: "all .15s",
                }}
              >
                {l}
              </button>
            );
          })}
        </div>
      </StepWrap>
    );
    footer = (
      <Button full size="lg" iconRight="arrowRight" disabled={!ready} onClick={next}>
        Gerar meu funil
      </Button>
    );
  } else if (cur === "editor") {
    if (generating) {
      body = (
        <div style={{ padding: "60px 24px", textAlign: "center" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: "var(--accent-050)",
              color: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 22px",
              position: "relative",
            }}
          >
            <Icon name="sparkles" size={34} />
            <div
              style={{
                position: "absolute",
                inset: -4,
                borderRadius: 24,
                border: "3px solid var(--accent)",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
          <h2 style={{ fontSize: 21, marginBottom: 8 }}>Montando seu funil de {obj.curto.toLowerCase()}…</h2>
          <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.5, maxWidth: 290, margin: "0 auto" }}>
            Escrevendo as boas-vindas e as perguntas certas pra <b>{obj.titulo.toLowerCase()}</b>.
          </p>
        </div>
      );
    } else if (built) {
      body = (
        <StepWrap
          eyebrow="Etapa 2 · Criar o funil"
          titulo={metodo === "ia" ? "Já deixei pronto pra você" : "Monte do seu jeito"}
          sub={
            metodo === "ia"
              ? "É só ajustar — toque pra editar, ligue/desligue ou adicione."
              : "Toque pra editar cada texto. Adicione quantas perguntas quiser."
          }
        >
          <div
            style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
              background: "var(--accent-050)",
              borderRadius: 12,
              padding: "11px 14px",
              marginBottom: 16,
            }}
          >
            <span style={{ color: "var(--accent)" }}>
              <Icon name={metodo === "ia" ? "sparkles" : "target"} size={18} />
            </span>
            <span style={{ fontSize: 13, color: "var(--accent-800)", fontWeight: 600 }}>
              {metodo === "ia" ? "Perguntas geradas pra " : "Funil pra "}
              {obj.titulo.toLowerCase()}
            </span>
          </div>
          <SectionLabel style={{ marginBottom: 8 }}>Nome do funil</SectionLabel>
          <Field
            value={funilNome}
            onChange={setFunilNome}
            placeholder={`Ex.: Funil de ${obj.curto.toLowerCase()}`}
            icon="funnel"
            style={{ marginBottom: 20 }}
          />
          <SectionLabel style={{ marginBottom: 8 }}>Mensagem de boas-vindas</SectionLabel>
          <EditableBlock
            value={built.welcome}
            onChange={(v) => setBuilt((b) => (b ? { ...b, welcome: v } : b))}
            multiline
          />
          <SectionLabel style={{ margin: "20px 0 8px" }}>Perguntas de qualificação</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {built.questions.map((q, i) => (
              <QuestionEditor
                key={q.id}
                q={q}
                onChange={(patch) => setQ(i, patch)}
                onRemove={built.questions.length > 1 ? () => rmQ(i) : null}
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
          <SectionLabel style={{ margin: "22px 0 8px" }}>Dados de contato</SectionLabel>
          <ContactConfig campos={campos} setCampos={setCampos} quando={quando} setQuando={setQuando} objetivo={objetivo} />
        </StepWrap>
      );
      footer = (
        <Button full size="lg" iconRight="arrowRight" onClick={next}>
          {metodo === "ia" ? "Tá ótimo, continuar" : "Continuar"}
        </Button>
      );
    }
  } else if (cur === "agenda") {
    body = (
      <StepWrap
        eyebrow="Sua agenda"
        titulo="Conectar Google Agenda"
        sub="Conecte pra mostrarmos só os horários livres e marcarmos automaticamente."
      >
        {!cal.done ? (
          <GoogleConnectCard
            connecting={cal.connecting}
            onConnect={() => {
              setCal({ connecting: true, done: false });
              setTimeout(() => setCal({ connecting: false, done: true }), 1600);
            }}
          />
        ) : (
          <div
            style={{
              background: "var(--card)",
              border: "1.5px solid var(--accent-200)",
              borderRadius: 18,
              padding: 18,
              animation: "popIn .4s both",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--accent)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="checkCircle" size={26} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: 15 }}>Agenda conectada</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{professional.googleCalendar.email}</div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={next}
          style={{
            marginTop: 16,
            width: "100%",
            textAlign: "center",
            color: "var(--muted)",
            fontWeight: 600,
            fontSize: 14,
            padding: 10,
          }}
        >
          Conectar depois
        </button>
      </StepWrap>
    );
    footer = cal.done ? (
      <Button full size="lg" iconRight="arrowRight" onClick={next}>
        Continuar
      </Button>
    ) : null;
  } else if (cur === "perfil") {
    body = (
      <StepWrap
        eyebrow="Quase lá · Seu contato"
        titulo="WhatsApp e perfil"
        sub="Isso aparece no topo do funil e no resumo que você recebe."
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <Avatar name={nome} size={64} />
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "var(--ink)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--bg)",
              }}
            >
              <Icon name="camera" size={14} />
            </div>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.45 }}>
            Puxamos a foto do seu @ — ou toque pra enviar outra.
          </div>
        </div>
        <Field label="Nome de exibição" value={nome} onChange={setNome} icon="user" />
        <Field
          label="Seu WhatsApp"
          value={whats}
          onChange={setWhats}
          prefix="+55"
          icon="whatsapp"
          type="tel"
          style={{ marginTop: 16 }}
          hint="Com DDD. É pra onde o lead é direcionado."
        />
      </StepWrap>
    );
    footer = (
      <Button
        full
        size="lg"
        iconRight="arrowRight"
        disabled={!nome.trim()}
        onClick={() => {
          publish();
          next();
        }}
      >
        Publicar funil
      </Button>
    );
  } else if (cur === "publicar") {
    const url = `agendai.com.br/f/${funnel.slug}`;
    body = (
      <div style={{ padding: "32px 22px", textAlign: "center" }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "var(--accent)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 22px",
            boxShadow: "0 8px 24px rgba(14,138,107,.32)",
            animation: "popIn .5s both",
          }}
        >
          <Icon name="check" size={42} sw={2.5} />
        </div>
        <h1 style={{ fontSize: 26, marginBottom: 8, letterSpacing: "-.02em" }}>Tá no ar! 🎉</h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--muted)",
            lineHeight: 1.5,
            marginBottom: 24,
            maxWidth: 300,
            marginInline: "auto",
          }}
        >
          Seu funil de <b>{obj.titulo.toLowerCase()}</b> está pronto. Cole o link na bio do Instagram.
        </p>
        <div
          style={{
            background: "var(--card)",
            border: "1.5px solid var(--line)",
            borderRadius: 16,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textAlign: "left",
            marginBottom: 14,
          }}
        >
          <span style={{ color: "var(--accent)" }}>
            <Icon name="link" size={20} />
          </span>
          <span
            style={{
              flex: 1,
              fontWeight: 700,
              color: "var(--ink)",
              fontSize: 14.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {url}
          </span>
        </div>
      </div>
    );
    footer = (
      <Button full size="lg" variant="dark" iconRight="arrowRight" onClick={onDone}>
        Ir pro meu painel
      </Button>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 560,
          margin: "0 auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            background: "var(--card)",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 6px)",
          }}
        >
          {header}
        </div>
        <div style={{ flex: 1, paddingBottom: footer ? 100 : 0 }}>{body}</div>
        {footer && (
          <div
            style={{
              position: "sticky",
              bottom: 0,
              background: "linear-gradient(transparent, var(--bg) 22%)",
              padding: "18px 20px calc(env(safe-area-inset-bottom, 0px) + 18px)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
