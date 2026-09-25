import generatedItems from "./generated/deutsch-outlet.json";
import { getUnifiedProduct } from "@/data/productLookup";
import { OUTLET_CATALOGUE_PAGES } from "@/data/outletCatalogueLinks";

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

/** Outlet rows with no catalogue product get their own page at
 *  `/outlet/components/[slug]`, but only once a real photo exists for them:
 *  a row is added here in the same change that uploads its photo, so "has an
 *  entry" always means "has a real image AND a real page" (the Merchant
 *  Center feed and checkout eligibility rule). Keyed by the row's outlet
 *  `sku`. `partNumber` is the clean manufacturer part number shown on the
 *  page (the sheet's own `description` is inconsistent), `image` is the
 *  `/media/...` path of the photo in R2. */
export type OutletOwnPage = { partNumber: string; image: string };

export const OUTLET_OWN_PAGES: Record<string, OutletOwnPage> = {
  "247002-2003": { partNumber: "IMC 16-2003X", image: "/media/outlet-components/imc-16-2003x.jpg" },
  "247000-2002": { partNumber: "IMC 11-2002X", image: "/media/outlet-components/imc-11-2002x.jpg" },
  "247002-6072": { partNumber: "IMC 26-2007X", image: "/media/outlet-components/imc-26-2007x.jpg" },
  "247000-6052": { partNumber: "IMC 21-2005X", image: "/media/outlet-components/imc-21-2005x.jpg" },
  "247001-2022": { partNumber: "IMC 14-2002X", image: "/media/outlet-components/imc-14-2002x.jpg" },
  "244534-120": { partNumber: "8N1534-24-20P", image: "/media/outlet-components/8n1534-24-20p.jpg" },
};

for (const sku of Object.keys(OUTLET_OWN_PAGES)) {
  if (OUTLET_CATALOGUE_PAGES[sku]) {
    throw new Error(`Outlet row ${sku} has both an own page and a catalogue page; use the existing catalogue page`);
  }
}

export function outletSlug(partNumber: string): string {
  return partNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const slugOwners = new Map<string, string>();
for (const [sku, page] of Object.entries(OUTLET_OWN_PAGES)) {
  const slug = outletSlug(page.partNumber);
  const clash = slugOwners.get(slug);
  if (clash) throw new Error(`Outlet page slug "${slug}" is used by both ${clash} and ${sku}`);
  slugOwners.set(slug, sku);
}

/** The outlet row whose part is the given Magento catalogue product, if any. */
export function outletItemForCatalogueProduct(productId: number | string): OutletComponent | undefined {
  const id = Number(productId);
  const sku = Object.keys(OUTLET_CATALOGUE_PAGES).find((k) => OUTLET_CATALOGUE_PAGES[k].productId === id);
  return sku ? deutschOutletComponents.find((item) => item.sku === sku) : undefined;
}

/** The own-page entry for an unmatched outlet row, or null. */
export function outletOwnPage(item: OutletComponent): OutletOwnPage | null {
  return item.matchedPartNumber ? null : (OUTLET_OWN_PAGES[item.sku] ?? null);
}

export function outletItemBySlug(slug: string): OutletComponent | undefined {
  return deutschOutletComponents.find((item) => {
    const page = outletOwnPage(item);
    return page !== null && outletSlug(page.partNumber) === slug;
  });
}

/** Links to the richer, dedicated Deutsch product page (full technical specs,
 *  compatible contacts/mating connectors/accessories, CAD files) rather than
 *  the generic cross-brand `/product/[sku]` page — outlet is Deutsch-only
 *  today, and every `deutschProducts` entry has a page at this exact slug
 *  (see `generateStaticParams` in that route), so no extra lookup is needed.
 *  Found 2026-09-09: outlet rows were linking to the thin generic page while
 *  a richer canonical one already existed for the same part. Rows with no
 *  catalogue product link to their own outlet page once they have one. */
export function outletComponentHref(item: OutletComponent): string | null {
  if (item.matchedPartNumber) {
    return `/products/deutsch-connectors/${item.matchedPartNumber.toLowerCase()}`;
  }
  const own = outletOwnPage(item);
  if (own) return `/outlet/components/${outletSlug(own.partNumber)}`;
  return OUTLET_CATALOGUE_PAGES[item.sku]?.route ?? null;
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
 *  for rows with no `matchedPartNumber` (unless they have an `OUTLET_OWN_PAGES`
 *  entry) or where the match's own photo is still the generic placeholder.
 *  Callers should fall back to the site's standard "No image available"
 *  treatment when this returns null. */
export function outletComponentImageSrc(item: OutletComponent): string | null {
  if (!item.matchedPartNumber) {
    return outletOwnPage(item)?.image ?? OUTLET_CATALOGUE_PAGES[item.sku]?.image ?? null;
  }
  const product = getUnifiedProduct(item.matchedPartNumber);
  return cleanImage(product?.image);
}
