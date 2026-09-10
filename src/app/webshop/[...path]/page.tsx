import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import CatalogueCategoryPage from "@/components/catalogue/CatalogueCategoryPage";
import CatalogueProductPage from "@/components/catalogue/CatalogueProductPage";
import ZFerrulesPage from "@/components/catalogue/ZFerrulesPage";
import JDDTechPage from "@/components/catalogue/JDDTechPage";
import { CATEGORY_DESCRIPTION_OVERRIDES } from "@/components/catalogue/CatalogueCategoryPage";
import StockoConnectorSystemsPage from "@/components/catalogue/StockoConnectorSystemsPage";
import StockoTerminatingTechnologyPage from "@/components/catalogue/StockoTerminatingTechnologyPage";
import {
  getCatalogueCategory,
  getCatalogueProduct,
  resolveCatalogueRoute,
  PRODUCT_CANONICAL_ROUTES,
  CATEGORY_CANONICAL_ROUTES,
  JDD_TECH_CATEGORY_ID,
  webshopPathFromSegments,
} from "@/lib/magentoCatalogue";
import { deutschProducts } from "@/data/deutschConnectors";
import { getStockoPitchGroupByCategoryRoute } from "@/data/stockoConnectorSystems";
import { getStockoMachineGroupByCategoryRoute } from "@/data/stockoTerminatingTechnology";

// Stocko categories with no Magento products: route to dedicated scraped pages.
const STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID = 125;
const STOCKO_TERMINATING_TECHNOLOGY_CATEGORY_ID = 171;
import {
  absoluteUrl,
  categoryMetaDescription,
  categoryTitle,
  productMetaDescription,
  productTitle,
} from "@/lib/seo";

type Props = {
  params: Promise<{ path: string[] }>;
};

// Every path here comes from static, build-time-bundled catalogue data (not a
// live API), so it's safe to cache indefinitely between deploys. An empty
// generateStaticParams (rather than omitting it) opts every path not built
// ahead of time into ISR instead of full per-request SSR — see
// docs/01-app/03-api-reference/04-functions/generate-static-params.md.
// Fixes a Vercel Function CPU Duration alert (2026-07-23): a traffic surge to
// one category page cost ~552ms CPU on every single request because nothing
// here was cacheable.
export async function generateStaticParams() {
  return [];
}
// 7 days, not 1 (2026-08-29) — this data only ever changes on redeploy, so a
// daily window bought no real freshness, just a forced re-render + ISR write
// for every actively-visited page once every 24h. ISR Writes showed up as a
// real, significant cost line on the Vercel usage breakdown; lengthening this
// cuts that down directly. See [[post-launch-backlog]] for the full reasoning
// — worth pushing even longer later once behaviour across a deploy is confirmed.
export const revalidate = 604800;

function canonical(path: string) {
  return absoluteUrl(path);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path } = await params;
  const routePath = webshopPathFromSegments(path);
  const route = resolveCatalogueRoute(routePath);

  if (!route) return {};

  if (route.type === "product") {
    const product = getCatalogueProduct(route.id);
    if (!product) return {};

    // Redirect pages don't need metadata — the destination generates its own.
    const sku = (product.sku ?? "").toUpperCase();
    const name = (product.name ?? "").toUpperCase();
    const isDeutsch = deutschProducts.some(
      (d) => d.partNumber.toUpperCase() === sku || d.partNumber.toUpperCase() === name,
    );
    if (isDeutsch) return {};

    const title = productTitle(product);
    const description = productMetaDescription(product);
    return {
      title,
      description,
      alternates: { canonical: canonical(routePath) },
      openGraph: {
        title,
        description,
        url: canonical(routePath),
        type: "website",
        images: product.image ? [{ url: product.image }] : undefined,
      },
    };
  }

  const category = getCatalogueCategory(route.id);
  if (!category) return {};
  const title = categoryTitle(category);
  const description = CATEGORY_DESCRIPTION_OVERRIDES[category.id] ?? categoryMetaDescription(category);
  return {
    title,
    description,
    alternates: { canonical: canonical(routePath) },
    openGraph: {
      title,
      description,
      url: canonical(routePath),
      type: "website",
    },
  };
}

