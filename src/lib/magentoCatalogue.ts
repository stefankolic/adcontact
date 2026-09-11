import categoriesJson from "@/data/generated/magento-catalogue/categories.json";
import productsJson from "@/data/generated/magento-catalogue/products.json";
import routesJson from "@/data/generated/magento-catalogue/routes.json";

export type CatalogueRoute = {
  type: "product" | "category";
  id: number;
};

export type CatalogueFile = {
  id: number;
  name: string | null;
  filename: string | null;
  path: string | null;
  link: string | null;
  legacyDownloadPath: string;
};

export type CatalogueProduct = {
  id: number;
  sku: string | null;
  type: string;
  name: string;
  urlPath: string | null;
  route: string | null;
  brand: string | null;
  manufacturer: string | null;
  manufacturerId: number | null;
  status: "enabled" | "disabled";
  visibility: number;
  image: string | null;
  smallImage: string | null;
  thumbnail: string | null;
  gallery: string[];
  description: string | null;
  shortDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  price: number | null;
  specialPrice: number | null;
  categoryIds: number[];
  files: CatalogueFile[];
  attributes: Record<string, string>;
  routes: string[];
};

export type CatalogueCategory = {
  id: number;
  parentId: number;
  path: string;
  position: number;
  level: number;
  name: string | null;
  urlPath: string | null;
  route: string | null;
  image: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  includeInMenu: boolean;
  productIds: number[];
  children: number[];
};

export type CatalogueSearchParams = Record<string, string | string[] | undefined>;

export type CatalogueFilterFacet = {
  label: string;
  param: string;
  values: Array<{
    value: string;
    count: number;
    active: boolean;
  }>;
};

const routes = routesJson as unknown as Record<string, CatalogueRoute>;
const products = productsJson as unknown as Record<string, CatalogueProduct>;
const categories = categoriesJson as unknown as Record<string, CatalogueCategory>;

// ── Synthetic brand landings ────────────────────────────────────────────────
// A handful of represented brands have NO Magento products (they're lean
// partner landings, not catalogue hubs), so they're not in the imported
// catalogue data. Inject a product-less category under their menu parent so
// the menu box, page and breadcrumbs all resolve normally.
function injectSyntheticCategory(opts: {
  id: number;
  parentId: number;
  name: string;
  route: string;
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
}): void {
  const parent = categories[String(opts.parentId)];
  categories[String(opts.id)] = {
    id: opts.id,
    parentId: opts.parentId,
    path: parent ? `${parent.path}/${opts.id}` : String(opts.id),
    position: 20,
    level: parent ? parent.level + 1 : 3,
    name: opts.name,
    urlPath: opts.urlPath,
    route: opts.route,
    image: null,
    description: null,
    metaTitle: opts.metaTitle,
    metaDescription: opts.metaDescription,
    isActive: true,
    includeInMenu: true,
    productIds: [],
    children: [],
  };
  routes[opts.route] = { type: "category", id: opts.id };
  if (parent && !parent.children.includes(opts.id)) {
    parent.children = [...parent.children, opts.id];
  }
}

// JDD Tech — under Heat Shrink Tubing (4). Page is a dedicated component
// (JDDTechPage.tsx, mirroring ZFerrulesPage.tsx), special-cased by this id in
// webshop/[...path]/page.tsx.
export const JDD_TECH_CATEGORY_ID = 90001;
injectSyntheticCategory({
  id: JDD_TECH_CATEGORY_ID,
  parentId: 4,
  name: "JDD Tech",
  route: "/webshop/components/heat-shrinkable/jdd-tech.html",
  urlPath: "components/heat-shrinkable/jdd-tech",
  metaTitle: "JDD Tech | Cable Protection, Sleeving & Conduit",
  metaDescription:
    "JDD Tech braided sleeving, spiral wrap, textile sleeve, conduit and heat-shrink products at Adcontact. Specialist Nordic distributor. Request a quote with expert technical support.",
});

// Cable Handling Equipment — a NEW top-level Production Equipment menu section
// (44), since Ramatech's range (dereeling, coiling, stacking, reel racks,
// winding, rewinding) doesn't fit any existing category. Single-brand hub for
// now (renders as a 1-box brand-box landing, matching Heat Shrink -> HongShang).
export const CABLE_HANDLING_CATEGORY_ID = 90003;
injectSyntheticCategory({
  id: CABLE_HANDLING_CATEGORY_ID,
  parentId: 44,
  name: "Cable Handling Equipment",
  route: "/webshop/production-equipment/cable-handling-equipment.html",
  urlPath: "production-equipment/cable-handling-equipment",
  metaTitle: "Cable Handling Equipment | Adcontact",
  metaDescription:
    "Cable handling and processing equipment at Adcontact. Specialist Nordic distributor. Request a quote with expert technical support.",
});

// Ramatech — under Cable Handling Equipment (90003); also listed under Cutting
// Machines and Stripping Machines in navigation.ts (same href, Tekuwa/Metzner-
// style multi-listing, since Ramatech also makes cutting/stripping machines).
export const RAMATECH_CATEGORY_ID = 90004;
injectSyntheticCategory({
  id: RAMATECH_CATEGORY_ID,
  parentId: CABLE_HANDLING_CATEGORY_ID,
  name: "Ramatech",
  route: "/webshop/production-equipment/cable-handling-equipment/ramatech.html",
  urlPath: "production-equipment/cable-handling-equipment/ramatech",
  metaTitle: "Ramatech Systems | Cable Handling & Processing Machines",
  metaDescription:
    "Ramatech cable feeding, storage, rewinding, winding, cutting and stripping machines at Adcontact. Specialist Nordic distributor. Request a quote with expert technical support.",
});

