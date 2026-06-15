"use server";

import { createClient } from "@/lib/supabase/server";
import { fromAutomation } from "@/lib/supabase/mappers";
import type { Automation } from "@/lib/types";

async function owner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function saveAutomationAction(rule: Automation, isNew: boolean) {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  if (isNew) {
    const { error } = await supabase
      .from("automations")
      .insert({ id: rule.id, professional_id: userId, ...fromAutomation(rule) });
    return { error: error?.message ?? null };
  }
  const { error } = await supabase
    .from("automations")
    .update(fromAutomation(rule))
    .eq("id", rule.id)
    .eq("professional_id", userId);
  return { error: error?.message ?? null };
}

export async function toggleAutomationAction(id: string, ativa: boolean) {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase
    .from("automations")
    .update({ ativa })
    .eq("id", id)
    .eq("professional_id", userId);
  return { error: error?.message ?? null };
}
