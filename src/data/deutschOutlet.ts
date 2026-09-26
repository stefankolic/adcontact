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
/** What we know about an own-page part, for the SEO title, description and the
 *  Technical specifications table. Only facts that are known go in: a missing
 *  field is left out of the page rather than guessed. `type` follows the
 *  Deutsch letter in the part number (S = Socket, P = Plug), the same
 *  convention the existing product titles use. `basis` is for our own review
 *  sheet only and is never shown on the site. */
export type OutletOwnSeo = {
  series?: string;
  ways?: number;
  type?: "Plug" | "Socket";
  shellSize?: string;
  /** For parts that are not connectors: what it is (for example "Adaptor") and the series it fits. */
  kind?: string;
  fitsSeries?: string;
  basis?: string;
};

export type OutletOwnPage = {
  partNumber: string;
  image: string;
  seo?: OutletOwnSeo;
  /** True when the photo shows a similar variant, not this exact part; the
   *  page then labels it "Reference image". */
  reference?: boolean;
};

export const OUTLET_OWN_PAGES: Record<string, OutletOwnPage> = {
  "247002-2003": { partNumber: "IMC16-2003X", image: "/media/outlet-components/imc-16-2003x.jpg", seo: { series: "IMC Series", ways: 3, shellSize: "16", basis: "3 contacts and IMC Series confirmed by RS and Mouser listings; shell size from the part number" } },
  "247000-2002": { partNumber: "IMC11-2002X", image: "/media/outlet-components/imc-11-2002x.jpg", seo: { series: "IMC Series", ways: 2, shellSize: "11", basis: "Contact count and shell size from the part number (IMC16-2003X pattern), photo shows the same count" } },
  "247002-6072": { partNumber: "IMC26-2007X", image: "/media/outlet-components/imc-26-2007x.jpg", seo: { series: "IMC Series", ways: 7, shellSize: "26", basis: "Contact count and shell size from the part number (IMC16-2003X pattern), photo shows 7 cavities" } },
  "247000-6052": { partNumber: "IMC21-2005X", image: "/media/outlet-components/imc-21-2005x.jpg", seo: { series: "IMC Series", ways: 5, shellSize: "21", basis: "Contact count and shell size from the part number (IMC16-2003X pattern), photo shows 5 cavities" } },
  "247001-2022": { partNumber: "IMC14-2002X", image: "/media/outlet-components/imc-14-2002x.jpg", seo: { series: "IMC Series", ways: 2, shellSize: "14", basis: "Contact count and shell size from the part number (IMC16-2003X pattern), photo shows 2 cavities" } },
  "244534-120": { partNumber: "8N1534-24-20P", image: "/media/outlet-components/8n1534-24-20p.jpg", seo: { ways: 20, type: "Plug", shellSize: "24", basis: "Arrangement 24-20P read as shell 24, 20 contacts, pins; supplier listings conflict, please confirm" } },
  "242016-460": { partNumber: "DT16-6SB-KP01", image: "/media/outlet-components/dt-16-6sb-kp01.jpg", seo: { series: "DT Series", ways: 6, type: "Socket", basis: "Confirmed by TE, TME and DigiKey listings and our DT16-6S-KP01 (6-way, DT Series, size 16 contacts)" } },
  "244130-01": { partNumber: "0428-204-1890", image: "/media/outlet-components/0428-204-1890.jpg", seo: { kind: "Adaptor", fitsSeries: "HD30 Series", shellSize: "18", basis: "Same family as 0428-204-2490 (Mouser: Adaptor for HD30 Series Size 24); size 18 read from the part number, please confirm" } },
  // 2026-09-26: new outlet row added by Stefan, photo and Mouser description supplied.
  "244131-01": { partNumber: "0428-204-2490", image: "/media/outlet-components/0428-204-2490.jpg", seo: { kind: "Adaptor", fitsSeries: "HD30 Series", shellSize: "24", basis: "Description from the Mouser listing supplied by Stefan: Deutsch 0428-204-2490 Adaptor for HD30 Series Size 24" } },
  // Reference image: the HDP24-18-14PE-L024 catalogue photo (same 14-way HDP24 family), padded to 640x640.
  "244026-0114": { partNumber: "HDP24-24-14PE", image: "/media/outlet-components/hdp24-24-14pe.jpg", seo: { series: "HDP Heavy Power Series", ways: 14, type: "Plug", shellSize: "24", basis: "14 contacts from the part number; sibling HDP24-18-14PE is HDP20 Series with 14 cavities in our data; series label matches the other HDP titles" }, reference: true },
  "246020-016": { partNumber: "WT06B-20-16SN", image: "/media/outlet-components/wt-06b-20-16-sn.jpg", seo: { ways: 16, type: "Socket", shellSize: "20", basis: "16 contacts and shell 20 from the part number, S read as socket; series unknown; one listing calls it a plug, please confirm" } },
  "246024-031": { partNumber: "WT06B-24-31SN", image: "/media/outlet-components/wt06b-24-31sn.jpg", seo: { ways: 31, type: "Socket", shellSize: "24", basis: "Photo of the actual part: the ring is marked WT06B-24-31SN and the insert has 31 cavities; S read as socket; series unknown, please confirm" } },
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