const LEGACY_ROUTE_ALIASES: Record<string, string> = {
  "/webshop/components/contact-pieces-for-pcb.html":
    "/webshop/components/sealed-connectors/vogt/contact-pieces-for-pcb-soldering-tags.html",
};
const HIDDEN_FILTER_ATTRIBUTES = new Set([
  "Apply MAP",
  "Availability",
  "Display Actual Price",
  "Enable Recurring Profile",
  "Finishing Ni",
  "Purchase currency",
]);

export function normalizeCataloguePath(path: string): string {
  const withoutOrigin = path.replace(/^https?:\/\/[^/]+/i, "");
  const cleanPath = withoutOrigin.split("?")[0].split("#")[0] || "/";
  return `/${cleanPath.replace(/^\/+/, "").replace(/\/+/g, "/")}`;
}

export function webshopPathFromSegments(segments: string[]): string {
  return normalizeCataloguePath(`/webshop/${segments.join("/")}`);
}

export function resolveCatalogueRoute(path: string): CatalogueRoute | undefined {
  const normalizedPath = normalizeCataloguePath(path);
  // Canonical URL overrides (renamed product / category) resolve to their target.
  for (const [id, canonical] of Object.entries(PRODUCT_CANONICAL_ROUTES)) {
    if (normalizeCataloguePath(canonical) === normalizedPath) {
      return { type: "product", id: Number(id) };
    }
  }
  for (const [id, canonical] of Object.entries(CATEGORY_CANONICAL_ROUTES)) {
    if (normalizeCataloguePath(canonical) === normalizedPath) {
      return { type: "category", id: Number(id) };
    }
  }
  return (
    routes[normalizedPath] ??
    routes[LEGACY_ROUTE_ALIASES[normalizedPath]] ??
    routes[legacyNumberedCategoryAlias(normalizedPath)]
  );
}

function legacyNumberedCategoryAlias(path: string) {
  return path
    .replace("/for-hole-1-3mm-3.html", "/for-hole-1-3mm-4209.html")
    .replace("/for-hole-1-3mm-4.html", "/for-hole-1-3mm-4210.html")
    .replace("/insulating-spacers-227/", "/insulating-spacers-4209/")
    .replace("/insulating-spacers-227.html", "/insulating-spacers-4209.html")
    .replace("/insulating-spacers-228.html", "/insulating-spacers-4210.html")
    .replace("/clamping-straps-116.html", "/clamping-straps-2105.html");
}

// Category subtrees temporarily removed from the live site but PRESERVED in the
// data — routes.json, categories and products are left untouched. To re-post a
// category later, just remove its ids here and restore its menu entry in
// navigation.ts; nothing else needs rebuilding.
//
// Currently hidden:
// - the "Misc. Equipment" tree (hub 75) — Shrink Tunnel (49), Twist Equipment
//   (54), Taping (55), Komax (112), DSG Canusa (113), Bundling/Insulating/
//   Marking (1724) — plus every product that lives ONLY there.
// - Komax (supplier we no longer represent): its equipment category hubs
//   crimping (108), stripping (1678), full-automatic (99), marking (103), and
//   the two Komax machine categories under Stocko terminating technology
//   (Komax Alpha 356 = 222, Komax ZETA 633 = 223). All have 0 enabled products.
// - Test & Quality sub-brands we no longer represent (all products disabled, but
//   their hub URLs were still reachable): Electrical Testers (78), Cirris (114),
//   TSK (1674) and the empty Mechanical Pull Testers (79). The parent Test &
//   Quality hub (76) is KEPT and repurposed as the "Test equipment" / Mav page.
export const HIDDEN_CATEGORY_IDS = new Set<number>([
  75, 49, 54, 55, 112, 113, 1724,
  99, 103, 108, 1678, 222, 223,
  // 79 (Mechanical Pull Testers) is repurposed as the Mav Prüftechnik leaf page
  // under the Test equipment brand-box hub — kept visible.
  78, 114, 1674,
]);

// Individual products hidden from the live site but kept in the data (reversible
// — remove the id to bring one back). Currently: the EOL Branson welding
// machines we no longer feature; the Branson welding hub keeps only the 2032S
// Wire Splicer (22940) and the Ultraseal20 Metal Tube Sealer (22944).
export const HIDDEN_PRODUCT_IDS = new Set<number>([
  22941, 22942, 22943, 22945,
  // Ulmer machines no longer on their live cutting catalogue
  // (ulmer-gmbh.net/produkte-loesungen/schneiden/) — kept only the 6 current
  // "touch" models: SM 15 2PT, SG400, SG400 V, WSM 30 E, WSM 60 E, SSM 60.
  21522, 21523, 22878, 22925, 22920, 22922, 22923, 22924,
]);

// Curated per-product overrides (reversible). Applied in getCatalogueProduct so
// they flow to the grid card, detail page and search. `image` also updates
// smallImage/thumbnail/gallery.
const GMX_W1_ROUTE = "/webshop/production-equipment/ultrasonic-welding/branson-gmx-w1.html";
const ULTRASEAL20_ROUTE =
  "/webshop/production-equipment/ultrasonic-welding/branson-ultraseal20-metal-tube-sealer.html";
const CRIMP = "/webshop/production-equipment/crimping-equipment";
const WEZAG_ROUTE = `${CRIMP}/wezag.html`;
const WZ_30_ROUTE = `${CRIMP}/wezag/handtang-wz-30.html`;
const WZ_100_ROUTE = `${CRIMP}/wezag/handtang-wz-100.html`;
const WZ_130_ROUTE = `${CRIMP}/wezag/presshuvud-wz-130.html`;
// Feintechnik Rittmeyer (be-ri) — clean English slugs (old Swedish
// "avmantlingsmaskin-…" slugs 301-redirect here).
const FR_STRIP = "/webshop/production-equipment/stripping-machines/feintechnik-rittmyer";
const AM_ALL_ROUND_ROUTE = `${FR_STRIP}/am-all-round.html`;
const AM_STRIP_1_ROUTE = `${FR_STRIP}/am-strip-1.html`;
const AM_STRIP_2_ROUTE = `${FR_STRIP}/am-strip-2.html`;
const AM_STRIP_500_ROUTE = `${FR_STRIP}/am-strip-500-750-1000.html`;

