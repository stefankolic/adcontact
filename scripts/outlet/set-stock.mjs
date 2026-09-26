// Sets the live stock of one outlet SKU and refreshes the local snapshot.
// Use it when parts leave stock outside the webshop (ERP, direct sales) or when stock is corrected.
//   node --env-file=.env.local scripts/outlet/set-stock.mjs <sku> <quantity>   (0 = sold out)
// Webshop sales already decrement stock through the Stripe webhook; this is only for the rest.
import { neon } from "@neondatabase/serverless";
import { syncStock } from "./sync-stock.mjs";

const [sku, qtyArg] = process.argv.slice(2);
const quantity = Number(qtyArg);
if (!sku || !Number.isInteger(quantity) || quantity < 0) {
  console.error("Usage: node --env-file=.env.local scripts/outlet/set-stock.mjs <sku> <quantity>");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Run with --env-file=.env.local (vercel env pull first).");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);
const [before] = await sql`SELECT quantity_remaining FROM outlet_inventory WHERE sku = ${sku}`;
if (!before) {
  console.error(`Unknown SKU ${sku}: not in outlet_inventory`);
  process.exit(1);
}
await sql`UPDATE outlet_inventory SET quantity_remaining = ${quantity}, updated_at = now() WHERE sku = ${sku}`;
console.log(`${sku}: ${before.quantity_remaining} -> ${quantity}`);
await syncStock();
console.log("Next: redeploy so the pages follow (Vercel > Deployments > Redeploy), then rebuild the Merchant feed.");
