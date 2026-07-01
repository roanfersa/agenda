import "server-only";

/**
 * Envio de e-mail de aviso de lead via Resend. Env-gated:
 * sem RESEND_API_KEY (ou sem destinatário) é no-op silencioso.
 */
export async function sendLeadEmail(
  to: string,
  d: { nome: string; texto: string; funilNome?: string },
): Promise<void> {
  if (!process.env.RESEND_API_KEY || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM || "Revo <onboarding@resend.dev>",
        to,
        subject: `Novo lead: ${d.nome}`,
        html: `<p><b>${d.nome}</b> ${d.texto}${d.funilNome ? ` — funil ${d.funilNome}` : ""}.</p><p>Veja em getrevo.com.br/leads</p>`,
      }),
    });
  } catch {
    // Não lança: aviso por e-mail é best-effort.
  }
}
