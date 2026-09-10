import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CatalogueCategoryPage from "@/components/catalogue/CatalogueCategoryPage";
import CatalogueProductPage from "@/components/catalogue/CatalogueProductPage";
import {
  getCatalogueCategory,
  getCatalogueProduct,
  normalizeCataloguePath,
  resolveCatalogueRoute,
} from "@/lib/magentoCatalogue";
import {
  absoluteUrl,
  categoryMetaDescription,
  categoryTitle,
  productMetaDescription,
  productTitle,
} from "@/lib/seo";

type Props = {
  params: Promise<{ legacyPath: string[] }>;
};

// See webshop/[...path]/page.tsx for why this is needed (2026-07-23 Vercel
// CPU-duration alert) — an empty generateStaticParams opts every path into
// ISR instead of full per-request SSR.
export async function generateStaticParams() {
  return [];
}
// 7 days, not 1 — see webshop/[...path]/page.tsx (2026-08-29 ISR Writes cost
// reduction, same reasoning applies here).
export const revalidate = 604800;

function pathFromSegments(segments: string[]) {
  return normalizeCataloguePath(`/${segments.join("/")}`);
}

function canonical(path: string) {
  return absoluteUrl(path);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { legacyPath } = await params;
  const routePath = pathFromSegments(legacyPath);
  const route = resolveCatalogueRoute(routePath);
  if (!route) return {};

  if (route.type === "product") {
    const product = getCatalogueProduct(route.id);
    if (!product) return {};
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
  const description = categoryMetaDescription(category);
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

export default async function LegacyCatalogueRoute({ params }: Props) {
  const { legacyPath } = await params;
  const routePath = pathFromSegments(legacyPath);
  const route = resolveCatalogueRoute(routePath);
  if (!route) notFound();

  if (route.type === "product") {
    const product = getCatalogueProduct(route.id);
    if (!product) notFound();
    return <CatalogueProductPage product={product} />;
  }

  const category = getCatalogueCategory(route.id);
  if (!category) notFound();
  return <CatalogueCategoryPage category={category} />;
}
