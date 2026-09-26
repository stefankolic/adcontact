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
export type OutletOwnPage = {
  partNumber: string;
  image: string;
  /** True when the photo shows a similar variant, not this exact part; the
   *  page then labels it "Reference image". */
  reference?: boolean;
};

export const OUTLET_OWN_PAGES: Record<string, OutletOwnPage> = {
  "247002-2003": { partNumber: "IMC16-2003X", image: "/media/outlet-components/imc-16-2003x.jpg" },
  "247000-2002": { partNumber: "IMC11-2002X", image: "/media/outlet-components/imc-11-2002x.jpg" },
  "247002-6072": { partNumber: "IMC26-2007X", image: "/media/outlet-components/imc-26-2007x.jpg" },
  "247000-6052": { partNumber: "IMC21-2005X", image: "/media/outlet-components/imc-21-2005x.jpg" },
  "247001-2022": { partNumber: "IMC14-2002X", image: "/media/outlet-components/imc-14-2002x.jpg" },
  "244534-120": { partNumber: "8N1534-24-20P", image: "/media/outlet-components/8n1534-24-20p.jpg" },
  "242016-460": { partNumber: "DT16-6SB-KP01", image: "/media/outlet-components/dt-16-6sb-kp01.jpg" },
  "244130-01": { partNumber: "0428-204-1890", image: "/media/outlet-components/0428-204-1890.jpg" },
  // Reference image: the HDP24-18-14PE-L024 catalogue photo (same 14-way HDP24 family), padded to 640x640.
  "244026-0114": { partNumber: "HDP24-24-14PE", image: "/media/outlet-components/hdp24-24-14pe.jpg", reference: true },
  "246020-016": { partNumber: "WT06B-20-16SN", image: "/media/outlet-components/wt-06b-20-16-sn.jpg" },
  // Same photo as the 20-16; the part number suggests a larger shell with more cavities (24-31), so it is labelled a reference image.
  "246024-031": { partNumber: "WT06B-24-31SN", image: "/media/outlet-components/wt-06b-24-31-sn.jpg", reference: true },
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

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/** Writes a Deutsch-shaped part number the way Deutsch and our product pages
 *  do: no space after the initial letters (DRC 16-40 SE gives DRC16-40SE),
 *  letter and short-digit codes joined (P 02 gives P02), and three-digit or
 *  letter-plus-digit codes hyphenated (PN 059 gives PN-059, KP01 gives -KP01).
 *  Anything that is not Deutsch-shaped, or that carries an English note, is
 *  returned unchanged apart from collapsed spaces. Checked against the rows
 *  that have a known canonical number (2026-09-26). */
export function normalizePartNumber(raw: string): string {
  const d = raw.trim().replace(/\s+/g, " ");
  if (!/^[A-Z]{2,5} ?\d{1,2}[A-Z]?-/.test(d)) return d;
  const tokens = d.split(" ");
  let out = tokens[0];
  for (let i = 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (i === 1 && /^[A-Z]+$/.test(tokens[0]) && /^\d/.test(t)) out += t;
    else if (/^[A-Z]{1,2}$/.test(t)) out += t;
    else if (/^\d{1,2}$/.test(t)) out += t;
    else if (/^\d{3}$/.test(t)) out += (out.endsWith("-") ? "" : "-") + t;
    else if (/^[A-Z]+\d+[A-Z]*$/.test(t)) out += (out.endsWith("-") ? "" : "-") + t;
    else out += " " + t;
  }
  return out;
}

/** The canonical part number for an outlet row: the Deutsch-dataset number
 *  when matched, the catalogue's own number or our own-page number when the row
 *  has one, otherwise the normalized sheet text. */
export function outletPartNumber(item: OutletComponent): string {
  if (item.matchedPartNumber) return item.matchedPartNumber;
  return OUTLET_OWN_PAGES[item.sku]?.partNumber ?? OUTLET_CATALOGUE_PAGES[item.sku]?.partNumber ?? normalizePartNumber(item.description);
}

/** What the outlet shows for a row: the canonical part number followed by any
 *  note the sheet carried after it (Front Seal DT06-2S, Removal tool size 8). */
export function outletDisplayName(item: OutletComponent): string {
  const pn = outletPartNumber(item);
  const desc = item.description.trim().replace(/\s+/g, " ");
  for (let i = 1; i <= desc.length; i++) {
    if (alnum(desc.slice(0, i)) === alnum(pn)) return (pn + " " + desc.slice(i).trim()).trim();
  }
  return normalizePartNumber(desc);
}

/** Lower-case letters and digits only, one string per searchable field, so
 *  "DRC16-40SE", "drc 16 40 se" and "drc1640" all find the same row. */
export function outletSearchKeys(item: OutletComponent): string[] {
  return [alnum(item.sku), alnum(item.description), alnum(outletDisplayName(item))];
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
