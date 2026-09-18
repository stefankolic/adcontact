import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { deutschOutletComponents } from "@/data/deutschOutlet";

/**
 * TEMPORARY, one-off setup route - remove once the outlet_inventory table is
 * confirmed seeded on whatever Neon branch this deployment is actually bound
 * to. Vercel's Neon integration creates a separate copy-on-write branch per
 * deployment, so a local `vercel env pull` doesn't reliably target the same
 * branch a given deployment runs against - running this INSIDE the deployment
 * guarantees it hits the right one. Idempotent, safe to call more than once.
 *
 * Gated by a shared token, not left open - this runs schema/seed writes
 * against the live database and must not be a public unauthenticated
 * endpoint once this ships to production.
 */
export async function POST(req: Request) {
  const token = req.headers.get("x-setup-token");
  if (!token || token !== process.env.OUTLET_SETUP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS outlet_inventory (
      sku TEXT PRIMARY KEY,
      quantity_remaining INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS outlet_orders (
      id SERIAL PRIMARY KEY,
      stripe_session_id TEXT UNIQUE NOT NULL,
      sku TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      amount_eur NUMERIC(10, 2) NOT NULL,
      customer_email TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  // outlet_orders may already exist from before this column was added -
  // the Neon branch behind this deployment turned out to persist across
  // git-push-triggered builds (only ad-hoc `vercel deploy` CLI runs get a
  // throwaway branch), so CREATE TABLE IF NOT EXISTS alone won't migrate it.
  await sql`ALTER TABLE outlet_orders ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1`;

  let seeded = 0;
  for (const item of deutschOutletComponents) {
    const result = await sql`
      INSERT INTO outlet_inventory (sku, quantity_remaining)
      VALUES (${item.sku}, ${item.quantity})
      ON CONFLICT (sku) DO NOTHING
      RETURNING sku
    `;
    if (result.length > 0) seeded++;
  }

  const [{ count }] = await sql`SELECT count(*) FROM outlet_inventory`;

  return NextResponse.json({
    ok: true,
    seededNew: seeded,
    totalRows: Number(count),
  });
}
