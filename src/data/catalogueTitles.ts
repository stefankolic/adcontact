import type { CatalogueProduct } from "@/lib/magentoCatalogue";

// One source for the descriptive part of a Deutsch contact / accessory / tool
// title ("Size 16 Pin Contact", "DT Series, 3-Way Wedgelock", "Front Seal DT06-3S").
// Used by the outlet pages (outletSeo.ts) and by every regular Deutsch catalogue
// page in the Accessories, Contacts and Tools categories, so both read the same.
// Facts come from the catalogue specifications and from Stefan's naming rules
// (spec-first); when nothing reliable is known the caller keeps the bare part number.

export const DEUTSCH_CATEGORY_IDS = { accessories: 121, contacts: 122, tools: 123 } as const;

const has = (v: unknown): v is string => typeof v === "string" && v.trim() !== "" && v.trim() !== "-";
const cap = (w: string) => (/^[a-z]/.test(w) ? w[0].toUpperCase() + w.slice(1) : w);
const single = (v: unknown): string => (has(v) && !v.includes(",") ? v.trim() : "");

/** "DT Series, DTM Series" gives "DT/DTM Series"; one series stays as it is; more than four are left out. */
function seriesLabel(v: unknown): string {
  if (!has(v)) return "";
  const parts = v.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 1) return parts[0];
  if (parts.length > 4) return "";
  return parts.map((p) => p.replace(/\s*Series$/i, "")).join("/") + " Series";
}

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

// Number of ways: from the part number where Deutsch encodes it (DT12P, WM-2SB, WB-60SD),
// otherwise the catalogue cavity count when the part number carries the same number
// (WB-48PD says 15 cavities but is a 48-way part).
function waysFor(pn: string, a: Record<string, string>, pattern: RegExp): string {
  const fromName = pn.match(pattern)?.[1];
  if (fromName) return fromName;
  const cav = single(a["No. of cavities"]);
  return /^\d+$/.test(cav) && new RegExp(`(?<!\\d)${cav}(?!\\d)`).test(pn) ? cav : "";
}

