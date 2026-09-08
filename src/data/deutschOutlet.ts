import generatedItems from "./generated/deutsch-outlet.json";
import { productDetailHref } from "@/lib/productHref";
import { getUnifiedProduct } from "@/data/productLookup";

/**
 * Surplus Deutsch connector stock from Adcontact's own warehouse, sold at
 * outlet pricing while quantities last. Sourced from Stefan's outlet stock
 * export (260 lines, 2026-09) — a fixed batch, not derived from or kept in
 * sync with the regular catalogue. `sku` is Adcontact's own internal stock
 * code; `description` is the manufacturer part number/description as it
 * appears on the source sheet (format is inconsistent line to line — some
 * rows are a bare part number, some prepend or append a plain-English note).
 */
export type OutletComponent = {
  sku: string;
  description: string;
  quantity: number;
  priceEur: number;
  /** Manufacturer part number this line was matched to in our regular Deutsch
   *  catalogue, when the match is an exact one — used to link to that
   *  product's existing detail page for full specs/photos. Null when no
   *  confident match was found (still valid outlet stock, just no existing
   *  product page to point to). */
  matchedPartNumber: string | null;
};

export const deutschOutletComponents = generatedItems as OutletComponent[];

export function outletComponentHref(item: OutletComponent): string | null {
  return item.matchedPartNumber ? productDetailHref(item.matchedPartNumber) : null;
}

// Treat Magento's "no photo"/placeholder graphic as no image, same convention
// used everywhere else the catalogue renders a product photo (see cleanImage
// in /product/[sku]/page.tsx and magentoImageSrc in CatalogueProductBrowser).
function cleanImage(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/no_photo|placeholder/i.test(path)) return null;
  return path;
}

/** Thumbnail for this row, reusing whatever photo the linked catalogue
 *  product already has (about 58% of rows, as of the 2026-09 batch) — this
 *  is a fixed outlet snapshot, not a live product list, so no photo exists
 *  for rows with no `matchedPartNumber` or where the match's own photo is
 *  still the generic placeholder. Callers should fall back to the site's
 *  standard "No image available" treatment when this returns null. */
export function outletComponentImageSrc(item: OutletComponent): string | null {
  if (!item.matchedPartNumber) return null;
  const product = getUnifiedProduct(item.matchedPartNumber);
  return cleanImage(product?.image);
}
