/**
 * Tracking público (client-side). Fire-and-forget: nunca lança.
 * Usa navigator.sendBeacon (sobrevive à navegação) com fallback fetch keepalive.
 */
export function track(
  tipo: string,
  opts: { slug: string; recursoId?: string; fonte?: string },
): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    slug: opts.slug,
    tipo,
    recursoId: opts.recursoId,
    fonte: opts.fonte,
  });
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/track", blob);
      if (ok) return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silencioso — tracking é best-effort.
  }
}
