import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ArrowLeft, Boxes, Package, ArrowUpRight } from "lucide-react";
import CatalogueProductBrowser from "@/components/catalogue/CatalogueProductBrowser";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import {
  getCategoryBreadcrumbs,
  getCategoryChildren,
  getCategoryProductCount,
  getCategoryProducts,
  getCategoryAllProducts,
  getCatalogueCategory,
  getCatalogueProduct,
  resolveCatalogueRoute,
  findCatalogueProductByReference,
  RAMATECH_CATEGORY_ID,
  type CatalogueCategory,
} from "@/lib/magentoCatalogue";
import { normalizeLegacyHtml } from "@/lib/legacyHtml";
import { categoryIntro } from "@/lib/seo";
import { brands } from "@/data/brands";
import { getMenuBrandHub, type BrandBox } from "@/data/navigation";
import { deutschProducts } from "@/data/deutschConnectors";
import { featuredProducts } from "@/data/featuredProducts";
import {
  DEUTSCH_SERIES_CATEGORY_ROUTE,
  DEUTSCH_SERIES_INTRO,
  deutschSeriesByName,
  TE_CONNECTIVITY_SERIES_CATEGORY_ROUTE,
  TE_CONNECTIVITY_SERIES_INTRO,
  teConnectivitySeriesByName,
  type DeutschSeriesInfo,
} from "@/data/deutschSeries";
import {
  STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID,
  stockoSeriesCount,
  stockoConnectorSystems,
  stockoPitchOptions,
} from "@/data/stockoConnectorSystems";
import StockoSeriesBrowser from "@/components/catalogue/StockoSeriesBrowser";
import ConsentedVideo from "@/components/ConsentedVideo";

// Build a map of Magento product id → Deutsch CDN imageUrl for products that
// have no Magento image, so the category listing can show the correct thumbnail.
import type { CatalogueProduct } from "@/lib/magentoCatalogue";
function buildDeutschImageMap(products: CatalogueProduct[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const product of products) {
    // The Magento `sku` is usually a numeric internal stock code (e.g.
    // "244024-0118"), not the manufacturer part number ("HDP24-24-18SE-
    // L017") that deutschProducts is keyed by — the real part number lives
    // in the "Part Number" attribute, or falls back to `name`. Checking only
    // `sku ?? name` here silently failed to match whenever `sku` was present
    // but wasn't the part number, which is most Deutsch products (543 of
    // them, confirmed 2026-09-11 — the identical mismatch already fixed once
    // in search.ts's magentoCatalogueIndex for the same reason, e.g.
    // HDP24-24-18SE-L017 missing its photo on webshop.html's featured grid).
    const reference = String(
      product.attributes?.["Part Number"] ?? product.name ?? product.sku ?? "",
    ).toUpperCase();
    const deutsch = deutschProducts.find((d) => d.partNumber.toUpperCase() === reference);
    // Skip Magento no_photo/placeholder images so the card falls through to the
    // clean "No image available" placeholder instead of "image coming soon".
    if (deutsch?.imageUrl && !/no_photo|placeholder/i.test(deutsch.imageUrl)) {
      map[String(product.id)] = deutsch.imageUrl;
    }
  }
  return map;
}

// A URL-style slug derived from a brand's display name, so a route segment
// like "te-connectivity" resolves to the brand whose stored slug is "deutsch"
// (TE Connectivity manufactures the DEUTSCH catalogue).
function brandNameSlug(brand: (typeof brands)[number]) {
  return brand.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The current manufacturer behind a brand-named category (e.g. the "Deutsch"
// catalogue is now manufactured by TE Connectivity). Every page beneath a
// brand category should carry that brand's logo, so we walk the route from the
// deepest segment outward and return the closest brand ancestor — matching a
// segment against either the brand slug or its name-derived slug.
// A few categories are mislabelled in the legacy data — map them to the real
// manufacturer so the page shows the right brand (logo + name).
const CATEGORY_BRAND_OVERRIDES: Record<number, string> = {
  110: "wezag", // "Stocko" crimping category actually holds Wezag WZ hand tools
  106: "feintechnik-rittmeyer", // stripping-machine brand promoted as "be-ri"
  79: "mav", // "Mechanical Pull Testers" repurposed as the Mav Prüftechnik leaf
};

function brandForCategory(category: CatalogueCategory) {
  const overrideSlug = CATEGORY_BRAND_OVERRIDES[category.id];
  if (overrideSlug) {
    const overridden = brands.find((b) => b.slug === overrideSlug);
    if (overridden) return overridden;
  }
  const segments =
    category.route
      ?.split("/")
      .filter(Boolean)
      .map((segment) => segment.replace(/\.html$/, "")) ?? [];

  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i];
    const brand = brands.find(
      (b) => b.logo && (b.slug === segment || brandNameSlug(b) === segment),
    );
    if (brand) return brand;
  }
  return undefined;
}

// AMPSEAL and AMPSEAL 16 are TE Connectivity series, not part of the DEUTSCH
// series family — excluded from the DEUTSCH facets, surfaced on the TE page.
const AMPSEAL_SERIES = /^ampseal\b/i;

// Product "Series" values (DT, DTM, HDP20 …) with counts, sorted by size.
// `exclude` drops matching series (e.g. AMPSEAL from the DEUTSCH hub).
function getSeriesFacets(category: CatalogueCategory | undefined, exclude?: RegExp) {
  if (!category) return [] as Array<{ label: string; count: number }>;
  const products = getCategoryProducts(category, undefined, {
    includeDescendantsWhenEmpty: true,
  });
  const counts = new Map<string, number>();
  for (const product of products) {
    const raw = product.attributes?.["Series"];
    if (!raw) continue;
    for (const value of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (exclude && exclude.test(value)) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }));
}

// Application/brand header photos shown in the hub hero's right column — only on
// a brand's own landing page. Mirrored into our R2 (see [[cloudflare-r2-media]]).
// `fit`: "cover" fills the frame (product/application photos); "contain"
// letterboxes on the dark frame (portrait or self-framed graphics).
// `bg`: the card is white by default; "black" for graphics that ship on a black
// background so the letterbox is seamless.
type HeaderImage = { src: string; fit: "cover" | "contain"; bg?: "black" };
const BRAND_HEADER_IMAGES: Record<string, HeaderImage> = {
  deutsch: { src: "/media/brand-headers/deutsch.webp", fit: "cover" },
  vogt: { src: "/media/brand-headers/vogt.webp", fit: "cover" },
  hongshang: { src: "/media/brand-headers/hongshang.webp", fit: "cover" },
  cvilux: { src: "/media/brand-headers/cvilux.webp", fit: "cover" },
  htp: { src: "/media/brand-headers/htp.webp", fit: "contain" },
  stocko: { src: "/media/brand-headers/stocko.jpg", fit: "cover" },
  // TE's existing header art is a wide AMPSEAL info-banner, so it fits inside
  // the frame rather than filling it (swap for a product photo if one arrives).
  "te-connectivity": { src: "/media/brand-headers/te-connectivity.png", fit: "contain" },
};

// Display-title overrides for a few categories whose stored Magento name differs
// from what we want to show (menu + page H1).
const CATEGORY_TITLE_OVERRIDES: Record<number, string> = {
  77: "Plastic- and Metal Welding", // "Ultrasonic Welding"
  110: "Wezag", // legacy "Stocko" crimping category — actually Wezag WZ tools
  106: "Feintechnik Rittmeyer", // fix the data's "Rittmyer" spelling
  76: "Test equipment", // "Test & Quality" hub -> brand-box landing
  79: "Mav Prüftechnik", // Mav leaf (repurposed Mechanical Pull Testers)
  48: "Stripping and crimping machines", // repurposed "Stripper Crimper Units" hub
  4: "Heat Shrink Tubing and Protective Sleeves", // now also covers JDD Tech's sleeving/wrap/conduit range
};

// Header/intro text override (the hero paragraph). Used when a category's
// Magento metaDescription is empty/unsuitable — e.g. a rewritten partner blurb.
// Exported so generateMetadata (webshop/[...path]/page.tsx) can reuse the same
// text for the SEO <meta description>, keeping the on-page copy and the Google/
// social preview consistent instead of the page showing new copy while search
// snippets still show the old raw Magento metaDescription.
export const CATEGORY_DESCRIPTION_OVERRIDES: Record<number, string> = {
  3:
    "In our webshop you can find Industrial Components & Production Equipment from leading brands in the industry. A wide range of connectors, contacts, cutting- and stripping machines, crimping- and welding equipment and more.",
  106:
    "We supply the complete range of Feintechnik Rittmeyer wire stripping machines, marketed under the be-ri brand, for industrial cable processing. Whether you need a pneumatic, rotating or electric stripping machine, or high-precision processing of coaxial cables, we'll help you find the right solution.",
  100:
    "We supply Ulmer's precision cutting and cable-processing machines. Ulmer GmbH develops cutting, feeding, winding and material-handling systems for flexible materials across the cable, wire and tubing industries, from multi-core cables to corrugated conduits, hoses and heat-shrink tubing.",
  101:
    "Tekuwa develops and manufactures high-precision cutting and cable processing machines suitable for almost any material. Their range includes cutting-to-length machines, combined cutting and stripping systems, jacket removal equipment, automatic feeding and rewinding units, and complete production line configurations.",
  79:
    "We supply Mav Prüftechnik's pull-force and compression testing machines for quality assurance in cable and harness manufacturing. Since 1962, Mav has built manual and motorised test stations measuring tensile and compressive forces up to 10,000 N, the standard for crimp pull-force verification, all developed and produced in Germany with calibration software.",
  111:
    "Mecal, with a leading market position serving a wide range of industries, designs and manufactures applicators, bench-top presses and strip- and crimp machines. Their semi-automatic systems integrate easily into fully automatic lines or manual workstations, and are used for high-volume wire harness production, with integrated quality monitoring, applicator change systems, and pull-force testing options.",
  102:
    "We supply the complete range of Junquan fully Automatic Terminal Crimp Machines, Computerized Wire Stripping and Cutting Machines, Numerical Control Precision Press, and Digital Cutting Machines.",
  [RAMATECH_CATEGORY_ID]:
    "Ramatech Systems is one of the leading manufacturers of machines and automation solutions for wire handling and wire processing. Complete solutions for everything to do with cable feeding, storage, rewinding, winding, cutting to length and stripping. All their machines for cable processing and cable handling are designed in such a way that they can be assembled into complete production lines. You can choose from the entire product portfolio of Ramatech and the associated Metzner Group.",
};

