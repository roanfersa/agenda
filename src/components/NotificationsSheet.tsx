"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { EmptyState } from "./ui";
import { useStore } from "@/lib/store";

export function NotificationsSheet({
  onClose,
  onOpen,
}: {
  onClose: () => void;
  onOpen: (leadId: string) => void;
}) {
  const notifications = useStore((s) => s.notifications);
  const markNotifsRead = useStore((s) => s.markNotifsRead);
  React.useEffect(() => {
    markNotifsRead();
  }, [markNotifsRead]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 4000,
        background: "rgba(21,33,28,.42)",
        display: "flex",
        alignItems: "flex-end",
        animation: "fadeIn .2s both",
      }}
      className="lg:items-start lg:justify-end lg:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="no-sb lg:max-w-md lg:rounded-2xl lg:mt-4"
        style={{
          background: "var(--bg)",
          borderRadius: "24px 24px 0 0",
          padding: "18px 18px 30px",
          width: "100%",
          animation: "slideUp .3s cubic-bezier(.2,.8,.3,1) both",
          maxHeight: "76%",
          overflowY: "auto",
        }}
      >
        <div
          className="lg:hidden"
          style={{ width: 40, height: 4, borderRadius: 4, background: "var(--line)", margin: "0 auto 16px" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
          <span style={{ color: "var(--accent)", display: "flex" }}>
            <Icon name="bell" size={20} />
          </span>
          <h3 style={{ fontSize: 18 }}>Avisos</h3>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px", lineHeight: 1.45 }}>
          Você é avisado por <b>e-mail e push</b> quando entra um lead — sem precisar ficar olhando o app.
        </p>
        {notifications.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => onOpen(n.leadId)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 14,
                  padding: 13,
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "var(--accent-050)",
                    color: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name="user" size={19} />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 700, color: "var(--ink)", fontSize: 14.5 }}>
                    {n.nome} {n.texto}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    <span>{n.quando}</span>
                    <span>·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Icon name="send" size={11} /> {n.canais}
                    </span>
                  </span>
                </span>
                <span style={{ color: "var(--faint)" }}>
                  <Icon name="chevRight" size={17} />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bell"
            title="Nenhum aviso ainda"
            body="Quando alguém entrar pelo seu funil, o aviso aparece aqui."
          />
        )}
      </div>
    </div>
  );
}
