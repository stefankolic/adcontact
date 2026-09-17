import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";
import { deutschOutletComponents } from "@/data/deutschOutlet";
import { PILOT_CHECKOUT_SKUS } from "@/data/outletCheckoutPilot";

/**
 * Creates a Stripe Checkout Session for one outlet line item and returns the
 * hosted checkout URL to redirect to. Pilot-only: only SKUs in
 * PILOT_CHECKOUT_SKUS are allowed through, even if a request is crafted by
 * hand for a non-pilot SKU - defense in depth, not just a UI-level gate.
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

  if (!PILOT_CHECKOUT_SKUS.has(sku)) {
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
    shipping_address_collection: { allowed_countries: ["SE", "EE", "NO", "DK", "FI", "DE"] },
    metadata: { sku: item.sku, outletDescription: item.description },
    success_url: `${origin}/outlet/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/outlet/components`,
  });

  return NextResponse.json({ url: session.url });
}
