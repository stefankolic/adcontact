"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight, Package, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PartnerSearchContext, PartnerFilterContext } from "@/lib/partnerSearchContext";
import type {
  CatalogueProduct,
  CatalogueSearchParams,
} from "@/lib/magentoCatalogue";

const DEFAULT_PAGE_SIZE = 25;
const PAGE_SIZE_OPTIONS = [25, 50, 100];
const HIDDEN_FILTER_ATTRIBUTES = new Set([
  "Apply MAP",
  "Availability",
  "Display Actual Price",
  "Enable Recurring Profile",
  "Finishing Ni",
  "Purchase currency",
  // Image metadata — never a real product filter.
  "Image Label",
  "Small Image Label",
  "Thumbnail Label",
  // Redundant with the subcategory "Category" filter, whose brand chips link to
  // the brand hubs; the raw attribute also still reads "Stocko" (now Wezag).
  "Crimping equipment Brands",
  // Same pattern for the stripping-machine hub / Feintechnik Rittmeyer leaf —
  // shown as the locked "Brand" pre-filter on the brand page, hidden on the hub.
  "Stripping machine Brands",
  // Cutting-machine hub / Ulmer leaf — same locked "Brand" pre-filter pattern.
  "Cutting machine Brands",
]);

function firstParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(firstParamValue(value) ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function productDisplaySku(product: CatalogueProduct) {
  return product.sku ?? product.name ?? `Product ${product.id}`;
}

function filterParamFor(label: string) {
  return `f_${label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}

// Prettier display names for a few raw Magento attribute names used as facet
// titles. The param/matching still use the original label — only the label
// shown to the user changes.
const FACET_LABEL_OVERRIDES: Record<string, string> = {
  "Miscellaneous Products": "Branson products",
  // On a brand page this facet is the (hidden-but-active) pre-filter; show a
  // clean "Brand" heading instead of the raw Magento attribute name.
  "Crimping equipment Brands": "Brand",
  "Stripping machine Brands": "Brand",
  "Cutting machine Brands": "Brand",
};
function facetDisplayLabel(label: string): string {
  return FACET_LABEL_OVERRIDES[label] ?? label;
}

function searchableText(product: CatalogueProduct) {
  return [
    product.name,
    product.sku,
    product.brand,
    product.manufacturer,
    product.shortDescription,
    product.route,
    ...product.routes,
    ...Object.keys(product.attributes),
    ...Object.values(product.attributes),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function normalizedSearchText(product: CatalogueProduct) {
  return searchableText(product).replace(/[^a-z0-9]+/g, "");
}

function normalizedQuery(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function productSearchScore(product: CatalogueProduct, query: string) {
  const q = query.toLowerCase().trim();
  const nq = normalizedQuery(query);
  if (!q && !nq) return 0;

  const name = product.name.toLowerCase();
  const sku = (product.sku ?? "").toLowerCase();
  const partNumber = (product.attributes["Part Number"] ?? "").toLowerCase();
  const routeText = [product.route, ...product.routes].join(" ").toLowerCase();
  const haystack = searchableText(product);
  const normalizedHaystack = normalizedSearchText(product);
  let score = 0;

  for (const value of [sku, name, partNumber]) {
    const normalizedValue = normalizedQuery(value);
    if (value === q || normalizedValue === nq) score += 1000;
    else if (value.startsWith(q) || normalizedValue.startsWith(nq)) score += 650;
    else if (value.includes(q) || normalizedValue.includes(nq)) score += 420;
  }

  if (routeText.includes(q) || (nq && normalizedQuery(routeText).includes(nq))) score += 260;
  if (haystack.includes(q) || (nq && normalizedHaystack.includes(nq))) score += 80;

  return score;
}

function activeFiltersFromSearchParams(searchParams: CatalogueSearchParams) {
  const filters: Record<string, string> = {};
  for (const [key, rawValue] of Object.entries(searchParams)) {
    const value = firstParamValue(rawValue);
    if (key.startsWith("f_") && value) filters[key] = value;
  }
  return filters;
}

// Some Magento attributes hold things that are not clean categorical values and
// so must never become a filter facet:
//  - embedded HTML / download links (Catalog-page, Product Drawings,
//    Specification, Test Report);
//  - legend descriptions keyed with "=" (Plating Code: "1= Tin Over Nickel
//    Plated 2= Gold Flash Plated over 50μ" Nickel …").
// A genuine filter value ("Gold", "M12", "2.5 mm") never contains "=" or a tag.
function isFacetableValue(value: string): boolean {
  if (/<[a-z!/]/i.test(value)) return false;
  if (value.includes("=")) return false;
  return true;
}

// Attribute values can be comma-separated lists (e.g. Series: "DT Series, DTM
// Series"), so treat each value as a set of tokens for both faceting and matching.
function attributeTokens(value: string): string[] {
  return value
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);
}

function productMatchesFilter(
  product: CatalogueProduct,
  param: string,
  value: string,
) {
  return Object.entries(product.attributes).some(([label, attributeValue]) => {
    if (filterParamFor(label) !== param || !attributeValue) return false;
    return attributeValue === value || attributeTokens(attributeValue).includes(value);
  });
}

function productMatchesFilters(
  product: CatalogueProduct,
  activeFilters: Record<string, string>,
  exceptParam?: string,
) {
  return Object.entries(activeFilters).every(
    ([param, value]) => param === exceptParam || productMatchesFilter(product, param, value),
  );
}

// Narrowing faceted search: each facet's counts reflect the products that match
// the search plus every OTHER active filter, so options never lead to a dead
// end and the active value always stays visible and selectable.
function buildFacets(products: CatalogueProduct[], activeFilters: Record<string, string>) {
  // Universe of candidate attributes (distinct token counts gate which qualify).
  const universe = new Map<string, Map<string, number>>();
  for (const product of products) {
    for (const [label, value] of Object.entries(product.attributes)) {
      if (!value || value.length > 80) continue;
      // Hidden attributes stay hidden UNLESS they're the active filter. A
      // leaf-of-flat-hub page (e.g. the Wezag brand page) pre-filters on
      // "Crimping equipment Brands", so that facet must stay visible and
      // clearable there — even though it's hidden as a redundant facet on the
      // parent crimping hub, where it's never active.
      if (HIDDEN_FILTER_ATTRIBUTES.has(label) && !activeFilters[filterParamFor(label)]) continue;
      if (!isFacetableValue(value)) continue;
      if (!universe.has(label)) universe.set(label, new Map());
      const counts = universe.get(label)!;
      for (const token of attributeTokens(value)) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }
    }
  }

  return [...universe.entries()]
    .filter(([, tokens]) => tokens.size > 1 && tokens.size <= 35 && [...tokens.values()].some((c) => c < products.length))
    .map(([label, baseTokens]) => {
      const param = filterParamFor(label);
      const activeValue = activeFilters[param];

      // Count this dimension over products matching all OTHER active filters.
      const narrowed = products.filter((product) =>
        productMatchesFilters(product, activeFilters, param),
      );
      const counts = new Map<string, number>();
      for (const product of narrowed) {
        const value = product.attributes[label];
        if (!value || !isFacetableValue(value)) continue;
        for (const token of attributeTokens(value)) {
          counts.set(token, (counts.get(token) ?? 0) + 1);
        }
      }

      let values = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 10)
        .map(([value, count]) => ({ value, count, active: value === activeValue }));

      // Always surface the active value even if it falls outside the top 10.
      if (activeValue && !values.some((item) => item.value === activeValue)) {
        values = [
          { value: activeValue, count: counts.get(activeValue) ?? 0, active: true },
          ...values,
        ].slice(0, 10);
      }

      // A hidden-but-active facet is shown only because it IS the current filter
      // (e.g. a brand page pre-filtered on "Crimping equipment Brands"). Surface
      // just the active value as a clearable chip — not the sibling brands
      // borrowed from the parent hub pool.
      if (HIDDEN_FILTER_ATTRIBUTES.has(label) && activeValue) {
        values = values.filter((item) => item.value === activeValue);
      }

      const totalProducts = [...baseTokens.values()].reduce((sum, n) => sum + n, 0);
      return { label, param, values, totalProducts };
    })
    .filter((facet) => facet.values.length > 1 || Boolean(activeFilters[facet.param]))
    .sort((a, b) => {
      const PRIORITY: Record<string, number> = { Series: 0, Brand: 1, "Wire Size": 2 };
      const pa = PRIORITY[a.label] ?? 99;
      const pb = PRIORITY[b.label] ?? 99;
      if (pa !== pb) return pa - pb;
      return b.totalProducts - a.totalProducts || a.label.localeCompare(b.label);
    })
    .slice(0, 7);
}

function magentoImageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  // Magento's "no photo" placeholder → treat as no image so the clean
  // "No image available" fallback shows instead of the dated graphic.
  if (/no_photo|placeholder/i.test(path)) return null;
  // Serve via our /media proxy (handles uppercase/lowercase dir variants and
  // fetches from ORDERLAND_MEDIA_ORIGIN) rather than hardcoding adcontact.se,
  // which 404s on uppercase subdirectories like /D/T/.
  if (path.startsWith("/")) return path;
  return path;
}

// Duplicated from src/lib/magentoCatalogue.ts (hasDuplicateSegment /
// preferCleanestRoute) instead of imported: that module does a top-level
// `import productsJson from ".../products.json"` (22,308 products), so any
// value import from it — even one small pure function — would pull the
// entire catalogue JSON into this "use client" component's bundle. Keep
// these two in sync if the selection rule ever changes.
function hasDuplicateSegment(route: string): boolean {
  const segments = route.split("/").filter(Boolean);
  segments.pop();
  const seen = new Set<string>();
  for (const segment of segments) {
    const normalized = segment.endsWith("s") ? segment.slice(0, -1) : segment;
    if (seen.has(normalized)) return true;
    seen.add(normalized);
  }
  return false;
}

function preferCleanestRoute(routes: string[]): string {
  const clean = routes.filter((route) => !hasDuplicateSegment(route));
  const pool = clean.length > 0 ? clean : routes;
  return pool.reduce((longest, route) => (route.length > longest.length ? route : longest));
}

// Found 2026-09-11: this used to pick the FIRST route matching the current
// category's base path (`.find()`, arbitrary array order) while the rest of
// the site's link convention (catalogueProductLegacyRoute) preferred the
// LONGEST clean one — two independent "which of a product's several valid
// URLs do we show" implementations that could each land on a different
// answer for the same product. Stefan caught it comparing HTP's
// FHN0-C0A5-C0A5 link from the homepage featured strip against its link from
// clicking through webshop.html's own grid. Now applies the same
// preferCleanestRoute selection here, scoped to whichever routes match the
// current category context (falls back to the full webshop-route pool via
// catalogueProductLegacyRoute's own rule when there's no category context or
// no match) so both surfaces agree.
function productHref(product: CatalogueProduct, categoryRoute: string | null) {
  if (categoryRoute) {
    const basePath = categoryRoute.replace(/\.html$/, "/");
    const categoryProductRoutes = product.routes.filter((route) => route.startsWith(basePath));
    if (categoryProductRoutes.length > 0) {
      return preferCleanestRoute(categoryProductRoutes);
    }
  }

  const webshopRoutes = product.routes.filter((route) => route.startsWith("/webshop/"));
  if (webshopRoutes.length > 0) {
    return preferCleanestRoute(webshopRoutes);
  }
  return product.route ?? product.routes[0] ?? "#";
}


function ProductCard({
  product,
  categoryRoute,
  deutschImageMap,
  compact = false,
}: {
  product: CatalogueProduct;
  categoryRoute: string | null;
  deutschImageMap?: Record<string, string>;
  compact?: boolean;
}) {
  const imageUrl =
    deutschImageMap?.[String(product.id)] ??
    magentoImageSrc(product.thumbnail ?? product.image) ??
    null;

  if (compact) {
    return (
      <Link
        href={productHref(product, categoryRoute)}
        className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#e5e7eb] bg-white transition-all duration-200 hover:border-[#93c5fd] hover:shadow-[0_6px_20px_-8px_rgba(15,23,42,0.18)]"
      >
        <div className="relative aspect-square bg-[#f8fafc]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5">
              <Package size={20} strokeWidth={1.5} className="text-[#cbd5e1]" />
              <span className="text-[9px] font-medium text-[#94a3b8]">No image</span>
            </div>
          )}
        </div>
        <div className="border-t border-[#f1f5f9] px-2.5 py-2">
          <h3 className="line-clamp-2 text-[11px] font-bold leading-snug text-[#0a1628] group-hover:text-[#2563eb]">
            {product.name}
          </h3>
          <p className="mt-0.5 font-mono text-[9px] font-semibold text-[#94a3b8]">
            {productDisplaySku(product)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={productHref(product, categoryRoute)}
      className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white transition-all duration-200 hover:border-[#93c5fd] hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.18)]"
    >
      {/* Image */}
      <div className="relative aspect-square bg-[#f8fafc]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Package size={28} strokeWidth={1.4} className="text-[#cbd5e1]" />
            <span className="text-xs font-medium text-[#94a3b8]">No image available</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col px-3 pt-3">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-[#0a1628] group-hover:text-[#2563eb]">
          {product.name}
        </h3>
        <p className="mt-1 font-mono text-[10px] font-semibold text-[#94a3b8]">
          {productDisplaySku(product)}
        </p>
        {!categoryRoute?.includes("/production-equipment") && (
          <p className="mt-2 text-[11px] leading-snug text-[#64748b]">High availability · lead time on request</p>
        )}
      </div>

      {/* Quote CTA */}
      <div className="mx-3 mb-3 mt-3 flex items-center justify-between rounded-lg bg-[#f1f5f9] px-3 py-2 transition-colors group-hover:bg-[#eff6ff]">
        <span className="text-xs font-semibold text-[#374151] group-hover:text-[#2563eb]">
          Get quote
        </span>
        <ArrowRight
          size={12}
          className="text-[#94a3b8] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-[#2563eb]"
        />
      </div>
    </Link>
  );
}

export type SubcategoryOption = {
  id: number;
  name: string;
  count: number;
  /** Display label overriding the numeric count, e.g. "28 series". */
  countLabel?: string;
  /** All category IDs in this subcategory's tree — used for product filtering.
   *  Empty array for non-product (partner content) categories. */
  allCategoryIds: number[];
  /** When set, the chip navigates to this URL (a brand's own hub page) instead
   *  of filtering the grid in place. */
  href?: string;
};

type CatalogueProductBrowserProps = {
  products: CatalogueProduct[];
  route: string | null;
  searchParams: CatalogueSearchParams;
  isWebshopRoot: boolean;
  sectionLabel: string;
  sectionTitle: string;
  deutschImageMap?: Record<string, string>;
  subcategoryOptions?: SubcategoryOption[];
  /** Filter params that are fixed for this page (e.g. a brand page's own-brand
   *  pre-filter) — shown but not clearable/toggleable, so they can't be removed
   *  to expand the borrowed parent-hub pool. */
  lockedFilterParams?: string[];
  /** When a non-product subcategory is active, render this content instead of
   *  the product grid. searchNames is the list of item names to match against
   *  the main search query for auto-activation (when no products match).
   *  `facet`, when present, is rendered by THIS browser in its own left sidebar
   *  (so it matches every other filter on the page) and the selected value is
   *  pushed to the embedded content via PartnerFilterContext. */
  partnerSlots?: {
    categoryId: number;
    content: React.ReactNode;
    searchNames?: string[];
    facet?: { label: string; options: { value: string; count: number }[] };
  }[];
};

// Reads the URL's query string client-side (useSearchParams) instead of via a
// server-passed prop, so the surrounding category/product page can be
// statically generated and ISR-cached instead of fully server-rendering on
// every request — a real traffic surge to one page (Vercel CPU-duration
// alert, 2026-07-23) turned into hundreds of full SSR passes/5min because
// this was the only thing forcing the whole route dynamic. Remounts the
// inner browser (via `key`) whenever the URL's params change, matching the
// previous server-driven remount-on-searchParams-change behaviour (used by
// same-page "Browse by series" links).
export default function CatalogueProductBrowser(
  props: Omit<CatalogueProductBrowserProps, "searchParams"> & {
    /** Server-computed filter values that always apply on this page (e.g. a
     *  brand leaf's own-brand pre-filter) — merged under the URL's params. */
    preFilter?: Record<string, string>;
  },
) {
  const { preFilter, ...rest } = props;
  const rawSearchParams = useSearchParams();

  const searchParams = useMemo<CatalogueSearchParams>(() => {
    const obj: CatalogueSearchParams = { ...preFilter };
    for (const key of new Set(rawSearchParams.keys())) {
      const values = rawSearchParams.getAll(key);
      obj[key] = values.length > 1 ? values : values[0];
    }
    return obj;
  }, [rawSearchParams, preFilter]);

  return (
    <CatalogueProductBrowserInner
      key={rawSearchParams.toString()}
      {...rest}
      searchParams={searchParams}
    />
  );
}

function CatalogueProductBrowserInner({
  products,
  route,
  searchParams,
  isWebshopRoot,
  sectionLabel,
  sectionTitle,
  deutschImageMap,
  subcategoryOptions,
  lockedFilterParams,
  partnerSlots,
}: CatalogueProductBrowserProps) {
  const initialPageSize = positiveInt(searchParams.per_page, DEFAULT_PAGE_SIZE);
  const [query, setQuery] = useState(firstParamValue(searchParams.q) ?? "");
  const [activeFilters, setActiveFilters] = useState(() => activeFiltersFromSearchParams(searchParams));
  const [pageSize, setPageSize] = useState(
    PAGE_SIZE_OPTIONS.includes(initialPageSize) ? initialPageSize : DEFAULT_PAGE_SIZE,
  );
  const [page, setPage] = useState(positiveInt(searchParams.page ?? searchParams.p, 1));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<number | null>(null);
  // Selected value of the active partner slot's facet (e.g. Stocko pitch).
  const [partnerFacetValue, setPartnerFacetValue] = useState<string | null>(null);

  // Subcategory filter runs first — before text search and attribute filters.
  // For partner-content subcategories (allCategoryIds empty) we return products
  // unchanged; the product grid is hidden and the partner slot renders instead.
  const subcategoryFilteredProducts = useMemo(() => {
    if (!activeSubcategoryId || !subcategoryOptions?.length) return products;
    const option = subcategoryOptions.find((o) => o.id === activeSubcategoryId);
    if (!option || option.allCategoryIds.length === 0) return products;
    const catIdSet = new Set(option.allCategoryIds);
    return products.filter((p) => p.categoryIds.some((id) => catIdSet.has(id)));
  }, [products, activeSubcategoryId, subcategoryOptions]);

  const queryText = query.toLowerCase().trim();
  const queryTokens = queryText.split(/\s+/).filter(Boolean);
  const normalizedTokens = queryTokens.map(normalizedQuery).filter(Boolean);

  // When query matches a partner slot's names and no products match, auto-show
  // that partner slot so searches like "RFK 2" surface series results.
  const hasAnyProductMatch = useMemo(() => {
    if (!queryText) return true;
    return products.some((product) => {
      const haystack = searchableText(product);
      const normalizedHaystack = normalizedSearchText(product);
      return queryTokens.every((token, index) => {
        const normalizedToken = normalizedTokens[index];
        return (
          haystack.includes(token) ||
          Boolean(normalizedToken && normalizedHaystack.includes(normalizedToken))
        );
      });
    });
  }, [products, queryText, queryTokens, normalizedTokens]);

  const autoPartnerSlotId = useMemo(() => {
    if (!queryText || hasAnyProductMatch || activeSubcategoryId !== null) return null;
    const matched = partnerSlots?.find((slot) =>
      slot.searchNames?.some((name) => {
        const nl = name.toLowerCase();
        return queryTokens.every((token) => nl.includes(token));
      }),
    );
    return matched?.categoryId ?? null;
  }, [queryText, hasAnyProductMatch, activeSubcategoryId, partnerSlots, queryTokens]);

  // Explicit user selection takes priority; fall back to query-driven auto-slot.
  const effectiveSubcategoryId = activeSubcategoryId ?? autoPartnerSlotId;

  const activePartnerSlot = effectiveSubcategoryId
    ? (partnerSlots?.find((s) => s.categoryId === effectiveSubcategoryId) ?? null)
    : null;

  const searchedProducts = useMemo(() => {
    if (queryTokens.length === 0) return subcategoryFilteredProducts;
    return subcategoryFilteredProducts
      .filter((product) => {
      const haystack = searchableText(product);
        const normalizedHaystack = normalizedSearchText(product);
        return queryTokens.every((token, index) => {
          const normalizedToken = normalizedTokens[index];
          return (
            haystack.includes(token) ||
            Boolean(normalizedToken && normalizedHaystack.includes(normalizedToken))
          );
        });
      })
      .sort(
        (a, b) =>
          productSearchScore(b, queryText) - productSearchScore(a, queryText) ||
          a.name.localeCompare(b.name),
      );
  }, [subcategoryFilteredProducts, queryText, queryTokens, normalizedTokens]);

  const facets = useMemo(
    () => buildFacets(searchedProducts, activeFilters),
    [searchedProducts, activeFilters],
  );

  const filteredProducts = useMemo(
    () => searchedProducts.filter((product) => productMatchesFilters(product, activeFilters)),
    [searchedProducts, activeFilters],
  );

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageProducts = filteredProducts.slice(startIndex, startIndex + pageSize);
  const visibleStart = filteredProducts.length > 0 ? startIndex + 1 : 0;
  const visibleEnd = startIndex + pageProducts.length;

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  const lockedParams = useMemo(() => new Set(lockedFilterParams ?? []), [lockedFilterParams]);

  function toggleFilter(param: string, value: string) {
    // Locked filters (a brand page's own pre-filter) can't be toggled off —
    // clearing them would expand the borrowed parent-hub pool.
    if (lockedParams.has(param)) return;
    setActiveFilters((current) => {
      const next = { ...current };
      if (next[param] === value) delete next[param];
      else next[param] = value;
      return next;
    });
    setPage(1);
  }

  function clearAll() {
    setQuery("");
    // Preserve any locked filters — only user-added filters are cleared.
    setActiveFilters((current) => {
      const kept: Record<string, string> = {};
      for (const param of lockedParams) if (current[param]) kept[param] = current[param];
      return kept;
    });
    setActiveSubcategoryId(null);
    setPartnerFacetValue(null);
    setPage(1);
  }

  const clearableFilters = Object.keys(activeFilters).filter((p) => !lockedParams.has(p));
  const activeFilterCount = clearableFilters.length + (effectiveSubcategoryId ? 1 : 0);
  const hasSubcategoryFilter = (subcategoryOptions?.length ?? 0) > 1;
  const showFilters = !isWebshopRoot && (facets.length > 0 || hasSubcategoryFilter);

  const filterPanel = showFilters ? (
    <div className="space-y-5">
      <div className="rounded-lg border border-[#e5e7eb] bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#0a1628]">
            Filter
          </h2>
          {(query || activeFilterCount > 0) && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8]"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Subcategory filter — always first, before attribute facets */}
        {hasSubcategoryFilter && (
          <div className="mt-5">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
              Category
            </h3>
            <div className="mt-2 space-y-1.5">
              {subcategoryOptions!.map((option) => {
                const active = effectiveSubcategoryId === option.id;
                const cls = `flex w-full items-start justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs leading-snug ${
                  active
                    ? "bg-[#eaf2ff] font-bold text-[#1d4ed8]"
                    : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#2563eb]"
                }`;
                const inner = (
                  <>
                    <span>{option.name}</span>
                    <span className="flex-none text-[#94a3b8]">
                      {option.countLabel ?? option.count.toLocaleString()}
                    </span>
                  </>
                );
                // Brand subcategories navigate to the brand's own hub page.
                if (option.href) {
                  return (
                    <Link key={option.id} href={option.href} className={cls}>
                      {inner}
                    </Link>
                  );
                }
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setActiveSubcategoryId(active ? null : option.id);
                      setPartnerFacetValue(null);
                      setPage(1);
                    }}
                    className={cls}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Partner facet (e.g. Stocko pitch) — rendered here so it looks like
            every other filter on the page, instead of floating chips. */}
        {activePartnerSlot?.facet && activePartnerSlot.facet.options.length > 1 && (
          <div className={`${hasSubcategoryFilter ? "mt-5 border-t border-[#eef2f7] pt-5" : "mt-5"}`}>
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
              {facetDisplayLabel(activePartnerSlot.facet.label)}
            </h3>
            <div className="mt-2 space-y-1.5">
              <button
                type="button"
                onClick={() => setPartnerFacetValue(null)}
                className={`flex w-full items-start justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs leading-snug ${
                  partnerFacetValue === null
                    ? "bg-[#eaf2ff] font-bold text-[#1d4ed8]"
                    : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#2563eb]"
                }`}
              >
                <span>All</span>
                <span className="flex-none text-[#94a3b8]">
                  {activePartnerSlot.facet.options.reduce((sum, o) => sum + o.count, 0)}
                </span>
              </button>
              {activePartnerSlot.facet.options.map((option) => {
                const active = partnerFacetValue === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPartnerFacetValue(active ? null : option.value)}
                    className={`flex w-full items-start justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs leading-snug ${
                      active
                        ? "bg-[#eaf2ff] font-bold text-[#1d4ed8]"
                        : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#2563eb]"
                    }`}
                  >
                    <span>{option.value}</span>
                    <span className="flex-none text-[#94a3b8]">{option.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!activePartnerSlot && facets.length > 0 && (
          <div className={`space-y-5 ${hasSubcategoryFilter ? "mt-5 border-t border-[#eef2f7] pt-5" : "mt-5"}`}>
            {facets.map((facet) => (
              <div key={facet.param}>
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
                  {facetDisplayLabel(facet.label)}
                </h3>
                <div className="mt-2 space-y-1.5">
                  {facet.values.map((item) => {
                    // A locked facet (a brand page's own pre-filter) is shown as a
                    // static, non-clickable chip — it can't be toggled off.
                    if (lockedParams.has(facet.param)) {
                      return (
                        <div
                          key={item.value}
                          className="flex w-full items-start justify-between gap-3 rounded-md bg-[#eaf2ff] px-2 py-1.5 text-left text-xs font-bold leading-snug text-[#1d4ed8]"
                        >
                          <span>{item.value}</span>
                          <span className="flex-none text-[#94a3b8]">{item.count}</span>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => toggleFilter(facet.param, item.value)}
                        className={`flex w-full items-start justify-between gap-3 rounded-md px-2 py-1.5 text-left text-xs leading-snug ${
                          item.active
                            ? "bg-[#eaf2ff] font-bold text-[#1d4ed8]"
                            : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#2563eb]"
                        }`}
                      >
                        <span>{item.value}</span>
                        <span className="flex-none text-[#94a3b8]">{item.count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <section className={showFilters ? "grid gap-8 lg:grid-cols-[280px_1fr]" : ""}>
      {/* Desktop sidebar — hidden on mobile */}
      {showFilters && (
        <aside className="hidden lg:block space-y-5">
          {filterPanel}
        </aside>
      )}

      {/* Mobile bottom sheet */}
      {showFilters && filtersOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[80vh] flex-col rounded-t-2xl bg-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
              <span className="text-sm font-bold text-[#0a1628]">Filter</span>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full p-1.5 text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto p-5">{filterPanel}</div>
            <div className="border-t border-[#e5e7eb] p-4">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full rounded-xl bg-[#2563eb] py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]"
              >
                Show {filteredProducts.length.toLocaleString()} results
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        {/* Mobile filter trigger — only shown when there are filters and on small screens */}
        {showFilters && (
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-[#d8dee7] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] shadow-sm hover:border-[#93c5fd] hover:text-[#2563eb]"
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {clearableFilters.map((param) => (
                  <button
                    key={param}
                    type="button"
                    onClick={() => toggleFilter(param, activeFilters[param])}
                    className="flex items-center gap-1 rounded-full bg-[#eaf2ff] px-2.5 py-1 text-xs font-bold text-[#1d4ed8]"
                  >
                    {activeFilters[param]}
                    <X size={10} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`mb-5 rounded-lg border border-[#d8dee7] bg-white p-4${isWebshopRoot ? " hidden" : ""}`}>
          <label className="sr-only" htmlFor="instant-catalogue-search">
            Search within this catalogue page
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]"
            />
            <input
              id="instant-catalogue-search"
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
              placeholder="Instant search: part number, series, material, colour, brand..."
              className="h-12 w-full rounded-md border border-[#d8dee7] bg-[#f8fafc] pl-11 pr-11 text-sm text-[#0a1628] outline-none placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:bg-white"
            />
            {query && (
              <button
                type="button"
                onClick={() => updateQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#64748b] hover:bg-[#eef2f7] hover:text-[#0a1628]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {(query || clearableFilters.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {query && (
                <span className="rounded-md bg-[#eff6ff] px-2 py-1 text-xs font-bold text-[#1d4ed8]">
                  Search: {query}
                </span>
              )}
              {clearableFilters.map((param) => (
                <button
                  key={param}
                  type="button"
                  onClick={() => toggleFilter(param, activeFilters[param])}
                  className="rounded-md bg-[#f1f5f9] px-2 py-1 text-xs font-bold text-[#475569] hover:bg-[#e2e8f0]"
                >
                  {activeFilters[param]} x
                </button>
              ))}
            </div>
          )}
        </div>

        {activePartnerSlot ? (
          /* Partner-content subcategory active: show the dedicated browser inline.
             The context passes the current search query so the embedded browser
             can filter its own content accordingly. */
          <PartnerSearchContext.Provider value={query}>
            <PartnerFilterContext.Provider value={partnerFacetValue}>
              <div>{activePartnerSlot.content}</div>
            </PartnerFilterContext.Provider>
          </PartnerSearchContext.Provider>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                  {sectionLabel}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[#0a1628]">{sectionTitle}</h2>
              </div>
              <span className="text-sm font-medium text-[#64748b]">
                Items {visibleStart.toLocaleString()} to {visibleEnd.toLocaleString()} of{" "}
                {filteredProducts.length.toLocaleString()} total
              </span>
            </div>

            {pageProducts.length > 0 ? (
              <div className={isWebshopRoot
                ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                : "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              }>
                {pageProducts.map((product) => (
                  <ProductCard key={product.id} product={product} categoryRoute={route} deutschImageMap={deutschImageMap} compact={isWebshopRoot} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-[#e5e7eb] bg-white px-6 py-12 text-center">
                <h3 className="text-base font-bold text-[#0a1628]">No matching catalogue items</h3>
                <p className="mt-2 text-sm text-[#64748b]">
                  Try a shorter part number, product family, material, colour, or brand.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 border-t border-[#e5e7eb] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748b]">
                  Show
                </span>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setPageSize(size);
                      setPage(1);
                    }}
                    className={`rounded-md border px-3 py-1.5 text-xs font-bold ${
                      size === pageSize
                        ? "border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8]"
                        : "border-[#d8dee7] bg-white text-[#475569] hover:border-[#93c5fd] hover:text-[#2563eb]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {pageCount > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-[#d8dee7] bg-white px-3 py-1.5 text-xs font-bold text-[#475569] hover:border-[#93c5fd] hover:text-[#2563eb] disabled:pointer-events-none disabled:border-[#e5e7eb] disabled:text-[#cbd5e1]"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-[#64748b]">
                    Page {currentPage.toLocaleString()} of {pageCount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
                    disabled={currentPage === pageCount}
                    className="rounded-md border border-[#d8dee7] bg-white px-3 py-1.5 text-xs font-bold text-[#475569] hover:border-[#93c5fd] hover:text-[#2563eb] disabled:pointer-events-none disabled:border-[#e5e7eb] disabled:text-[#cbd5e1]"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
