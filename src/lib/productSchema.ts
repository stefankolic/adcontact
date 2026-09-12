import { absoluteUrl } from "@/lib/seo";

/**
 * Shared JSON-LD builders for individual product detail pages. The brand *hub*
 * pages (e.g. /products/deutsch-connectors) already carry ItemList/Product/FAQ
 * schema; the per-part pages had none until 2026-09-11. These are the pages that
 * rank for part-number searches, so Product + BreadcrumbList markup here makes
 * them eligible for product rich results and keeps on-page data consistent with
 * the Google Merchant Center feed (Google cross-checks the two).
 */

type Crumb = { name: string; url: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : absoluteUrl(c.url),
    })),
  };
}

type ProductSchemaInput = {
  /** Display name / title for the part. */
  name: string;
  /** Manufacturer part number — used for both `sku` and `mpn`. */
  partNumber: string;
  brand: string;
  description: string;
  /** Absolute or site-relative image URL; omitted from the schema when absent. */
  image?: string | null;
  /** Canonical page path for this product. */
  url: string;
  /**
   * Plain-text category path, mirroring the Google Merchant Center feed's
   * `google_product_category` so the on-page structured data and the feed
   * agree on category as well as price (added 2026-09-12, after finding the
   * feed had been carrying an incorrect category id — see
   * [[seo-audit-fixes]]).
   */
  category?: string;
  /**
   * Only present for parts that have a real, visible price on the page (the
   * outlet items). Quote-only parts get Product schema with no `offers` — an
   * offer without a price is malformed, and there's no price to show anyway.
   */
  offer?: { priceEur: number };
};

export function productJsonLd(p: ProductSchemaInput) {
  const image = p.image
    ? p.image.startsWith("http")
      ? p.image
      : absoluteUrl(p.image)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.partNumber,
    mpn: p.partNumber,
    brand: { "@type": "Brand", name: p.brand },
    ...(p.category ? { category: p.category } : {}),
    ...(p.description ? { description: p.description } : {}),
    ...(image ? { image } : {}),
    ...(p.offer
      ? {
          offers: {
            "@type": "Offer",
            url: absoluteUrl(p.url),
            priceCurrency: "EUR",
            price: p.offer.priceEur.toFixed(2),
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "Adcontact AB" },
          },
        }
      : {}),
  };
}
