import Stripe from "stripe";

/**
 * Single shared Stripe client. Server-only (this file must never be imported
 * from a "use client" component) — STRIPE_SECRET_KEY is never exposed to the
 * browser. Outlet checkout only; the rest of the catalogue stays quote-based.
 *
 * Lazily constructed, not a top-level `new Stripe(...)` - Next.js evaluates
 * route/page modules during its build-time "Collecting page data" step even
 * though the handler never actually runs then, so an eager client crashed
 * the whole build the moment STRIPE_SECRET_KEY wasn't yet set as a Vercel
 * env var (found 2026-09-17, the first real preview-branch build attempt:
 * "Error: Neither apiKey nor config.authenticator provided"). Constructing
 * on first real use means a missing key only breaks the actual checkout
 * request, at runtime, not every build.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
      appInfo: { name: "adcontact-outlet-checkout" },
    });
  }
  return client;
}
