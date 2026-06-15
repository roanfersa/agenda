import "server-only";
import Stripe from "stripe";
import type { Plano } from "@/lib/types";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

/** Price ID do Stripe para cada plano (configurado via env). */
export function priceFor(plano: Plano): string | null {
  switch (plano) {
    case "entrada":
      return process.env.STRIPE_PRICE_ENTRADA ?? null;
    case "pro":
      return process.env.STRIPE_PRICE_PRO ?? null;
    case "setup":
      return process.env.STRIPE_PRICE_SETUP ?? null;
    default:
      return null;
  }
}

/** Plano correspondente a um price ID (usado no webhook). */
export function planoForPrice(priceId: string | null | undefined): Plano | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ENTRADA) return "entrada";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_SETUP) return "setup";
  return null;
}

export const TRIAL_DAYS = 7;
