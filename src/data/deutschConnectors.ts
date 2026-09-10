import generatedProducts from "./generated/deutsch-products.json";

export interface DeutschProduct {
  partNumber: string;
  series: string;
  ways: number | null;
  type: "Plug" | "Socket" | null;
  availability: "quote" | "lead-time";
  imageUrl: string | null;
  urlPath: string;
}

// Photo overrides for parts whose scraped imageUrl is a no_photo placeholder.
// Keyed by partNumber (uppercase) so a re-export of deutsch-products.json
// doesn't silently drop the fix — see PRODUCT_OVERRIDES in magentoCatalogue.ts
// for the equivalent mechanism on the main catalogue.
const DEUTSCH_IMAGE_OVERRIDES: Record<string, string> = {
  // 2026-09-10: was an 80x59 webp — swapped for a 550x550 photo Stefan
  // sourced (447px product content, white-padded to clear Google Merchant
  // Center's 500x500 minimum). The homepage featured-products strip still
  // uses the old small webp; that's a separate, lower-stakes context.
  "HDP24-24-18SE-L017": "/media/outlet-components/hdp24-24-18se-l017.jpg",
};

export const deutschProducts = (
  generatedProducts as unknown as DeutschProduct[]
).map((p) => {
  const override = DEUTSCH_IMAGE_OVERRIDES[p.partNumber.toUpperCase()];
  return override ? { ...p, imageUrl: override } : p;
});

export function getDeutschWebshopUrl(product: DeutschProduct): string {
  return `/webshop/${product.urlPath}`;
}
