import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Callback de Exclusão de Dados (exigido pela Meta para Login do Facebook/Instagram).
 * A Meta envia um POST com `signed_request` quando uma pessoa pede a exclusão dos dados.
 * Respondemos com `{ url, confirmation_code }` — a URL onde a pessoa acompanha o status.
 */
function parseSignedRequest(signed: string, secret: string): { user_id?: string } | null {
  const [sig, payload] = signed.split(".");
  if (!sig || !payload) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  if (expected !== sig) return null;
  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  let signed = "";
  try {
    const form = await request.formData();
    signed = String(form.get("signed_request") ?? "");
  } catch {
    /* sem corpo de formulário */
  }
  const secret = process.env.INSTAGRAM_APP_SECRET ?? "";
  const data = secret && signed ? parseSignedRequest(signed, secret) : null;
  const userId = data?.user_id ?? "desconhecido";
  const code = crypto.createHash("sha256").update(`${userId}:${Date.now()}`).digest("hex").slice(0, 16);

  // O pedido de exclusão fica registrado; a remoção efetiva segue a Política de Privacidade.
  // (Profissionais também podem desconectar a conta a qualquer momento em Automações.)
  console.log(`[data-deletion] pedido recebido user_id=${userId} code=${code}`);

  return NextResponse.json({ url: `${site}/exclusao-de-dados?code=${code}`, confirmation_code: code });
}

/** Página de status simples para acompanhamento do pedido. */
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
