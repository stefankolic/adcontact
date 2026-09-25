// Dumps every Merchant-Center-eligible outlet row (real page + real image) as JSON.
// Quantity is the live stock snapshot, so run scripts/outlet/sync-stock.mjs first.
// Run from the repo root: npx tsx scripts/outlet/dump-feed-data.ts <out.json>
import { writeFileSync } from "node:fs";
import {
  deutschOutletComponents,
  outletComponentHref,
  outletComponentImageSrc,
  OUTLET_OWN_PAGES,
} from "../../src/data/deutschOutlet";
import { OUTLET_CATALOGUE_PAGES } from "../../src/data/outletCatalogueLinks";
import { outletStock } from "../../src/data/outletStock";
import { deutschSeoTitleByPartNumber, REFERENCE_IMAGE_PARTS } from "../../src/data/deutschConnectors";
import { findCatalogueProductByReference, getProductBreadcrumbs } from "../../src/lib/magentoCatalogue";

const SITE = "https://www.adcontact.se";
const out = process.argv[2] ?? "outlet-feed-data.json";

const rows = deutschOutletComponents.flatMap((item) => {
  const href = outletComponentHref(item);
  const image = outletComponentImageSrc(item);
  if (!href || !image) return [];

  let kind: "deutsch" | "own" | "catalogue" = "deutsch";
  let partNumber = item.matchedPartNumber ?? item.description;
  let seoTitle: string | null = null;
  let categoryName: string | null = null;
  let catalogueName: string | null = null;
  let reference = false;

  if (item.matchedPartNumber) {
    seoTitle = deutschSeoTitleByPartNumber(item.matchedPartNumber);
    reference = REFERENCE_IMAGE_PARTS.has(item.matchedPartNumber.toUpperCase());
  } else if (OUTLET_OWN_PAGES[item.sku]) {
    kind = "own";
    partNumber = OUTLET_OWN_PAGES[item.sku].partNumber;
    reference = !!OUTLET_OWN_PAGES[item.sku].reference;
  } else if (OUTLET_CATALOGUE_PAGES[item.sku]) {
    kind = "catalogue";
    const found = findCatalogueProductByReference(item.description.replace(/\s+hand tool$/i, "").split(/\s+/)[0]) ??
      findCatalogueProductByReference(item.description.replace(/\s+hand tool$/i, "").trim());
    catalogueName = found?.name ?? null;
    categoryName = found ? (getProductBreadcrumbs(found).at(-1)?.name ?? null) : null;
    partNumber = found?.name ?? item.description;
  }

  return [{
    sku: item.sku,
    description: item.description,
    kind,
    partNumber,
    seoTitle,
    categoryName,
    catalogueName,
    reference,
    quantity: outletStock(item),
    priceEur: item.priceEur,
    link: SITE + href,
    imageLink: SITE + image.split("?")[0],
  }];
});

writeFileSync(out, JSON.stringify(rows, null, 1));
const byKind = rows.reduce<Record<string, number>>((a, r) => ((a[r.kind] = (a[r.kind] ?? 0) + 1), a), {});
console.log(`wrote ${rows.length} eligible rows to ${out}`, byKind);
