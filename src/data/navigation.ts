import { brands, type Brand } from "./brands";

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
};

export type NavGroup = {
  label: string;
  href?: string;
  items: NavItem[];
};

export type MegaMenuSection = {
  id: string;
  label: string;
  href: string;
  groups: NavGroup[];
  variant?: "catalogue-tree";
};

const industrialComponentsGroup: NavGroup = {
  label: "Industrial Components",
  href: "/webshop/components.html",
  items: [
    {
      label: "Heat Shrink Tubing and Protective Sleeves",
      href: "/webshop/components/heat-shrinkable.html",
      children: [
        { label: "HongShang", href: "/webshop/components/heat-shrinkable/hongshang.html" },
        { label: "JDD Tech", href: "/webshop/components/heat-shrinkable/jdd-tech.html" },
      ],
    },
    {
      label: "Connectors",
      href: "/webshop/components/sealed-connectors.html",
      children: [
        { label: "Stocko", href: "/webshop/components/sealed-connectors/stocko.html" },
        { label: "Deutsch Connectors", href: "/webshop/components/sealed-connectors/deutsch.html" },
        { label: "TE Connectivity", href: "/webshop/components/sealed-connectors/te-connectivity.html" },
        { label: "Cvilux", href: "/webshop/components/sealed-connectors/cvilux.html" },
        { label: "Vogt", href: "/webshop/components/sealed-connectors/vogt.html" },
        { label: "HTP", href: "/webshop/components/sealed-connectors/htp.html" },
        { label: "Zoller & Fröhlich", href: "/webshop/components/sealed-connectors/zoller-frohlich.html" },
      ],
    },
    {
      label: "Contacts",
      href: "/webshop/components/contacts.html",
      children: [
        { label: "Deutsch", href: "/webshop/components/contacts/deutsch.html" },
      ],
    },
    {
      label: "Accessories",
      href: "/webshop/components/accessories.html",
      children: [
        { label: "Deutsch", href: "/webshop/components/accessories/deutsch.html" },
      ],
    },
    {
      label: "Tools",
      href: "/webshop/components/tools.html",
      children: [
        { label: "Deutsch", href: "/webshop/components/tools/deutsch.html" },
      ],
    },
  ],
};

export const productionEquipmentGroup: NavGroup = {
  label: "Production Equipment",
  href: "/webshop/production-equipment.html",
  items: [
    {
      label: "Cutting Machines",
      href: "/webshop/production-equipment/cutting-machines-for-a-variety-of-materials.html",
      children: [
        { label: "Ulmer", href: "/webshop/production-equipment/cutting-machines-for-a-variety-of-materials/ulmer.html" },
        { label: "Tekuwa", href: "/webshop/production-equipment/cutting-machines-for-a-variety-of-materials/tekuwa.html" },
        { label: "Junquan", href: "/webshop/production-equipment/cutting-machines-for-a-variety-of-materials/junquan.html" },
        // Ramatech also makes cutting/stripping machines; its primary home is
        // the Cable Handling Equipment section, but it's dual-listed here too.
        { label: "Ramatech", href: "/webshop/production-equipment/cable-handling-equipment/ramatech.html" },
      ],
    },
    {
      label: "Stripping Machines",
      href: "/webshop/production-equipment/stripping-machines.html",
      children: [
        { label: "Zoller & Fröhlich", href: "/products/zoller-frohlich/wire-processing" },
        { label: "Feintechnik Rittmyer", href: "/webshop/production-equipment/stripping-machines/feintechnik-rittmyer.html" },
        // Tekuwa does cutting AND stripping; its combined lean page lives under
        // Cutting Machines but is also surfaced here.
        { label: "Tekuwa", href: "/webshop/production-equipment/cutting-machines-for-a-variety-of-materials/tekuwa.html" },
        // Ramatech also does both; same dual-listing pattern.
        { label: "Ramatech", href: "/webshop/production-equipment/cable-handling-equipment/ramatech.html" },
      ],
    },
    {
      label: "Crimping machines and tools",
      href: "/webshop/production-equipment/crimping-equipment.html",
      children: [
        { label: "Mecal", href: "/webshop/production-equipment/crimping-equipment/mecal.html" },
        { label: "Zoller & Fröhlich", href: "/products/zoller-frohlich/wire-processing" },
        // "Stocko" crimping tools are Wezag's (WZ hand tools) — labelled Wezag.
        { label: "Wezag", href: "/webshop/production-equipment/crimping-equipment/wezag.html" },
      ],
    },
    {
      // Brand-box hub (hosted on the repurposed cat 48). Z+F does both stripping
      // and crimping; Mecal makes strip-and-crimp machines.
      label: "Stripping and crimping machines",
      href: "/webshop/production-equipment/stripping-and-crimping-machines.html",
      children: [
        // Mecal's strip-and-crimp machines; its hub also covers applicators and
        // crimping presses, so it is listed under Crimping machines and tools too.
        { label: "Mecal", href: "/webshop/production-equipment/crimping-equipment/mecal.html" },
        { label: "Zoller & Fröhlich", href: "/products/zoller-frohlich/wire-processing" },
      ],
    },
    // Temporarily removed from the live site (kept for a potential future
    // re-post). Also hidden at the data layer via HIDDEN_CATEGORY_IDS in
    // src/lib/magentoCatalogue.ts — restore both to bring it back.
    // {
    //   label: "Misc. Equipment",
    //   href: "/webshop/production-equipment/misc-equipment.html",
    //   children: [
    //     { label: "DSG Canusa", href: "/webshop/production-equipment/misc-equipment/dsg-canusa.html" },
    //   ],
    // },
    {
      label: "Plastic- and Metal Welding",
      href: "/webshop/production-equipment/ultrasonic-welding.html",
      children: [
        { label: "Branson", href: "/webshop/production-equipment/ultrasonic-welding/branson.html" },
      ],
    },
    {
      // New section (2026-07-12): Ramatech's range (dereeling, coiling, stacking,
      // reel racks, winding, rewinding) doesn't fit any existing category.
      label: "Cable Handling Equipment",
      href: "/webshop/production-equipment/cable-handling-equipment.html",
      children: [
        { label: "Ramatech", href: "/webshop/production-equipment/cable-handling-equipment/ramatech.html" },
      ],
    },
    {
      // "Test & Quality" hub is now a brand-box landing; Mav Prüftechnik lives on
      // its own leaf. The other test sub-brands (Cirris etc.) are not represented.
      label: "Test equipment",
      href: "/webshop/production-equipment/test-quality.html",
      children: [
        { label: "Mav Prüftechnik", href: "/webshop/production-equipment/test-quality/mav.html" },
      ],
    },
  ],
};