// Canonical URL per product: the product page 301-redirects any other route
// that resolves to this product to the canonical one, and resolveCatalogueRoute
// makes the canonical path resolve.
export const PRODUCT_CANONICAL_ROUTES: Record<number, string> = {
  22940: GMX_W1_ROUTE,
  22944: ULTRASEAL20_ROUTE, // consolidate the /branson/ duplicate slug
  1817: WZ_30_ROUTE, // Wezag WZ tools moved out of the legacy /stocko/ path
  1818: WZ_100_ROUTE,
  1819: WZ_130_ROUTE,
  1780: AM_ALL_ROUND_ROUTE, // be-ri: Swedish slugs -> clean English
  1781: AM_STRIP_1_ROUTE,
  1782: AM_STRIP_2_ROUTE,
  1783: AM_STRIP_500_ROUTE,
};

// Same idea for a renamed CATEGORY hub: resolveCatalogueRoute makes the new path
// resolve, getCatalogueCategory serves the category with its route rewritten, and
// the page 301-redirects the old path. To rename a category URL, add it here.
export const CATEGORY_CANONICAL_ROUTES: Record<number, string> = {
  110: WEZAG_ROUTE, // legacy "Stocko" crimping hub -> Wezag
  // Test equipment brand-box hub (76) links to Mav's own leaf page; repurpose
  // the empty "Mechanical Pull Testers" category (79) as that Mav leaf.
  79: "/webshop/production-equipment/test-quality/mav.html",
  // "Stripping and crimping machines" menu hub has no native category; host its
  // Mecal + Z+F brand boxes on the repurposed "Stripper Crimper Units" cat (48).
  48: "/webshop/production-equipment/stripping-and-crimping-machines.html",
  // Legacy raw Magento grid pages for Z&F stripping/crimping equipment, no
  // longer linked from the menu (superseded by the wire-processing landing)
  // but still resolving by direct URL. Redirect both to that landing.
  105: "/products/zoller-frohlich/wire-processing", // old Stripping Machines > Z&F grid (6 products)
  109: "/products/zoller-frohlich/wire-processing", // old Crimping equipment > Z&F grid (27 products)
};

type ProductOverride = Partial<
  Pick<CatalogueProduct, "name" | "sku" | "shortDescription" | "description" | "route" | "routes">