export default async function WebshopCatalogueRoute({ params }: Props) {
  const { path } = await params;
  const routePath = webshopPathFromSegments(path);
  const route = resolveCatalogueRoute(routePath);
  if (!route) notFound();

  if (route.type === "product") {
    const product = getCatalogueProduct(route.id);
    if (!product || product.status !== "enabled") notFound();

    // 301 any non-canonical URL for this product to its canonical one.
    const canonicalRoute = PRODUCT_CANONICAL_ROUTES[route.id];
    if (canonicalRoute) {
      const strip = (p: string) => p.replace(/^\/+|\/+$/g, "").toLowerCase();
      if (strip(routePath) !== strip(canonicalRoute)) permanentRedirect(canonicalRoute);
    }

    // Deutsch connector products have a richer dedicated page — redirect there.
    // Match by SKU first; fall back to product name (some Magento entries use a
    // numeric TE part number as the SKU rather than the Deutsch part number).
    const sku = (product.sku ?? "").toUpperCase();
    const name = (product.name ?? "").toUpperCase();
    const deutschMatch = deutschProducts.find(
      (d) => d.partNumber.toUpperCase() === sku || d.partNumber.toUpperCase() === name,
    );
    if (deutschMatch) {
      permanentRedirect(`/products/deutsch-connectors/${deutschMatch.partNumber.toLowerCase()}`);
    }

    return <CatalogueProductPage product={product} />;
  }

  const category = getCatalogueCategory(route.id);
  if (!category) notFound();

  // 301 a renamed category's old URL to its canonical one.
  const canonicalCategoryRoute = CATEGORY_CANONICAL_ROUTES[route.id];
  if (canonicalCategoryRoute) {
    const strip = (p: string) => p.replace(/^\/+|\/+$/g, "").toLowerCase();
    if (strip(routePath) !== strip(canonicalCategoryRoute)) permanentRedirect(canonicalCategoryRoute);
  }

  // Z+F Wire Ferrules hub — dedicated visual layout with partner link
  if (category.id === 1711) {
    return <ZFerrulesPage category={category} />;
  }

  // JDD Tech — dedicated visual layout (mirrors ZFerrulesPage), 6 product-category boxes
  if (category.id === JDD_TECH_CATEGORY_ID) {
    return <JDDTechPage category={category} />;
  }

  // Cvilux hub renders as a normal webshop descendant hub (dark hero + product
  // browser), identical to Stocko et al. — so /products/cvilux redirects here
  // instead of the other way around, keeping the header consistent.

  // Stocko Connector Systems hub and its pitch sub-categories — no Magento
  // products exist here, so show the manufacturer-sourced reference page.
  if (category.id === STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID) {
    return <StockoConnectorSystemsPage category={category} />;
  }
  if (category.parentId === STOCKO_CONNECTOR_SYSTEMS_CATEGORY_ID) {
    const pitchGroup = category.route
      ? getStockoPitchGroupByCategoryRoute(category.route)
      : undefined;
    return <StockoConnectorSystemsPage category={category} pitchGroup={pitchGroup} />;
  }

  // Stocko Terminating Technology hub and its machine sub-categories.
  if (category.id === STOCKO_TERMINATING_TECHNOLOGY_CATEGORY_ID) {
    return <StockoTerminatingTechnologyPage category={category} />;
  }
  if (category.parentId === STOCKO_TERMINATING_TECHNOLOGY_CATEGORY_ID) {
    const machineGroup = category.route
      ? getStockoMachineGroupByCategoryRoute(category.route)
      : undefined;
    return <StockoTerminatingTechnologyPage category={category} machineGroup={machineGroup} />;
  }

  return <CatalogueCategoryPage category={category} />;
}
