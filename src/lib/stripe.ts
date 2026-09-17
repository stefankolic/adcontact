import Stripe from "stripe";

/**
 * Single shared Stripe client. Server-only (this file must never be imported
 * from a "use client" component) — STRIPE_SECRET_KEY is never exposed to the
 * browser. Outlet checkout only; the rest of the catalogue stays quote-based.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  appInfo: { name: "adcontact-outlet-checkout" },
});
