import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, planoForPrice } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Plano } from "@/lib/types";

/**
 * Webhook do Stripe. Verifica a assinatura com o corpo cru e sincroniza
 * a tabela subscriptions + o plano em professionals. Idempotente: faz upsert
 * por stripe_subscription_id.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  const raw = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "assinatura inválida";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const db = createAdminClient();

  async function profByCustomer(customer: string | null) {
    if (!customer) return null;
    const { data } = await db
      .from("professionals")
      .select("id")
      .eq("stripe_customer_id", customer)
      .single();
    return data?.id ?? null;
  }

  async function syncSubscription(sub: Stripe.Subscription) {
    const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const professionalId = await profByCustomer(customer);
    if (!professionalId) return;

    const priceId = sub.items.data[0]?.price.id;
    const plano = planoForPrice(priceId) ?? "entrada";
    const valor = (sub.items.data[0]?.price.unit_amount ?? 0) / 100;
    const ciclo = sub.items.data[0]?.price.recurring?.interval === "year" ? "anual" : "mensal";
    const status =
      sub.status === "active" || sub.status === "trialing"
        ? sub.status === "trialing"
          ? "trial"
          : "em_dia"
        : sub.status === "past_due" || sub.status === "unpaid"
          ? "atrasado"
          : "cancelado";

    await db.from("subscriptions").upsert(
      {
        professional_id: professionalId,
        plano,
        valor,
        ciclo,
        status,
        stripe_subscription_id: sub.id,
        current_period_end: new Date(sub.items.data[0].current_period_end * 1000).toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );

    // Atualiza o plano efetivo do profissional só quando a assinatura está ativa.
    if (status === "em_dia" || status === "trial") {
      await db.from("professionals").update({ plano }).eq("id", professionalId);
    }
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription" && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscription(sub);
      } else if (session.mode === "payment") {
        // Setup avulso pago.
        const professionalId =
          session.metadata?.professional_id ??
          (await profByCustomer(typeof session.customer === "string" ? session.customer : null));
        const plano = (session.metadata?.plano as Plano) ?? "setup";
        if (professionalId) {
          await db.from("subscriptions").insert({
            professional_id: professionalId,
            plano,
            valor: (session.amount_total ?? 0) / 100,
            ciclo: "unico",
            status: "em_dia",
          });
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.created":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object);
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object;
      const professionalId = await profByCustomer(
        typeof inv.customer === "string" ? inv.customer : null,
      );
      if (professionalId) {
        await db
          .from("subscriptions")
          .update({ status: "atrasado" })
          .eq("professional_id", professionalId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
