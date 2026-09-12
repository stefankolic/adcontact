import routesJson from "@/data/generated/magento-catalogue/routes.json";
import {
  getCatalogueCategory,
  getCatalogueProduct,
  PRODUCT_CANONICAL_ROUTES,
} from "@/lib/magentoCatalogue";
import { deutschProducts } from "@/data/deutschConnectors";
import { resources } from "@/data/resources";
import { brands } from "@/data/brands";
import { usedMachines } from "@/data/usedMachines";

/** Google's sitemap protocol caps a single file at 50,000 URLs. Stay comfortably
 *  under that so future catalogue growth doesn't silently overflow a chunk. */
export const SITEMAP_CHUNK_SIZE = 45000;

type Route = { type: "product" | "category"; id: number };
const routes = routesJson as unknown as Record<string, Route>;

export type SitemapEntry = {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "monthly";
  /** ISO date the page's content last meaningfully changed, when known. */
  lastModified?: string;
};

/**
 * Marks the date a whole section of the site last had a meaningful content
 * change, so the sitemap can tell Google "look at these again" instead of
 * waiting for its own recrawl schedule. Deliberately NOT derived from build
 * time — this project deploys many times a day for unrelated fixes, and
 * Google explicitly down-weights a sitemap that claims every page changed on
 * every fetch (see the "force-static" comment in sitemap.ts for the related
 * lesson about Google's crawler being picky about this feed specifically).
 *
 * Update this list when you ship a change broad/important enough that you
 * want Google to notice sooner rather than later (add a new entry, or bump
 * an existing date) — don't touch entries whose pages didn't actually
 * change. `prefix` matches any sitemap path starting with it.
 */
const LASTMOD_OVERRIDES: { prefix: string; date: string }[] = [
  // 2026-09-12: all 1,794 Deutsch connector pages got a new SEO-optimised
  // H1/JSON-LD (title format matching the GMC feed, corrected category) -
  // see [[seo-audit-fixes]].
  { prefix: "/products/deutsch-connectors/", date: "2026-09-12" },
];

function lastModifiedFor(path: string): string | undefined {
  return LASTMOD_OVERRIDES.find((o) => path.startsWith(o.prefix))?.date;
}

// Deutsch products get a richer dedicated page — the webshop [...path] route
// permanently redirects to it (see src/app/webshop/[...path]/page.tsx). Listing
// the redirecting URL in the sitemap would waste crawl budget on a 308, so we
// resolve straight to the destination instead. Root-level legacy bare-slug
// routes for the same product do NOT redirect (see [...legacyPath]/page.tsx),
// so those are left as real, distinct pages.
function deutschRedirectTarget(sku: string | null, name: string | null): string | null {
  const s = (sku ?? "").toUpperCase();
  const n = (name ?? "").toUpperCase();
  const match = deutschProducts.find(
    (d) => d.partNumber.toUpperCase() === s || d.partNumber.toUpperCase() === n,
  );
  return match ? `/products/deutsch-connectors/${match.partNumber.toLowerCase()}` : null;
}

// Hand-curated static/marketing routes. Pages that self-declare a canonical
// pointing elsewhere (storefront-product, webshop-brand, featured-product) are
// deliberately excluded — Google's own guidance is to list only the canonical
// URL in a sitemap, never a page that canonicalizes away from itself.
const STATIC_PATHS: SitemapEntry[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/webshop.html", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact/quote", priority: 0.6, changeFrequency: "monthly" },
  { path: "/quality", priority: 0.5, changeFrequency: "monthly" },
  { path: "/resources", priority: 0.6, changeFrequency: "weekly" },
  { path: "/brands", priority: 0.6, changeFrequency: "weekly" },
  { path: "/policies", priority: 0.3, changeFrequency: "monthly" },
  { path: "/policies/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/policies/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/policies/shipping", priority: 0.3, changeFrequency: "monthly" },
  { path: "/policies/returns", priority: 0.3, changeFrequency: "monthly" },
  { path: "/policies/cookies", priority: 0.3, changeFrequency: "monthly" },
  { path: "/products/stocko", priority: 0.8, changeFrequency: "weekly" },
  { path: "/products/htp", priority: 0.8, changeFrequency: "weekly" },
  { path: "/products/deutsch-connectors", priority: 0.8, changeFrequency: "weekly" },
  { path: "/products/te-connectivity", priority: 0.8, changeFrequency: "weekly" },
  { path: "/products/zoller-frohlich", priority: 0.8, changeFrequency: "weekly" },
  { path: "/outlet", priority: 0.7, changeFrequency: "weekly" },
  { path: "/outlet/components", priority: 0.7, changeFrequency: "weekly" },
  { path: "/outlet/used-machines", priority: 0.7, changeFrequency: "weekly" },
];

