"use server";

import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import type { LeadRow } from "@/lib/supabase/types";

async function owner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function updateLeadAction(id: string, patch: Partial<Lead>) {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  const row: Partial<LeadRow> = {};
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.resumoIA !== undefined) row.resumo_ia = patch.resumoIA;
  if (patch.resumoEditado !== undefined) row.resumo_editado = patch.resumoEditado;
  if (patch.nome !== undefined) row.nome = patch.nome;
  if (patch.whatsapp !== undefined) row.whatsapp = patch.whatsapp;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch._novo !== undefined) row.novo = patch._novo;
  const { error } = await supabase
    .from("leads")
    .update(row)
    .eq("id", id)
    .eq("professional_id", userId);
  return { error: error?.message ?? null };
}

export async function markLeadReadAction(id: string) {
  return updateLeadAction(id, { _novo: false });
}

export async function markNotifsReadAction() {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase
    .from("notifications")
    .update({ lida: true })
    .eq("professional_id", userId)
    .eq("lida", false);
  return { error: error?.message ?? null };
}
