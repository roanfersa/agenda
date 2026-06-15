"use server";

import { createClient } from "@/lib/supabase/server";
import { fromProfessional } from "@/lib/supabase/mappers";
import type { Professional } from "@/lib/types";

async function ownerId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

export async function updateProfessionalAction(patch: Partial<Professional>) {
  const { supabase, userId } = await ownerId();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase
    .from("professionals")
    .update(fromProfessional(patch))
    .eq("id", userId);
  return { error: error?.message ?? null };
}

export async function setCalendarAction(conectado: boolean, email?: string) {
  const { supabase, userId } = await ownerId();
  if (!userId) return { error: "unauthenticated" };
  const { data: cur } = await supabase
    .from("professionals")
    .select("google_calendar")
    .eq("id", userId)
    .single();
  const gc = cur?.google_calendar ?? { conectado: false, email: "", calendarId: "" };
  const { error } = await supabase
    .from("professionals")
    .update({
      google_calendar: { ...gc, conectado, email: email ?? gc.email },
    })
    .eq("id", userId);
  return { error: error?.message ?? null };
}

export async function completeOnboardingAction(patch: Partial<Professional>) {
  const { supabase, userId } = await ownerId();
  if (!userId) return { error: "unauthenticated" };
  const { error } = await supabase
    .from("professionals")
    .update({ ...fromProfessional(patch), onboarding_done: true })
    .eq("id", userId);
  return { error: error?.message ?? null };
}
