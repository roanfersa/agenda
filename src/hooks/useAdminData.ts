"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import type { AdminData } from "@/lib/data/admin-bootstrap";

let inflight: Promise<void> | null = null;

function loadOnce() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/admin/bootstrap", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as AdminData;
        useStore.getState().hydrateAdmin(data);
      }
    } catch {
      // Sem permissão / rede — o proxy já garante que só internos chegam aqui.
    }
  })();
  return inflight;
}

/** Hidrata o store com os dados globais do painel admin (uma vez). */
export function useAdminData() {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    loadOnce().finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}
