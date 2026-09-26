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

// 05xx parts: the catalogue cavity count, else the two digits Deutsch puts at the start of the last number block
// (0528-003-3805 is a 38-way part); "00" means none.
function waysFor05(pn: string, a: Record<string, string>): string {
  const cav = single(a["No. of cavities"]);
  if (/^\d+$/.test(cav)) return cav;
  const m = pn.match(/-(\d{2})\d{2}$/);
  return m && m[1] !== "00" ? String(Number(m[1])) : "";
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
  const sf = (a["Special Features"] ?? "").replace(/&deg;?/g, "°").trim();
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

  // Families Stefan identified from his own review (2026-09-27): HDC = dust cap, 0513 = internal seal (DRC/AEC),
  // 0515 = wire router, 0528 = backshell (DRC), HD18-00x = 180 degree backshell (HD10), 1011-0xx/1xx DT-family
  // receptacle parts = seal retainer.
  const shortSf = sf && sf.length <= 20 && !/^Requires/i.test(sf) ? sf : "";
  if (isAccessory && /^HDC/i.test(pn)) {
    const ways = single(a["No. of cavities"]);
    return done([series, `${/^\d+$/.test(ways) ? ways + "-Way " : ""}Dust Cap`, color].filter(Boolean).join(", "), "Family rule (Stefan): HDC is a dust cap; series, ways and colour from the catalogue");
  }
  if (isAccessory && /^0513-/.test(pn)) {
    const ways = waysFor05(pn, a);
    return done([series, `${ways ? ways + "-Way " : ""}Internal Seal`].filter(Boolean).join(", "), "Family rule (Stefan): 0513 is an internal seal for DRC; series and ways from the catalogue");
  }
  if (isAccessory && /^0515-/.test(pn)) {
    const ways = waysFor05(pn, a);
    return done([series, `${ways ? ways + "-Way " : ""}Wire Router`, color, /^Non-env\. sealed$/i.test(sf) ? "Non-Env. Sealed" : ""].filter(Boolean).join(", "), "Family rule (Stefan): 0515 is a wire router for DRC; series, ways and colour from the catalogue");
  }
  if (isAccessory && /^0528-/.test(pn)) {
    const ways = waysFor05(pn, a);
    return done([series, `${ways ? ways + "-Way " : ""}Backshell`, color, shortSf].filter(Boolean).join(", "), "Family rule (Stefan): 0528 is a backshell for DRC; series, ways and colour from the catalogue");
  }
  if (isAccessory && /^HD18-\d{3}$/i.test(pn)) {
    const ways = single(a["No. of cavities"]);
    return done([series, `${/^\d+$/.test(ways) ? ways + "-Way " : ""}Backshell`, "180°", color].filter(Boolean).join(", "), "Family rule (Stefan): HD18-00x is a 180 degree backshell for HD10");
  }
  if (isAccessory && /^1011-[01]\d\d-/.test(pn) && /^Receptacle$/i.test(a["Connector Style"] ?? "") && !sf && waysFor05(pn, a)) {
    return done([series, `${waysFor05(pn, a)}-Way Receptacle Seal Retainer`, color].filter(Boolean).join(", "), "Family rule (Stefan, from two answers): 1011-0xx/1xx receptacle parts with a way count are seal retainers");
  }

  // Part families described in Stefan's notes (2026-09-27, from TE/TME/Mouser/Dalroad product guide and Google AI text, so
  // marked "please confirm" in the review sheet): 1028 and tubing adapters = backshell, 2428 = HDP20 backshell,
  // 1027 = metal mounting bracket, M902 = HD10 strain relief. AMPSEAL is parked and left alone.
  const amp = /AMPSEAL/i.test(a["Series"] ?? "");
  const angle = /^90\s*°/i.test(sf) ? "90°" : /^180\s*°/i.test(sf) ? "180°" : /^Straight/i.test(sf) ? "Straight" : "";
  const shell = (a["Shell Size"] ?? "").match(/(\d+)/)?.[1];
  const usedWith = sf.match(/used with (L\d+)/i)?.[1];
  if (isAccessory && !amp && /^1028-/.test(pn) && /adapter/i.test(sf)) {
    return done([series, `${angle ? angle + " " : ""}Backshell Adapter`].filter(Boolean).join(", "), "Family rule (Stefan's notes): 1028 is a backshell / cable holder; the text says adapter");
  }
  if (isAccessory && !amp && (/^1028-/.test(pn) || /tubing/i.test(sf))) {
    const tube = sf.match(/NW ([\d.]+)(?: and NW ([\d.]+))? tubing/i);
    const ways = waysFor05(pn, a);
    return done(
      [series, `${ways ? ways + "-Way " : ""}Backshell`, angle, tube ? `NW ${tube[1]}${tube[2] ? " and NW " + tube[2] : ""} Tubing` : ""].filter(Boolean).join(", "),
      "Family rule (Stefan's notes): 1028 and parts whose text names conduit tubing are backshells / cable holders",
    );
  }
  if (isAccessory && !amp && /^2428-/.test(pn)) {
    return done([series, `${shell ? "Size " + shell + " " : ""}Backshell`, angle, usedWith ? `Used with ${usedWith}` : ""].filter(Boolean).join(", "), "Family rule (Stefan's notes): 2428 is a backshell for HDP20 (shell size and modification code from the catalogue)");
  }
  if (isAccessory && !amp && /^1027-/.test(pn)) {
    const cav = single(a["No. of cavities"]);
    const material = has(a["Material"]) ? a["Material"].split(" ").map(cap).join(" ") + " " : "";
    const hole = sf.match(/^(\.\d+) O\.D\. hole/i)?.[1];
    return done(
      [series, `${/^\d+$/.test(cav) ? cav + "-Way " : ""}${material}Mounting Bracket`, /^Zinc$/i.test(color) ? "Zinc" : "", hole ? `${hole} O.D. Hole` : ""].filter(Boolean).join(", "),
      "Family rule (Stefan's notes): 1027 is a metal mounting bracket; material, colour and hole size from the catalogue",
    );
  }
  if (isAccessory && !amp && /^M902-/i.test(pn)) {
    const cav = single(a["No. of cavities"]);
    return done(
      [series, `${/^\d+$/.test(cav) ? cav + "-Way " : ""}Strain Relief`, shell ? `Size ${shell}` : "", usedWith ? `Used with ${usedWith}` : ""].filter(Boolean).join(", "),
      "Family rule (Stefan's notes): M902 is a strain relief / compression nut for HD10; series, ways and shell size from the catalogue",
    );
  }

  // Part families labelled by Stefan in the review workbook (2026-09-27). Each rule keeps to what he wrote and adds series,
  // ways, size and colour from the catalogue. AMPSEAL stays out.
  if (isAccessory && !amp) {
    const cav = /^\d+$/.test(single(a["No. of cavities"])) ? single(a["No. of cavities"]) : "";
    const cavWay = cav ? `${cav}-Way ` : "";
    const sizeShell = shell ? `Size ${shell} ` : "";
    const blockSize = String(Number(pn.match(/-(\d{2})\d{2}$/)?.[1] ?? "0") || "");
    const env = /^Non-env\. sealed$/i.test(sf) ? "Non-Env. Sealed" : /^Env\. sealed/i.test(sf) ? "Env. Sealed" : "";
    const style = single(a["Connector Style"]);
    const metal = /^metal$/i.test(a["Material"] ?? "") ? "" : has(a["Material"]) ? a["Material"].split(" ").map(cap).join(" ") + " " : "";
    const fam = (parts: string[], why: string) => done(parts.filter(Boolean).join(", "), `Family label (Stefan): ${why}`);
    if (/^1011-0(26|30)-/.test(pn)) return fam([series, "Mounting Clip", color], "1011-026 and -030 are mounting clips for DT/DTM/DTP PCB connectors");
    const n1011 = Number(pn.match(/^1011-(\d{3})-/)?.[1] ?? "0");
    if (n1011 >= 227 && n1011 <= 250) {
      const ways = waysFor05(pn, a);
      return fam([series, `${ways ? ways + "-Way " : ""}${style ? style + " " : ""}Backshell`, n1011 <= 229 ? "180°" : "", color], "1011-227 to -250 are DT backshells (180° stated for 227-229)");
    }
    if (/^1013-/.test(pn)) return fam([series, `${cavWay || (waysFor05(pn, a) ? waysFor05(pn, a) + "-Way " : "")}Silicone Seal`, color], "1013 is an environmental seal (orange silicone, receptacle)");
    if (/^DT[MP]?\d+[SP]-DC/i.test(pn)) {
      const ways = waysFor(pn, a, DT_WAYS);
      return fam([series, `${ways ? ways + "-Way " : ""}Protective Cover`, color], "-DC is a protective cover");
    }
    if (/^11\d{4}-90$/.test(pn)) return fam([series, `${sizeShell}Panel Nut`, color], "112263-90 is a panel nut for HD30 receptacles");
    if (/^11\d{4}$/.test(pn)) return fam([series, `${sizeShell}Sealing Plug`, color], "the digits-only 11xxxx parts are sealing plugs");
    if (/^0526-/.test(pn)) return fam([series, `${cavWay}Retaining Bolt`], "0526 is a retaining bolt for DRC");
    if (/^SRK-BS-/.test(pn)) return fam([series, "Backshell", /-90-/.test(pn) ? "90°" : /-ST-/.test(pn) ? "Straight" : "", has(a["Shell Size"]) ? a["Shell Size"].split(" ").map(cap).join(" ") : ""], "SRK-BS is a STRIKE backshell");
    if (/^WHDS-/.test(pn)) return fam([series, `${sizeShell}${metal}Strain Relief`], "WHDS is a steel strain relief for HD30");
    if (/^0413-/.test(pn)) return fam([series, /^Locking/i.test(sf) ? "Locking Sealing Plug" : "Sealing Plug", blockSize ? `Size ${blockSize}` : "", color], "0413 is a sealing plug");
    if (/^0504-/.test(pn)) return fam([series, `${cavWay}Dust Cap`, color, env], "0504 is a DRC dust cap");
    if (/^0730-/.test(pn)) return fam([series, `Size ${cav || blockSize} Coupling Ring`, color], "0730 is an HD10 coupling ring");
    if (/^0411-32[34]-/.test(pn)) return fam([series, `${sizeShell}Wire Router`], "0411-323 and -324 are wire routers for HD30/HDP20");
    if (/^0510-/.test(pn)) return fam([series, `${cavWay}Connector Seal`], "0510 is a connector seal for DRC");
    if (/^0535-/.test(pn)) return fam([series, `${metal}Connector Bolt`], "0535 is a connector bolt for DRC");
    if (/^16-04\d{3}$/.test(pn)) return fam([series, `${sizeShell}${metal}Receptacle Gasket`], "16-04xxx is a receptacle gasket for HD30/HDP20");
    if (/^2411-/.test(pn)) return fam([series, `${sizeShell}Nut`, color, "PPS"], "2411 is a PPS nut for HDP");
    if (/^2414-/.test(pn)) return fam([series, `${sizeShell}${/^Curved$/i.test(sf) ? "Curved " : ""}Steel Lockwasher`], "2414 is a steel lockwasher for HDP");
    if (/^3315-/.test(pn)) return fam([series, `${cavWay}Protective Cover`, color, env], "3315 is a DRB protective cover");
    if (/^5004-/.test(pn)) return fam([series, "Dust Cap", color, /^Screws included$/i.test(sf) ? "Screws Included" : ""], "5004 is an HD30 dust cap");
    const lan = sf.match(/^Steel,\s*(\d+\/\d+)\D*x\s*(\d+)"/i);
    if (/^L47N-/.test(pn) && lan) return fam([series, "Steel Lanyard", `${lan[1]}" x ${lan[2]}"`, "Nylon Coated"], "L47N is a nylon-coated steel lanyard");
    if (/^JDL/.test(pn)) return fam([series, "Rubber Lanyard"], "JDL is a rubber lanyard for HD10");
    if (/^0410-/.test(pn)) return fam([series || "HD30 Series", "Cavity Reducer", metal.trim(), color], "0410 is a silicone rubber cavity reducer for HD30");
    if (/^0514-/.test(pn)) return fam([series, "Mounting Washer"], "0514 is a mounting washer");
    if (/^CN\d+$/.test(pn)) return fam([series, `${sizeShell}Cap Nut`, usedWith ? `Used with ${usedWith}` : ""], "CN is a cap nut for HDP20");
    if (/^SRN\d+$/.test(pn)) return fam([series, `${sizeShell}Backshell Sealing Ring`, usedWith ? `Used with ${usedWith}` : ""], "SRN is a backshell sealing ring for HDP20");
  }
  if (isTool && /^HDP-400$/i.test(pn)) return done("Pneumatic Hand Crimping Tool", "Family label (Stefan): HDP-400 is a pneumatic, interchangeable hand crimping tool");

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
    if (/^Cable clamp$/i.test(sf)) return done(["Cable Clamp", series].filter(Boolean).join(", "), "Special Features text: cable clamp; series from the catalogue");
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
