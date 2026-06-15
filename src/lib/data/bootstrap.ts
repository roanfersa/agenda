import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  toAppointment,
  toAutomation,
  toDisponibilidade,
  toFunnel,
  toLead,
  toNotification,
  toProfessional,
  toSubscription,
} from "@/lib/supabase/mappers";
import type {
  Appointment,
  Automation,
  Disponibilidade,
  Funnel,
  Lead,
  Notification,
  Professional,
  Subscription,
} from "@/lib/types";

export type BootstrapData = {
  professional: Professional;
  funnels: Funnel[];
  activeFunnelId: string;
  leads: Lead[];
  appointments: Appointment[];
  automations: Automation[];
  notifications: Notification[];
  disponibilidade: Disponibilidade[];
  subscription: Subscription | null;
  onboardingDone: boolean;
};

/**
 * Carrega todo o estado do profissional logado a partir do Supabase.
 * Retorna null se não houver sessão. Respeita RLS (só vê os próprios dados).
 */
export async function getBootstrap(): Promise<BootstrapData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [prof, funnels, leads, appts, autos, notifs, dispo, subs] =
    await Promise.all([
      supabase.from("professionals").select("*").eq("id", user.id).single(),
      supabase.from("funnels").select("*").order("criado_em", { ascending: true }),
      supabase.from("leads").select("*").order("criado_em", { ascending: false }),
      supabase.from("appointments").select("*"),
      supabase.from("automations").select("*").order("criado_em", { ascending: false }),
      supabase.from("notifications").select("*").order("criado_em", { ascending: false }),
      supabase.from("availability").select("*"),
      supabase
        .from("subscriptions")
        .select("*")
        .order("criado_em", { ascending: false })
        .limit(1),
    ]);

  if (!prof.data) return null;

  const funnelList = (funnels.data ?? []).map(toFunnel);

  return {
    professional: toProfessional(prof.data),
    funnels: funnelList,
    activeFunnelId: funnelList[0]?.id ?? "",
    leads: (leads.data ?? []).map(toLead),
    appointments: (appts.data ?? []).map(toAppointment),
    automations: (autos.data ?? []).map(toAutomation),
    notifications: (notifs.data ?? []).map(toNotification),
    disponibilidade: (dispo.data ?? []).map(toDisponibilidade),
    subscription: subs.data?.[0] ? toSubscription(subs.data[0]) : null,
    onboardingDone: prof.data.onboarding_done,
  };
}
