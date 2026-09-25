// Read-only: dumps the live outlet stock (sku -> quantity_remaining) to JSON for the feed build.
// Usage: node --env-file=.env.local scripts/outlet/dump-stock.mjs stock.json
import { neon } from "@neondatabase/serverless";
import { writeFileSync } from "node:fs";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run with --env-file=.env.local (vercel env pull first).");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT sku, quantity_remaining, updated_at FROM outlet_inventory ORDER BY sku`;
const stock = Object.fromEntries(rows.map((r) => [r.sku, r.quantity_remaining]));
writeFileSync(process.argv[2] ?? "stock.json", JSON.stringify(stock, null, 1));
console.log(`wrote ${rows.length} SKUs; latest update ${rows.reduce((m, r) => (r.updated_at > m ? r.updated_at : m), rows[0]?.updated_at)}`);
