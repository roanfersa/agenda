import "server-only";

/**
 * Host público da aplicação (ex.: https://getrevo.com.br).
 *
 * A app roda atrás de um proxy reverso (Caddy → Next em localhost:3000), então
 * `new URL(request.url).origin` e o header `host` retornam o host INTERNO
 * (localhost:3000). Qualquer URL entregue ao NAVEGADOR (redirects) ou a
 * provedores EXTERNOS (Google/Meta/Stripe, OAuth redirect_uri, links de DM)
 * precisa do host público. Ordem de resolução:
 *   1. NEXT_PUBLIC_SITE_URL  (definido em produção)
 *   2. X-Forwarded-Host/Proto (o Caddy injeta o host público)
 *   3. origin da requisição   (último recurso — dev local sem proxy)
 */
export function publicOrigin(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/+$/, "");
  const h = request.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  return new URL(request.url).origin;
}