const DT_WAYS = /^DT[MPV]?(\d+)[SP]/i;
const WEDGE_NAME = /^W[BMPV]?-?(\d+)[A-Z]*(?:-|$)/i;

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
  const isTool = routeType === "tools";
  const isAccessory = routeType === "accessories";
  const isConnector = /connectors/.test(routeType);
  const done = (descriptor: string, basis: string, connector = false, feedText = ""): CatalogueDescriptor => ({ descriptor, basis, connector, feedText });
  const sf = (a["Special Features"] ?? "").trim();
  const series = seriesLabel(a["Series"]);
  const color = single(a["Color"]);

  if (isContact && has(a["Holds Pin/Socket"]) && has(a["Contact Size"])) {
    return done(`Size ${a["Contact Size"]} ${a["Holds Pin/Socket"]} Contact`, "Contact size and pin/socket from the catalogue specifications");
  }
  if (isConnector && has(a["No. of cavities"]) && (has(a["Holds Pin/Socket"]) || has(a["Connector Style"]))) {
    const type = has(a["Holds Pin/Socket"]) ? a["Holds Pin/Socket"] : a["Connector Style"];
    const seriesRaw = has(a["Series"]) ? a["Series"] : "";
    return done(
      [seriesRaw, `${a["No. of cavities"]}-Way ${type}`].filter(Boolean).join(", "),
      "Series, cavities and pin/socket from the catalogue specifications",
      true,
      `${pn}, ${seriesRaw ? seriesRaw + ", " : ""}${a["No. of cavities"]}-way, ${type.toLowerCase()} connector`,
    );
  }
  if (has(a["Accessory Type"])) {
    return done(
      [a["Accessory Type"], has(a["Contact Size"]) ? `Size ${a["Contact Size"]}` : "", has(a["Color"]) ? a["Color"] : ""].filter(Boolean).join(", "),
      "Accessory type, size and colour from the catalogue specifications",
    );
  }
  if (note) return done(tidyNote(note), "Text from the outlet stock sheet (the catalogue has no descriptive specification)");

  // Stefan's naming rules (2026-09-27): GKT in the name is a gasket, BT is a boot adapter,
  // W... is a wedgelock (W2SA-P012 = A-coded P012 version of the DT wedgelock W2S).
  if (isAccessory && /GKT/i.test(pn)) {
    const ways = waysFor(pn, a, DT_WAYS);
    return done([series, `${ways ? ways + "-Way " : ""}Gasket`].filter(Boolean).join(", "), "Name rule: GKT is a gasket; series and ways from the catalogue");
  }
  if (isAccessory && /BT/i.test(pn)) {
    const ways = waysFor(pn, a, DT_WAYS);
    const enhanced = /Enhanced overlap/i.test(sf) ? "Enhanced Overlap" : "";
    return done([series, `${ways ? ways + "-Way " : ""}Boot Adapter`, color, enhanced].filter(Boolean).join(", "), "Name rule: BT is a boot adapter; series, ways and colour from the catalogue");
  }
  if (isAccessory && (a["Wedgelock"] === "y" || WEDGE_NAME.test(pn))) {
    const ways = waysFor(pn, a, WEDGE_NAME);
    const key = a["keyed"]?.match(/^Yes,\s*([A-D])\s*key$/i)?.[1]?.toUpperCase();
    const j1939 = /J1939/i.test(a["keyed"] ?? "");
    const kind = /LED Wedgelock/i.test(sf) ? "LED Wedgelock for DT Detector" : "Wedgelock";
    const noun = `${ways ? ways + "-Way " : ""}${key ? key + "-Coded " : ""}${j1939 ? "J1939 " : ""}${kind}`;
    return done([series, noun, /P012/i.test(pn) ? "P012 version" : ""].filter(Boolean).join(", "), "Name rule and catalogue: wedgelock, key coding, P012 version, series and ways");
  }

  // Item names the catalogue text states outright.
  const seal = sf.match(/^Seal,\s*(front|internal),\s*(enhanced,\s*)?(.+?)\*?\s*$/i);
  if (seal) return done(`${seal[2] ? "Enhanced " : ""}${cap(seal[1].toLowerCase())} Seal ${seal[3].trim()}`, "Seal text from the catalogue specifications");
  if (isTool) {
    const size = single(a["Contact Size"]) || sf.match(/sz\.\s*(\d+)/i)?.[1] || "";
    const sz = size ? `Size ${size}` : "";
    if (/^Stamped and Formed die$/i.test(sf)) return done(["Stamped and Formed Die", sz].filter(Boolean).join(", "), "Special Features text: stamped and formed die");
    if (/^Hand\b/i.test(sf)) return done(["Hand Crimp Tool", sz].filter(Boolean).join(", "), "Special Features text: hand tool for crimp contacts (pattern, please confirm)");
    const punch = sf.match(/^Tool,\s*(\d+)\s*shell D-hole punch$/i);
    if (punch) return done(`D-Hole Punch, ${punch[1]} Shell`, "Special Features text: D-hole punch");
    if (/^Tool,\s*draw stud for D-hole punches$/i.test(sf)) return done("Draw Stud for D-Hole Punches", "Special Features text: draw stud");
    const gauge = sf.match(/^Go-No-Go for (.+)$/i);
    if (gauge) return done(`Go-No-Go Gauge for ${gauge[1].trim()}`, "Special Features text: Go-No-Go gauge");
  }
  if (isAccessory) {
    if (/^Strain relief for jacketed cable$/i.test(sf)) return done(["Strain Relief for Jacketed Cable", series].filter(Boolean).join(", "), "Special Features text: strain relief");
    if (/^Cable clamp$/i.test(sf)) return done("Cable Clamp", "Special Features text: cable clamp");
    if (/^Vibration Dampener$/i.test(sf)) return done("Vibration Dampener", "Special Features text: vibration dampener");
    if (/sealing plug/i.test(sf)) {
      const size = sf.match(/sz\.\s*(\d+)/i)?.[1];
      return done([/^Locking/i.test(sf) ? "Locking Sealing Plug" : "Sealing Plug", size ? `Size ${size}` : ""].filter(Boolean).join(", "), "Special Features text: sealing plug");
    }
  }
  if (a["Replacement Parts"] === "y") {
    const size = single(a["Contact Size"]);
    return done(["Tool Replacement Part", size ? `Size ${size}` : ""].filter(Boolean).join(", "), "Replacement-part flag and contact size from the catalogue specifications");
  }

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
export function deutschCatalogueSeo(product: CatalogueProduct): { title: string; descriptor: string; description: string; basis: string } | null {
  const routeType = routeTypeFor(product);
  if (!routeType) return null;
  const pn = product.name.trim();
  const d = catalogueDescriptor(product.attributes ?? {}, { pn, routeType, allowWeak: false });
  if (!d) return null;
  const title = `Deutsch ${pn}, ${d.descriptor}, for wire processing`;
  return {
    title,
    descriptor: d.descriptor,
    basis: d.basis,
    description: `${title}. Request a quote from Adcontact, your specialist Nordic supplier.`,
  };
}
