import generatedDetails from "./generated/featured-product-details.json";
import { featuredProducts } from "./featuredProducts";
import { deutschProducts } from "./deutschConnectors";
import { getProductDetail } from "./deutschProductDetails";
import { getRelatedProduct } from "./relatedProducts";
import type { DrawingFile, RelatedProduct } from "./deutschProductDetails";

export interface FeaturedProductDetail {
  name: string;
  slug: string;
  sourcePath: string;
  imageUrl: string;
  gallery: string[];
  shortDescription: string;
  descriptionHtml: string;
  availability: "in-stock" | "lead-time";
  availabilityNote: string;
  price: string;
  specs: Record<string, string>;
  contacts: RelatedProduct[];
  matingConnectors: RelatedProduct[];
  requiredComponents: RelatedProduct[];
  accessories: RelatedProduct[];
  drawings: DrawingFile[];
}

const crawledDetails =
  generatedDetails as unknown as FeaturedProductDetail[];

const modernSlugs = ["dt06-4s-e008", "dt06-2s-e003", "0460-202-1631"];

// Matches by the trailing "/<slug>.html" segment rather than assuming every
// card's href is prefixed "/webshop/" — some (e.g. HDP24-24-18SE-L017,
// "/hdp24-24-18se-l017.html") aren't. The exact-prefix version silently never
// matched for those, so the live-data override below never fired and this
// page kept serving whatever was in the crawled JSON forever, including a
// stale price and, for HDP24-24-18SE-L017, the generic no_photo placeholder
// image (found 2026-09-11 while syncing the same part's homepage entry).
function featuredCard(slug: string) {
  return featuredProducts.find((product) =>
    product.href.toLowerCase().endsWith(`/${slug.toLowerCase()}.html`),
  );
}

function getModernDetail(slug: string): FeaturedProductDetail | undefined {
  const card = featuredCard(slug);
  if (!card) return undefined;

  const related = getRelatedProduct(slug);
  if (related) {
    return {
      name: related.partNumber,
      slug,
      sourcePath: card.href,
      imageUrl: related.largeImageUrl,
      gallery: [related.largeImageUrl],
      shortDescription: `${related.partNumber} industrial contact by ${related.specs.Brand ?? "Adcontact"}.`,
      descriptionHtml: "",
      availability: related.availability,
      availabilityNote: related.availabilityNote,
      price: card.price,
      specs: related.specs,
      contacts: related.contacts,
      matingConnectors: related.matingConnectors,
      requiredComponents: related.requiredComponents,
      accessories: related.accessories,
      drawings: related.drawings,
    };
  }

  const catalogue = deutschProducts.find(
    (product) => product.partNumber.toLowerCase() === slug,
  );
  if (!catalogue) return undefined;
  const detail = getProductDetail(slug);

  return {
    name: catalogue.partNumber,
    slug,
    sourcePath: card.href,
    imageUrl: detail?.largImageUrl ?? catalogue.imageUrl ?? card.image,
    gallery: [detail?.largImageUrl ?? catalogue.imageUrl ?? card.image],
    shortDescription: `${catalogue.partNumber} ${catalogue.series} sealed connector${catalogue.ways ? `, ${catalogue.ways}-way` : ""}.`,
    descriptionHtml: "",
    availability: catalogue.availability === "quote" ? "in-stock" : "lead-time",
    availabilityNote:
      detail?.availabilityNote ??
      (catalogue.availability === "quote" ? "Available for quote" : "Contact us for lead time"),
    price: card.price,
    specs:
      detail?.specs ?? {
        Brand: "Deutsch",
        Series: catalogue.series,
        ...(catalogue.ways ? { Cavities: String(catalogue.ways) } : {}),
        ...(catalogue.type ? { Type: catalogue.type } : {}),
      },
    contacts: detail?.contacts ?? [],
    matingConnectors: detail?.matingConnectors ?? [],
    requiredComponents: detail?.requiredComponents ?? [],
    accessories: detail?.accessories ?? [],
    drawings: detail?.drawings ?? [],
  };
}

export const featuredProductDetails = [
  ...crawledDetails.map((product) => ({
    ...product,
    price: featuredCard(product.slug)?.price ?? product.price,
    // The crawled image is a point-in-time snapshot that can never self-heal
    // (e.g. HDP24-24-18SE-L017's was still the generic no_photo placeholder);
    // prefer whatever the featuredProducts card has now, same as price above.
    imageUrl: featuredCard(product.slug)?.image ?? product.imageUrl,
    gallery: featuredCard(product.slug)?.image
      ? [featuredCard(product.slug)!.image]
      : product.gallery,
  })),
  ...modernSlugs
    .map(getModernDetail)
    .filter((product): product is FeaturedProductDetail => Boolean(product)),
];

export function getFeaturedProductDetail(
  slug: string,
): FeaturedProductDetail | undefined {
  return featuredProductDetails.find((product) => product.slug === slug);
}