> & { image?: string; attributes?: Record<string, string> };
export const PRODUCT_OVERRIDES: Record<number, ProductOverride> = {
  // HDP24-24-18SE-L017 had no real photo (no_photo placeholder); Stefan supplied one.
  3465: { image: "/media/featured-products/hdp24-24-18se-l017.webp" },
  // The Branson 2032S slot is presented as the current Branson GMX-W1 wire splicer.
  22940: {
    name: "Branson GMX-W1 Wire Splicer",
    sku: "Branson GMX-W1",
    image: "/media/branson/wire-splicer.webp",
    route: GMX_W1_ROUTE,
    routes: [GMX_W1_ROUTE],
    shortDescription:
      "The Branson GMX-W1 joins wires reliably and quickly while providing maximum maneuverability. A user-friendly HMI and portable, ergonomic design make it easy to use as either an in-line or tabletop system. This product is designed for copper wire harness, although other materials may be possible upon testing and qualification.",
  },
  // Ultraseal20 keeps its name (still a current Branson product); we only
  // consolidate its URL and give it the clean overview.
  22944: {
    route: ULTRASEAL20_ROUTE,
    routes: [ULTRASEAL20_ROUTE],
    shortDescription:
      "Ultraseal ultrasonic systems hermetically seal copper and aluminum tubes. A one-step operation crimps, seals and cuts off charged tubes in under one second. Systems are suited to automation for high levels of efficiency and productivity.",
  },
  // Wezag WZ hand tools — link under the renamed /wezag/ path. The legacy
  // "Crimping equipment Brands" attribute reads "Stocko"; re-label it "Wezag" so
  // the brand-page filter box shows "Wezag" (it's hidden on the parent hub).
  1817: { route: WZ_30_ROUTE, routes: [WZ_30_ROUTE], attributes: { "Crimping equipment Brands": "Wezag" } },
  1818: { route: WZ_100_ROUTE, routes: [WZ_100_ROUTE], attributes: { "Crimping equipment Brands": "Wezag" } },
  1819: { route: WZ_130_ROUTE, routes: [WZ_130_ROUTE], attributes: { "Crimping equipment Brands": "Wezag" } },
  // Feintechnik Rittmeyer stripping machines — fix the data's "Rittmyer"
  // spelling in the brand attribute so the brand-page "Brand" filter matches
  // the corrected page title; translate the 3 Swedish names ("Avmantlingsmaskin"
  // = stripping machine) so the grid reads consistently in English.
  1780: {
    route: AM_ALL_ROUND_ROUTE,
    routes: [AM_ALL_ROUND_ROUTE],
    shortDescription:
      "AM.ALL.ROUND is a semi-automatic, electro-pneumatic rotating wire stripping machine for high-precision industrial cable processing. Its rotating blade head strips round cables from 2 to 24 mm outer diameter, with stripping lengths up to 160 mm, and up to 1000 mm in the 400 / 750 / 1000 variants.",
    attributes: { "Stripping machine Brands": "Feintechnik Rittmeyer" },
  },
  1781: {
    name: "Stripping Machine AM.STRIP.1",
    route: AM_STRIP_1_ROUTE,
    routes: [AM_STRIP_1_ROUTE],
    shortDescription:
      "AM.STRIP.1 is a pneumatic, semi-automatic wire stripping machine for industrial cable processing. It strips round cables up to 12.5 mm outer diameter and flat cables up to 20 mm wide, with full-stroke stripping lengths up to 65 mm. AM.STRIP.1 and AM.STRIP.2 differ only in stripping diameter and length.",
    attributes: { "Stripping machine Brands": "Feintechnik Rittmeyer" },
  },
  1782: {
    name: "Stripping Machine AM.STRIP.2",
    route: AM_STRIP_2_ROUTE,
    routes: [AM_STRIP_2_ROUTE],
    shortDescription:
      "AM.STRIP.2 is a pneumatic, semi-automatic wire stripping machine for industrial cable processing. It strips round cables up to 25 mm outer diameter and flat cables up to 35 mm wide, with full-stroke stripping lengths up to 120 mm.",
    attributes: { "Stripping machine Brands": "Feintechnik Rittmeyer" },
  },
  1783: {
    name: "Stripping Machine AM.STRIP.500/.750/.1000",
    route: AM_STRIP_500_ROUTE,
    routes: [AM_STRIP_500_ROUTE],
    shortDescription:
      "AM.STRIP.500 / .750 / .1000 are powerful pneumatic, semi-automatic bench machines for industrial stripping of cables up to 30 mm outer diameter and flat cables up to 32 mm wide. Full stripping lengths reach 500, 750 or 1000 mm depending on the model.",
    attributes: { "Stripping machine Brands": "Feintechnik Rittmeyer" },
  },
  // Ulmer cutting machines — English overview drawn from our own product copy.
  21524: {
    shortDescription:
      "The SM 15 2PT is a universal, servo-driven cutting machine with an industrial touchscreen that stores product data for secure, reproducible cutting. It processes a wide range of materials, from foils, shrink tubing and fabric to insulation, wires and round cables, and is extendable up to a full production line.",
  },
  22916: {
    shortDescription:
      "The SG 400 is a belt-fed cutting machine designed for large cables and lateral cuts. It processes multi-conductor cables up to 26 mm outer diameter and lateral cuts up to 150 mm², and can also cut hose to length with the appropriate blade.",
  },
  22917: {
    shortDescription:
      "The SG 400 V is a servo-driven cutting machine for large cables and cross-sections. It cuts dimensionally stable hoses up to 30 mm outer diameter and cables up to 200 mm² (Cu stranded), with a PLC control and optional PC cable-assembly software.",
  },
  22918: {
    shortDescription:
      "The WSM 30 E is a rotary corrugated-tube cutting machine for non-slitted corrugated tubes from 7 to 32 mm outer diameter. The blades rotate continuously around the tube to cut cleanly at the specified length, with an optional longitudinal slitting unit.",
  },
  22919: {
    shortDescription:
      "The WSM 60 E is a rotary corrugated-tube cutting machine for non-slitted corrugated tubes from 7 to 60 mm outer diameter. The blades rotate continuously around the tube to cut cleanly at the specified length, with an optional longitudinal slitting unit.",
  },
  22921: {
    shortDescription:
      "The SSM 60 is a guillotine hose cutting machine for closed and slitted corrugated tube, PVC, rubber and other hoses up to 60 mm outer diameter. Its 45° fixed blade delivers a precise cutting angle and high cut quality.",
  },
  // Junquan JQ-6100 digital cutting machine — overview + name from its own copy.
  1831: {
    name: "JQ-6100 Digital Cutting Machine",
    shortDescription:
      "The Junquan JQ-6100 is a compact digital cutting machine for fast, high-precision cutting to length, suitable for a wide range of flexible and metallic materials.",
  },
};

// Structured Features + Specifications for the product page, shown as two
// side-by-side boxes. Specifications mirror the manufacturer verbatim; features
// are drawn only from the manufacturer's description/spec facts.
export const PRODUCT_PRESENTATIONS: Record<
  number,
  { features: string[]; specifications: { label: string; value: string }[] }
