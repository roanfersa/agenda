import "server-only";
import Stripe from "stripe";
import type { Plano } from "@/lib/types";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

export type Ciclo = "mensal" | "anual";

/**
 * Price ID do Stripe. O produto é único (acesso total = plano "pro"); o que muda
 * é o ciclo: mensal (R$120/mês) ou anual (R$1.080/ano = R$90/mês).
 */
export function priceFor(_plano: Plano, ciclo: Ciclo = "mensal"): string | null {
  return ciclo === "anual"
    ? (process.env.STRIPE_PRICE_ANUAL ?? null)
    : (process.env.STRIPE_PRICE_MENSAL ?? null);
}

/** Plano correspondente a um price ID (usado no webhook). Ambos os ciclos = "pro". */
export function planoForPrice(priceId: string | null | undefined): Plano | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_MENSAL || priceId === process.env.STRIPE_PRICE_ANUAL) return "pro";
  return null;
}

export const TRIAL_DAYS = 7;
