"use server";

import { createClient } from "@/lib/supabase/server";
import type { SetupStatus } from "@/lib/types";

async function assertInternal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ok: false };
  const { data: interno } = await supabase.rpc("is_internal");
  return { supabase, ok: Boolean(interno) };
}

export async function resolveLgpdAction(id: string) {
  const { supabase, ok } = await assertInternal();
  if (!ok) return { error: "forbidden" };
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
