import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { deutschOutletComponents } from "@/data/deutschOutlet";
import { CHECKOUT_ELIGIBLE_SKUS } from "@/data/outletCheckoutPilot";

/**
 * Flat-rate shipping by region (Stefan's pricing, 2026-09-18), not computed
 * per order. Order matters: Stripe pre-selects the FIRST option for the
 * buyer on the hosted checkout page. Deliberately defaulting to a €45 tier
 * rather than the cheaper Sweden/Estonia rate - an inattentive buyer then
 * "corrects down" only by actively picking the cheap option, instead of an
 * out-of-region buyer accidentally leaving the cheap one pre-selected.
 *
 * "Outside EU/EEA" is worded generically on purpose - the United Kingdom is
 * today's only real example, but the same tier/price and customs-excluded
 * disclosure should apply to any future non-EU/EEA destination without
 * needing new code, just an addition to allowed_countries below.
 */
const SHIPPING_OPTIONS: Stripe.Checkout.SessionCreateParams.ShippingOption[] = [
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 4500, currency: "eur" },
      display_name: "Rest of EU/EEA",
    },
  },
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 4500, currency: "eur" },
      display_name: "Outside EU/EEA (e.g. United Kingdom) - customs excl.",
    },
  },
  {
    shipping_rate_data: {
      type: "fixed_amount",
      fixed_amount: { amount: 2500, currency: "eur" },
      display_name: "Sweden & Estonia",
    },
  },
];

/**
 * Creates a Stripe Checkout Session for one outlet line item and returns the
 * hosted checkout URL to redirect to. Only SKUs in CHECKOUT_ELIGIBLE_SKUS
 * (real page + real image, same rule the GMC feed uses) are allowed through,
 * even if a request is crafted by hand for an ineligible SKU - defense in
 * depth, not just a UI-level gate.
 *
 * Uses ad-hoc `price_data` per session rather than pre-syncing outlet rows
 * into Stripe's own Product/Price catalog - simpler for a v1 pilot, nothing
 * to keep in sync if outlet pricing changes. Revisit if/when this widens to
 * the full outlet catalogue and Stripe-side reporting per-SKU becomes useful.
 */
export async function POST(req: Request) {
  const { sku, quantity } = await req.json();
  if (typeof sku !== "string") {
    return NextResponse.json({ error: "Missing sku" }, { status: 400 });
  }
  // The buyer picks quantity on our own page (a real, visible stepper) -
  // Stripe's own adjustable_quantity control on the hosted checkout page is
  // small and easy to miss, so it's kept only as a fallback for last-minute
  // changes, not the primary way to choose an amount.
  const requestedQuantity = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  if (!CHECKOUT_ELIGIBLE_SKUS.has(sku)) {
    return NextResponse.json({ error: "Not available for direct purchase" }, { status: 403 });
  }

  const item = deutschOutletComponents.find((o) => o.sku === sku);
  if (!item) {
    return NextResponse.json({ error: "Unknown SKU" }, { status: 404 });
  }

  // Check live stock (not the static outlet snapshot's quantity) before
  // creating a session at all - the whole point of the live inventory table
  // is that a sold-out item can't be checked out again.
  const sql = getDb();
  const [row] = await sql`
    SELECT quantity_remaining FROM outlet_inventory WHERE sku = ${sku}
  `;
  if (!row || row.quantity_remaining <= 0) {
    return NextResponse.json({ error: "Sold out" }, { status: 409 });
  }
  if (requestedQuantity > row.quantity_remaining) {
    return NextResponse.json(
      { error: `Only ${row.quantity_remaining} left in stock` },
      { status: 409 },
    );
  }

  const origin = new URL(req.url).origin;

  // Stripe's own adjustable_quantity.maximum hard-caps at 99 regardless of
  // how much stock we actually have.
  const maxQty = Math.max(1, Math.min(row.quantity_remaining, 99));

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: requestedQuantity,
        adjustable_quantity: { enabled: true, minimum: 1, maximum: maxQty },
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.priceEur * 100),
          product_data: {
            name: `${item.description} (Adcontact Outlet)`,
            metadata: { sku: item.sku },
          },
        },
      },
    ],
    // Individuals (not just businesses) must be able to buy - a GMC
    // eligibility requirement, see the outlet-checkout memory playbook -
    // Checkout collects the buyer's shipping address for physical fulfillment.
    shipping_address_collection: { allowed_countries: ["SE", "EE", "NO", "DK", "FI", "DE", "GB"] },
    shipping_options: SHIPPING_OPTIONS,
    // Requires the Terms of service URL to be set in the Stripe dashboard's
    // public details, otherwise session creation fails. Stripe records the
    // acceptance on the session (consent.terms_of_service).
    consent_collection: { terms_of_service: "required" },
    custom_text: {
      terms_of_service_acceptance: {
        message: `I agree to the [General Terms of Delivery](${origin}/policies/terms) and the [Return & Refund Policy](${origin}/policies/returns).`,
      },
      submit: {
        message: `Private individuals have a 14-day right of withdrawal. [How to withdraw](${origin}/policies/withdraw)`,
      },
    },
    metadata: { sku: item.sku, outletDescription: item.description },
    success_url: `${origin}/outlet/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/outlet/components`,
  });

  return NextResponse.json({ url: session.url });
}