> = {
  22940: {
    features: [
      'User-friendly HMI with 22" capacitive touch screen',
      "Portable, ergonomic design for in-line or tabletop use",
      "Integrated Cutter Module",
      "USB and Ethernet data interfaces",
      "Designed for copper wire harness joining",
    ],
    specifications: [
      { label: "Frequency", value: "20 kHz" },
      { label: "Output power", value: "4000 W" },
      { label: "Actuation", value: "Pneumatic" },
      { label: "Cooling system", value: "Air" },
      { label: "Pneumatics type", value: "5.5 bar (80 psi) clean, dry air" },
      { label: "Special feature", value: "Cutter Module" },
      { label: "User interface", value: '22" capacitive touch screen' },
      { label: "Data interface", value: "USB, Ethernet" },
      { label: "Input power", value: "200~230V single phase, 25A max" },
      { label: "Overall dimensions", value: '6.7" (W) x 7.9" (H) x 19.9" (L)' },
    ],
  },
  22944: {
    // Branson publishes no public spec table for the Ultraseal20 (datasheet
    // only) — features drawn from their description; specifications on request.
    features: [
      "Hermetically seals copper and aluminum tubes",
      "One-step operation that crimps, seals and cuts off charged tubes",
      "Completes each seal in under one second",
      "Suited to automation for high efficiency and productivity",
    ],
    specifications: [],
  },
  // Feintechnik Rittmeyer (be-ri) — features + specs verified against each
  // product's page on rittmeyer-beri.de (no invented values).
  1780: {
    features: [
      "Rotating blade head",
      "No blade change needed when using flat blades",
      "Brief setup times",
      "Sensor triggering",
      "Progressively adjustable cable diameter and clamping force",
      "Die blades and prismatic (special) blades",
      'Optional "Cutting-only" and "Automatic reset" modules',
    ],
    specifications: [
      { label: "Outer diameter", value: "2.0 to 24.0 mm (0.08 to 0.95 in)" },
      { label: "Stripping length (rotating blades)", value: "5.0 to 160.0 mm (0.2 to 6.3 in)" },
      { label: "Partial stroke", value: "5.0 to 160.0 mm (0.2 to 6.3 in)" },
      { label: "Drive", value: "Electro-pneumatic" },
      { label: "Blade head", value: "Rotating" },
      { label: "Variants", value: "AM.ALL.ROUND 400 / 750 / 1000 (up to 400 / 750 / 1000 mm)" },
    ],
  },
  1781: {
    features: [
      "Pneumatic, semi-automatic operation",
      "Strips round cables and flat cables",
      "Full-stroke and partial-stroke stripping",
      "Optional slitting device for flat cables",
      "Optional special blade heads for graduated / 2-step processing",
      "Optional stripping stop rod and stroke limitation for partial stripping",
      "Optional pneumatic sensor",
    ],
    specifications: [
      { label: "Outer diameter", value: "1.0 to 12.5 mm (0.04 to 0.46 in)" },
      { label: "Flat cable", value: "up to 20.0 mm (0.79 in) wide" },
      { label: "Stripping length (full stroke)", value: "up to 65.0 mm (2.56 in)" },
      { label: "Partial stroke", value: "up to 250 mm (9.84 in)" },
      { label: "Drive", value: "Pneumatic" },
    ],
  },
  1782: {
    features: [
      "Pneumatic, semi-automatic operation",
      "Strips round cables and flat cables",
      "Full-stroke and partial-stroke stripping",
      "Optional slitting device for flat cables",
      "Optional special blade heads for graduated / 2-step processing",
      "Optional stripping stop rod and stroke limitation for partial stripping",
      "Optional pneumatic sensor and emergency stop",
    ],
    specifications: [
      { label: "Outer diameter", value: "1.0 to 25.0 mm (0.04 to 0.99 in)" },
      { label: "Flat cable", value: "up to 35.0 mm (1.38 in) wide" },
      { label: "Stripping length (full stroke)", value: "up to 120.0 mm (4.73 in)" },
      { label: "Drive", value: "Pneumatic" },
    ],
  },
  1783: {
    features: [
      "Powerful pneumatic, semi-automatic bench machine",
      "Long stripping lengths of 500 / 750 / 1000 mm depending on model",
      "Strips round cables and flat cables",
      "Optional stroke limit for faster work with short stripping lengths",
    ],
    specifications: [
      { label: "Stripping Ø", value: "up to 30.0 mm (1.18 in)" },
      { label: "Flat cable", value: "up to 32.0 mm (1.26 in)" },
      { label: "Stripping length (full stroke)", value: "up to 500 / 750 / 1000 mm (.500 / .750 / .1000)" },
      { label: "Partial stroke", value: "up to 500 mm (19.7 in)" },
      { label: "Drive", value: "Pneumatic" },
    ],
  },
  // Ulmer cutting machines — features + specs extracted from our own English
  // product copy (specs from the SM 15 2PT spec table and each machine's text).
  21524: {
    features: [
      "Stores product data for reproducible cutting",
      "Industrial touchscreen, easy to operate",
      "Powerful servo drive for exact positioning",
      "Processes foil, shrink tubing, fabric, insulation, wires and round cables",
      "Cuts wire up to 70 mm²",
      "Synchronised upper and lower toothed-belt feed",
      "Optional multi-lane infeed guide and monitoring / cutting units",
      "Extendable up to a full production line (SM15 / SM30 series)",
    ],
    specifications: [
      { label: "Cutting range width", value: "150 mm" },
      { label: "Cutting range height", value: "15 mm (30 mm centre)" },
      { label: "Max wire cross-section", value: "70 mm²" },
      { label: "Accuracy", value: "0.1 mm" },
      { label: "Feed speed", value: "1 m/sec" },
      { label: "Pulling force", value: "up to 20 kg" },
      { label: "Drive", value: "Servo" },
      { label: "Power supply", value: "230 V / 50 to 60 Hz / 16 A" },
      { label: "Air supply", value: "6 bar (87 psi)" },
      { label: "Dimensions (L / W / H)", value: "670 / 430 / 570 mm" },
      { label: "Weight", value: "60 kg" },
    ],
  },
  22916: {
    features: [
      "Designed for large cables and lateral cuts",
      "Powerful belt feeder for exact positioning",
      "Optional hose cutting blade to cut hose to length",
      "Mechanical upper-belt limit for pressure-sensitive products",
      "Control panel mounted on top for easy access",
      "Cutting head pulls out for maintenance",
    ],
    specifications: [
      { label: "Max cable outer diameter", value: "26 mm" },
      { label: "Max lateral cut", value: "150 mm²" },
      { label: "Feed", value: "Belt" },
      { label: "Materials", value: "Multi-conductor cable, hose (optional)" },
    ],
  },
  22917: {
    features: [
      "Developed for large cables and cross-sections",
      "Two-belt feed with product-specific belt coatings",
      "Powerful, efficient servo drive",
      "Mechanical feed-path limit for pressure-sensitive materials",
      "Extendable cutting head for quick knife and guide changes",
      "PLC control: length and quantity, product-specific parameters, printing units, error detection",
      "Optional PC with cable-assembly software and barcode input",
    ],
    specifications: [
      { label: "Max hose outer diameter", value: "30 mm" },
      { label: "Max cable cross-section", value: "200 mm² (Cu stranded)" },
      { label: "Drive", value: "Servo" },
      { label: "Control", value: "PLC (optional PC software)" },
      { label: "Feed", value: "Two-belt" },
    ],
  },
  22918: {
    features: [
      "Cuts non-slitted corrugated tubes in rotation mode",
      "Optional slitting unit for longitudinal slitting",
      "Telescopic cutting head",
      "Laser light barrier for positioning",
      "Guide nozzles and blade sets for 3 tube diameters (customer-specified)",
      "Supplementary accessories for special forms",
    ],
    specifications: [
      { label: "Corrugated tube outer diameter", value: "7 to 32 mm" },
      { label: "Material", value: "Non-slitted corrugated tube" },
      { label: "Cutting mode", value: "Rotary" },
      { label: "Positioning", value: "Laser light barrier" },
      { label: "Cutting head", value: "Telescopic" },
    ],
  },
  22919: {
    features: [
      "Cuts non-slitted corrugated tubes in rotation mode",
      "Optional slitting unit for longitudinal slitting",
      "Telescopic cutting head",
      "Laser light barrier for positioning",
      "Guide nozzles and blade sets for 3 tube diameters (customer-specified)",
      "Supplementary accessories for special forms",
    ],
    specifications: [
      { label: "Corrugated tube outer diameter", value: "7 to 60 mm" },
      { label: "Material", value: "Non-slitted corrugated tube" },
      { label: "Cutting mode", value: "Rotary" },
      { label: "Positioning", value: "Laser light barrier" },
      { label: "Cutting head", value: "Telescopic" },
    ],
  },
  22921: {
    features: [
      "Cuts closed and slitted corrugated tube, PVC, rubber and other hoses",
      "Guillotine cut with blade fixed at 45° for a precise angle",
      "High cut quality",
      "Compact control unit monitoring all relevant machine data",
      "Powerful feed for accurate positioning",
    ],
    specifications: [
      { label: "Max hose outer diameter", value: "60 mm" },
      { label: "Cut type", value: "Guillotine (45° fixed blade)" },
      { label: "Materials", value: "Corrugated tube, PVC, rubber hose" },
      { label: "Control", value: "Compact control unit" },
    ],
  },
  // Junquan JQ-6100 — from the product's own description/spec table.
  1831: {
    features: [
      "High speed with precise digital control for cutting a wide range of materials, including vinyl, hose, shrink tube, wire, film, copper and tinplate.",
      "Accepts an external signal input, with various warning messages and alarm functions.",
      "Maximum cutting width of 100 mm.",
      "CE approved.",
    ],
    specifications: [
      { label: "Model", value: "JQ-6100" },
      { label: "Dimensions", value: "W 350 x D 250 x H 320 mm" },
      { label: "Weight", value: "25 kg" },
      { label: "Power supply", value: "AC 220 V" },
      { label: "Max. cutting width", value: "100 mm" },
      { label: "Cutting length", value: "1 to 99,999 mm" },
      { label: "Cutting speed", value: "100 pcs/min at L=100 mm" },
    ],
  },
};

