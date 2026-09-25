// Writes the live outlet stock (sku -> quantity_remaining) to src/data/generated/outlet-stock.json.
// Runs before every build (see package.json) so a redeploy picks up the current stock, and by hand:
//   node --env-file=.env.local scripts/outlet/sync-stock.mjs
// Never fails a build: without DATABASE_URL, or if the query fails, the existing snapshot is kept.
import { neon } from "@neondatabase/serverless";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const file = join(process.cwd(), "src/data/generated/outlet-stock.json");

export async function syncStock() {
  if (!process.env.DATABASE_URL) {
    console.warn("[outlet-stock] DATABASE_URL not set, keeping the existing snapshot");
    return null;
  }
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT sku, quantity_remaining FROM outlet_inventory ORDER BY sku`;
    const stock = Object.fromEntries(rows.map((r) => [r.sku, r.quantity_remaining]));
    mkdirSync(join(process.cwd(), "src/data/generated"), { recursive: true });
    writeFileSync(file, JSON.stringify(stock, null, 1) + "\n");
    const soldOut = rows.filter((r) => r.quantity_remaining <= 0).map((r) => r.sku);
    console.log(`[outlet-stock] ${rows.length} SKUs, sold out: ${soldOut.length ? soldOut.join(", ") : "none"}`);
    return stock;
  } catch (err) {
    console.warn("[outlet-stock] could not read the database, keeping the existing snapshot:", err?.message ?? err);
    return null;
  }
}

if (!existsSync(file)) {
  mkdirSync(join(process.cwd(), "src/data/generated"), { recursive: true });
  writeFileSync(file, "{}\n");
}
if (process.argv[1]?.replace(/\\/g, "/").endsWith("/sync-stock.mjs")) {
  await syncStock();
}