// Subcategory filter chips that should navigate to a brand's own hub page
// instead of filtering the grid in place (equipment brands with dedicated pages).
const SUBCATEGORY_HREF_OVERRIDES: Record<number, string> = {
  109: "/products/zoller-frohlich/wire-processing", // Z+F crimping → wire-processing landing
  110: "/webshop/production-equipment/crimping-equipment/wezag.html", // Wezag → its brand page (tools + presses boxes)
  111: "/webshop/production-equipment/crimping-equipment/mecal.html", // Mecal → its hub (WIP)
};

// Header photo for hubs that don't resolve to a single brand (keyed by category
// id). Rendered in the hero's right column, same frame as BRAND_HEADER_IMAGES.
const CATEGORY_HEADER_IMAGES: Record<number, HeaderImage> = {
  77: { src: "/media/branson/hub-header.jpg", fit: "cover" }, // Branson welding hub
  115: { src: "/media/branson/hub-header.jpg", fit: "cover" }, // Branson sub-page
  // Wezag hand-crimper graphic ships on a black background — frame it black.
  110: { src: "/media/wezag/hub-header.png", fit: "contain", bg: "black" },
  // Feintechnik Rittmeyer (be-ri) — AM.ALL.ROUND machine render, contained.
  106: { src: "/media/feintechnik/hub-header.jpg", fit: "contain" },
  // Ulmer — cutting-machine mechanism close-up (fills the frame).
  100: { src: "/media/ulmer/hub-header.jpg", fit: "cover" },
  // Tekuwa — engineering/craftsmanship photo (3:2, fills the frame).
  101: { src: "/media/tekuwa/hub-header.jpg", fit: "cover" },
  // Mav Prüftechnik — KMG force-tester display (contained on the white card).
  79: { src: "/media/mav/hub-header.jpg", fit: "contain" },
  // Mecal — facility photo (wide, fills the frame).
  111: { src: "/media/mecal/hub-header.jpg", fit: "cover" },
  // Junquan — facility photo (wide, fills the frame).
  102: { src: "/media/junquan/hub-header.webp", fit: "cover" },
  // Ramatech — branded signage photo (fills the frame).
  [RAMATECH_CATEGORY_ID]: { src: "/media/ramatech/hub-header.jpg", fit: "cover" },
};

// Category-level sourcing CTA for hubs that don't resolve to a single `brand`
// (e.g. the Branson welding hub, where we redirect to the supplier's catalogue).
// Mirrors the brand "Can't find the exact part?" box.
const BRANSON_WELDING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Branson's complete ultrasonic metal- and plastic-welding programme. Tell us about your application and we'll help you find the right machine, or browse Branson's full catalogue.",
  mailtoSubject: "Branson welding: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Branson catalogue",
  catalogueUrl: "https://www.branson.emerson.com/en",
} as const;

const WEZAG_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Wezag's complete crimping-tool and machine programme, including hand tools, dies, presses and automation. Tell us about your application and we'll help you find the right tool or press, or browse Wezag's full range.",
  mailtoSubject: "Wezag crimping: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Wezag range",
  catalogueUrl: "https://www.wezag.de/en/",
} as const;

const FEINTECHNIK_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Feintechnik Rittmeyer's complete be-ri wire-stripping programme, including pneumatic, rotating and electric machines. Tell us about your application and we'll help you find the right machine, or browse their full range.",
  mailtoSubject: "Feintechnik Rittmeyer (be-ri): application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View be-ri range",
  catalogueUrl: "https://rittmeyer-beri.de/en/cable-processing/",
} as const;

const ULMER_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Ulmer's complete range of cutting and cable-processing machines. Tell us about your application and we'll help you find the right machine, or browse Ulmer's full range.",
  mailtoSubject: "Ulmer cutting machines: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Ulmer range",
  catalogueUrl: "https://www.ulmer-gmbh.net/produkte-loesungen/schneiden/",
} as const;

const TEKUWA_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Tekuwa's complete range of cutting, stripping and cable-processing machines. Tell us about your application and we'll help you find the right machine, or browse Tekuwa's full range.",
  mailtoSubject: "Tekuwa cutting & stripping: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Tekuwa range",
  catalogueUrl: "https://tekuwa.de/en/machines/",
} as const;

const MAV_SOURCING_CTA = {
  heading: "Can't find the exact test station for your application?",
  body: "We represent Mav Prüftechnik's complete range of pull-force and compression testing machines. Tell us about your application and we'll help you find the right test station, or browse Mav's full range.",
  mailtoSubject: "Mav Prüftechnik test equipment: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Mav range",
  catalogueUrl: "https://www.mav-germany.de/home.html",
} as const;

const MECAL_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Mecal's complete range of applicators, crimping presses and strip-and-crimp machines. Tell us about your application and we'll help you find the right solution, or browse Mecal's full range.",
  mailtoSubject: "Mecal crimping equipment: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Mecal range",
  catalogueUrl: "https://mecal.net/en/products/",
} as const;

const JUNQUAN_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Junquan's complete range of cutting, stripping, crimping and digital cutting machines. Tell us about your application and we'll help you find the right machine, or browse Junquan's full range.",
  mailtoSubject: "Junquan machines: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Junquan range",
  catalogueUrl: "https://www.cuttingstripping-machine.com/products.html",
} as const;

const RAMATECH_SOURCING_CTA = {
  heading: "Can't find the exact machine for your application?",
  body: "We represent Ramatech's complete range of cable handling and cable processing machines. Tell us about your application and we'll help you find the right machine, or browse Ramatech's full range.",
  mailtoSubject: "Ramatech machines: application enquiry",
  primaryLabel: "Send us your application",
  catalogueLabel: "View Ramatech range",
  catalogueUrl: "https://www.ramatech.ch/en/products/",
} as const;

const CATEGORY_SOURCING_CTA: Record<
  number,
  { heading: string; body: string; mailtoSubject: string; primaryLabel: string; catalogueLabel: string; catalogueUrl: string }
> = {
  77: BRANSON_WELDING_CTA, // Plastic- and Metal Welding hub
  115: BRANSON_WELDING_CTA, // Branson sub-page
  110: WEZAG_SOURCING_CTA, // Wezag crimping brand page
  106: FEINTECHNIK_SOURCING_CTA, // Feintechnik Rittmeyer (be-ri) stripping page
  100: ULMER_SOURCING_CTA, // Ulmer cutting brand page
  101: TEKUWA_SOURCING_CTA, // Tekuwa cutting & stripping brand page
  79: MAV_SOURCING_CTA, // Mav Prüftechnik leaf page
  111: MECAL_SOURCING_CTA, // Mecal crimping equipment brand page
  102: JUNQUAN_SOURCING_CTA, // Junquan cutting/stripping brand page
  [RAMATECH_CATEGORY_ID]: RAMATECH_SOURCING_CTA, // Ramatech cable handling brand page
};

// Presentational "link boxes" shown at the top of a hub — an image + short
// description + an outbound link to the manufacturer. Used for the Branson
// welding hub (a split by welding type) and the Wezag hub (its tool and
// machine sister-brands, which live on their own sites).
type CategoryLinkBox = {
  label: string;
  href: string;
  image: string;
  description: string[];
  ctaLabel: string;
  fit?: "cover" | "contain"; // "cover" fills the frame; "contain" for graphics
  // With "cover", anchor the crop: "left" keeps a wide graphic's left content
  // (e.g. the Deutsch headline + tool) instead of centre-cropping it away.
  position?: "left" | "center";
};
// Rendered by box count: ONE box → full-width Zoller & Fröhlich-style banner;
// two or more → the compact side-by-side Branson grid.
type CategoryLinkSection = { eyebrow: string; boxes: CategoryLinkBox[] };

// Branson: the listed machines are mostly EOL and are disregarded; both options
// point to Branson's catalogue while the final Branson presentation is decided.
const BRANSON_WELDING_TYPES: CategoryLinkBox[] = [
  {
    label: "Ultrasonic Metal welding",
    href: "https://www.branson.emerson.com/en/metal-welding",
    image: "/media/branson/metal-welding.webp",
    ctaLabel: "View at Branson",
    fit: "cover",
    description: [
      "Ultrasonic energy has been used to join metal materials for decades. In ultrasonic metal welding, dissimilar materials are joined together without the use of applied heat or electric current passing through components.",
      "Ultrasonic energy can weld through contaminants to create a clean seal while providing increased quality and control.",
    ],
  },
  {
    label: "Ultrasonic Plastic welding",
    href: "https://www.branson.emerson.com/en/ultrasonic-plastic-welding",
    image: "/media/branson/plastic-welding.webp",
    ctaLabel: "View at Branson",
    fit: "cover",
    description: [
      "Ultrasonic energy has been used to join thermoplastics for over 70 years. It is frequently chosen when parts are too complex or expensive to be molded in one piece.",
      "In ultrasonic plastic welding, a vibratory motion at the horn face (amplitude) is transferred to the part. The vibrations move through the part and create friction at the interface between the parts, creating heat, then melting. When cooled, a weld is formed.",
    ],
  },
];

// Wezag: the "Stocko" crimping category actually holds Wezag WZ hand tools. Its
// wider tool and machine ranges live on Wezag's sister-brand sites — Private
// Label Tools (hand tools) and WDT Machines (presses/automation).
const WEZAG_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Hand crimping tools",
    href: "https://www.private-label-tools.de/en/tools/",
    image: "/media/wezag/tools-crimp.png",
    ctaLabel: "View at Private Label Tools",
    fit: "cover",
    description: [
      "Private Label Tools is Wezag's hand-tool brand, offering professional crimping tools with interchangeable die sets for repeatable, high-quality crimps.",
      "Dies available for Deutsch DT & DTM and many other connector systems.",
    ],
  },
  {
    label: "Crimping presses & machines",
    href: "https://www.wdt-machines.de/en/wdt-crimping-machines/",
    image: "/media/wezag/presses.png",
    ctaLabel: "View at WDT Machines",
    fit: "cover",
    description: [
      "WDT Machines is Wezag's machine brand, offering pneumatic and electro-pneumatic crimping presses and automation for cable assembly.",
      "Optimised for small to medium series in low- and high-voltage production, with the same Wezag crimp quality.",
    ],
  },
];