export const megaMenuSections: MegaMenuSection[] = [
  {
    id: "products",
    label: "Webshop",
    href: "/webshop.html",
    groups: [
      industrialComponentsGroup,
      productionEquipmentGroup,
    ],
    variant: "catalogue-tree",
  },
];

// ── Menu-derived brand-box landings ────────────────────────────────────
// Every clickable dropdown entry should render a consistent "brand-box"
// landing (one box per brand under it), NOT a raw product grid. The boxes are
// derived from the menu tree here + each brand's logo from brands.ts, so they
// stay complete and correct automatically (single source of truth, like the
// footer). A category -> its brand boxes; a section root -> its brands grouped
// by category. Consumed by CatalogueCategoryPage.

// Nav-child href/label -> brand slug, for the few whose URL segment doesn't
// match a brands.ts slug (misspelled route, repurposed hub).
const NAV_BRAND_ALIASES: Record<string, string> = {
  "feintechnik-rittmyer": "feintechnik-rittmeyer", // route keeps the data's misspelling
  "test-quality": "mav", // Test & Quality hub repurposed as the Mav page
  "wire-processing": "zoller-frohlich", // Z+F lean landing under /products
};

function brandForNavItem(item: NavItem): Brand | undefined {
  const segments = item.href
    .split("/")
    .filter(Boolean)
    .map((s) => s.replace(/\.html$/, ""));
  for (let i = segments.length - 1; i >= 0; i--) {
    const key = NAV_BRAND_ALIASES[segments[i]] ?? segments[i];
    const brand = brands.find((b) => b.slug === key && b.logo);
    if (brand) return brand;
  }
  return brands.find((b) => b.name === item.label);
}

export type BrandBox = { label: string; href: string; slug: string; logo?: string };
export type BrandHub =
  | { type: "category"; label: string; brands: BrandBox[] }
  | { type: "section"; groups: { label: string; brands: BrandBox[] }[] };

function toBrandBox(item: NavItem): BrandBox {
  const slug = item.href.split("/").filter(Boolean).pop()?.replace(/\.html$/, "") ?? "";
  return { label: item.label, href: item.href, slug, logo: brandForNavItem(item)?.logo };
}

const normalizeRoute = (route: string) => route.replace(/\/+$/, "").toLowerCase();

// Given a page route, return the brand-box landing it should render (or
// undefined if this route isn't a menu section/category).
export function getMenuBrandHub(route: string | null | undefined): BrandHub | undefined {
  if (!route) return undefined;
  const target = normalizeRoute(route);
  const sections = [industrialComponentsGroup, productionEquipmentGroup];
  // Section root (Industrial Components / Production Equipment) -> grouped.
  for (const section of sections) {
    if (section.href && normalizeRoute(section.href) === target) {
      return {
        type: "section",
        groups: section.items
          .filter((item) => (item.children?.length ?? 0) > 0)
          .map((item) => ({ label: item.label, brands: item.children!.map(toBrandBox) })),
      };
    }
  }
  // A category (Connectors, Cutting Machines, ...) -> its brand boxes. Skip a
  // single-brand category whose only child is the category's own page (e.g. the
  // Mav/test-quality hub), which would just self-link.
  for (const section of sections) {
    for (const item of section.items) {
      if (normalizeRoute(item.href) === target && (item.children?.length ?? 0) > 0) {
        const kids = item.children!.filter((c) => normalizeRoute(c.href) !== target);
        if (kids.length === 0) return undefined;
        return { type: "category", label: item.label, brands: kids.map(toBrandBox) };
      }
    }
  }
  return undefined;
}

export const topNavItems: NavItem[] = [
  {
    label: "Outlet",
    href: "/outlet",
    children: [
      { label: "Components outlet", href: "/outlet/components" },
      { label: "Used machines", href: "/outlet/used-machines" },
    ],
  },
  { label: "Trusted Partners", href: "/brands" },
  { label: "Quality Management", href: "/quality" },
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  {
    label: "Policies",
    href: "/policies",
    children: [
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Shipping & Export Policy", href: "/policies/shipping" },
      { label: "Return & Refund Policy", href: "/policies/returns" },
      { label: "Cookie Policy", href: "/policies/cookies" },
      { label: "General Terms of Delivery", href: "/policies/terms" },
    ],
  },
];
 
