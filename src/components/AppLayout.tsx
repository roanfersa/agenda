"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { Avatar, RoundBtn, ToastHost } from "./ui";
import { BioLinkCard, Logo } from "./shared";
import { useStore } from "@/lib/store";
import { useHasHydrated } from "@/hooks/useHasHydrated";

export type AppScreen =
  | "inicio"
  | "leads"
  | "agenda"
  | "funis"
  | "funil"
  | "recursos"
  | "automacoes"
  | "conversas"
  | "planos"
  | "config";

type Item = { id: AppScreen; href: string; label: string; icon: IconName };

const ITEMS: Item[] = [
  { id: "inicio", href: "/inicio", label: "Início", icon: "home" },
  { id: "leads", href: "/leads", label: "Leads", icon: "users" },
  { id: "agenda", href: "/agenda", label: "Agenda", icon: "calendar" },
  { id: "funis", href: "/funis", label: "Funis", icon: "funnel" },
  { id: "recursos", href: "/recursos", label: "Recursos", icon: "link" },
  { id: "automacoes", href: "/automacoes", label: "Automações", icon: "instagram" },
  { id: "conversas", href: "/conversas", label: "Conversas", icon: "chat" },
  { id: "planos", href: "/planos", label: "Planos", icon: "bolt" },
];

// Item de fallback para "config" — não fica na nav lateral, mas continua
// alcançável no mobile e como destino do card de perfil.
const CONFIG_ITEM: Item = { id: "config", href: "/config", label: "Ajustes", icon: "settings" };

const MOBILE_TABS: AppScreen[] = ["inicio", "leads", "agenda", "config"];

