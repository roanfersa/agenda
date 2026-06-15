import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, priceFor, TRIAL_DAYS } from "@/lib/stripe/server";
import type { Plano } from "@/lib/types";

/** Cria uma Stripe Checkout Session para o plano escolhido pelo profissional. */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { plano } = (await request.json().catch(() => ({}))) as { plano?: Plano };
  const price = plano ? priceFor(plano) : null;
  if (!plano || !price) {
    return NextResponse.json({ error: "Plano inválido ou sem price configurado." }, { status: 400 });
  }

  // Reusa/garante o customer do Stripe.
  const { data: prof } = await supabase
    .from("professionals")
    .select("stripe_customer_id, nome")
    .eq("id", user.id)
    .single();

  let customerId = prof?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: prof?.nome || undefined,
      metadata: { professional_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("professionals")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const isSetup = plano === "setup";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isSetup ? "payment" : "subscription",
    line_items: [{ price, quantity: 1 }],
    ...(isSetup ? {} : { subscription_data: { trial_period_days: TRIAL_DAYS } }),
    metadata: { professional_id: user.id, plano },
    success_url: `${site}/planos?status=sucesso`,
    cancel_url: `${site}/planos?status=cancelado`,
    locale: "pt-BR",
  });

  return NextResponse.json({ url: session.url });
}
