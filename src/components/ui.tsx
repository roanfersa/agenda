"use client";

import * as React from "react";
import { Icon, type IconName } from "./Icon";
import { initials, useStore } from "@/lib/store";

/* ---- Avatar -------------------------------------------------------------- */
export function Avatar({
  name,
  size = 40,
  src,
  bg = "var(--accent)",
  fg = "#fff",
  style,
}: {
  name?: string;
  size?: number;
  src?: string | null;
  bg?: string;
  fg?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: src ? `center/cover url(${src})` : bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font)",
        fontWeight: 700,
        fontSize: size * 0.38,
        letterSpacing: ".01em",
        ...style,
      }}
    >
      {!src && initials(name)}
    </div>
  );
}

/* ---- Badge / status pill ------------------------------------------------- */
export const STATUS: Record<
  string,
  { t: string; bg: string; fg: string }
> = {
  novo: { t: "Novo", bg: "var(--accent-100)", fg: "var(--accent-800)" },
  agendado: { t: "Agendado", bg: "var(--info-bg)", fg: "var(--info)" },
  em_conversa: { t: "Em conversa", bg: "var(--amber-bg)", fg: "var(--amber-ink)" },
  ativo: { t: "Ativo", bg: "var(--accent-100)", fg: "var(--accent-800)" },
  trial: { t: "Trial", bg: "var(--info-bg)", fg: "var(--info)" },
  inadimplente: { t: "Inadimplente", bg: "var(--danger-bg)", fg: "var(--danger-ink)" },
  cancelado: { t: "Cancelado", bg: "#EEECE6", fg: "#7C857E" },
  em_dia: { t: "Em dia", bg: "var(--accent-100)", fg: "var(--accent-800)" },
  atrasado: { t: "Atrasado", bg: "var(--danger-bg)", fg: "var(--danger-ink)" },
  pendente: { t: "Pendente", bg: "var(--amber-bg)", fg: "var(--amber-ink)" },
  concluido: { t: "Concluído", bg: "var(--accent-100)", fg: "var(--accent-800)" },
  solicitado: { t: "Solicitado", bg: "#EEECE6", fg: "#7C857E" },
  em_montagem: { t: "Em montagem", bg: "var(--info-bg)", fg: "var(--info)" },
  aguardando_cliente: { t: "Aguardando cliente", bg: "var(--amber-bg)", fg: "var(--amber-ink)" },
  publicado: { t: "Publicado", bg: "var(--accent-100)", fg: "var(--accent-800)" },
  pausado: { t: "Pausado", bg: "#EEECE6", fg: "#7C857E" },
};

export function Badge({
  status,
  children,
  bg,
  fg,
  dot,
  style,
}: {
  status?: string;
  children?: React.ReactNode;
  bg?: string;
  fg?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}) {
  const s = status ? STATUS[status] : undefined;
  const _bg = bg || s?.bg || "#EEECE6";
  const _fg = fg || s?.fg || "#7C857E";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: _bg,
        color: _fg,
        fontWeight: 700,
        fontSize: 12,
        lineHeight: 1,
        padding: "5px 9px",
        borderRadius: 8,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 6, background: _fg }} />}
      {children || s?.t || status}
    </span>
  );
}

/* ---- Button -------------------------------------------------------------- */
type ButtonVariant = "primary" | "dark" | "soft" | "ghost" | "outline" | "danger" | "whats";
type ButtonSize = "sm" | "md" | "lg";

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  full,
  disabled,
  style,
  type,
}: {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconRight?: IconName;
  full?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}) {
  const [hover, setHover] = React.useState(false);
  const sizes = {
    sm: { h: 36, px: 14, fs: 13.5, gap: 6, ic: 16 },
    md: { h: 46, px: 18, fs: 15, gap: 8, ic: 18 },
    lg: { h: 54, px: 22, fs: 16.5, gap: 9, ic: 20 },
  }[size];
  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: disabled ? "#C4D8D0" : hover ? "var(--accent-700)" : "var(--accent)", color: "#fff", boxShadow: disabled ? "none" : "var(--sh-sm)" },
    dark: { background: hover ? "#0c1714" : "var(--ink)", color: "#fff" },
    soft: { background: hover ? "var(--accent-100)" : "var(--accent-050)", color: "var(--accent-800)" },
    ghost: { background: hover ? "var(--line-soft)" : "transparent", color: "var(--ink)" },
    outline: { background: hover ? "var(--line-soft)" : "var(--card)", color: "var(--ink)", border: "1.5px solid var(--line)" },
    danger: { background: hover ? "#b53a31" : "var(--danger)", color: "#fff" },
    whats: { background: hover ? "#0c7c5c" : "var(--accent)", color: "#fff" },
  };
  return (
    <button
      type={type || "button"}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        height: sizes.h,
        padding: `0 ${sizes.px}px`,
        borderRadius: 12,
        fontWeight: 700,
        fontSize: sizes.fs,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: sizes.gap,
        width: full ? "100%" : undefined,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background .16s, transform .1s",
        letterSpacing: "-.01em",
        ...variants[variant],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={sizes.ic} sw={2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.ic} sw={2} />}
    </button>
  );
}

