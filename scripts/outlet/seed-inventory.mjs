// One-off setup script for the outlet checkout's live inventory table.
// Creates the schema (if missing) and seeds outlet_inventory from the
// current deutsch-outlet.json snapshot - safe to re-run, uses
// ON CONFLICT DO NOTHING so it never resets a quantity that's already
// been decremented by a real sale.
//
// Usage:
//   DATABASE_URL=postgres://... node scripts/outlet/seed-inventory.mjs
//
// Reads DATABASE_URL from the environment - run with your local
// .env.local values loaded, e.g. via `vercel env pull` first, or export
// the variable manually before running.
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run `vercel env pull .env.local` first, then load it.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const outletPath = join(process.cwd(), "src/data/generated/deutsch-outlet.json");
const items = JSON.parse(readFileSync(outletPath, "utf8"));

async function main() {
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

  let seeded = 0;
  for (const item of items) {
    const result = await sql`
      INSERT INTO outlet_inventory (sku, quantity_remaining)
      VALUES (${item.sku}, ${item.quantity})
      ON CONFLICT (sku) DO NOTHING
      RETURNING sku
    `;
    if (result.length > 0) seeded++;
  }

  console.log(`Schema ready. Seeded ${seeded} new SKU(s) (of ${items.length} total in the outlet file).`);
  console.log("Existing rows were left untouched - re-running this is safe.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
