import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb } from "@/lib/db";

/**
 * Stripe calls this after a checkout event. Only checkout.session.completed
 * is handled - that's the one that means "money has actually been taken".
 *
 * Idempotent by construction: outlet_orders.stripe_session_id is UNIQUE, so
 * a retried delivery of the same event (Stripe's own docs warn ordering and
 * delivery aren't guaranteed-once) simply fails to insert a second row and
 * we skip the inventory decrement - never double-charge stock for one sale.
 */
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const sku = session.metadata?.sku;
  const description = session.metadata?.outletDescription ?? null;

  if (!sku) {
    console.error("checkout.session.completed with no sku in metadata:", session.id);
    return NextResponse.json({ received: true });
  }

  // The session's own line item carries the actual quantity the buyer chose
  // via adjustable_quantity - it's not on session.metadata, which is fixed
  // at session-creation time.
  const lineItems = await getStripe().checkout.sessions.listLineItems(session.id, { limit: 1 });
  const quantity = lineItems.data[0]?.quantity ?? 1;

  const sql = getDb();

  const inserted = await sql`
    INSERT INTO outlet_orders (stripe_session_id, sku, description, quantity, amount_eur, customer_email)
    VALUES (
      ${session.id},
      ${sku},
      ${description},
      ${quantity},
      ${session.amount_total != null ? session.amount_total / 100 : 0},
      ${session.customer_details?.email ?? null}
    )
    ON CONFLICT (stripe_session_id) DO NOTHING
    RETURNING id
  `;

  if (inserted.length === 0) {
    // Already processed this exact session - a Stripe retry, not a new sale.
    return NextResponse.json({ received: true, alreadyProcessed: true });
  }

  const decremented = await sql`
    UPDATE outlet_inventory
    SET quantity_remaining = quantity_remaining - ${quantity}, updated_at = now()
    WHERE sku = ${sku} AND quantity_remaining >= ${quantity}
    RETURNING quantity_remaining
  `;

  if (decremented.length === 0) {
    // Sold out or unknown SKU at decrement time - the order is still
    // correctly recorded above; this needs a human to look at stock levels,
    // not a silent failure.
    console.error(`Outlet oversold or unknown SKU on decrement: ${sku} (session ${session.id})`);
  }

  return NextResponse.json({ received: true });
}