/* ---- Card ---------------------------------------------------------------- */
export function Card({
  children,
  style,
  onClick,
  pad = 16,
  hover: hoverable,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  pad?: number;
  hover?: boolean;
}) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hoverable && setH(true)}
      onMouseLeave={() => hoverable && setH(false)}
      style={{
        background: "var(--card)",
        borderRadius: "var(--r-lg)",
        border: "1px solid var(--line)",
        padding: pad,
        boxShadow: h ? "var(--sh)" : "var(--sh-sm)",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow .18s, transform .12s, border-color .18s",
        transform: h ? "translateY(-1px)" : "none",
        borderColor: h ? "var(--accent-200)" : "var(--line)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---- Progress ------------------------------------------------------------ */
export function Progress({ value, style }: { value: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        height: 6,
        background: "var(--line)",
        borderRadius: 6,
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.round(value * 100)}%`,
          background: "var(--accent)",
          borderRadius: 6,
          transition: "width .45s cubic-bezier(.2,.8,.3,1)",
        }}
      />
    </div>
  );
}

/* ---- Toast --------------------------------------------------------------- */
export function ToastHost() {
  const toast = useStore((s) => s.toastMsg);
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 26,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: "var(--ink)",
        color: "#fff",
        padding: "12px 18px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
        boxShadow: "var(--sh-lg)",
        display: "flex",
        alignItems: "center",
        gap: 9,
        animation: "popIn .3s both",
        maxWidth: 360,
      }}
    >
      <span style={{ color: "var(--accent-200)", display: "flex" }}>
        <Icon name="checkCircle" size={18} />
      </span>
      {toast.msg}
    </div>
  );
}

/* ---- Field --------------------------------------------------------------- */
export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  icon,
  prefix,
  as,
  rows = 3,
  style,
  autoFocus,
}: {
  label?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  icon?: IconName;
  prefix?: string;
  as?: "textarea";
  rows?: number;
  style?: React.CSSProperties;
  autoFocus?: boolean;
}) {
  const [focus, setFocus] = React.useState(false);
  const isArea = as === "textarea";
  return (
    <label style={{ display: "block", ...style }}>
      {label && (
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", marginBottom: 7 }}>
          {label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: isArea ? "flex-start" : "center",
          gap: 9,
          background: "var(--card)",
          border: `1.5px solid ${focus ? "var(--accent)" : "var(--line)"}`,
          borderRadius: 12,
          padding: isArea ? "12px 14px" : "0 14px",
          height: isArea ? "auto" : 50,
          transition: "border-color .15s, box-shadow .15s",
          boxShadow: focus ? "0 0 0 4px var(--accent-050)" : "none",
        }}
      >
        {icon && (
          <span style={{ color: "var(--faint)", display: "flex" }}>
            <Icon name={icon} size={19} />
          </span>
        )}
        {prefix && (
          <span style={{ color: "var(--muted)", fontWeight: 600, fontSize: 15 }}>{prefix}</span>
        )}
        {isArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            autoFocus={autoFocus}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              width: "100%",
              fontSize: 15.5,
              color: "var(--ink)",
              fontFamily: "var(--font)",
              fontWeight: 500,
              resize: "vertical",
              lineHeight: 1.5,
              padding: 0,
            }}
          />
        ) : (
          <input
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            type={type}
            autoFocus={autoFocus}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              width: "100%",
              fontSize: 15.5,
              color: "var(--ink)",
              fontFamily: "var(--font)",
              fontWeight: 500,
              padding: "14px 0",
            }}
          />
        )}
      </div>
      {hint && (
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.4 }}>
          {hint}
        </div>
      )}
    </label>
  );
}

/* ---- Typing dots --------------------------------------------------------- */
export function TypingDots({ color = "var(--muted)" }: { color?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 7,
            background: color,
            animation: `dot 1.2s ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

/* ---- Empty state --------------------------------------------------------- */
export function EmptyState({
  icon = "sparkles",
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "40px 24px" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "var(--accent-050)",
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <Icon name={icon} size={30} />
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 17,
          color: "var(--ink)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {body && (
        <div
          style={{
            fontSize: 14,
            color: "var(--muted)",
            lineHeight: 1.5,
            maxWidth: 280,
            margin: "0 auto 18px",
          }}
        >
          {body}
        </div>
      )}
      {action}
    </div>
  );
}

/* ---- App Header --------------------------------------------------------- */
export function AppHeader({
  title,
  left,
  right,
  sub,
  dark,
}: {
  title: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  sub?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "6px 18px 14px",
        background: dark ? "var(--accent)" : "var(--card)",
        color: dark ? "#fff" : "var(--ink)",
      }}
    >
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 21,
            letterSpacing: "-.02em",
            color: dark ? "#fff" : "var(--ink)",
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              fontSize: 13,
              color: dark ? "rgba(255,255,255,.85)" : "var(--muted)",
              marginTop: 1,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

/* ---- Round icon button --------------------------------------------------- */
export function RoundBtn({
  icon,
  onClick,
  badge,
  dark,
  size = 40,
}: {
  icon: IconName;
  onClick?: () => void;
  badge?: React.ReactNode;
  dark?: boolean;
  size?: number;
}) {
  const [h, setH] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        position: "relative",
        background: dark
          ? h ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.14)"
          : h ? "var(--line-soft)" : "var(--bg)",
        color: dark ? "#fff" : "var(--ink)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background .15s",
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={20} />
      {badge ? (
        <span
          style={{
            position: "absolute",
            top: -3,
            right: -3,
            minWidth: 17,
            height: 17,
            padding: "0 4px",
            borderRadius: 9,
            background: "var(--danger)",
            color: "#fff",
            fontSize: 10.5,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--card)",
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/* ---- Section label ------------------------------------------------------- */
export function SectionLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--muted)",
        textTransform: "uppercase",
        letterSpacing: ".06em",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