// A product is hidden only when EVERY category it belongs to is hidden, so a
// product also filed under a visible category still surfaces there.
function productIsInHiddenTreeOnly(product: CatalogueProduct): boolean {
  const cats = product.categoryIds ?? [];
  return cats.length > 0 && cats.every((id) => HIDDEN_CATEGORY_IDS.has(Number(id)));
}

// Disabled products (status !== "enabled") are excluded everywhere they could
// render: detail pages 404, lookups skip them, listings already filtered. These
// are mostly dropped-supplier equipment we no longer represent and must not
// surface anywhere on the live site. Products inside a hidden category tree are
// suppressed the same way.
export function getCatalogueProduct(id: number | string): CatalogueProduct | undefined {
  const product = products[String(id)];
  if (!product || product.status !== "enabled") return undefined;
  if (HIDDEN_PRODUCT_IDS.has(Number(product.id))) return undefined;
  if (productIsInHiddenTreeOnly(product)) return undefined;
  const override = PRODUCT_OVERRIDES[Number(product.id)];
  if (override) {
    const merged = { ...product, ...override };
    if (override.attributes) {
      // Merge (not replace) so only the named attributes are overridden.
      merged.attributes = { ...product.attributes, ...override.attributes };
    }
    if (override.image) {
      merged.image = override.image;
      merged.smallImage = override.image;
      merged.thumbnail = override.image;
      merged.gallery = [override.image];
    }
    return merged;
  }
  return product;
}

export function getAllCatalogueProducts(): CatalogueProduct[] {
  return Object.values(products).filter(
    (product) =>
      product.status === "enabled" &&
      !HIDDEN_PRODUCT_IDS.has(Number(product.id)) &&
      !productIsInHiddenTreeOnly(product),
  );
}

// A route has a duplicate segment when the same category slug repeats in its
// path (e.g. ".../fuse-holder/fuse-holders/fuse-holder/..."). That shape only
// exists because the underlying Magento category tree has literally-duplicate
// nested categories (found 2026-09-11 for HTP: categories 1038, 1588 and 1589
// are ALL named "Fuse Holder", nested three deep inside each other) — it's a
// data-corruption artifact, never a genuinely more specific/correct URL.
//
// Segments are compared after stripping a trailing "s" so a singular/plural
// pair (e.g. "fuse-holder" then "fuse-holders") counts as a repeat too, not
// just an exact match — HTP's category chain uses both forms across its
// nesting levels.
function hasDuplicateSegment(route: string): boolean {
  const segments = route.split("/").filter(Boolean);
  segments.pop(); // the product slug itself is never the problem
  const seen = new Set<string>();
  for (const segment of segments) {
    const normalized = segment.endsWith("s") ? segment.slice(0, -1) : segment;
    if (seen.has(normalized)) return true;
    seen.add(normalized);
  }
  return false;
}

