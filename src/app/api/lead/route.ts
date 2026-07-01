import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeLead } from "@/lib/ai/lead-summary";
import { getValidGoogleToken } from "@/lib/data/google";
import { createCalendarEvent, proximaOcorrencia } from "@/lib/integrations/google";
import { sendLeadEmail } from "@/lib/notify/email";
import type { Resposta } from "@/lib/types";

type Body = {
  slug: string;
  nome: string;
  whatsapp: string;
  email?: string;
  respostas: Resposta[];
  agendamento?: {
    dia: string;
    dataHora: string;
    hora: string;
    tipo: string;
    modalidade: "online" | "presencial";
  } | null;
  origem?: "instagram" | "link";
  recursoId?: string;
  fonte?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "json inválido" }, { status: 400 });
  }

  if (!body.slug || !body.nome?.trim()) {
    return NextResponse.json({ error: "dados incompletos" }, { status: 400 });
  }

  const db = createAdminClient();

  // 1) Funil precisa existir e estar publicado.
  const { data: funnel } = await db
    .from("funnels")
    .select("id, professional_id, objetivo, consentimento_texto, nome")
    .eq("slug", body.slug)
    .eq("status", "publicado")
    .single();
  if (!funnel) {
    return NextResponse.json({ error: "funil indisponível" }, { status: 404 });
  }

  const { data: prof } = await db
    .from("professionals")
    .select("nome, especialidade, avisos")
    .eq("id", funnel.professional_id)
    .single();

  // 2) Resumo + qualificação por IA (com fallback se a IA não estiver ligada).
  const qual = await summarizeLead({
    nome: body.nome,
    especialidade: prof?.especialidade ?? "",
    objetivo: funnel.objetivo,
    respostas: body.respostas ?? [],
  });

  const agora = new Date().toISOString();
  const status = body.agendamento ? "agendado" : "novo";

  // 3) Cria o lead.
  const { data: lead, error: leadErr } = await db
    .from("leads")
    .insert({
      professional_id: funnel.professional_id,
      funnel_id: funnel.id,
      nome: body.nome.trim(),
      whatsapp: body.whatsapp ?? "",
      email: body.email || null,
      respostas: body.respostas ?? [],
      resumo_ia: qual.resumo,
      status,
      consentimento: { dado: true, dataHora: agora },
      origem: body.origem ?? "link",
      recurso_id: body.recursoId ?? null,
      fonte: body.fonte ?? "",
      novo: true,
    })
    .select("id")
    .single();
  if (leadErr || !lead) {
    return NextResponse.json({ error: "falha ao salvar" }, { status: 500 });
  }

  // 4) Agendamento (opcional). Cria o evento no Google Agenda, se conectado.
  if (body.agendamento) {
    let googleEventId: string | null = null;
    try {
      const cred = await getValidGoogleToken(funnel.professional_id);
      const quando = cred ? proximaOcorrencia(body.agendamento.dia, body.agendamento.hora) : null;
      if (cred && quando) {
        googleEventId = await createCalendarEvent(cred.token, cred.calendarId, {
          summary: `${body.agendamento.tipo} — ${body.nome.trim()}`,
          description: `Agendado pelo Revo${body.whatsapp ? ` · WhatsApp: ${body.whatsapp}` : ""}`,
          start: quando.start,
          end: quando.end,
        });
      }
    } catch {
      // Não bloqueia o agendamento se o Google falhar.
    }
    await db.from("appointments").insert({
      professional_id: funnel.professional_id,
      lead_id: lead.id,
      dia_rotulo: body.agendamento.dia,
      data_hora: body.agendamento.dataHora,
      hora: body.agendamento.hora,
      tipo_atendimento: body.agendamento.tipo,
      modalidade: body.agendamento.modalidade,
      status: "confirmado",
      google_event_id: googleEventId,
    });
  }

  // 5) Consentimento (auditoria LGPD) + notificação.
  const canais =
    [prof?.avisos?.email && "e-mail", prof?.avisos?.push && "push"]
      .filter(Boolean)
      .join(" + ") || "app";
  await Promise.all([
    db.from("consent_log").insert({
      professional_id: funnel.professional_id,
      lead_id: lead.id,
      lead_nome: body.nome.trim(),
      professional_nome: prof?.nome ?? "",
      data_hora: agora,
      texto: funnel.consentimento_texto,
    }),
    db.from("notifications").insert({
      professional_id: funnel.professional_id,
      lead_id: lead.id,
      nome: body.nome.trim(),
      texto: body.agendamento
        ? `marcou ${body.agendamento.dia}, ${body.agendamento.hora}`
        : "entrou pelo seu funil",
      canais,
      quando: "Agora mesmo",
    }),
  ]);

  // 6) Aviso por e-mail ao profissional (se ele optou por e-mail). Best-effort.
  if (prof?.avisos?.email) {
    try {
      const { data: u } = await db.auth.admin.getUserById(funnel.professional_id);
      const proEmail = u?.user?.email;
      if (proEmail) {
        await sendLeadEmail(proEmail, {
          nome: body.nome.trim(),
          texto: body.agendamento ? `marcou ${body.agendamento.dia}` : "entrou pelo seu funil",
          funilNome: funnel.nome,
        });
      }
    } catch {
      // Não bloqueia a resposta se o aviso por e-mail falhar.
    }
  }

  return NextResponse.json({ ok: true, leadId: lead.id });
}
