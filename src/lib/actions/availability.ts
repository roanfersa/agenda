"use server";

import { createClient } from "@/lib/supabase/server";
import type { Disponibilidade } from "@/lib/types";

/** Substitui toda a disponibilidade do profissional pelo conjunto informado. */
export async function saveAvailabilityAction(dias: Disponibilidade[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const del = await supabase.from("availability").delete().eq("professional_id", user.id);
  if (del.error) return { error: del.error.message };

  const rows = dias
    .filter((d) => d.horarios.length > 0)
    .map((d) => ({ professional_id: user.id, rotulo: d.rotulo || d.dia, dia: d.dia, horarios: d.horarios }));
  if (rows.length) {
    const ins = await supabase.from("availability").insert(rows);
    if (ins.error) return { error: ins.error.message };
  }
  return { error: null };
}