// Picks the single best route out of a set of candidates that all point at
// the same product: prefer the most descriptive (deepest-nested) alias, not
// just whichever happens to come first in the array — that order isn't
// meaningful (it's whatever the original Magento export happened to discover
// first), so two products with an identical route shape could get
// inconsistent links: one showing its full category path, the other a flat
// one-segment alias for no real reason. Found 2026-09-11 comparing
// 0460-202-1631 (nested route listed first) against 1062-12-0144 (same shape
// of routes, but the flat one happened to be listed first).
//
// Filters out duplicate-segment routes first (see hasDuplicateSegment) so
// "prefer longest" can't pick a degenerate, corrupted-category route just
// because it's the longest string — found 2026-09-11 for HTP's
// FHN0-C0A5-C0A5, which was landing on ".../fuse-holder/fuse-holders/
// fuse-holder/..." instead of a real category path. Falls back to the full
// pool if every route happens to be degenerate.
//
// Shared by catalogueProductLegacyRoute (below) and CatalogueProductBrowser's
// own productHref() — those used to be two separate implementations with two
// separate "first in array order wins" bugs; fixing only one left the other
// still inconsistent (found 2026-09-11, Stefan comparing the featured-
// products link against the webshop.html browse-grid link for the same
// HTP product and getting two different, both-valid URLs).
export function preferCleanestRoute(routes: string[]): string {
  const clean = routes.filter((route) => !hasDuplicateSegment(route));
  const pool = clean.length > 0 ? clean : routes;
  return pool.reduce((longest, route) => (route.length > longest.length ? route : longest));
}

export function catalogueProductLegacyRoute(product: CatalogueProduct): string {
  const webshopRoutes = product.routes.filter((route) => route.startsWith("/webshop/"));
  if (webshopRoutes.length > 0) {
    return preferCleanestRoute(webshopRoutes);
  }
  return product.route ?? product.routes[0] ?? "#";
}

function normalizeReference(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function findCatalogueProductByReference(reference: string): CatalogueProduct | undefined {
  const needle = normalizeReference(reference);
  if (!needle) return undefined;

  return getAllCatalogueProducts().find((product) => {
    const candidates = [
      product.sku,
      product.name,
      product.attributes["Part Number"],
    ].filter(Boolean);
    return candidates.some((candidate) => normalizeReference(candidate ?? "") === needle);
  });
}

export function getCatalogueCategory(id: number | string): CatalogueCategory | undefined {
  if (HIDDEN_CATEGORY_IDS.has(Number(id))) return undefined;
  const category = categories[String(id)];
  if (!category) return undefined;
  const canonical = CATEGORY_CANONICAL_ROUTES[Number(id)];
  return canonical ? { ...category, route: canonical } : category;
}

export function getWebshopRootCategory(): CatalogueCategory | undefined {
  return getCatalogueCategory(3);
}

export function getCategoryChildren(category: CatalogueCategory): CatalogueCategory[] {
  return category.children
    .map((id) => getCatalogueCategory(id))
    .filter((child): child is CatalogueCategory => Boolean(child))
    .sort((a, b) => a.position - b.position || a.name?.localeCompare(b.name ?? "") || 0);
}

export function getCategoryProductCount(category: CatalogueCategory): number {
  const productIds = new Set(category.productIds);
  const stack = [...category.children];
  const seen = new Set<number>();

  while (stack.length > 0) {
    const id = stack.pop();
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const child = getCatalogueCategory(id);
    if (!child) continue;

    for (const productId of child.productIds) productIds.add(productId);
    stack.push(...child.children);
  }

  // Exclude individually-hidden products so the count matches the visible grid.
  return [...productIds].filter((id) => !HIDDEN_PRODUCT_IDS.has(Number(id))).length;
}

function getCategoryDescendantProductIds(category: CatalogueCategory): number[] {
  const productIds = new Set<number>();
  const stack = [...category.children];
  const seen = new Set<number>();

  while (stack.length > 0) {
    const id = stack.pop();
    if (!id || seen.has(id)) continue;
    seen.add(id);

    const child = getCatalogueCategory(id);
    if (!child) continue;

    for (const productId of child.productIds) productIds.add(productId);
    stack.push(...child.children);
  }

  return [...productIds];
}

export function getCategoryProducts(
  category: CatalogueCategory,
  limit?: number,
  options: { includeDescendantsWhenEmpty?: boolean } = {},
): CatalogueProduct[] {
  const out: CatalogueProduct[] = [];
  const productIds =
    category.productIds.length > 0 || options.includeDescendantsWhenEmpty === false
      ? category.productIds
      : getCategoryDescendantProductIds(category);

  for (const id of productIds) {
    const product = getCatalogueProduct(id);
    if (!product || product.status !== "enabled") continue;
    out.push(product);
    if (limit && out.length >= limit) break;
  }
  return out;
}

// Returns all enabled products from the category itself AND all descendants,
// deduplicated. Use this for parent categories that carry both their own
// productIds and subcategories (e.g. production-equipment hubs).
export function getCategoryAllProducts(
  category: CatalogueCategory,
  limit?: number,
): CatalogueProduct[] {
  const seen = new Set<number>();
  const out: CatalogueProduct[] = [];

  for (const id of [...category.productIds, ...getCategoryDescendantProductIds(category)]) {
    if (seen.has(id)) continue;
    seen.add(id);
    const product = getCatalogueProduct(id);
    if (!product || product.status !== "enabled") continue;
    out.push(product);
    if (limit && out.length >= limit) break;
  }
  return out;
}

function firstParamValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function filterParamFor(label: string): string {
  return `f_${label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")}`;
}

function productMatchesText(product: CatalogueProduct, query: string): boolean {
  const q = query.toLowerCase();
  return [
    product.name,
    product.sku,
    product.brand,
    product.manufacturer,
    product.shortDescription,
  ].some((value) => value?.toLowerCase().includes(q));
}

export function filterCatalogueProducts(
  productsToFilter: CatalogueProduct[],
  searchParams: CatalogueSearchParams = {},
): CatalogueProduct[] {
  const query = firstParamValue(searchParams.q)?.trim();
  const activeFilters = Object.entries(searchParams)
    .filter(([key]) => key.startsWith("f_"))
    .map(([param, rawValue]) => [param, firstParamValue(rawValue)] as const)
    .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));

  return productsToFilter.filter((product) => {
    if (query && !productMatchesText(product, query)) return false;

    for (const [param, value] of activeFilters) {
      const match = Object.entries(product.attributes).some(
        ([label, attributeValue]) =>
          filterParamFor(label) === param && attributeValue === value,
      );
      if (!match) return false;
    }

    return true;
  });
}

