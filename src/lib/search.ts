import { products } from "@/data/products";
import { deutschProducts } from "@/data/deutschConnectors";
import {
  getAllCatalogueProducts,
  catalogueProductLegacyRoute,
  getCatalogueCategory,
} from "@/lib/magentoCatalogue";
import { stripLegacyHtml } from "@/lib/legacyHtml";

export type SearchResult = {
  id: string;
  partNumber: string;
  name: string;
  brand: string;
  category: string;
  href: string;
  available: boolean;
  description: string;
};

type IndexedResult = SearchResult & { haystack: string };

// Build a combined, de-duplicated search index once at module load.
const curatedPartNumbers = new Set(
  products.map((p) => p.partNumber.toUpperCase()),
);

const curatedIndex: IndexedResult[] = products.map((p) => ({
  id: p.id,
  partNumber: p.partNumber,
  name: p.name,
  brand: p.brand,
  category: p.category,
  href: `/products/${p.categorySlug}/${p.slug}`,
  available: p.available,
  description: p.shortDescription,
  haystack: [
    p.name,
    p.partNumber,
    p.brand,
    p.category,
    p.shortDescription,
    ...p.tags,
    ...p.applications,
  ]
    .join(" ")
    .toLowerCase(),
}));

const deutschIndex: IndexedResult[] = deutschProducts
  // Skip parts already covered by the richer curated entries.
  .filter((d) => !curatedPartNumbers.has(d.partNumber.toUpperCase()))
  .map((d) => {
    const ways = d.ways ? `${d.ways}-way` : "";
    const type = d.type ?? "";
    const name = ["DEUTSCH", d.partNumber, ways, type].filter(Boolean).join(" ");
    const description = [d.series, "series", ways, type, "sealed connector"]
      .filter(Boolean)
      .join(" ");
    return {
      id: `deutsch-${d.partNumber}`,
      partNumber: d.partNumber,
      name,
      brand: "Deutsch",
      category: "Connectors",
      href: `/products/deutsch-connectors/${d.partNumber.toLowerCase()}`,
      available: d.availability === "lead-time",
      description,
      haystack: [d.partNumber, d.series, ways, type, "deutsch connector sealed"]
        .join(" ")
        .toLowerCase(),
    };
  });

// Set of SKUs already covered by curated or Deutsch index entries.
const coveredSkus = new Set([
  ...products.map((p) => p.partNumber.toUpperCase()),
  ...deutschProducts.map((d) => d.partNumber.toUpperCase()),
]);

const magentoCatalogueIndex: IndexedResult[] = getAllCatalogueProducts()
  .filter(
    (p) =>
      p.status === "enabled" &&
      p.routes.length > 0 &&
      p.sku &&
      // The Magento `sku` is usually a numeric internal stock code (e.g.
      // "242001-0812"), not the manufacturer part number — that lives in the
      // "Part Number" attribute (or the name). Checking only `sku` here let
      // 543 Deutsch parts through as duplicates of their deutschIndex entry;
      // check the real part number too.
      !coveredSkus.has(p.sku.toUpperCase()) &&
      !coveredSkus.has(
        String(p.attributes?.["Part Number"] ?? p.name ?? p.sku).toUpperCase(),
      ),
  )
  .map((p) => {
    const brand = p.brand ?? p.manufacturer ?? p.attributes?.["Brand"] ?? "";
    // Use the human-facing Part Number attribute if present; fall back to name then sku.
    const partNumber = p.attributes?.["Part Number"] ?? p.name ?? p.sku ?? "";
    const rawDesc = p.shortDescription && p.shortDescription !== p.name && p.shortDescription !== p.sku
      ? stripLegacyHtml(p.shortDescription)
      : "";
    const description = rawDesc || (brand ? `${brand} ${p.name}` : p.name);

    // Unique ancestor category names (e.g. "Deutsch", "Accessories", "Connectors")
    const categoryNames = [
      ...new Set(
        p.categoryIds
          .map((id) => getCatalogueCategory(id)?.name ?? "")
          .filter(Boolean),
      ),
    ];

    // All attribute values (covers Series, LADD Accessory Type, Material, etc.)
    // except the technical cross-reference codes below (crimp tool numbers,
    // DIN standard cross-references, application-image codes) — their values
    // are internal codes, not descriptive text, and coincidentally collide
    // with other real products' own SKUs often enough to surface as
    // confusing, unrelated "hits". Found 2026-09-11: searching Vogt's SKU
    // 491116 also matched product 461116, purely because 461116's "Nummer
    // DIN" attribute happens to hold the string "491116" as a standard
    // cross-reference. Audited the full catalogue: 67 products collide via
    // "Nummer DIN" alone, 1,364 via "Werkzuege" (crimp tool codes).
    const NON_SEARCHABLE_ATTRIBUTES = new Set([
      "Werkzuege",
      "Nummer DIN",
      "Nummer F",
      "Farbe DIN",
      "Farbe F",
      "Anwendungsbild",
    ]);
    const attrValues = Object.entries(p.attributes ?? {})
      .filter(([key]) => !NON_SEARCHABLE_ATTRIBUTES.has(key))
      .map(([, v]) => v)
      .filter(
        (v): v is string => typeof v === "string" && v.toLowerCase() !== "y" && v.toLowerCase() !== "n",
      );

    return {
      id: `magento-${p.id}`,
      partNumber,
      name: p.name,
      brand,
      category: categoryNames[0] ?? (brand || "Catalogue"),
      href: catalogueProductLegacyRoute(p),
      available: true,
      description,
      haystack: [
        partNumber,
        p.name,
        brand,
        ...categoryNames,
        ...attrValues,
        p.shortDescription ? stripLegacyHtml(p.shortDescription) : "",
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

const searchIndex: IndexedResult[] = [...curatedIndex, ...deutschIndex, ...magentoCatalogueIndex];

function scoreResult(item: IndexedResult, full: string, tokens: string[]): number {
  const pn = item.partNumber.toLowerCase();
  const name = item.name.toLowerCase();
  let score = 0;

  if (pn === full) score += 120;
  else if (pn.startsWith(full)) score += 70;
  else if (pn.includes(full)) score += 45;

  if (name.includes(full)) score += 25;

  for (const t of tokens) {
    if (pn.includes(t)) score += 10;
    if (name.includes(t)) score += 4;
  }

  if (item.available) score += 1;
  return score;
}

/**
 * Tokenised search across the full catalogue (curated products + Deutsch
 * connectors). A result matches only when every token appears somewhere in
 * its searchable text, so multi-word queries like "deutsch 8 way plug" work.
 * Results are ranked by relevance (part number and name matches first).
 */
export function searchCatalogue(query: string, limit = 60): SearchResult[] {
  const full = query.trim().toLowerCase();
  if (full.length < 2) return [];
  const tokens = full.split(/\s+/).filter(Boolean);

  const matches = searchIndex.filter((item) =>
    tokens.every((t) => item.haystack.includes(t)),
  );

  matches.sort((a, b) => scoreResult(b, full, tokens) - scoreResult(a, full, tokens));

  // Strip the internal haystack field before returning.
  return matches.slice(0, limit).map(({ haystack: _haystack, ...rest }) => rest);
}