// Feintechnik Rittmeyer (be-ri) — a single link box on pneumatic stripping,
// linking to be-ri's own catalogue. Copy supplied by the customer.
const FEINTECHNIK_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Wire stripping machines",
    href: "https://rittmeyer-beri.de/en/cable-processing/",
    image: "/media/feintechnik/pneumatic.jpg",
    ctaLabel: "View at be-ri",
    fit: "cover",
    description: [
      "Wire stripping machines for industrial purposes.",
      "Whether you are looking for a pneumatic wire stripping machine, a rotating wire stripping machine, an electric wire stripping machine, or you are interested in high-precision processing of coaxial cables.",
    ],
  },
];

// Ulmer — a single link box on their cutting machines. Copy supplied by the
// customer (Ulmer's own description).
const ULMER_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "High-precision cutting machines",
    href: "https://www.ulmer-gmbh.net/produkte-loesungen/schneiden/",
    image: "/media/ulmer/cutting.jpg",
    ctaLabel: "View at Ulmer",
    fit: "cover",
    description: [
      "Our high-precision cutting machines offer maximum versatility and efficiency for a wide variety of materials, from multi-core cables and stranded wires to heat shrink tubing and hoses, and even corrugated conduits.",
      "Our systems guarantee clean cut edges, consistently reproducible lengths, and a smooth production process. Thanks to their modular design, our machines can be quickly adapted to new material types and cross-sections.",
    ],
  },
];

// Tekuwa — a lean page with two boxes (cutting + stripping). Copy supplied by
// the customer (Tekuwa's own descriptions).
const TEKUWA_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Cutting & length-cutting machines",
    href: "https://tekuwa.de/en/cutting-lengthing/",
    image: "/media/tekuwa/cutting.webp",
    ctaLabel: "View at Tekuwa",
    fit: "cover",
    description: [
      "As standard, Tekuwa's cable cutting and length-cutting machines already meet a wide range of requirements. They cut simple cables, multi-core cables, data cables or flat cables as well as wires, hoses, tubes, ropes made of silicone, rubber, plastic, metal or textile.",
    ],
  },
  {
    label: "Stripping machines",
    href: "https://tekuwa.de/en/lengthing-and-stripping/",
    image: "/media/tekuwa/stripping.jpg",
    ctaLabel: "View at Tekuwa",
    fit: "cover",
    description: [
      "Tekuwa's electropneumatic stripping machines provide and ensures that the fine inner conductors are never damaged, whether the jacket is robust, thick, flexible, smooth or flat.",
    ],
  },
];

// Mav Prüftechnik — two boxes (manual + motorized force testers). Copy supplied
// by the customer (Mav's own descriptions).
const MAV_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Manual force testers",
    href: "https://www.mav-germany.de/Products/Manual-Devices/manual-devices.html",
    image: "/media/mav/manual.jpg",
    ctaLabel: "View at Mav",
    fit: "cover",
    description: [
      "Manually operated MAV-testers provide a fast and inexpensive option to carry out pull-off force tests with loads up to 1,000 N.",
    ],
  },
  {
    label: "Motorized force testers",
    href: "https://www.mav-germany.de/Products/Motorized-Devices/motorized-devices.html",
    image: "/media/mav/motorized.jpg",
    ctaLabel: "View at Mav",
    fit: "cover",
    description: [
      "Motorized MAV-force testers are a reliable way to determine tensile and compressive forces up to 10,000 N due to their constant testing speeds.",
    ],
  },
];

// Mecal — a lean page with three boxes (applicators, crimping machines, strip &
// crimp). Copy supplied by the customer (Mecal's own descriptions). Square
// product shots on white → "contain" so the whole machine shows.
const MECAL_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Applicators",
    href: "https://mecal.net/en/products/applicators/",
    image: "/media/mecal/applicators.jpg",
    ctaLabel: "View at Mecal",
    fit: "contain",
    description: [
      "We supply their complete range of applicators for linked terminals on a reel. It can be supplied either with a continuous or a fourpad regulating head and it's fitted with a non-resettable 7-digit cycle counter, and with both cams either for terminal feeding on upstroke or downstroke. An applicator from Mecal can be fitted to any stand alone crimping bench-top press or a fully automatic machine configuration.",
    ],
  },
  {
    label: "Crimping machines",
    href: "https://mecal.net/en/products/crimping-machines/",
    image: "/media/mecal/crimping.jpg",
    ctaLabel: "View at Mecal",
    fit: "contain",
    description: [
      "We supply their complete range of crimping machine for manufacturers seeking reliability and simplicity in production. It ensures precise and consistent crimps on electrical terminals, even in high-intensity cycles. It's compact and robust, and integrates easily into automatic lines or manual workstations, offering safety and excellent visibility. Its versatility allows customization and the use of numerous accessories to meet diverse production requirements.",
    ],
  },
  {
    label: "Stripping and crimping machines",
    href: "https://mecal.net/en/products/strip-and-crimp/",
    image: "/media/mecal/strip-crimp.jpg",
    ctaLabel: "View at Mecal",
    fit: "contain",
    description: [
      "We supply their complete range of Stripping and crimping machines. Ideal solution for precise single-wire processing. It integrates linear stripping and crimping in a fully programmable cycle, ensuring high repeatability and maximum flexibility. Perfect for versatile production, multi-core cables and applications requiring fast changeovers and full process control.",
    ],
  },
];

// Junquan — a single link box (renders as the full-width banner). Copy supplied
// by the customer (Junquan's own description; "Juanquan" typo corrected).
const JUNQUAN_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Wire cutting and stripping machines",
    href: "https://www.cuttingstripping-machine.com/products.html",
    image: "/media/junquan/machines.webp",
    ctaLabel: "View at Junquan",
    fit: "cover",
    description: [
      "Junquan Automation has been working on exploring computerized wire cutting and stripping machines for twenty years. With high precision and working speed and comprehensive in functions, the products are widely used in wire processing Industry, such as the electronics and electrical appliance Industry.",
    ],
  },
];

// Ramatech — seven boxes, the core distinct machine lines from ramatech.ch's
// own product menu (skips "Peripheral devices" and "Customized solutions",
// which are catch-all/accessory pages, not distinct machine types). Images
// mirrored to R2; card copy summarised from ramatech.ch's own product pages
// (2026-07-12).
const RAMATECH_LINK_BOXES: CategoryLinkBox[] = [
  {
    label: "Cable Cutting and Stripping Machines",
    href: "https://www.ramatech.ch/en/products/cable-cutting-and-stripping-machines/",
    image: "/media/ramatech/cutting-stripping.png",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Powerful, flexible and precise machines for cutting cables to length and stripping insulation, processing cables from 3 to 40 mm in diameter through user-friendly software.",
    ],
  },
  {
    label: "Cable Dereeler",
    href: "https://www.ramatech.ch/en/products/cable-dereeler/",
    image: "/media/ramatech/dereeler.jpg",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Automated feeding systems that unwind and feed cable into production lines, adapting unwinding speed to downstream processing for drums up to 1,600 mm diameter and 2 tonnes.",
    ],
  },
  {
    label: "Cable Coiling Machines",
    href: "https://www.ramatech.ch/en/products/cable-coiling-machines/",
    image: "/media/ramatech/coiling.png",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Ring coiling machines that automatically wind cut and stripped cable into compact rings up to 35 mm diameter, with versions that wind, bind and automatically eject the finished coil.",
    ],
  },
  {
    label: "Cable Stackers",
    href: "https://www.ramatech.ch/en/products/cable-stackers/",
    image: "/media/ramatech/stackers.jpg",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Deposit cut-to-length cable pieces precisely and sorted after processing, complementing automatic wire processing equipment for cable sections up to 12,000 mm.",
    ],
  },
  {
    label: "Cable Reel Rack Systems",
    href: "https://www.ramatech.ch/en/products/cable-reel-rack-systems/",
    image: "/media/ramatech/reel-rack-systems.jpg",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Storage systems ranging from passive frames to fully automated solutions, combining storage and production space and reducing material handling by up to 80 percent compared to traditional methods.",
    ],
  },
  {
    label: "Cable Winding Machines",
    href: "https://www.ramatech.ch/en/products/cable-winding-machines/",
    image: "/media/ramatech/winding.jpg",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Rewinding systems for unwinding, rewinding and coiling cable across diverse applications, customisable to combine high quality standards with safety for specific production requirements.",
    ],
  },
  {
    label: "Mobile Cable Rewinders",
    href: "https://www.ramatech.ch/en/products/mobile-cable-rewinders/",
    image: "/media/ramatech/mobile-rewinders.jpg",
    ctaLabel: "View at Ramatech",
    fit: "contain",
    description: [
      "Mobile winding machines with movable rollers that can be repositioned on site, unwinding cable up to 45 mm diameter, cutting to length and rewinding onto drums or rings.",
    ],
  },
];

const CATEGORY_LINK_SECTIONS: Record<number, CategoryLinkSection> = {
  77: { eyebrow: "Browse by welding type", boxes: BRANSON_WELDING_TYPES },
  115: { eyebrow: "Browse by welding type", boxes: BRANSON_WELDING_TYPES },
  110: { eyebrow: "Wezag crimping tools & presses", boxes: WEZAG_LINK_BOXES },
  106: { eyebrow: "be-ri cable processing machines", boxes: FEINTECHNIK_LINK_BOXES },
  100: { eyebrow: "Ulmer cutting machines", boxes: ULMER_LINK_BOXES },
  101: { eyebrow: "Tekuwa cutting & stripping machines", boxes: TEKUWA_LINK_BOXES },
  79: { eyebrow: "Mav force testers", boxes: MAV_LINK_BOXES },
  111: { eyebrow: "Mecal crimping equipment", boxes: MECAL_LINK_BOXES },
  102: { eyebrow: "Junquan machines", boxes: JUNQUAN_LINK_BOXES },
  [RAMATECH_CATEGORY_ID]: { eyebrow: "Ramatech cable handling & processing machines", boxes: RAMATECH_LINK_BOXES },
};

// Brand pages presented as a lean partner landing (header + link boxes +
// sourcing box) with NO product grid/filter — mirrors the Zoller & Fröhlich
// approach. Wezag (110): its catalogue products are outdated / low-volume, so we
// surface only the trusted-partner brand page.
const HIDE_PRODUCT_GRID_CATEGORY_IDS = new Set([110, 101, 79, 111, RAMATECH_CATEGORY_ID]);