export function AppLayout({
  screen,
  title,
  sub,
  rightAction,
  onBack,
  children,
  fullWidth = false,
}: {
  screen: AppScreen;
  title?: React.ReactNode;
  sub?: React.ReactNode;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const hydrated = useHasHydrated();
  const router = useRouter();
  const professional = useStore((s) => s.professional);
  const leads = useStore((s) => s.leads);
  const funnel = useStore((s) => s.funnel);
  const toast = useStore((s) => s.toast);
  const novos = leads.filter((l) => l._novo || l.status === "novo").length;

  if (!hydrated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          fontSize: 13,
        }}
      >
        <span style={{ opacity: 0.5 }}>Carregando…</span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 244,
          background: "var(--card)",
          borderRight: "1px solid var(--line)",
          flexDirection: "column",
          padding: "22px 14px 18px",
          zIndex: 30,
        }}
      >
        <div style={{ padding: "0 6px 18px" }}>
          <Logo size={26} />
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ITEMS.map((it) => {
            const on = screen === it.id;
            return (
              <Link
                key={it.id}
                href={it.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: on ? 700 : 600,
                  transition: "background .14s",
                  background: on ? "var(--accent-050)" : "transparent",
                  color: on ? "var(--accent-800)" : "var(--muted)",
                }}
              >
                <Icon name={it.icon} size={19} sw={on ? 2.1 : 1.8} />
                {it.label}
                {it.id === "leads" && novos ? (
                  <span
                    style={{
                      marginLeft: "auto",
                      minWidth: 19,
                      height: 19,
                      padding: "0 5px",
                      borderRadius: 10,
                      background: "var(--danger)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {novos}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 16 }}>
          <BioLinkCard slug={funnel.slug} onToast={toast} />
        </div>
        <Link
          href="/config"
          style={{
            marginTop: "auto",
            padding: 10,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid var(--line)",
            cursor: "pointer",
            background: screen === "config" ? "var(--accent-050)" : "transparent",
            transition: "background .14s",
          }}
          className="profile-card-link"
        >
          <Avatar name={professional.nome} size={34} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--ink)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {professional.nome}
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
              Plano {professional.plano === "pro" ? "Pro" : professional.plano === "setup" ? "Setup" : "Entrada"}
            </div>
          </div>
          <Icon name="settings" size={17} sw={1.8} style={{ color: "var(--muted)", flexShrink: 0 }} />
        </Link>
      </aside>

      {/* Main column */}
      <main
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          paddingBottom: 96,
        }}
        className="lg:!pb-0 lg:pl-[244px]"
      >
        {/* Mobile top header */}
        <div
          className="flex lg:hidden"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "var(--card)",
            borderBottom: "1px solid var(--line)",
            padding: "12px 16px 14px",
            alignItems: "center",
            gap: 12,
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)",
          }}
        >
          {onBack && <RoundBtn icon="arrowLeft" onClick={onBack} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 20,
                  letterSpacing: "-.02em",
                  color: "var(--ink)",
                }}
              >
                {title}
              </div>
            )}
            {sub && (
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{sub}</div>
            )}
          </div>
          {rightAction}
        </div>

        {/* Desktop header — same title row but inside the column */}
        <div
          className="hidden lg:flex"
          style={{
            padding: "26px 30px 6px",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "var(--muted)",
                  marginBottom: 6,
                }}
              >
                <Icon name="arrowLeft" size={16} /> Voltar
              </button>
            )}
            {title && (
              <h1 style={{ fontSize: 27, letterSpacing: "-.02em", marginBottom: sub ? 5 : 0 }}>{title}</h1>
            )}
            {sub && <p style={{ fontSize: 14.5, color: "var(--muted)", margin: 0 }}>{sub}</p>}
          </div>
          {rightAction}
        </div>

        <div
          style={{
            flex: 1,
            width: "100%",
            maxWidth: fullWidth ? "100%" : 1080,
            margin: "0 auto",
            padding: "16px 0 24px",
          }}
          className="lg:px-8 lg:py-6"
        >
          {(() => {
            const t = professional.trialEndsAt;
            if (!t || professional.plano === "pro") return null;
            const dias = Math.ceil((new Date(t).getTime() - Date.now()) / 86400000);
            const ativo = dias > 0;
            return (
              <a href="/planos" style={{ textDecoration: "none", display: "block", margin: "0 16px 16px" }} className="lg:mx-0">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: ativo ? "var(--accent-050)" : "var(--amber-bg)",
                    border: `1px solid ${ativo ? "var(--accent-100)" : "var(--amber)"}`,
                    borderRadius: 12,
                    padding: "10px 14px",
                  }}
                >
                  <Icon name="bolt" size={17} style={{ color: ativo ? "var(--accent)" : "var(--amber-ink)", flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: ativo ? "var(--accent-800)" : "var(--amber-ink)" }}>
                    {ativo ? `Teste grátis: ${dias} ${dias === 1 ? "dia" : "dias"} restante${dias === 1 ? "" : "s"}.` : "Seu teste grátis acabou."}{" "}
                    <b>Assine pra continuar com tudo liberado.</b>
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--accent)", flexShrink: 0, whiteSpace: "nowrap" }}>Assinar →</span>
                </div>
              </a>
            );
          })()}
          {children}
        </div>
      </main>

      {/* Mobile tabbar */}
      {MOBILE_TABS.includes(screen) && (
        <nav
          className="flex lg:hidden"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 25,
            background: "rgba(255,255,255,.94)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderTop: "1px solid var(--line)",
            justifyContent: "space-around",
            paddingTop: 9,
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 9px)",
          }}
        >
          {MOBILE_TABS.map((tab) => {
            const item = ITEMS.find((i) => i.id === tab) ?? CONFIG_ITEM;
            const on = screen === tab;
            return (
              <button
                key={tab}
                onClick={() => router.push(item.href)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  color: on ? "var(--accent)" : "var(--faint)",
                  position: "relative",
                  flex: 1,
                  padding: "2px 0",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Icon name={item.icon} size={24} sw={on ? 2.1 : 1.8} />
                  {tab === "leads" && novos ? (
                    <span
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -8,
                        minWidth: 16,
                        height: 16,
                        padding: "0 4px",
                        borderRadius: 8,
                        background: "var(--danger)",
                        color: "#fff",
                        fontSize: 10,
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {novos}
                    </span>
                  ) : null}
                </div>
                <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600 }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      <ToastHost />
    </div>
  );
}
