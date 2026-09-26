import type { CatalogueProduct } from "@/lib/magentoCatalogue";

// One source for the descriptive part of a Deutsch contact / accessory / tool
// title ("Size 16 Pin Contact", "DT Series, 3-Way Wedgelock", "Front Seal DT06-3S").
// Used by the outlet pages (outletSeo.ts) and by every regular Deutsch catalogue
// page in the Accessories, Contacts and Tools categories, so both read the same.
// Facts come from the catalogue specifications first (spec-first rule); when
// nothing reliable is known the caller keeps the bare part number.

export const DEUTSCH_CATEGORY_IDS = { accessories: 121, contacts: 122, tools: 123 } as const;

const has = (v: unknown): v is string => typeof v === "string" && v.trim() !== "" && v.trim() !== "-";
const cap = (w: string) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w);
const single = (v: unknown): string => (has(v) && !v.includes(",") ? v.trim() : "");

/** "Keying Pin size 12 yellow" gives "Keying Pin, Size 12, Yellow"; other notes only get capitalised words. */
export function tidyNote(note: string): string {
  const m = note.match(/^(.*?)\s+size\s+(\d+)(?:\s+([A-Za-z]+))?$/i);
  if (m) return [m[1].split(" ").map(cap).join(" "), `Size ${m[2]}`, m[3] ? cap(m[3]) : ""].filter(Boolean).join(", ");
  return note.split(" ").map(cap).join(" ");
}

export type CatalogueDescriptor = {
  descriptor: string;
  basis: string;
  /** True for a connector housing: the title then also says ", connector". */
  connector: boolean;
  /** Feed sentence for connectors (empty for everything else). */
  feedText: string;
};

/**
 * @param routeType  "contacts" | "accessories" | "tools" | a "...connectors" route segment
 * @param note       text the outlet stock sheet adds after the part number (outlet only)
 * @param allowWeak  outlet rows may fall back to weaker readings ("Accessory for 40-way
 *                   receptacle", bare "Accessory"); regular pages only state solid facts
 */
export function catalogueDescriptor(
  a: Record<string, string>,
  o: { pn: string; routeType: string; note?: string; allowWeak: boolean },
): CatalogueDescriptor | null {
  const { pn, routeType, note, allowWeak } = o;
  const isContact = routeType === "contacts";
  const isConnector = /connectors/.test(routeType);
  const done = (descriptor: string, basis: string, connector = false, feedText = ""): CatalogueDescriptor => ({ descriptor, basis, connector, feedText });

  if (isContact && has(a["Holds Pin/Socket"]) && has(a["Contact Size"])) {
    return done(`Size ${a["Contact Size"]} ${a["Holds Pin/Socket"]} Contact`, "Contact size and pin/socket from the catalogue specifications");
  }
  if (isConnector && has(a["No. of cavities"]) && (has(a["Holds Pin/Socket"]) || has(a["Connector Style"]))) {
    const type = has(a["Holds Pin/Socket"]) ? a["Holds Pin/Socket"] : a["Connector Style"];
    const series = has(a["Series"]) ? a["Series"] : "";
    return done(
      [series, `${a["No. of cavities"]}-Way ${type}`].filter(Boolean).join(", "),
      "Series, cavities and pin/socket from the catalogue specifications",
      true,
      `${pn}, ${series ? series + ", " : ""}${a["No. of cavities"]}-way, ${type.toLowerCase()} connector`,
    );
  }
  if (has(a["Accessory Type"])) {
    return done(
      [a["Accessory Type"], has(a["Contact Size"]) ? `Size ${a["Contact Size"]}` : "", has(a["Color"]) ? a["Color"] : ""].filter(Boolean).join(", "),
      "Accessory type, size and colour from the catalogue specifications",
    );
  }
  if (note) return done(tidyNote(note), "Text from the outlet stock sheet (the catalogue has no descriptive specification)");
  if (a["Wedgelock"] === "y") {
    const series = single(a["Series"]);
    // The cavity count is only trusted when the part number carries the same number (WB-48PD says 15 cavities but is a 48-way part).
    const cav = single(a["No. of cavities"]);
    const ways = /^\d+$/.test(cav) && new RegExp(`(?<!\\d)${cav}(?!\\d)`).test(pn) ? cav : "";
    return done([series, `${ways ? ways + "-Way " : ""}Wedgelock`].filter(Boolean).join(", "), "Wedgelock flag, series and cavities from the catalogue specifications");
  }
  if (a["Replacement Parts"] === "y") {
    const size = single(a["Contact Size"]);
    return done(["Tool Replacement Part", size ? `Size ${size}` : ""].filter(Boolean).join(", "), "Replacement-part flag and contact size from the catalogue specifications");
  }
  const seal = a["Special Features"]?.match(/^Seal,\s*front,\s*(enhanced,\s*)?(.+?)\*?\s*$/i);
  if (seal) return done(`${seal[1] ? "Enhanced " : ""}Front Seal ${seal[2].trim()}`, "Front-seal text from the catalogue specifications");

  if (!allowWeak) return null;
  if (has(a["No. of cavities"]) && has(a["Connector Style"])) {
    return done(
      `Accessory for ${a["No. of cavities"]}-way ${a["Connector Style"].toLowerCase().replace(/,\s*/g, " or ")}`,
      "Catalogue lists cavities and connector style on this accessory; read as the connector it fits, please confirm",
    );
  }
  return done("Accessory", "No descriptive data in the catalogue or the stock sheet");
}

function routeTypeFor(product: CatalogueProduct): string | null {
  const ids = product.categoryIds;
  if (ids.includes(DEUTSCH_CATEGORY_IDS.contacts)) return "contacts";
  if (ids.includes(DEUTSCH_CATEGORY_IDS.tools)) return "tools";
  if (ids.includes(DEUTSCH_CATEGORY_IDS.accessories)) return "accessories";
  return null;
}

/** Heading, schema name and meta text for a regular Deutsch contact, accessory or tool page; null keeps the bare part number. */
export function deutschCatalogueSeo(product: CatalogueProduct): { title: string; descriptor: string; description: string } | null {
  const routeType = routeTypeFor(product);
  if (!routeType) return null;
  const pn = product.name.trim();
  const d = catalogueDescriptor(product.attributes ?? {}, { pn, routeType, allowWeak: false });
  if (!d) return null;
  const title = `Deutsch ${pn}, ${d.descriptor}, for wire processing`;
  return {
    title,
    descriptor: d.descriptor,
    description: `${title}. Request a quote from Adcontact, your specialist Nordic supplier.`,
  };
}
