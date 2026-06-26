import * as React from "react";

/** Layout simples e legível para páginas legais (privacidade, termos). */
export function LegalPage({
  titulo,
  atualizado,
  children,
}: {
  titulo: string;
  atualizado: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)", padding: "48px 20px" }}>
      <article
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          padding: "40px clamp(20px, 5vw, 48px)",
        }}
      >
        <a href="/" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textDecoration: "none" }}>
          ← Revo
        </a>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: "-.02em", margin: "16px 0 6px", color: "var(--ink)" }}>
          {titulo}
        </h1>
        <p style={{ fontSize: 13, color: "var(--faint)", marginBottom: 28 }}>Última atualização: {atualizado}</p>
        <div style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-2, #3A463F)" }} className="legal">
          {children}
        </div>
      </article>
    </div>
  );
}

/** Cabeçalho de seção reutilizável. */
export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, color: "var(--ink)", margin: "28px 0 8px" }}>
      {children}
    </h2>
  );
}
