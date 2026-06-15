import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

/** Abre o portal do cliente Stripe pro profissional gerenciar/cancelar. */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: prof } = await supabase
    .from("professionals")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();
  if (!prof?.stripe_customer_id) {
    return NextResponse.json({ error: "Sem assinatura ativa." }, { status: 400 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const session = await stripe.billingPortal.sessions.create({
    customer: prof.stripe_customer_id,
    return_url: `${site}/planos`,
  });

  return NextResponse.json({ url: session.url });
}
