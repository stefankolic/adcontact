import { OUTLET_OWN_PAGES, outletDisplayName, type OutletComponent } from "@/data/deutschOutlet";
import { OUTLET_CATALOGUE_PAGES } from "@/data/outletCatalogueLinks";
import { getCatalogueProduct } from "@/lib/magentoCatalogue";

// Server-side only: reads the Magento catalogue. One source for the SEO title,
// the meta description and the specification rows of every outlet part that has
// no Deutsch dataset entry (11 own pages, 38 catalogue pages). The page H1,
// <title>, JSON-LD name and the Merchant feed all come from here, so they agree.
// Facts come from the specifications when they exist (see spec-first-descriptions);
// an unknown field is left out, never guessed.

export type OutletSeo = {
  /** Full title used as the page H1 and the JSON-LD name. */
  title: string;
  /** The same without the trailing ", connector, for wire processing" (the feed's short format). */
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
  const shortTitle = ["Deutsch " + partNumber, f.series, ways].filter(Boolean).join(", ");
  const title = known ? `${shortTitle}, connector, for wire processing` : shortTitle;
  const descriptor = [f.series, ways].filter(Boolean).join(" ") || "part";
  const specs: [string, string][] = [["Part number", partNumber], ["Brand", "Deutsch"]];
  if (f.series) specs.push(["Series", f.series]);
  if (f.ways) specs.push(["No. of cavities", String(f.ways)]);
  if (f.type) specs.push(["Contact type", f.type]);
  if (f.shellSize) specs.push(["Shell size", f.shellSize]);
  specs.push(["Condition", "New, surplus stock"]);
  const what = known ? `${f.series ? f.series + " " : ""}${f.ways}-way${f.type ? " " + f.type.toLowerCase() : ""} connector` : "Deutsch part";
  const description = `${partNumber}: ${what}. Surplus outlet stock from Adcontact's Keila warehouse, EUR ${item.priceEur.toFixed(2)} per unit while quantities last. Buy online or request a quote.`;
  const feedDescription = known
    ? `${partNumber}, ${f.series ? f.series + ", " : ""}${f.ways}-way${f.type ? ", " + f.type.toLowerCase() : ""} connector from Deutsch. ${TAIL}`
    : `${partNumber} from Deutsch. ${TAIL}`;
  return { title, shortTitle, descriptor, description, feedDescription, specs, kind: "own", basis: f.basis ?? "" };
}

const title = (w: string) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w);

/** "Keying Pin size 12 yellow" gives "Keying Pin, Size 12, Yellow"; other notes only get capitalised words. */
function tidyNote(note: string): string {
  const m = note.match(/^(.*?)\s+size\s+(\d+)(?:\s+([A-Za-z]+))?$/i);
  if (m) return [m[1].split(" ").map(title).join(" "), `Size ${m[2]}`, m[3] ? title(m[3]) : ""].filter(Boolean).join(", ");
  return note.split(" ").map(title).join(" ");
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
  const isContact = routeType === "contacts";
  const isConnector = /connectors/.test(routeType);
  let descriptor = "";
  let basis = "";
  let connector = false;
  let feedText = "";
  if (isContact && has(a["Holds Pin/Socket"]) && has(a["Contact Size"])) {
    descriptor = `Size ${a["Contact Size"]} ${a["Holds Pin/Socket"]} Contact`;
    basis = "Contact size and pin/socket from the catalogue specifications";
  } else if (isConnector && has(a["No. of cavities"]) && (has(a["Holds Pin/Socket"]) || has(a["Connector Style"]))) {
    const type = has(a["Holds Pin/Socket"]) ? a["Holds Pin/Socket"] : a["Connector Style"];
    const series = has(a["Series"]) ? a["Series"] : "";
    descriptor = [series, `${a["No. of cavities"]}-Way ${type}`].filter(Boolean).join(", ");
    feedText = `${pn}, ${series ? series + ", " : ""}${a["No. of cavities"]}-way, ${type.toLowerCase()} connector`;
    basis = "Series, cavities and pin/socket from the catalogue specifications";
    connector = true;
  } else if (has(a["Accessory Type"])) {
    descriptor = [a["Accessory Type"], has(a["Contact Size"]) ? `Size ${a["Contact Size"]}` : "", has(a["Color"]) ? a["Color"] : ""].filter(Boolean).join(", ");
    basis = "Accessory type, size and colour from the catalogue specifications";
  } else if (note) {
    descriptor = tidyNote(note);
    basis = "Text from the outlet stock sheet (the catalogue has no descriptive specification)";
  } else if (has(a["No. of cavities"]) && has(a["Connector Style"])) {
    descriptor = `Accessory for ${a["No. of cavities"]}-way ${a["Connector Style"].toLowerCase().replace(/,\s*/g, " or ")}`;
    basis = "Catalogue lists cavities and connector style on this accessory; read as the connector it fits, please confirm";
  } else {
    descriptor = "Accessory";
    basis = "No descriptive data in the catalogue or the stock sheet";
  }
  const shortTitle = `Deutsch ${pn}, ${descriptor}`;
  const title = connector ? `${shortTitle}, connector, for wire processing` : shortTitle;
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
