import generatedProducts from "./generated/deutsch-products.json";

export interface DeutschProduct {
  partNumber: string;
  series: string;
  ways: number | null;
  type: "Plug" | "Socket" | null;
  availability: "quote" | "lead-time";
  imageUrl: string | null;
  urlPath: string;
}

// Photo overrides for parts whose scraped imageUrl is a no_photo placeholder.
// Keyed by partNumber (uppercase) so a re-export of deutsch-products.json
// doesn't silently drop the fix — see PRODUCT_OVERRIDES in magentoCatalogue.ts
// for the equivalent mechanism on the main catalogue.
const DEUTSCH_IMAGE_OVERRIDES: Record<string, string> = {
  // 2026-09-10: was an 80x59 webp — swapped for a 550x550 photo Stefan
  // sourced (447px product content, white-padded to clear Google Merchant
  // Center's 500x500 minimum). The homepage featured-products strip still
  // uses the old small webp; that's a separate, lower-stakes context.
  "HDP24-24-18SE-L017": "/media/outlet-components/hdp24-24-18se-l017.jpg",
};

export const deutschProducts = (
  generatedProducts as unknown as DeutschProduct[]
).map((p) => {
  const override = DEUTSCH_IMAGE_OVERRIDES[p.partNumber.toUpperCase()];
  return override ? { ...p, imageUrl: override } : p;
});

export function getDeutschWebshopUrl(product: DeutschProduct): string {
  return `/webshop/${product.urlPath}`;
}

// Full display name for a series code — only some codes have a distinct
// marketing name (Deutsch's own naming, e.g. "HDP" = "Heavy Power"); every
// other code falls back to "<code> Series" rather than the bare code alone,
// matching the convention used everywhere else this series label appears
// (product page subtitle, GMC feed, search results).
export const SERIES_LABELS: Record<string, string> = {
  DT: "DT Series",
  DT13: "DT13 Flanged Series",
  DT15: "DT15 Flanged Series",
  DTF13: "DTF13 Flanged Series",
  DTF15: "DTF15 Flanged Series",
  DTM: "DTM Miniature Series",
  DTP: "DTP Power Series",
  HDP: "HDP Heavy Power Series",
  JS: "JS Series",
  SRK: "SRK Series",
  AT: "AT Series",
};

export function seriesLabelFor(series: string): string {
  return SERIES_LABELS[series] ?? `${series} Series`;
}

/**
 * The SEO title format shared by the product page H1, its JSON-LD `name`,
 * search-result snippets, and the Google Merchant Center feed (2026-09-12,
 * per Stefan's SEO review) — one shared builder so these can't drift apart
 * the way `catalogueProductLegacyRoute()`/`productHref()` did earlier this
 * project (see [[webshop-catalogue-patterns]]). Every Deutsch product has a
 * `series`; `type` is always "Plug" or "Socket" (never a non-connector
 * accessory), so "connector, for wire processing" is accurate for all 1,794
 * entries, not just the outlet-priced ones.
 */
export function deutschSeoTitle(product: DeutschProduct): string {
  const series = seriesLabelFor(product.series);
  const wayType = product.ways && product.type ? `, ${product.ways}-Way ${product.type}` : "";
  return `Deutsch ${product.partNumber}, ${series}${wayType}, connector, for wire processing`;
}

/** Convenience wrapper for callers that only have a part number string
 *  (e.g. the outlet table, matching against `matchedPartNumber`). */
export function deutschSeoTitleByPartNumber(partNumber: string): string | null {
  const product = deutschProducts.find(
    (p) => p.partNumber.toUpperCase() === partNumber.toUpperCase(),
  );
  return product ? deutschSeoTitle(product) : null;
}
