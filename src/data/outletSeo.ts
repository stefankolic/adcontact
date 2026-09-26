import { OUTLET_OWN_PAGES, outletDisplayName, type OutletComponent } from "@/data/deutschOutlet";
import { OUTLET_CATALOGUE_PAGES } from "@/data/outletCatalogueLinks";
import { getCatalogueProduct } from "@/lib/magentoCatalogue";
import { catalogueDescriptor } from "@/data/catalogueTitles";

// Server-side only: reads the Magento catalogue. One source for the SEO title,
// the meta description and the specification rows of every outlet part that has
// no Deutsch dataset entry (11 own pages, 38 catalogue pages). The page H1,
// <title>, JSON-LD name and the Merchant feed all come from here, so they agree.
// Facts come from the specifications when they exist (see spec-first-descriptions);
// an unknown field is left out, never guessed.

export type OutletSeo = {
  /** Full title used as the page H1 and the JSON-LD name. */
  title: string;
  /** The same without the trailing ", for wire processing" (and ", connector"): the feed's short format. */
  shortTitle: string;
  /** Plain descriptor, e.g. "6-Way Socket" or "Size 16 Pin Contact". */
  descriptor: string;
  description: string;
  feedDescription: string;
  specs: [string, string][];
  kind: "own" | "catalogue";
  /** How each fact was established (review sheet only). */
  basis: string;
};

const TAIL = "Surplus stock from Adcontact's own warehouse, sold at outlet pricing while quantities last.";

function ownSeo(item: OutletComponent): OutletSeo | null {
  const page = OUTLET_OWN_PAGES[item.sku];
  if (!page) return null;
  const { partNumber } = page;
  const f = page.seo ?? {};
  const ways = f.ways ? `${f.ways}-Way${f.type ? ` ${f.type}` : ""}` : "";
  const known = Boolean(f.ways);
  // Non-connector parts (adaptors): "Adaptor for HD30 Series, Size 24".
  const kindText = f.kind ? [f.kind + (f.fitsSeries ? ` for ${f.fitsSeries}` : ""), f.shellSize ? `Size ${f.shellSize}` : ""].filter(Boolean).join(", ") : "";
  const shortTitle = ["Deutsch " + partNumber, f.series, ways, kindText].filter(Boolean).join(", ");
  const title = `${shortTitle}${known ? ", connector" : ""}, for wire processing`;
  const descriptor = kindText || [f.series, ways].filter(Boolean).join(" ") || "part";
  const specs: [string, string][] = [["Part number", partNumber], ["Brand", "Deutsch"]];
  if (f.kind) specs.push(["Type", f.kind]);
  if (f.fitsSeries) specs.push(["For series", f.fitsSeries]);
  if (f.series) specs.push(["Series", f.series]);
  if (f.ways) specs.push(["No. of cavities", String(f.ways)]);
  if (f.type) specs.push([f.type === "Receptacle" ? "Connector style" : "Contact type", f.type]);
  if (f.shellSize) specs.push(["Shell size", f.shellSize]);
  if (f.mounting) specs.push(["Mounting style", f.mounting]);
  if (f.termination) specs.push(["Termination", f.termination]);
  if (f.wireGauge) specs.push(["Wire gauge", f.wireGauge]);
  specs.push(["Condition", "New, surplus stock"]);
  const what = kindText ? kindText : known ? `${f.series ? f.series + " " : ""}${f.ways}-way${f.type ? " " + f.type.toLowerCase() : ""} connector` : "Deutsch part";
  const description = `${partNumber}: ${what}. Surplus outlet stock from Adcontact's Keila warehouse, EUR ${item.priceEur.toFixed(2)} per unit while quantities last. Buy online or request a quote.`;
  const feedDescription = kindText
    ? `${partNumber}, ${kindText} from Deutsch. ${TAIL}`
    : known
    ? `${partNumber}, ${f.series ? f.series + ", " : ""}${f.ways}-way${f.type ? ", " + f.type.toLowerCase() : ""} connector from Deutsch. ${TAIL}`
    : `${partNumber} from Deutsch. ${TAIL}`;
  return { title, shortTitle, descriptor, description, feedDescription, specs, kind: "own", basis: f.basis ?? "" };
}

const has = (v: unknown): v is string => typeof v === "string" && v.trim() !== "" && v.trim() !== "-";

function catalogueSeo(item: OutletComponent): OutletSeo | null {
  const link = OUTLET_CATALOGUE_PAGES[item.sku];
  if (!link) return null;
  const product = getCatalogueProduct(link.productId);
  const a = (product?.attributes ?? {}) as Record<string, string>;
  const pn = link.partNumber;
  // What the sheet added after the part number (Front Seal DT06-2S), without the number itself.
  const shown = outletDisplayName(item);
  const note = shown.toLowerCase().startsWith(pn.toLowerCase()) ? shown.slice(pn.length).trim() : "";
  const routeType = link.route.split("/")[3] ?? "";
  const { descriptor, basis, connector, feedText } = catalogueDescriptor(a, { pn, routeType, note, allowWeak: true })!;
  const shortTitle = `Deutsch ${pn}, ${descriptor}`;
  const title = `${shortTitle}${connector ? ", connector" : ""}, for wire processing`;
  const specs: [string, string][] = [["Part number", pn], ["Brand", "Deutsch"]];
  const extra = ["Series", "Accessory Type", "Contact Size", "Holds Pin/Socket", "Current Rating", "No. of cavities", "Connector Style", "Shell Size", "Color", "Material"] as const;
  for (const k of extra) if (has(a[k])) specs.push([k === "Current Rating" ? "Current rating (A)" : k, a[k]]);
  const description = `${pn}: ${connector ? descriptor + " connector" : descriptor}. Surplus outlet stock from Adcontact's Keila warehouse, EUR ${item.priceEur.toFixed(2)} per unit while quantities last. Buy online or request a quote.`;
  const feedDescription = `${feedText || `${pn}, ${descriptor}`} from Deutsch. ${TAIL}`;
  return { title, shortTitle, descriptor, description, feedDescription, specs, kind: "catalogue", basis };
}

export function outletSeo(item: OutletComponent): OutletSeo | null {
  if (item.matchedPartNumber) return null;
  return ownSeo(item) ?? catalogueSeo(item);
}
