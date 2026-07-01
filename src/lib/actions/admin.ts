"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { FEATURE_KEYS } from "@/lib/features";
import type { Plano, SetupStatus } from "@/lib/types";

async function assertInternal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false, userId: null as string | null };
  const { data: interno } = await supabase.rpc("is_internal");
  return { supabase, ok: Boolean(interno), userId: user.id };
}

/** Registra uma ação no log de auditoria interno. */
async function logAudit(actorId: string | null, acao: string) {
  if (!actorId) return;
  const db = createAdminClient();
  const { data: actor } = await db
    .from("internal_users")
    .select("nome, email")
    .eq("id", actorId)
    .single();
  await db.from("audit_log").insert({
    internal_user: actor?.nome || actor?.email || "interno",
    acao,
  });
}

export async function resolveLgpdAction(id: string) {
  const { supabase, ok, userId } = await assertInternal();
  if (!ok) return { error: "forbidden" };

  const db = createAdminClient();

  // Carrega o pedido para saber o tipo e o lead relacionado.
  const { data: req } = await db
    .from("lgpd_requests")
    .select("id, tipo, lead_id, lead_nome, professional_id")
    .eq("id", id)
    .single();

  // Só o pedido de EXCLUSÃO dispara anonimização efetiva do lead.
  if (req?.tipo === "exclusao") {
    // lead_id é a referência direta. Se estiver ausente (ex.: pedido vindo de
    // data-deletion sem lead casado), tenta o melhor por nome + profissional.
    let leadIds: string[] = [];
    if (req.lead_id) {
      leadIds = [req.lead_id as string];
    } else if (req.lead_nome && req.professional_id) {
      const { data: leads } = await db
        .from("leads")
        .select("id")
        .eq("professional_id", req.professional_id)
        .eq("nome", req.lead_nome);
      leadIds = (leads ?? []).map((l) => l.id as string);
    }

    for (const leadId of leadIds) {
      // Anonimiza o lead (mantém a linha para integridade do consent_log).
      await db
        .from("leads")
        .update({ nome: "[removido]", whatsapp: "", email: null, respostas: [] })
        .eq("id", leadId);
      // Remove dados derivados; consent_log é preservado (auditoria LGPD).
      await db.from("appointments").delete().eq("lead_id", leadId);
      await db.from("notifications").delete().eq("lead_id", leadId);
    }

    await logAudit(
      userId,
      leadIds.length
        ? `Concluiu exclusão LGPD e anonimizou ${leadIds.length} lead(s)`
        : "Concluiu exclusão LGPD (nenhum lead correspondente encontrado)",
    );
  }

  const { error } = await supabase
    .from("lgpd_requests")
    .update({ status: "concluido" })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function advanceSetupAction(id: string, status: SetupStatus) {
  const { supabase, ok } = await assertInternal();
  if (!ok) return { error: "forbidden" };
  const { error } = await supabase.from("setup_tasks").update({ status }).eq("id", id);
  return { error: error?.message ?? null };
}

/**
 * Liga/desliga um override de feature flag de outro profissional.
 * RLS bloqueia update cross-tenant → usa service role após assertInternal.
 */
export async function setFeatureFlagAction(proId: string, key: string, value: boolean) {
  const { ok, userId } = await assertInternal();
  if (!ok) return { error: "forbidden" };
  if (!FEATURE_KEYS.includes(key as never)) return { error: "flag inválida" };

  const db = createAdminClient();
  const { data: prof } = await db
    .from("professionals")
    .select("feature_flags, nome")
    .eq("id", proId)
    .single();
  const flags = { ...(prof?.feature_flags ?? {}), [key]: value };
  const { error } = await db
    .from("professionals")
    .update({ feature_flags: flags })
    .eq("id", proId);
  if (error) return { error: error.message };
  await logAudit(userId, `${value ? "Ligou" : "Desligou"} a flag '${key}' de ${prof?.nome ?? proId}`);
  return { error: null };
}

/** Remove um membro da equipe interna (não permite remover a si mesmo). */
export async function removeInternalUserAction(id: string) {
  const { ok, userId } = await assertInternal();
  if (!ok) return { error: "forbidden" };
  if (id === userId) return { error: "Você não pode remover a si mesmo." };
  const db = createAdminClient();
  const { data: u } = await db.from("internal_users").select("nome").eq("id", id).single();
  const { error } = await db.from("internal_users").delete().eq("id", id);
  if (error) return { error: error.message };
  await logAudit(userId, `Removeu ${u?.nome ?? id} da equipe interna`);
  return { error: null };
}

/**
 * Concede acesso de equipe interna a um usuário JÁ CADASTRADO (por e-mail).
 * A pessoa precisa ter criado a conta antes. Retorna o membro criado.
 */
export async function grantInternalAction(email: string, papel: "admin" | "operacao" | "financeiro") {
  const { ok, userId } = await assertInternal();
  if (!ok) return { error: "forbidden" as string, membro: null };
  const db = createAdminClient();

  // Procura o usuário de auth pelo e-mail.
  const { data: list } = await db.auth.admin.listUsers();
  const target = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!target) {
    return { error: "Nenhuma conta com esse e-mail. Peça para a pessoa criar a conta primeiro.", membro: null };
  }
  const nome = (target.user_metadata?.nome as string) || target.email || "Membro";
  const { error } = await db
    .from("internal_users")
    .upsert({ id: target.id, nome, email: target.email ?? email, papel });
  if (error) return { error: error.message, membro: null };
  await logAudit(userId, `Adicionou ${nome} à equipe interna (${papel})`);
  return { error: null, membro: { id: target.id, nome, email: target.email ?? email, papel } };
}

/** Altera o plano de outro profissional (service role + auditoria). */
export async function setPlanAction(proId: string, plano: Plano) {
  const { ok, userId } = await assertInternal();
  if (!ok) return { error: "forbidden" };
  const db = createAdminClient();
  const { data: prof } = await db.from("professionals").select("nome").eq("id", proId).single();
  const { error } = await db.from("professionals").update({ plano }).eq("id", proId);
  if (error) return { error: error.message };
  await logAudit(userId, `Alterou o plano de ${prof?.nome ?? proId} para ${plano}`);
  return { error: null };
}
