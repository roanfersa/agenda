import "server-only";
import { convert as htmlToText } from "html-to-text";
import { getAnthropic, textOf } from "./client";

/** Modelo com visão + leitura de PDF (extração é infrequente → modelo capaz). */
const EXTRACT_MODEL = "claude-sonnet-4-6";
const MAX_BYTES = 12 * 1024 * 1024; // 12MB

export type ExtractInput = {
  tipo: "arquivo" | "texto" | "link";
  url?: string;
  mime?: string;
  titulo?: string;
  descricao?: string;
};

const SYSTEM =
  "Você lê materiais de um profissional autônomo e resume o que é ÚTIL para um " +
  "assistente de vendas/qualificação: ofertas, produtos, preços, diferenciais, " +
  "público, objeções e tom de voz. Responda em pt-BR, em tópicos curtos, no máximo " +
  "~250 palavras. Não invente — use só o que está no material.";

function isImage(mime?: string, url?: string) {
  return (mime?.startsWith("image/") ?? false) || /\.(png|jpe?g|webp|gif)$/i.test(url || "");
}
function isPdf(mime?: string, url?: string) {
  return mime === "application/pdf" || /\.pdf($|\?)/i.test(url || "");
}
function isDocx(mime?: string, url?: string) {
  return (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime === "application/msword" ||
    /\.(docx?|doc)($|\?)/i.test(url || "")
  );
}

async function fetchLimited(url: string): Promise<Response> {
  if (!/^https?:\/\//i.test(url)) throw new Error("URL inválida");
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    const len = Number(res.headers.get("content-length") || 0);
    if (len > MAX_BYTES) throw new Error("Arquivo muito grande");
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function summarize(content: string): Promise<string> {
  const client = getAnthropic();
  if (!client) return content.slice(0, 2000);
  const msg = await client.messages.create({
    model: EXTRACT_MODEL,
    max_tokens: 600,
    system: SYSTEM,
    messages: [{ role: "user", content: `Material a resumir:\n\n${content.slice(0, 60000)}` }],
  });
  return textOf(msg);
}

/**
 * Lê o conteúdo de um material e devolve um resumo normalizado, pronto pra
 * alimentar a IA. PDFs e imagens vão direto pra Claude pela URL (lê texto e
 * elementos visuais); DOCX/HTML/txt são extraídos localmente e resumidos.
 */
export async function extractMaterial(input: ExtractInput): Promise<string> {
  const client = getAnthropic();
  const { url, mime } = input;

  // PDF e imagem: Claude lê pela URL pública (nativo).
  if (url && client && (isPdf(mime, url) || isImage(mime, url))) {
    const isImg = isImage(mime, url);
    const block = isImg
      ? ({ type: "image", source: { type: "url", url } } as const)
      : ({ type: "document", source: { type: "url", url } } as const);
    const msg = await client.messages.create({
      model: EXTRACT_MODEL,
      max_tokens: 600,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: [
            block,
            { type: "text", text: isImg ? "Descreva o que é relevante nesta imagem." : "Extraia e resuma os pontos úteis deste documento." },
          ],
        },
      ],
    });
    return textOf(msg);
  }

  // DOCX: extrai texto com mammoth e resume.
  if (url && isDocx(mime, url)) {
    const res = await fetchLimited(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    const mammoth = (await import("mammoth")).default ?? (await import("mammoth"));
    const { value } = await mammoth.extractRawText({ buffer });
    return summarize(value || input.descricao || "");
  }

  // Link/HTML (landing page): busca, converte pra texto e resume.
  if (input.tipo === "link" && url) {
    const res = await fetchLimited(url);
    const html = await res.text();
    const texto = htmlToText(html, {
      wordwrap: false,
      selectors: [
        { selector: "script", format: "skip" },
        { selector: "style", format: "skip" },
        { selector: "nav", format: "skip" },
        { selector: "footer", format: "skip" },
        { selector: "a", options: { ignoreHref: true } },
      ],
    });
    return summarize(texto);
  }

  // txt ou nota de texto: usa o que tem.
  if (url && /\.txt($|\?)/i.test(url)) {
    const res = await fetchLimited(url);
    return summarize(await res.text());
  }
  return input.descricao || "";
}
