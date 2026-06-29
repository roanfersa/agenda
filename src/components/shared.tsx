"use client";

import * as React from "react";
import { Icon, type IconName } from "./Icon";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  RoundBtn,
  SectionLabel,
  STATUS,
} from "./ui";

/* ---- Logo ---------------------------------------------------------------- */
export function Logo({ size = 28, light }: { size?: number; light?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.32,
          background: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
          <path
            d="M5 13l4 4 10-11"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: size * 0.62,
          letterSpacing: "-.02em",
          color: light ? "#fff" : "var(--ink)",
        }}
      >
        Revo
      </span>
    </div>
  );
}

/* ---- Toggle -------------------------------------------------------------- */
export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 42,
        height: 25,
        borderRadius: 13,
        background: on ? "var(--accent)" : "var(--line)",
        position: "relative",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2.5,
          left: on ? 20 : 2.5,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
          transition: "left .2s",
        }}
      />
    </button>
  );
}

/* ---- PushHeader (mobile, with back) ------------------------------------- */
export function PushHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 16px 14px",
      }}
    >
      {onBack && <RoundBtn icon="arrowLeft" onClick={onBack} />}
      <div
        style={{
          flex: 1,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 19,
          color: "var(--ink)",
          letterSpacing: "-.02em",
        }}
      >
        {title}
      </div>
      {right}
    </div>
  );
}

/* ---- StepWrap (onboarding step scaffold) --------------------------------- */
export function StepWrap({
  eyebrow,
  titulo,
  sub,
  children,
}: {
  eyebrow?: string;
  titulo: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "8px 20px 0", animation: "fadeUp .35s both" }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: ".05em",
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h1
        style={{
          fontSize: 25,
          lineHeight: 1.12,
          letterSpacing: "-.02em",
          marginBottom: sub ? 8 : 18,
        }}
      >
        {titulo}
      </h1>
      {sub && (
        <p
          style={{
            fontSize: 14.5,
            color: "var(--muted)",
            lineHeight: 1.5,
            marginBottom: 22,
          }}
        >
          {sub}
        </p>
      )}
      {children}
    </div>
  );
}