export function getCategoryFilterFacets(
  productsForFacets: CatalogueProduct[],
  searchParams: CatalogueSearchParams = {},
  limit = 6,
): CatalogueFilterFacet[] {
  const byAttribute = new Map<string, Map<string, number>>();

  for (const product of productsForFacets) {
    for (const [label, value] of Object.entries(product.attributes)) {
      if (!value || HIDDEN_FILTER_ATTRIBUTES.has(label)) continue;
      if (value.length > 80) continue;
      if (!byAttribute.has(label)) byAttribute.set(label, new Map());
      const values = byAttribute.get(label);
      values?.set(value, (values.get(value) ?? 0) + 1);
    }
  }

  return [...byAttribute.entries()]
    .map(([label, values]) => ({
      label,
      param: filterParamFor(label),
      values: [...values.entries()]
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8)
        .map(([value, count]) => ({
          value,
          count,
          active: firstParamValue(searchParams[filterParamFor(label)]) === value,
        })),
      totalValues: values.size,
      totalProducts: [...values.values()].reduce((sum, count) => sum + count, 0),
    }))
    .filter((facet) => facet.values.length > 1 && facet.totalValues <= 30)
    .sort((a, b) => b.totalProducts - a.totalProducts || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map(({ totalValues: _totalValues, totalProducts: _totalProducts, ...facet }) => facet);
}

export function getProductPrimaryCategory(
  product: CatalogueProduct,
): CatalogueCategory | undefined {
  for (const id of [...product.categoryIds].reverse()) {
    const category = getCatalogueCategory(id);
    if (category?.route) return category;
  }
  return product.categoryIds.map(getCatalogueCategory).find(Boolean);
}

export function getCategoryBreadcrumbs(categoryId: number): CatalogueCategory[] {
  const crumbs: CatalogueCategory[] = [];
  const seen = new Set<number>();
  let current = getCatalogueCategory(categoryId);

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    if (current.route && current.name && current.id !== categoryId && current.id > 3) {
      crumbs.unshift(current);
    }
    if (current.parentId <= 2) break;
    current = getCatalogueCategory(current.parentId);
  }

  return crumbs;
}

export function getProductBreadcrumbs(product: CatalogueProduct): CatalogueCategory[] {
  const category = getProductPrimaryCategory(product);
  return category ? [...getCategoryBreadcrumbs(category.id), category] : [];
}

// Attributes that are internal Magento bookkeeping or shown elsewhere on the page.
const HIDDEN_PRODUCT_ATTRIBUTES = new Set([
  // Internal Magento flags
  "Accessory",
  "Apply MAP",
  "Display Actual Price",
  "Enable Recurring Profile",
  "Finishing Ni",
  "Purchase currency",
  "Availability",
  // Image metadata (internal)
  "Image Label",
  "Small Image Label",
  "Thumbnail Label",
  // Redundant with the page title
  "Part Number",
  // Redundant with the brand/manufacturer header
  "Brand",
  // Relationship buckets — rendered in their own sections below the spec table
  "Accessory Type",
  "Accessories",
  "Mating Connectors",
  "Pin Connectors",
  "Socket Connectors",
  "Stamped/Formed Contacts",
  "Solid Contacts",
  "Tab Connectors",
  "Required Components",
  "Required Wedgelock",
  "Receptacle Contact Housing/Pin Contact Housing/PCB Header",
]);

export function getProductAttributeEntries(
  product: CatalogueProduct,
  limit?: number,
): Array<[string, string]> {
  const entries = Object.entries(product.attributes).filter(
    ([key, value]) => value && value !== "y" && value !== "n" && !HIDDEN_PRODUCT_ATTRIBUTES.has(key),
  );
  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

// The human-facing part number shown on product pages.
// The "Part Number" attribute holds the manufacturer/catalogue designation
// (e.g. "HDP26-24-47SE-L017"). The raw `sku` field is an internal
// Adcontact/Magento catalog number not shown on the original site.
export function productDisplaySku(product: CatalogueProduct): string {
  const partAttr = product.attributes?.["Part Number"];
  if (partAttr && partAttr !== product.name) return partAttr;
  return product.name ?? product.sku ?? `Product ${product.id}`;
}

export function getRelatedCatalogueProducts(
  product: CatalogueProduct,
  limit = 8,
): CatalogueProduct[] {
  const out: CatalogueProduct[] = [];
  const category = getProductPrimaryCategory(product);
  if (!category) return out;

  for (const id of category.productIds) {
    if (out.length >= limit) break;
    if (id === product.id) continue;
    const related = getCatalogueProduct(id);
    if (related?.status === "enabled") out.push(related);
  }

  return out;
}

export function titleForProduct(product: CatalogueProduct): string {
  return product.name ?? productDisplaySku(product);
}
