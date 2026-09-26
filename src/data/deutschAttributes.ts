import attributesData from "@/data/generated/deutsch-attributes.json";
import { deutschProducts } from "@/data/deutschConnectors";

export type AttributeOption = { label: string; count: number };
export type AttributeGroup = { name: string; options: AttributeOption[] };

type AttributesFile = {
  generatedAt: string;
  attributes: AttributeGroup[];
  productCount: number;
  products: Record<string, Record<string, string>>;
};

const data = attributesData as AttributesFile;

/** Filter groups in the original storefront's order (Series, No. of cavities, …). */
export const filterAttributes: AttributeGroup[] = data.attributes;

/** partNumber → { attributeName: optionLabel } */
export const productAttributes: Record<string, Record<string, string>> = data.products;

export function attrsForPart(partNumber: string): Record<string, string> {
  return data.products[partNumber] ?? {};
}

// ── Series summaries for the "Browse by series" overview ───────────────────────
// Derived from the same real Series attribute the filter uses, so the overview
// and the filter stay perfectly consistent.

export type SeriesSummary = {
  label: string;
  count: number;
  image: string | null;
  minCav: number | null;
  maxCav: number | null;
  styles: string[];
};

const imageByPart = new Map(deutschProducts.map((p) => [p.partNumber, p.imageUrl]));

// Representative photo for a series card. Wins over the first product photo of the
// series, which is only a fallback. Keyed by the series label; files live in R2.
const SERIES_IMAGE_OVERRIDES: Record<string, string> = {
  "AMPSEAL Series": "/media/series/ampseal-series.jpg",
};

export const seriesSummaries: SeriesSummary[] = (() => {
  const seriesGroup = data.attributes.find((a) => a.name === "Series");
  const byseries = new Map<
    string,
    { image: string | null; cavs: number[]; styles: Set<string> }
  >();

  for (const [pn, attrs] of Object.entries(data.products)) {
    const s = attrs["Series"];
    if (!s) continue;
    const e = byseries.get(s) ?? { image: null, cavs: [], styles: new Set<string>() };
    if (!e.image) {
      const img = imageByPart.get(pn);
      if (img) e.image = img;
    }
    const cav = attrs["No. of cavities"];
    const n = cav ? Number(cav) : NaN;
    if (!Number.isNaN(n)) e.cavs.push(n);
    const style = attrs["Connector Style"];
    if (style) e.styles.add(style);
    byseries.set(s, e);
  }

  return (seriesGroup?.options ?? [])
    .map((o) => {
      const e = byseries.get(o.label);
      return {
        label: o.label,
        count: o.count,
        image: SERIES_IMAGE_OVERRIDES[o.label] ?? e?.image ?? null,
        minCav: e && e.cavs.length ? Math.min(...e.cavs) : null,
        maxCav: e && e.cavs.length ? Math.max(...e.cavs) : null,
        styles: e ? Array.from(e.styles).sort() : [],
      };
    })
    .sort((a, b) => b.count - a.count);
})();