/* ---- EditableBlock ------------------------------------------------------- */
export function EditableBlock({
  value,
  onChange,
  multiline,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  if (editing) {
    return (
      <div>
        <Field as={multiline ? "textarea" : undefined} rows={3} value={value} onChange={onChange} autoFocus />
        <button
          onClick={() => setEditing(false)}
          style={{ marginTop: 8, color: "var(--accent)", fontWeight: 700, fontSize: 13.5 }}
        >
          Pronto
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={() => setEditing(true)}
      style={{
        width: "100%",
        textAlign: "left",
        background: "var(--card)",
        border: "1.5px solid var(--line)",
        borderRadius: 14,
        padding: "13px 15px",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <span style={{ flex: 1, fontSize: 14.5, color: "var(--text)", lineHeight: 1.5, fontWeight: 500 }}>
        {value}
      </span>
      <span style={{ color: "var(--faint)", flexShrink: 0, marginTop: 2 }}>
        <Icon name="edit" size={17} />
      </span>
    </button>
  );
}

/* ---- QuestionEditor ----------------------------------------------------- */
export type QFull = {
  id: string;
  texto: string;
  tipo: "opcoes" | "texto_livre";
  opcoes?: string[];
  obrigatoria: boolean;
  ativa: boolean;
};

export function QuestionEditor({
  q,
  onChange,
  onRemove,
}: {
  q: QFull;
  onChange: (patch: Partial<QFull>) => void;
  onRemove?: (() => void) | null;
}) {
  const [editingText, setEditingText] = React.useState(false);
  const [editOpt, setEditOpt] = React.useState<number | null>(null);
  const setOpt = (i: number, val: string) =>
    onChange({ opcoes: (q.opcoes || []).map((o, j) => (j === i ? val : o)) });
  const addOpt = () =>
    onChange({ opcoes: [...(q.opcoes || []), "Nova opção"] });
  const rmOpt = (i: number) =>
    onChange({ opcoes: (q.opcoes || []).filter((_, j) => j !== i) });

  return (
    <div
      style={{
        background: "var(--card)",
        border: `1.5px solid ${q.ativa ? "var(--line)" : "var(--line-soft)"}`,
        borderRadius: 14,
        padding: 14,
        opacity: q.ativa ? 1 : 0.55,
        transition: "opacity .2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: "var(--faint)", cursor: "grab" }}>
          <Icon name="grip" size={18} />
        </span>
        {editingText ? (
          <input
            autoFocus
            value={q.texto}
            onChange={(e) => onChange({ texto: e.target.value })}
            onBlur={() => setEditingText(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingText(false)}
            style={{
              flex: 1,
              border: "none",
              borderBottom: "2px solid var(--accent)",
              outline: "none",
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--ink)",
              fontFamily: "var(--font)",
              padding: "2px 0",
              background: "transparent",
            }}
          />
        ) : (
          <button
            onClick={() => setEditingText(true)}
            style={{ flex: 1, textAlign: "left", fontSize: 14.5, fontWeight: 700, color: "var(--ink)" }}
          >
            {q.texto}
          </button>
        )}
        <Toggle on={q.ativa} onClick={() => onChange({ ativa: !q.ativa })} />
        {onRemove && (
          <button onClick={onRemove} style={{ color: "var(--faint)", display: "flex" }}>
            <Icon name="trash" size={16} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 11, paddingLeft: 28 }}>
        {[
          ["opcoes", "Opções"],
          ["texto_livre", "Texto livre"],
        ].map(([id, l]) => {
          const on = q.tipo === id;
          return (
            <button
              key={id}
              onClick={() => onChange({ tipo: id as QFull["tipo"] })}
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                padding: "4px 9px",
                borderRadius: 7,
                background: on ? "var(--ink)" : "var(--bg)",
                color: on ? "#fff" : "var(--muted)",
                border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
      {q.tipo === "opcoes" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, paddingLeft: 28 }}>
          {(q.opcoes || []).map((o, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12.5,
                fontWeight: 700,
                color: "var(--accent-800)",
                background: "var(--accent-050)",
                padding: "5px 8px 5px 10px",
                borderRadius: 8,
              }}
            >
              {editOpt === i ? (
                <input
                  autoFocus
                  value={o}
                  onChange={(e) => setOpt(i, e.target.value)}
                  onBlur={() => setEditOpt(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditOpt(null)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "var(--accent-800)",
                    fontFamily: "var(--font)",
                    width: 88,
                  }}
                />
              ) : (
                <button
                  onClick={() => setEditOpt(i)}
                  style={{ color: "var(--accent-800)", fontWeight: 700, fontSize: 12.5 }}
                >
                  {o}
                </button>
              )}
              <button
                onClick={() => rmOpt(i)}
                style={{ color: "var(--accent)", display: "flex", opacity: 0.6 }}
              >
                <Icon name="x" size={12} sw={2.5} />
              </button>
            </span>
          ))}
          <button
            onClick={addOpt}
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: "var(--faint)",
              padding: "5px 9px",
              borderRadius: 8,
              border: "1px dashed var(--line)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Icon name="plus" size={13} /> opção
          </button>
        </div>
      )}
      {q.tipo === "texto_livre" && (
        <div style={{ marginTop: 10, paddingLeft: 28, fontSize: 12.5, color: "var(--muted)", fontStyle: "italic" }}>
          O lead responde digitando.
        </div>
      )}
    </div>
  );
}

/* ---- ContactConfig ------------------------------------------------------ */
export function ContactConfig({
  campos,
  setCampos,
  quando,
  setQuando,
  objetivo,
}: {
  campos: { email: boolean; whatsapp: boolean };
  setCampos: (c: { email: boolean; whatsapp: boolean }) => void;
  quando: "inicio" | "fim";
  setQuando: (q: "inicio" | "fim") => void;
  objetivo: string;
}) {
  const agenda = objetivo === "agendar";
  const rows: { key: "nome" | "email" | "whatsapp"; label: string; locked?: boolean }[] = [
    { key: "nome", label: "Nome", locked: true },
    { key: "email", label: "E-mail" },
    { key: "whatsapp", label: "WhatsApp" },
  ];
  return (
    <div>
      <div style={{ background: "var(--card)", border: "1.5px solid var(--line)", borderRadius: 14, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <div
            key={r.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "12px 14px",
              borderTop: i ? "1px solid var(--line-soft)" : "none",
            }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: "var(--accent-050)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={r.key === "nome" ? "user" : r.key === "email" ? "chat" : "whatsapp"} size={16} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{r.label}</div>
              {r.locked && <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Sempre coletado</div>}
            </div>
            {r.locked ? (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--accent-800)",
                  background: "var(--accent-100)",
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                OBRIGATÓRIO
              </span>
            ) : (
              <Toggle
                on={!!campos[r.key as "email" | "whatsapp"]}
                onClick={() => setCampos({ ...campos, [r.key]: !campos[r.key as "email" | "whatsapp"] })}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
          Quando pedir o contato?
        </div>
        {agenda ? (
          <div
            style={{
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
              background: "var(--bg)",
              borderRadius: 12,
              padding: "11px 13px",
            }}
          >
            <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }}>
              <Icon name="clock" size={16} />
            </span>
            <span style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 }}>
              Neste funil de agendamento, o contato é sempre pedido{" "}
              <b style={{ color: "var(--ink)" }}>logo após a escolha do horário</b>, dentro da reserva de 10 min — pra não segurar slot à toa.
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            {(
              [
                ["inicio", "Após a 1ª pergunta"],
                ["fim", "No final"],
              ] as const
            ).map(([id, l]) => {
              const on = quando === id;
              return (
                <button
                  key={id}
                  onClick={() => setQuando(id)}
                  style={{
                    flex: 1,
                    padding: "11px 8px",
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 12.5,
                    background: on ? "var(--accent-050)" : "var(--card)",
                    color: on ? "var(--accent-800)" : "var(--muted)",
                    border: `1.5px solid ${on ? "var(--accent)" : "var(--line)"}`,
                    transition: "all .15s",
                  }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- Overlay ------------------------------------------------------------ */
export function Overlay({
  children,
  title,
  sub,
  footer,
  onClose,
  wide,
}: {
  children: React.ReactNode;
  title: string;
  sub?: string;
  footer?: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
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
          background: "var(--bg)",
          borderRadius: 20,
          width: "100%",
          maxWidth: wide ? 720 : 460,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--sh-lg)",
          animation: "popIn .26s both",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "20px 22px 14px",
            borderBottom: "1px solid var(--line)",
            background: "var(--card)",
          }}
        >
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 19, letterSpacing: "-.02em" }}>{title}</h3>
            {sub && <p style={{ fontSize: 13.5, color: "var(--muted)", margin: "4px 0 0" }}>{sub}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--bg)",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="no-sb" style={{ padding: 22, overflowY: "auto" }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--line)", background: "var(--card)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- ConfirmModal ------------------------------------------------------- */
export function ConfirmModal({
  icon,
  title,
  body,
  confirm,
  onConfirm,
  onClose,
  danger,
  doubleConfirm,
}: {
  icon: IconName;
  title: string;
  body: string;
  confirm: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
  doubleConfirm?: boolean;
}) {
  const [checked, setChecked] = React.useState(!doubleConfirm);
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
        padding: 24,
        animation: "fadeIn .18s both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          borderRadius: 18,
          padding: 26,
          maxWidth: 420,
          width: "100%",
          boxShadow: "var(--sh-lg)",
          animation: "popIn .26s both",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: danger ? "var(--danger-bg)" : "var(--accent-050)",
            color: danger ? "var(--danger)" : "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon name={icon} size={26} />
        </div>
        <h3 style={{ fontSize: 19, marginBottom: 8 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55, margin: "0 0 18px" }}>{body}</p>
        {doubleConfirm && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, cursor: "pointer" }}>
            <span
              onClick={() => setChecked(!checked)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `2px solid ${checked ? "var(--danger)" : "var(--line)"}`,
                background: checked ? "var(--danger)" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {checked && <Icon name="check" size={14} sw={3} />}
            </span>
            <span style={{ fontSize: 13, color: "var(--text)" }}>Entendo que esta ação é irreversível.</span>
          </label>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <Button full variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button full variant={danger ? "danger" : "primary"} disabled={!checked} onClick={onConfirm}>
            {confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---- BioLinkCard ------------------------------------------------------- */
const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://getrevo.com.br").replace(/\/$/, "");
export const funnelUrl = (slug: string) => `${SITE_BASE}/f/${slug}`;

export function BioLinkCard({
  slug,
  onToast,
}: {
  slug: string;
  onToast?: (msg: string) => void;
}) {
  const url = funnelUrl(slug);
  const host = SITE_BASE.replace(/^https?:\/\//, "");
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      onToast?.("Link copiado ✓");
    } catch {
      onToast?.("Não consegui copiar o link.");
    }
  };
  const onShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Meu link", url });
      } catch {
        /* usuário cancelou */
      }
    } else {
      onCopy();
    }
  };
  return (
    <div style={{ background: "var(--ink)", borderRadius: "var(--r-lg)", padding: 16, color: "#fff" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          fontWeight: 700,
          color: "rgba(255,255,255,.6)",
          textTransform: "uppercase",
          letterSpacing: ".05em",
          marginBottom: 10,
        }}
      >
        <Icon name="link" size={15} /> seu link da bio
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            flex: 1,
            fontWeight: 700,
            fontSize: 15,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {host}/f/{slug}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
        <button
          onClick={onCopy}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 10,
            background: "rgba(255,255,255,.14)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Icon name="copy" size={16} /> Copiar
        </button>
        <button
          onClick={onShare}
          style={{
            flex: 1,
            height: 40,
            borderRadius: 10,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Icon name="share" size={16} /> Compartilhar
        </button>
      </div>
    </div>
  );
}

/* ---- PageHead (desktop) ------------------------------------------------ */
export function PageHead({
  title,
  sub,
  action,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1 style={{ fontSize: 27, letterSpacing: "-.02em", marginBottom: sub ? 5 : 0 }}>{title}</h1>
        {sub && <p style={{ fontSize: 14.5, color: "var(--muted)", margin: 0 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---- DeskCard ---------------------------------------------------------- */
export function DeskCard({
  children,
  style,
  pad = 22,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--line)",
        borderRadius: 16,
        padding: pad,
        boxShadow: "var(--sh-sm)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---- Table cells ------------------------------------------------------- */
export function Th({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <th
      style={{
        textAlign: "left",
        fontSize: 11.5,
        fontWeight: 700,
        color: "var(--muted)",
        textTransform: "uppercase",
        letterSpacing: ".04em",
        padding: "0 14px 11px",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </th>
  );
}

export function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td
      style={{
        padding: "13px 14px",
        fontSize: 14,
        color: "var(--text)",
        borderTop: "1px solid var(--line-soft)",
        ...style,
      }}
    >
      {children}
    </td>
  );
}

export { Avatar, Badge, Button, Card, Field, RoundBtn, SectionLabel, STATUS };
