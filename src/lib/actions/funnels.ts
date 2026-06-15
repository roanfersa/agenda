"use server";

import { createClient } from "@/lib/supabase/server";
import { fromFunnel } from "@/lib/supabase/mappers";
import type { Funnel } from "@/lib/types";

async function owner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function saveFunnelAction(id: string, patch: Partial<Funnel>) {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase
    .from("funnels")
    .update(fromFunnel(patch))
    .eq("id", id)
    .eq("professional_id", userId);
  return { error: error?.message ?? null };
}

export async function createFunnelAction(funnel: Funnel) {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase.from("funnels").insert({
    id: funnel.id,
    professional_id: userId,
    ...fromFunnel(funnel),
  });
  return { error: error?.message ?? null };
}

export async function deleteFunnelAction(id: string) {
  const { supabase, userId } = await owner();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase
    .from("funnels")
    .delete()
    .eq("id", id)
    .eq("professional_id", userId);
  return { error: error?.message ?? null };
}