// Per-page logo overrides for individual brand boxes, keyed by category id then
// by the brand box's slug (last URL segment). Scoped to one page. Connectors
// (43): the customer supplied a fresh TE tile — swap it here only, per request.
const BRAND_BOX_LOGO_OVERRIDES: Record<number, Record<string, string>> = {
  43: { "te-connectivity": "/media/brand-logos/te-connectivity.jpg" },
};

// Logo fixes applied to a brand box wherever it appears (NOT the global
// brands.ts logo). Deutsch's brands.ts logo is the shared TE mark (a latent
// bug) — show Deutsch's correct mark in every brand box so it never renders a
// TE logo. brands.ts itself is left untouched per the user.
const BRAND_BOX_LOGO_GLOBAL: Record<string, string> = {
  deutsch: "/media/wysiwyg/infortis/ultimo/category_images/Deutsch.jpg",
};

// "Browse by series" configuration for the brand hubs whose products carry a
// "Series" attribute. Each hub defines where its series live and how to
// present them.
type SeriesPageConfig = {
  target: CatalogueCategory | undefined;
  intro: string;
  seriesByName: Map<string, DeutschSeriesInfo>;
  exclude?: RegExp;
  fallbackBlurb: string;
};

function getSeriesPageConfig(
  category: CatalogueCategory,
  children: CatalogueCategory[],
): SeriesPageConfig | undefined {
  // DEUTSCH: series live in the largest child (Connectors). AMPSEAL is excluded
  // because those are TE Connectivity series.
  if (category.route === DEUTSCH_SERIES_CATEGORY_ROUTE) {
    const target = [...children].sort(
      (a, b) => getCategoryProductCount(b) - getCategoryProductCount(a),
    )[0];
    return {
      target,
      intro: DEUTSCH_SERIES_INTRO,
      seriesByName: deutschSeriesByName,
      exclude: AMPSEAL_SERIES,
      fallbackBlurb: "DEUTSCH sealed connector series.",
    };
  }
  // TE Connectivity: products (the AMPSEAL family) live directly in this category.
  if (category.route === TE_CONNECTIVITY_SERIES_CATEGORY_ROUTE) {
    return {
      target: category,
      intro: TE_CONNECTIVITY_SERIES_INTRO,
      seriesByName: teConnectivitySeriesByName,
      fallbackBlurb: "TE Connectivity sealed connector series.",
    };
  }
  return undefined;
}

type VisualLink = {
  href: string;
  title: string;
  image: string | null;
};

type DescriptionContent = {
  html: string | null;
  visualLinks: VisualLink[];
  standaloneImages: string[];
  videoEmbedSrc: string | null;
};

function magentoMediaSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return `https://www.adcontact.se${path}`;
  return path;
}

// Only match a brand when the category's own last segment is the brand slug —
// not when the brand is merely an ancestor. This prevents subcategory cards
// within a brand page (e.g. Stocko › Micro connectors) from showing the brand
// logo instead of actual product photos.
function isBrandOwnCategory(category: CatalogueCategory) {
  const route = category.route;
  if (!route) return undefined;
  const lastSegment = route
    .split("/")
    .filter(Boolean)
    .pop()
    ?.replace(/\.html$/, "") ?? "";
  return brands.find(
    (b) => b.logo && (b.slug === lastSegment || brandNameSlug(b) === lastSegment),
  );
}

type CategoryCardOverrides = {
  image?: string;
  countLabel?: string;
  hideChildren?: boolean;
};