let cached: SitemapEntry[] | null = null;

/** Builds the full, deduplicated set of canonical URLs the site should expose
 *  to search engines, computed once per server process and cached — the
 *  underlying JSON is large (products.json alone is ~33MB) so this must not
 *  be recomputed per sitemap chunk request.
 *
 *  Deliberately goes through getCatalogueCategory()/getCatalogueProduct()
 *  rather than reading the generated JSON directly, so it automatically stays
 *  in sync with HIDDEN_CATEGORY_IDS, HIDDEN_PRODUCT_IDS, PRODUCT_OVERRIDES and
 *  CATEGORY_CANONICAL_ROUTES (all applied inside those accessors) without
 *  duplicating that logic here. */
export function getAllSitemapEntries(): SitemapEntry[] {
  if (cached) return cached;

  const byPath = new Map<string, SitemapEntry>();
  const add = (entry: SitemapEntry) => {
    if (!byPath.has(entry.path)) byPath.set(entry.path, entry);
  };

  for (const entry of STATIC_PATHS) add(entry);
  for (const r of resources) add({ path: `/resources/${r.slug}`, priority: 0.5, changeFrequency: "monthly" });
  for (const b of brands) add({ path: `/brands/${b.slug}`, priority: 0.5, changeFrequency: "monthly" });
  for (const m of usedMachines) {
    add({ path: `/outlet/used-machines/${m.slug}`, priority: 0.5, changeFrequency: "weekly" });
  }

  for (const [path, route] of Object.entries(routes)) {
    if (route.type === "category") {
      // getCatalogueCategory() returns undefined for HIDDEN_CATEGORY_IDS, and
      // rewrites .route to the CATEGORY_CANONICAL_ROUTES target when the
      // category was renamed — so every legacy path variant for a renamed
      // category collapses onto its one canonical URL here.
      const category = getCatalogueCategory(route.id);
      if (category?.route) add({ path: category.route, priority: 0.7, changeFrequency: "weekly" });
      continue;
    }

    // getCatalogueProduct() returns undefined for disabled products,
    // HIDDEN_PRODUCT_IDS, and products living only in a hidden category tree.
    const product = getCatalogueProduct(route.id);
    if (!product) continue;

    // A handful of products were given a single canonical URL (renamed brand
    // path, deduped duplicate slug) — the product page 301-redirects every
    // other route to it, so list only the canonical one.
    const canonicalRoute = PRODUCT_CANONICAL_ROUTES[route.id];
    if (canonicalRoute) {
      add({ path: canonicalRoute, priority: 0.5, changeFrequency: "monthly" });
      continue;
    }

    if (path.startsWith("/webshop/")) {
      const redirectTarget = deutschRedirectTarget(product.sku, product.name);
      if (redirectTarget) {
        add({ path: redirectTarget, priority: 0.5, changeFrequency: "monthly" });
        continue;
      }
    }
    add({ path, priority: 0.5, changeFrequency: "monthly" });
  }

  cached = [...byPath.values()]
    .map((entry) => {
      const lastModified = lastModifiedFor(entry.path);
      return lastModified ? { ...entry, lastModified } : entry;
    })
    .sort((a, b) => a.path.localeCompare(b.path));
  return cached;
}

export function getSitemapChunkCount(): number {
  return Math.max(1, Math.ceil(getAllSitemapEntries().length / SITEMAP_CHUNK_SIZE));
}
