import liveStock from "./generated/outlet-stock.json";

// Live stock per outlet sku, written from the database before every build
// (scripts/outlet/sync-stock.mjs). Falls back to the static export quantity
// for a sku the snapshot does not know.
const stock = liveStock as Record<string, number>;

type Stocked = { sku: string; quantity: number };

export function outletStock(item: Stocked): number {
  return stock[item.sku] ?? item.quantity;
}

export function outletSoldOut(item: Stocked): boolean {
  return outletStock(item) <= 0;
}