function CategoryCard({
  category,
  overrides,
}: {
  category: CatalogueCategory;
  overrides?: CategoryCardOverrides;
}) {
  const children = getCategoryChildren(category).slice(0, 6);
  const productCount = getCategoryProductCount(category);

  // Use a curated partner logo only when the card is the brand category itself
  // (e.g. the "Stocko" card on Sealed Connectors). Subcategory cards within a
  // brand page always use product photos so the grid stays visually informative.
  const brand = isBrandOwnCategory(category);
  const representativeProduct = brand
    ? undefined
    : getCategoryProducts(category, undefined, {
        includeDescendantsWhenEmpty: true,
      }).find((p) => p.thumbnail || p.image);
  const cardImage =
    overrides?.image ??
    brand?.logo ??
    magentoMediaSrc(representativeProduct?.thumbnail ?? representativeProduct?.image) ??
    magentoMediaSrc(category.image);

  return (
    <article className="group grid min-w-0 overflow-hidden rounded-lg border border-[#d8dee7] bg-white transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)] sm:grid-cols-[132px_1fr]">
      <Link
        href={category.route ?? "#"}
        className={`relative flex min-h-32 items-center justify-center ${brand ? "bg-white" : "bg-[#f8fafc]"}`}
      >
        {cardImage ? (
          <Image
            src={cardImage}
            alt={category.name ?? "Category"}
            fill
            unoptimized
            sizes="132px"
            className={`object-contain transition-transform group-hover:scale-105 ${brand ? "p-6" : "p-4"}`}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-[#d8dee7] bg-white text-[#2563eb] shadow-sm">
            <Boxes size={27} strokeWidth={1.7} />
          </div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={category.route ?? "#"}
              className="text-lg font-bold leading-snug text-[#0a1628] group-hover:text-[#2563eb]"
            >
              {category.name ?? "Category"}
            </Link>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]">
              {overrides?.countLabel ?? `${productCount.toLocaleString()} catalogue items`}
            </p>
          </div>
          <Link
            href={category.route ?? "#"}
            className="hidden flex-none items-center gap-1.5 rounded-md border border-[#d8dee7] px-3 py-2 text-xs font-bold text-[#2563eb] transition-colors hover:border-[#93c5fd] hover:bg-[#eff6ff] sm:inline-flex"
          >
            Browse <ArrowRight size={13} />
          </Link>
        </div>

        {!overrides?.hideChildren && children.length > 0 && (
          <div className="mt-5 grid gap-2 border-t border-[#eef2f7] pt-4 sm:grid-cols-2">
            {children.map((child) => (
              <Link
                key={child.id}
                href={child.route ?? "#"}
                className="flex items-start justify-between gap-3 rounded-md bg-[#f8fafc] px-3 py-2 text-xs font-medium leading-snug text-[#475569] hover:bg-[#eff6ff] hover:text-[#2563eb]"
              >
                <span>{child.name ?? "Category"}</span>
                <span className="mt-0.5 flex-none text-[#94a3b8]">
                  {getCategoryProductCount(child).toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeEntities(
    value
      .replace(/<br\s*\/?>/gi, " / ")
      .replace(/<\/(h[1-6]|p|div)>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function firstImageSrc(value: string) {
  const match = value.match(/<img\b[^>]*\bsrc=(["'])(.*?)\1/i);
  return match?.[2] ?? null;
}

function descriptionContent(description: string | null): DescriptionContent {
  if (!description) return { html: null, visualLinks: [], standaloneImages: [], videoEmbedSrc: null };

  const normalized = normalizeLegacyHtml(description).trim();
  if (!normalized) return { html: null, visualLinks: [], standaloneImages: [], videoEmbedSrc: null };

  // Extract the first iframe embed (e.g. YouTube) and remove it from the HTML so
  // it doesn't render in the content area — it will be shown in the header instead.
  const iframeMatch = normalized.match(/<iframe\b[^>]*\bsrc=(["'])(https?:\/\/[^"']+)\1[^>]*>(?:[\s\S]*?<\/iframe>)?/i);
  const videoEmbedSrc = iframeMatch?.[2] ?? null;
  const withoutIframe = videoEmbedSrc
    ? normalized
        .replace(iframeMatch![0], "")
        // Drop a "Video" heading that was only there to label the iframe
        .replace(/<h[1-6][^>]*>\s*(?:<[^>]+>)*\s*Video\s*(?:<\/[^>]+>)*\s*<\/h[1-6]>/gi, "")
        .trim()
    : normalized;

  const visualLinks: VisualLink[] = [];
  const linkedBlocks: string[] = [];
  const linkPattern = /<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(withoutIframe))) {
    const [, , href, innerHtml] = match;
    const title = stripTags(innerHtml);
    const rawImage = firstImageSrc(innerHtml);
    // Magento template strings are already resolved to /media/... paths by normalizeLegacyHtml.
    // Stale Magento product images (/media/catalog/...) are dropped — we prefer brand logos
    // from brands.ts. BUT curated theme "category_images" (e.g.
    // /media/wysiwyg/.../category_images/HTP/M8.png) are proper per-category illustrations
    // now served from R2, so keep those as the card image.
    const image =
      !rawImage || rawImage.startsWith("{{")
        ? null
        : rawImage.includes("/category_images/")
          ? rawImage
          : rawImage.startsWith("/media/")
            ? null
            : rawImage.startsWith("/")
              ? `https://www.adcontact.se${rawImage}`
          : rawImage;
    if (!href || !title) continue;
    linkedBlocks.push(match[0]);
    visualLinks.push({ href, title, image });
  }

  const htmlWithoutLinks = linkedBlocks.reduce(
    (html, block) => html.replace(block, ""),
    withoutIframe,
  );
  const standaloneImages = [...htmlWithoutLinks.matchAll(/<img\b[^>]*\bsrc=(["'])(.*?)\1/gi)]
    .map((imageMatch) => {
      const src = imageMatch[2];
      return src?.startsWith("/") ? `https://www.adcontact.se${src}` : src;
    })
    .filter(Boolean);

  const textWithoutLinksOrImages = stripTags(htmlWithoutLinks.replace(/<img\b[^>]*>/gi, "")).trim();
  // Some Magento category descriptions are junk — a bare part number / code with
  // no spaces (e.g. "DT04-2P", "HBG", "H-2(LS)"). Those must not render as a
  // description box; a real description is prose with spaces.
  const isJunkDescription =
    textWithoutLinksOrImages.length > 0 &&
    textWithoutLinksOrImages.length < 30 &&
    !/\s/.test(textWithoutLinksOrImages);
  const shouldRenderHtml =
    visualLinks.length === 0 &&
    standaloneImages.length === 0 &&
    Boolean(textWithoutLinksOrImages) &&
    !isJunkDescription;

  return {
    html: shouldRenderHtml ? withoutIframe : null,
    visualLinks,
    standaloneImages: [...new Set(standaloneImages)],
    videoEmbedSrc,
  };
}

function CategoryVisualLinkCard({
  item,
  category,
  compact = false,
}: {
  item: VisualLink;
  category: CatalogueCategory | undefined;
  compact?: boolean;
}) {
  const productCount = category ? getCategoryProductCount(category) : null;
  const childCount = category ? getCategoryChildren(category).length : 0;
  const brand = category ? isBrandOwnCategory(category) : undefined;
  const imageSrc = item.image ?? brand?.logo ?? null;

  return (
    <Link
      href={item.href}
      className={`group grid overflow-hidden rounded-lg border border-[#d8dee7] bg-white transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)] ${compact ? "min-h-[180px]" : "min-h-[210px]"}`}
    >
      <div className={`relative flex items-center justify-center border-b border-[#eef2f7] ${compact ? "min-h-28" : "min-h-32"} ${brand ? "bg-white" : "bg-[#f8fafc]"}`}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            unoptimized
            sizes={compact ? "(max-width: 768px) 100vw, (max-width: 1280px) 25vw, 240px" : "(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 280px"}
            className={`object-contain transition-transform group-hover:scale-105 ${brand ? (compact ? "p-5" : "p-6") : (compact ? "p-3" : "p-4")}`}
          />
        ) : (
          <Boxes size={compact ? 28 : 34} strokeWidth={1.6} className="text-[#2563eb]" />
        )}
      </div>
      <div className={`flex min-w-0 flex-col ${compact ? "p-3.5" : "p-4"}`}>
        <h3 className={`font-bold leading-snug text-[#0a1628] group-hover:text-[#2563eb] ${compact ? "min-h-10 text-sm" : "min-h-11 text-base"}`}>
          {item.title}
        </h3>
        <div className={`flex items-center justify-between gap-3 border-t border-[#eef2f7] ${compact ? "mt-2.5 pt-2.5" : "mt-3 pt-3"}`}>
          <span className={`font-semibold uppercase text-[#64748b] ${compact ? "text-[11px] tracking-[0.1em]" : "text-xs tracking-[0.12em]"}`}>
            {productCount !== null
              ? `${productCount.toLocaleString()} items`
              : "Open category"}
            {childCount > 0 ? ` · ${childCount} areas` : ""}
          </span>
          <ArrowRight size={compact ? 14 : 15} className="flex-none text-[#2563eb]" />
        </div>
      </div>
    </Link>
  );
}

// A single brand box on a menu-derived hub landing: brand logo on a white
// panel + label + a footer showing the brand's catalogue-item count + arrow.
// Exported so other sections (e.g. the outlet hub/used-machines listing) can
// reuse the exact same box — same dimensions, same visual language — rather
// than hand-copy the styling and risk it drifting out of sync.
export function BrandBoxCard({
  label,
  href,
  logo,
  count,
  areas = 0,
  meta: metaOverride,
}: {
  label: string;
  href: string;
  logo?: string;
  count?: number | null;
  areas?: number;
  /** Overrides the computed "N items" footer text — for boxes that aren't
   *  brand-catalogue counts (e.g. a used machine's price). */
  meta?: string;
}) {
  const external = /^https?:\/\//.test(href);
  const meta =
    metaOverride ??
    (count != null
      ? `${count.toLocaleString()} item${count === 1 ? "" : "s"}${
          areas > 0 ? ` · ${areas} area${areas === 1 ? "" : "s"}` : ""
        }`
      : "View brand");
  const inner = (
    <>
      <div className="relative flex min-h-24 items-center justify-center border-b border-[#eef2f7] bg-white">
        {logo ? (
          <Image
            src={logo}
            alt={label}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 25vw, 220px"
            className="object-contain p-5 transition-transform group-hover:scale-105"
          />
        ) : (
          <Boxes size={30} strokeWidth={1.6} className="text-[#2563eb]" />
        )}
      </div>
      <div className="flex min-w-0 flex-col p-3.5">
        <h3 className="min-h-10 text-sm font-bold leading-snug text-[#0a1628] group-hover:text-[#2563eb] sm:text-base">
          {label}
        </h3>
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#eef2f7] pt-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b]">
            {meta}
          </span>
          <ArrowRight size={14} className="flex-none text-[#2563eb]" />
        </div>
      </div>
    </>
  );
  const className =
    "group grid min-h-[156px] overflow-hidden rounded-lg border border-[#d8dee7] bg-white transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)]";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

function ImageShowcase({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="grid gap-4 md:grid-cols-2">
        {images.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className={index === 0 && images.length > 2 ? "md:col-span-2" : ""}
          >
            <div className="relative aspect-[3/1] overflow-hidden rounded-lg border border-[#d8dee7] bg-white">
              <Image
                src={image}
                alt={`${title} ${index + 1}`}
                fill
                unoptimized
                sizes={index === 0 ? "(max-width: 1024px) 100vw, 1280px" : "(max-width: 1024px) 100vw, 640px"}
                className="object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeriesSection({
  facets,
  targetRoute,
  intro,
  seriesByName,
  fallbackBlurb,
}: {
  facets: Array<{ label: string; count: number }>;
  targetRoute: string;
  intro: string;
  seriesByName: Map<string, DeutschSeriesInfo>;
  fallbackBlurb: string;
}) {
  return (
    <section className="mb-14">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
            Product series
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#0a1628]">Browse by series</h2>
        </div>
        <span className="text-sm font-medium text-[#64748b]">
          {facets.length.toLocaleString()} series
        </span>
      </div>
      <p className="mb-6 max-w-3xl text-sm leading-6 text-[#64748b]">
        {intro}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facets.map(({ label, count }) => {
          const info = seriesByName.get(label);
          return (
            <Link
              key={label}
              href={`${targetRoute}?f_series=${encodeURIComponent(label)}`}
              className="group flex flex-col rounded-lg border border-[#d8dee7] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)]"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#eef2f7] pb-3">
                <h3 className="text-base font-bold leading-snug text-[#0a1628] group-hover:text-[#2563eb]">
                  {label}
                </h3>
                <span className="flex-none rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-bold text-[#475569]">
                  {count.toLocaleString()} {count === 1 ? "product" : "products"}
                </span>
              </div>

              {info?.features ? (
                <ul className="mt-3 flex-1 space-y-1.5">
                  {info.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex gap-2 text-xs leading-snug text-[#475569]"
                    >
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-[#93c5fd]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 flex-1 text-xs leading-snug text-[#64748b]">
                  {info?.blurb ?? fallbackBlurb}
                </p>
              )}

              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563eb]">
                View series
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Static placeholder shown while CatalogueProductBrowser (which reads the URL
// client-side) hydrates — kept minimal since real content swaps in almost
// immediately after JS loads.
function ProductBrowserFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 w-full max-w-md rounded-lg bg-[#e5e7eb]" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 rounded-lg bg-[#e5e7eb]" />
        ))}
      </div>
    </div>
  );
}

export default function CatalogueCategoryPage({
  category,
}: {
  category: CatalogueCategory;
}) {
  const isWebshopRoot = category.id === 3;
  const children = getCategoryChildren(category).filter(
    (child) => !(isWebshopRoot && child.name === "Featured Products"),
  );

  // When a category has both its own productIds AND subcategories, treat it as
  // a "flat catalogue hub": show all products (direct + descendants) in the
  // product browser with attribute filters, instead of forcing an extra click
  // through subcategory cards. This matches the legacy Magento behaviour for
  // production-equipment hubs like Crimping Equipment.
  const isFlatHub = !isWebshopRoot && category.productIds.length > 0 && children.length > 0;

  // "Descendant hub": no direct products, but a browsable set of descendant products
  // worth surfacing in a product browser rather than hiding behind deep navigation.
  // Threshold catches brand hubs like Stocko (1.2k), Cvilux (888) and Vogt (14.5k)
  // while keeping genuine mega-categories (Connectors 20k, the catalogue root) as
  // category-card drill-down pages.
  const descendantPool =
    !isWebshopRoot && !isFlatHub && category.productIds.length === 0 && children.length > 0
      ? getCategoryAllProducts(category)
      : [];
  const isDescendantHub = descendantPool.length > 0 && descendantPool.length <= 16000;

  // "Leaf of flat hub": a leaf sub-category (e.g. a brand page) whose parent is a
  // flat hub. The leaf's own products all share the same attribute value, so the
  // product browser shows no useful filters. Fix: use the parent's full product pool
  // so filter facets (brand, type, …) are available, and pre-apply this leaf's
  // distinguishing attribute value as the default filter.
  const parentCategory = !isWebshopRoot && !isFlatHub && !isDescendantHub && children.length === 0 && category.productIds.length > 0
    ? getCatalogueCategory(category.parentId)
    : undefined;
  const parentHubChildren = parentCategory ? getCategoryChildren(parentCategory) : [];
  const parentIsFlatHub = Boolean(
    parentCategory &&
    parentCategory.productIds.length > 0 &&
    parentHubChildren.length > 1,
  );
  const isLeafOfFlatHub = Boolean(parentIsFlatHub);

  const leafParentPool = isLeafOfFlatHub ? getCategoryAllProducts(parentCategory!) : [];

  // Find the attribute key/value that singles out this leaf's products within the
  // parent pool (e.g. "Crimping equipment Brands" = "Zoller & Fröhlich").
  const leafPreFilter: Record<string, string> = {};
  if (isLeafOfFlatHub && leafParentPool.length > 0) {
    const ownProducts = getCategoryProducts(category, undefined);
    outer: for (const [attr, value] of Object.entries(ownProducts[0]?.attributes ?? {})) {
      if (!value || value.length > 80) continue;
      if (!ownProducts.every((p) => p.attributes[attr] === value)) continue;
      const parentValues = new Set(leafParentPool.map((p) => p.attributes[attr]).filter(Boolean));
      if (parentValues.size > 1) {
        const param = `f_${attr.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}`;
        leafPreFilter[param] = value;
        break outer;
      }
    }
  }

  // The webshop root's "Featured product selection" shows the SAME curated
  // set as the homepage marquee (src/data/featuredProducts.ts), not the raw
  // Magento category-3 product list — those two used to be independent,
  // silently-diverging lists (Stefan flagged the mismatched counts, 2026-08-13,
  // see [[webshop-catalogue-patterns]]).
  //
  // Resolve by `fp.name` (findCatalogueProductByReference), not `fp.href` via
  // resolveCatalogueRoute — the latter only understands legacy Magento routes,
  // so it silently drops any entry whose href points at the newer
  // /products/deutsch-connectors/[slug] page instead (fell into exactly that
  // trap 2026-09-11: repointing curated Deutsch entries at their rich page
  // quietly dropped 4 of 16 from this grid, 16→12, with no error anywhere).
  // Resolving by name instead decouples "which page do we link to" from
  // "which catalogue product is this" so the two can vary independently.
  const webshopRootFeaturedPool: CatalogueProduct[] = isWebshopRoot
    ? featuredProducts
        .map((fp) => {
          const byName = findCatalogueProductByReference(fp.name);
          if (byName) return byName;
          const route = resolveCatalogueRoute(fp.href);
          if (!route || route.type !== "product") return null;
          return getCatalogueProduct(route.id) ?? null;
        })
        .filter((p): p is CatalogueProduct => p !== null)
    : [];

  const rawProductPool = isFlatHub
    ? getCategoryAllProducts(category)
    : isDescendantHub
      ? descendantPool
      : isLeafOfFlatHub
        ? leafParentPool
        : isWebshopRoot
          ? webshopRootFeaturedPool
          : getCategoryProducts(category, undefined);

  const seriesPage = getSeriesPageConfig(category, children);
  const seriesFacets = seriesPage
    ? getSeriesFacets(seriesPage.target, seriesPage.exclude)
    : [];
  const showSeries = seriesFacets.length > 1 && Boolean(seriesPage?.target?.route);

  // When the series config excludes a subset (e.g. AMPSEAL from Deutsch), drop
  // those products from the pool so they don't appear in the grid or filters.
  const productPool = seriesPage?.exclude
    ? rawProductPool.filter((p) => {
        const series = p.attributes?.["Series"];
        if (!series) return true;
        return !series.split(",").map((s) => s.trim()).some((s) => seriesPage.exclude!.test(s));
      })
    : rawProductPool;

  // Very large hubs (e.g. Vogt, 14.5k products) serialise into a multi-megabyte
  // client payload if every product carries its full 25-field shape. Above this
  // size, rebuild each product with only the ~dozen fields the browser actually
  // reads (card, search, links, subcategory filter). Attribute facets are
  // dropped, but the Category filter, name/SKU/brand search, the grid and
  // pagination keep working at a fraction of the weight. `routes` is trimmed to
  // the single category-scoped entry so product links stay correct (the bare
  // `route` is a root-level legacy URL).
  const LARGE_HUB_PRODUCT_LIMIT = 3000;
  const hubBasePath = (category.route ?? "").replace(/\.html$/, "/");
  const browserProducts =
    productPool.length > LARGE_HUB_PRODUCT_LIMIT
      ? productPool.map((p) => {
          const scoped = p.routes.filter((r) => r.startsWith(hubBasePath));
          return {
            id: p.id,
            name: p.name,
            sku: p.sku,
            brand: p.brand,
            manufacturer: p.manufacturer,
            route: p.route,
            routes: scoped.length > 0 ? [scoped[0]] : p.routes.slice(0, 1),
            image: p.image,
            thumbnail: p.thumbnail,
            categoryIds: p.categoryIds,
            shortDescription: null,
            attributes: {},
          } as unknown as CatalogueProduct;
        })
      : productPool;

  const content = descriptionContent(category.description);
  const breadcrumbs = getCategoryBreadcrumbs(category.id);
  const title = CATEGORY_TITLE_OVERRIDES[category.id] ?? category.name ?? "Catalogue";
  const categorySourcingCta = CATEGORY_SOURCING_CTA[category.id];
  const categoryLinkSection = CATEGORY_LINK_SECTIONS[category.id];
  const description = CATEGORY_DESCRIPTION_OVERRIDES[category.id] ?? category.metaDescription;
  // Keep the hero's "N catalogue items" stat in sync with the curated
  // featured pool on the webshop root (see webshopRootFeaturedPool above) —
  // otherwise the count text and the grid below it would disagree again.
  const productCount = isWebshopRoot
    ? webshopRootFeaturedPool.length
    : getCategoryProductCount(category);
  const productSectionLabel = isWebshopRoot ? "Selected products" : "Products";
  const productSectionTitle = isWebshopRoot ? "Featured product selection" : "Catalogue items";
  // Single transparent pass-through: the only child is a leaf with products and
  // no sub-categories. Clicking it would just show a flat product list anyway,
  // so skip the intermediary card and surface the products directly.
  const isSingleLeafPassthrough =
    !isWebshopRoot &&
    !isFlatHub &&
    !isDescendantHub &&
    children.length === 1 &&
    getCategoryChildren(children[0]).length === 0 &&
    getCategoryProductCount(children[0]) > 0;

  // Lean partner landing (e.g. Wezag): no product grid/filter, just header +
  // link boxes + sourcing box.
  const hideProductGrid = HIDE_PRODUCT_GRID_CATEGORY_IDS.has(category.id);
  // Menu-derived brand-box landing (see getMenuBrandHub): a category shows one
  // box per brand under it; a section root shows brands grouped by category.
  // When active it replaces the product grid, category cards and visual links.
  // Activates on every menu section/category hub; brand leaf pages keep the grid.
  // A brand hub takes precedence over a curated link-section/sourcing box on the
  // same page (both are suppressed below when brandHubActive), so a menu hub like
  // the welding category shows brand boxes while brand leaf pages keep their own
  // link-section (getMenuBrandHub returns undefined for leaf routes).
  const brandHub = getMenuBrandHub(category.route);
  const brandHubActive = Boolean(brandHub);
  const showProductBrowser = !brandHubActive && !hideProductGrid && productPool.length > 0 && (isWebshopRoot || children.length === 0 || isFlatHub || isSingleLeafPassthrough || isDescendantHub || isLeafOfFlatHub);
  // Suppress visual link cards on descendant hubs — the product browser with brand
  // filters replaces them, just like isFlatHub pages show no category cards.
  const showVisualLinks = !brandHubActive && content.visualLinks.length > 0 && !isDescendantHub;

  // When the category has exactly one child that carries no direct products but
  // itself has sub-categories, flatten one level so those sub-categories appear
  // as first-class cards instead of requiring an extra click.
  const singleEmptyChild =
    !showVisualLinks &&
    !isFlatHub &&
    !isSingleLeafPassthrough &&
    children.length === 1 &&
    getCategoryProductCount(children[0]) === 0 &&
    getCategoryChildren(children[0]).length > 0
      ? children[0]
      : undefined;
  const displayChildren = singleEmptyChild
    ? getCategoryChildren(singleEmptyChild)
    : children;
  const flattenedGroupLabel = singleEmptyChild?.name ?? null;

  const visualCategoryByHref = new Map(displayChildren.map((child) => [child.route, child]));
  // For descendant hubs filter out empty subcategories so only navigable buckets
  // appear as chips alongside the browser. Connector Systems is included even
  // though it has no Magento products, since it has its own partner content page.
  const browsableChildren = (isDescendantHub || isFlatHub)
    ? displayChildren.filter(
        (c) => getCategoryProductCount(c) > 0 || c.id === STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID,
      )
    : displayChildren;
  // Non-hub pages show category cards. Descendant hubs (e.g. Stocko) use the
  // product browser directly with subcategory options injected as a "Category"
  // filter facet — Zalando-style: grid first, filters on the left.
  const showGenericCategoryCards =
    !brandHubActive && !showVisualLinks && !isFlatHub && !isDescendantHub && !isSingleLeafPassthrough &&
    displayChildren.length > 0;

  // For descendant hubs: build subcategory filter options. Product-bearing
  // categories get filter buttons; non-product partner categories get navigation
  // links (href set) so clicking takes the user to their dedicated page.
  function getAllDescendantCategoryIds(cat: CatalogueCategory): number[] {
    const ids = [cat.id];
    for (const childId of cat.children) {
      const child = getCatalogueCategory(childId);
      if (child) ids.push(...getAllDescendantCategoryIds(child));
    }
    return ids;
  }
  const subcategoryOptions = (isDescendantHub || isFlatHub)
    ? browsableChildren
        // Connector Systems is partner-sourced (no products) — list it last,
        // after the product-backed categories like Solderless Terminals.
        .slice()
        .sort((a, b) => {
          const aPartner = a.id === STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID ? 1 : 0;
          const bPartner = b.id === STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID ? 1 : 0;
          return aPartner - bPartner;
        })
        .map((c) => {
          if (c.id === STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID) {
            return {
              id: c.id,
              // Shorten the long Magento name so the chip matches its siblings.
              name: "Connector Systems",
              count: stockoSeriesCount,
              countLabel: `${stockoSeriesCount} series`,
              allCategoryIds: [] as number[],
            };
          }
          return {
            id: c.id,
            name: CATEGORY_TITLE_OVERRIDES[c.id] ?? c.name ?? "Category",
            count: getCategoryProductCount(c),
            allCategoryIds: getAllDescendantCategoryIds(c),
            href: SUBCATEGORY_HREF_OVERRIDES[c.id],
          };
        })
    : [];

  const heroStatText = (() => {
    // Lean partner landing has no grid — don't advertise a catalogue-item count.
    if (hideProductGrid) return null;
    // Menu-derived brand-box landing: count brands, not products.
    if (brandHubActive && brandHub) {
      const slugs =
        brandHub.type === "category"
          ? brandHub.brands.map((b) => b.slug)
          : brandHub.groups.flatMap((g) => g.brands.map((b) => b.slug));
      const n = new Set(slugs).size;
      return `${n} ${n === 1 ? "brand" : "brands"}`;
    }
    const itemsPart = `${productCount.toLocaleString()} catalogue items`;
    if (showSeries) {
      return `${seriesFacets.length} series · ${itemsPart}`;
    }
    if (showVisualLinks) {
      const label = isWebshopRoot ? "categories" : "subcategories";
      return `${content.visualLinks.length.toLocaleString()} ${label} · ${itemsPart}`;
    }
    if ((isDescendantHub || isFlatHub) && subcategoryOptions.length > 0) {
      return `${subcategoryOptions.length} subcategories · ${itemsPart}`;
    }
    if (showGenericCategoryCards) {
      const label = isWebshopRoot ? "categories" : "subcategories";
      return `${displayChildren.length.toLocaleString()} ${label} · ${itemsPart}`;
    }
    return itemsPart;
  })();

  // Video embeds and standalone images are promoted to the hero right column.
  // Video takes precedence over an image when both are present.
  const { videoEmbedSrc } = content;
  const heroImageSrc = !videoEmbedSrc ? (content.standaloneImages[0] ?? null) : null;
  const remainingImages = heroImageSrc ? content.standaloneImages.slice(1) : content.standaloneImages;

  // Current manufacturer logo for brand-named categories (e.g. Deutsch → TE).
  const brand = brandForCategory(category);
  // Sourcing CTA: connector and heat-shrink brands get the bottom-of-grid block
  // (instead of the top "Go to partner shop" box). Equipment/other brands keep
  // their existing top box ("the rest").
  const showSourcingCta =
    !!brand &&
    (brand.categories.includes("connectors") || brand.categories.includes("heat-shrink"));

  // Trial: for these brands render the subcategory cards BELOW the product grid
  // with a "Browse by category" jump button, mirroring the DEUTSCH series layout.
  // Suits brands that browse by sub-category and have no "series" data. The
  // category cards markup is shared so it can render either in its usual spot or
  // below the products depending on this flag.
  const CATEGORIES_BELOW_PRODUCTS_BRANDS = new Set(["hongshang", "htp"]);
  const categoriesBelowProducts = !!brand && CATEGORIES_BELOW_PRODUCTS_BRANDS.has(brand.slug);
  // Trial (HTP): show 4 category cards per row on large screens instead of 3,
  // so each card is a bit smaller and the grid takes less vertical space.
  const fourColumnCategories = brand?.slug === "htp";
  // Is this the brand's own landing page (e.g. Hongshang), vs a descendant
  // subcategory (Thin Wall Tubing, etc.)? On the landing page the jump button
  // scrolls down to the categories; on a descendant it links back UP to the
  // landing page's category list so a visitor can "start over".
  const isBrandHome = isBrandOwnCategory(category)?.slug === brand?.slug && !!brand;
  // Brand application photo for the hero right column — only on the brand's own
  // landing page, and only if a video isn't already taking that slot.
  const brandHeaderImage =
    isBrandHome && brand && !videoEmbedSrc ? BRAND_HEADER_IMAGES[brand.slug] : undefined;
  // Brand image wins; otherwise a category-level header photo (hubs with no
  // brand). A configured category header photo is an explicit editorial choice,
  // so it also takes precedence over any auto-detected description video.
  const headerImage = brandHeaderImage ?? CATEGORY_HEADER_IMAGES[category.id];
  const brandHomeRoute =
    categoriesBelowProducts && !isBrandHome
      ? breadcrumbs.find((crumb) => {
          const seg = crumb.route?.split("/").filter(Boolean).pop()?.replace(/\.html$/, "");
          return seg === brand?.slug;
        })?.route ?? null
      : null;
  const categoryCardsBlock = (
    <>
      {showVisualLinks && (
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                Categories
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0a1628]">
                {`Browse ${title}`}
              </h2>
            </div>
            <span className="text-sm font-medium text-[#64748b]">
              {content.visualLinks.length.toLocaleString()} categories
            </span>
          </div>
          <div className={`grid gap-4 sm:grid-cols-2 ${fourColumnCategories ? "md:grid-cols-3 lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {content.visualLinks.map((item) => (
              <CategoryVisualLinkCard
                key={`${item.href}-${item.title}`}
                item={item}
                category={visualCategoryByHref.get(item.href)}
                compact={fourColumnCategories}
              />
            ))}
          </div>
        </section>
      )}

      {showGenericCategoryCards && (
        <section className="mb-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
                {flattenedGroupLabel ?? "Categories"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#0a1628]">
                {flattenedGroupLabel
                  ? `Browse ${flattenedGroupLabel}`
                  : isWebshopRoot
                    ? "Browse catalogue areas"
                    : "Browse subcategories"}
              </h2>
            </div>
            <span className="text-sm font-medium text-[#64748b]">
              {browsableChildren.length.toLocaleString()} categories
            </span>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {displayChildren.map((child) => (
              <CategoryCard key={child.id} category={child} />
            ))}
          </div>
        </section>
      )}
    </>
  );

  // Resolve a brand box's catalogue-item count (and subcategory "areas") from
  // its target category. Lean partner pages (no grid) and non-catalogue links
  // (e.g. the Z+F /products landing) show no count -> a "View brand" label.
  const brandBoxMeta = (href: string): { count: number | null; areas: number } => {
    const resolved = resolveCatalogueRoute(href);
    if (resolved?.type !== "category") return { count: null, areas: 0 };
    const cat = getCatalogueCategory(resolved.id);
    if (!cat) return { count: null, areas: 0 };
    const areas = getCategoryChildren(cat).length;
    if (HIDE_PRODUCT_GRID_CATEGORY_IDS.has(resolved.id)) return { count: null, areas };
    const count = getCategoryProductCount(cat);
    return { count: count > 0 ? count : null, areas };
  };
  // Menu-derived brand-box landing. A per-page logo override wins over the
  // brand-box global fix (Deutsch), which wins over the brand's brands.ts logo.
  const resolveBrandBox = (b: BrandBox) => ({
    label: b.label,
    href: b.href,
    logo:
      BRAND_BOX_LOGO_OVERRIDES[category.id]?.[b.slug] ??
      BRAND_BOX_LOGO_GLOBAL[b.slug] ??
      b.logo,
    ...brandBoxMeta(b.href),
  });
  const brandHubBlock = brandHub ? (
    <section className="mb-14">
      {brandHub.type === "category" ? (
        <>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              Brands
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[#0a1628]">{`Browse ${title}`}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {brandHub.brands.map((b) => (
              <BrandBoxCard key={`${b.href}-${b.label}`} {...resolveBrandBox(b)} />
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-10">
          {brandHub.groups.map((g) => (
            <div key={g.label}>
              <h2 className="mb-4 text-lg font-bold text-[#0a1628]">{g.label}</h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {g.brands.map((b) => (
                  <BrandBoxCard key={`${b.href}-${b.label}`} {...resolveBrandBox(b)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  ) : null;

  // "Browse by series" — on brand hubs (DEUTSCH, TE Connectivity) whose products
  const breadcrumbCrumbs =
    category.id === 3
      ? [{ label: title }]
      : [
          { label: "Webshop", href: "/webshop.html" },
          ...breadcrumbs
            .filter((item) => item.route)
            .map((item) => ({
              label: CATEGORY_TITLE_OVERRIDES[item.id] ?? item.name ?? "Category",
              href: item.route ?? undefined,
            })),
          { label: title },
        ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="relative overflow-hidden bg-[#0a1628] text-white">
        <div className="absolute inset-0 tech-grid opacity-30" />
        <div className={`relative mx-auto max-w-[1440px] px-6 ${isWebshopRoot ? "py-9" : "py-6"}`}>
          <Breadcrumbs
            light
            crumbs={breadcrumbCrumbs}
          />

          {/* On the Webshop landing, mirror the shared PageHeader recipe
              (mt-5 / min-h-[156px] / vertically centred) so its header is the
              same height as About/Contact/Quality/Trusted Partners. Other
              catalogue pages keep the default top-aligned hero. */}
          <div
            className={`mt-5 flex flex-col gap-8 lg:flex-row ${
              isWebshopRoot ? "min-h-[156px] justify-center lg:items-center lg:justify-between" : "lg:items-start"
            }`}
          >
            {/* Left: title, description, stats, CTA. On the Webshop landing
                the title/description typography matches PageHeader exactly
                (text-4xl font-extrabold / text-sm leading-relaxed, no extra
                mt-2) — the previous fix only removed the stray stat line but
                left the type scale itself larger than PageHeader's, which was
                still enough on its own to push this hero past 156px. */}
            <div className="flex-1">
              {brand?.logo && (
                <span className="mb-4 inline-flex items-center gap-2.5 rounded-lg bg-white px-3.5 py-2 shadow-sm">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={132}
                    height={28}
                    unoptimized
                    className="h-6 w-auto object-contain"
                  />
                </span>
              )}
              <h1
                className={
                  isWebshopRoot
                    ? "text-4xl font-extrabold tracking-[-0.035em]"
                    : "mt-2 text-3xl font-bold tracking-[-0.03em] lg:text-4xl"
                }
              >
                {title}
              </h1>
              <p
                className={
                  isWebshopRoot
                    ? "mt-3 max-w-2xl text-sm leading-relaxed text-[#94a3b8]"
                    : "mt-4 max-w-3xl text-base leading-7 text-[#94a3b8]"
                }
              >
                {description ?? (
                  // Only use the brand description when the brand's product type
                  // matches the category tree (e.g. equipment brands describe
                  // themselves on equipment pages, not on connector pages).
                  brand?.linecardSection === "equipment" && !category.route?.includes("/production-equipment")
                    ? null
                    : brand?.description
                ) ?? categoryIntro(category)}
              </p>
              {/* Dropped entirely on the Webshop landing (Stefan's call) —
                  simpler than fitting it in either column, and this hero's
                  height only needs to match PageHeader's, not carry this stat. */}
              {heroStatText && !isWebshopRoot && (
                <p className="mt-4 text-sm font-semibold text-blue-200">
                  {heroStatText}
                </p>
              )}

              {brand?.shopUrl && !showSourcingCta && (
                <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3">
                  <span className="text-sm text-[#94a3b8]">
                    Can&apos;t find what you&apos;re looking for? Browse the full range directly with {brand.name}.
                  </span>
                  <a
                    href={brand.shopUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#fbbf24] hover:text-[#f59e0b] transition-colors"
                  >
                    Go to partner shop
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Right column. Brand application photo uses the SAME frame as the
                Zoller & Fröhlich hub (w-420, 3/2, white card + shadow) so every
                brand header is a consistent size. Video / description images keep
                the wider dark 4:3 frame. */}
            {headerImage ? (
              <div className="w-full lg:w-[420px] lg:flex-shrink-0">
                <div className={`overflow-hidden rounded-2xl shadow-lg ${headerImage.bg === "black" ? "bg-black" : "bg-white"}`}>
                  <div className="relative aspect-[3/2] w-full">
                    <Image
                      src={headerImage.src}
                      alt={title}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className={headerImage.fit === "cover" ? "object-cover" : "object-contain p-4"}
                    />
                  </div>
                </div>
              </div>
            ) : videoEmbedSrc || heroImageSrc ? (
              <div className="w-full lg:w-[420px] lg:flex-shrink-0 xl:w-[480px]">
                <div
                  className="relative w-full overflow-hidden rounded-2xl border border-[#1e3a6e] bg-[#0f2042]"
                  style={{ aspectRatio: videoEmbedSrc ? "16/9" : "4/3" }}
                >
                  {videoEmbedSrc ? (
                    <ConsentedVideo src={videoEmbedSrc} title={title} />
                  ) : (
                    <Image
                      src={heroImageSrc!}
                      alt={title}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 480px"
                      className="object-contain p-4"
                    />
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        {!brandHubActive && categoryLinkSection && (
          <section className="mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">
              {categoryLinkSection.eyebrow}
            </p>
            {categoryLinkSection.boxes.length === 1 ? (
              /* ONE box → full-width Zoller & Fröhlich-style banner: large image
                 LEFT (sm:w-72 lg:w-96), text RIGHT. Two or more → the compact
                 side-by-side Branson grid below. */
              <div className="mt-4">
                {categoryLinkSection.boxes.map((w) => (
                  <a
                    key={w.label}
                    href={w.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)] sm:flex-row"
                  >
                    <div className={`relative aspect-[16/10] w-full flex-none sm:aspect-auto sm:w-72 lg:w-96 ${w.fit === "contain" ? "bg-white" : "bg-[#f8fafc]"}`}>
                      <Image
                        src={w.image}
                        alt={w.label}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 384px"
                        className={`transition-transform duration-300 group-hover:scale-[1.03] ${
                          w.fit === "contain"
                            ? "object-contain p-4"
                            : `object-cover ${w.position === "left" ? "object-left" : ""}`
                        }`}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center p-6 sm:p-8">
                      <h3 className="text-base font-bold text-[#0a1628] group-hover:text-[#2563eb] sm:text-lg">
                        {w.label}
                      </h3>
                      <div className="mt-2 space-y-2 text-sm leading-6 text-[#475569]">
                        {w.description.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] transition-colors group-hover:text-[#1d4ed8]">
                        {w.ctaLabel}
                        <ArrowUpRight size={15} />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
            <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${categoryLinkSection.boxes.length >= 3 ? "lg:grid-cols-3" : ""}`}>
              {categoryLinkSection.boxes.map((w) => (
                <a
                  key={w.label}
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[176px] overflow-hidden rounded-lg border border-[#d8dee7] bg-white transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)]"
                >
                  {/* Branson template: picture LEFT (w-28 / sm:w-40, fills the
                      card height), text RIGHT. A shared min-height keeps every
                      2-box page the same size (Wezag baseline); pages with more
                      copy, e.g. Branson, grow a touch taller. */}
                  <div className={`relative w-28 flex-none sm:w-40 ${w.fit === "contain" ? "bg-white" : "bg-[#f8fafc]"}`}>
                    <Image
                      src={w.image}
                      alt={w.label}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 112px, 160px"
                      className={`transition-transform duration-300 group-hover:scale-[1.04] ${
                        w.fit === "contain"
                          ? "object-contain p-2"
                          : `object-cover ${w.position === "left" ? "object-left" : ""}`
                      }`}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                    <h3 className="text-sm font-bold text-[#0a1628] group-hover:text-[#2563eb] sm:text-base">
                      {w.label}
                    </h3>
                    <div className="mt-1.5 space-y-1.5 text-[13px] leading-5 text-[#475569]">
                      {w.description.map((p) => (
                        <p key={p}>{p}</p>
                      ))}
                    </div>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b] transition-colors group-hover:text-[#2563eb]">
                      {w.ctaLabel}
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
            )}
          </section>
        )}

        {/* The brand badge in the hero now represents brand-named categories,
            so the legacy category banner (often a stale brand logo) is hidden
            for them. */}
        {category.image && !brand && (
          <section className="mb-12">
            <div className="relative aspect-[5/2] max-h-[340px] overflow-hidden rounded-lg border border-[#d8dee7] bg-white">
              <Image
                src={category.image}
                alt={category.name ?? "Category"}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-contain p-4"
              />
            </div>
          </section>
        )}

        {/* Menu-derived brand-box landing (replaces the grid/cards on hub pages). */}
        {brandHubBlock}

        {/* Decorative series banner images shown only when there is no series section */}
        {!brandHubActive && remainingImages.length > 0 && !showSeries && (
          <ImageShowcase images={remainingImages} title={title} />
        )}

        {/* Category cards render here for most pages, but for Hongshang they move
            below the product grid (see categoriesBelowProducts). */}
        {!categoriesBelowProducts && categoryCardsBlock}

        {!brandHubActive && content.html && (
          <section className="mb-12">
            <div
              className="prose prose-sm max-w-none rounded-lg border border-[#e5e7eb] bg-white px-6 py-5 text-[#374151]"
              dangerouslySetInnerHTML={{ __html: content.html }}
            />
          </section>
        )}

        {showProductBrowser && (
          <div id="products">
            {/* Production-equipment flat hubs have no "series" section, so the
                leaf "Browse by series" link would point at a non-existent
                #series anchor — suppress it there. */}
            {(showSeries || (isLeafOfFlatHub && !category.route?.includes("/production-equipment"))) && (
              <div className="mb-6 flex justify-end">
                <a
                  href={isLeafOfFlatHub && parentCategory?.route ? `${parentCategory.route}#series` : "#series"}
                  className="flex items-center gap-1.5 rounded-lg border border-[#d8dee7] bg-white px-3.5 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-colors hover:border-[#93c5fd] hover:text-[#2563eb]"
                >
                  Browse by series
                  <ArrowRight size={14} />
                </a>
              </div>
            )}
            {categoriesBelowProducts && (
              <div className="mb-6 flex justify-end">
                <a
                  href={brandHomeRoute ? `${brandHomeRoute}#categories` : "#categories"}
                  className="flex items-center gap-1.5 rounded-lg border border-[#d8dee7] bg-white px-3.5 py-2 text-sm font-semibold text-[#374151] shadow-sm transition-colors hover:border-[#93c5fd] hover:text-[#2563eb]"
                >
                  {brandHomeRoute ? (
                    <>
                      <ArrowLeft size={14} />
                      {`All ${brand?.name ?? ""} categories`}
                    </>
                  ) : (
                    <>
                      Browse by category
                      <ArrowRight size={14} />
                    </>
                  )}
                </a>
              </div>
            )}
            <Suspense fallback={<ProductBrowserFallback />}>
              <CatalogueProductBrowser
                products={browserProducts}
                route={isLeafOfFlatHub ? (parentCategory?.route ?? category.route) : category.route}
                preFilter={isLeafOfFlatHub ? leafPreFilter : undefined}
                isWebshopRoot={isWebshopRoot}
                sectionLabel={productSectionLabel}
                sectionTitle={productSectionTitle}
                deutschImageMap={buildDeutschImageMap(productPool)}
                subcategoryOptions={subcategoryOptions.length > 0 ? subcategoryOptions : undefined}
                lockedFilterParams={isLeafOfFlatHub ? Object.keys(leafPreFilter) : undefined}
                partnerSlots={[
                  {
                    categoryId: STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID,
                    searchNames: stockoConnectorSystems.flatMap((g) =>
                      g.series.map((s) => s.name),
                    ),
                    facet: { label: "Pitch", options: stockoPitchOptions(stockoConnectorSystems) },
                    content: <StockoSeriesBrowser groups={stockoConnectorSystems} embedded />,
                  },
                ]}
              />
            </Suspense>

            {/* Sourcing CTA for connector & heat-shrink brands — sits directly
                under the product grid, not at the very bottom, since some pages
                have more sections before the footer. The manufacturer catalogue
                link only shows for brands that have a partner shop URL. */}
            {brand && showSourcingCta && (
              <section className="mt-10 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-6 py-7 sm:px-8">
                <h2 className="text-lg font-bold text-[#0a1628] sm:text-xl">
                  Can&apos;t find the exact part?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
                  {brand.shopUrl
                    ? `We supply the complete ${brand.name} range, not only what's listed here. Find the exact reference in the ${brand.name} catalogue, then send it to us and we'll source it for you.`
                    : `We supply the complete ${brand.name} range, not only what's listed here. Tell us the part number or spec you need and we'll source it for you.`}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <a
                    href={`mailto:info@adcontact.se?subject=${encodeURIComponent(`Sourcing request: ${brand.name}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                  >
                    Send us the part number
                    <ArrowRight size={15} />
                  </a>
                  {brand.shopUrl && (
                    <a
                      href={brand.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#475569] transition-colors hover:text-[#2563eb]"
                    >
                      {`View ${brand.name} catalogue`}
                      <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Category sourcing box — after the grid, or standalone on a lean
            partner landing page that has no grid (e.g. Wezag). */}
        {!brandHubActive && categorySourcingCta && (
          <section className="mt-10 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-6 py-7 sm:px-8">
            <h2 className="text-lg font-bold text-[#0a1628] sm:text-xl">
              {categorySourcingCta.heading}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
              {categorySourcingCta.body}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a
                href={`mailto:info@adcontact.se?subject=${encodeURIComponent(categorySourcingCta.mailtoSubject)}`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
              >
                {categorySourcingCta.primaryLabel}
                <ArrowRight size={15} />
              </a>
              <a
                href={categorySourcingCta.catalogueUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#475569] transition-colors hover:text-[#2563eb]"
              >
                {categorySourcingCta.catalogueLabel}
                <ArrowUpRight size={14} />
              </a>
            </div>
          </section>
        )}

        {/* Hongshang trial: subcategory cards below the product grid. Only on
            pages that actually have category cards (skips empty leaf pages). */}
        {categoriesBelowProducts && (showVisualLinks || showGenericCategoryCards) && (
          <div id="categories" className="mt-14 scroll-mt-24">
            {categoryCardsBlock}
          </div>
        )}

        {showSeries && seriesPage?.target?.route && (
          <div id="series" className="mt-14">
            <SeriesSection
              facets={seriesFacets}
              targetRoute={seriesPage.target.route}
              intro={seriesPage.intro}
              seriesByName={seriesPage.seriesByName}
              fallbackBlurb={seriesPage.fallbackBlurb}
            />
          </div>
        )}

        {children.length === 0 &&
          productPool.length === 0 &&
          !content.html &&
          content.standaloneImages.length === 0 &&
          !categorySourcingCta &&
          !categoryLinkSection && (
          <div className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-10 text-center">
            <Package className="mx-auto text-[#cbd5e1]" size={34} />
            <h2 className="mt-4 text-lg font-bold text-[#0a1628]">No catalogue items yet</h2>
            <p className="mt-2 text-sm text-[#64748b]">
              Contact us and we will help locate the right product.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
