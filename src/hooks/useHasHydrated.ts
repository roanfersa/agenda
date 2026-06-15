"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import type { BootstrapData } from "@/lib/data/bootstrap";

let bootstrapped = false;
let inflight: Promise<void> | null = null;

async function loadOnce() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch("/api/bootstrap", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as BootstrapData;
        useStore.getState().hydrate(data);
      }
    } catch {
      // Sem sessão ou rede indisponível — a UI autenticada é protegida pelo proxy.
    }
  })();
  return inflight;
}

/**
 * Carrega o estado do profissional logado a partir do Supabase (uma vez) e
 * hidrata o store. Retorna true quando a carga inicial terminou.
 */
export function useHasHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    if (!bootstrapped) {
      bootstrapped = true;
      loadOnce().finally(() => alive && setHydrated(true));
    } else {
      loadOnce().finally(() => alive && setHydrated(true));
    }
    return () => {
      alive = false;
    };
  }, []);
  return hydrated;
}
