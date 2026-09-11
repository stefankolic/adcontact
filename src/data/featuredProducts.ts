import { deutschOutletComponents } from "@/data/deutschOutlet";
import { getUnifiedProduct } from "@/data/productLookup";

export type FeaturedProduct = {
  name: string;
  href: string;
  image: string;
  price: string;
};

// HDP24-24-18SE-L017 is also outlet stock, so its image and price are derived
// live from the outlet data instead of hardcoded below. A hardcoded snapshot
// drifted twice: the price still read the pre-re-import figure (7.87 EUR vs
// the current 9.48 EUR) and the image separately needed a manual fix the same
// day its R2 override was updated. Deriving both here means a future outlet
// re-import or image change stays in sync on this strip automatically, no
// second "don't forget the featured strip too" step required. Falls back to
// the last-known values if the outlet listing or image ever disappears.
const HDP_PART_NUMBER = "HDP24-24-18SE-L017";
const hdpOutletListing = deutschOutletComponents.find(
  (o) => o.matchedPartNumber?.toUpperCase() === HDP_PART_NUMBER,
);
const hdpImage = getUnifiedProduct(HDP_PART_NUMBER)?.image;

export const featuredProducts: FeaturedProduct[] = [
  {
    name: "Mecal TT Press",
    href: "/webshop/tt-press.html",
    image: "/images/tt_web12.jpg",
    price: "Quote",
  },
  {
    name: "Mecal Evolution",
    href: "/webshop/mecal-evolution.html",
    image: "/images/evs00_web3.jpg",
    price: "Quote",
  },
  {
    name: "Stripping machine AI 01",
    href: "/webshop/skalmaskin-ai-01.html",
    image: "/images/ai_01-os_1fb4782275.png",
    price: "Quote",
  },
  {
    name: "Ulmer Cutting machine SG400",
    href: "/ulmer-cutting-machine-sg400.html",
    image: "/media/catalog/product/c/u/cutting_machine_sg400-1.jpg",
    price: "Quote",
  },
  {
    name: "Branson GMX-W1 Wire Splicer",
    href: "/webshop/production-equipment/ultrasonic-welding/branson-gmx-w1.html",
    image: "/media/branson/wire-splicer.webp",
    price: "Quote",
  },
  {
    name: HDP_PART_NUMBER,
    href: "/hdp24-24-18se-l017.html",
    image: hdpImage ?? "/media/featured-products/hdp24-24-18se-l017.webp",
    price: hdpOutletListing ? `${hdpOutletListing.priceEur.toFixed(2)} EUR` : "Quote",
  },
  {
    name: "DT06-4S-E008",
    href: "/webshop/components/sealed-connectors/deutsch/connectors/dt06-4s-e008.html",
    image: "/images/products/deutsch/dt06-4s-e008.jpg",
    price: "Quote",
  },
  {
    name: "DT06-2S-E003",
    href: "/dt06-2s-e003.html",
    image: "/images/products/deutsch/dt06-2s-e003.jpg",
    price: "Quote",
  },
  {
    name: "776533-3",
    href: "/webshop/776533-3.html",
    image: "/images/776533-3.jpg",
    price: "Quote",
  },
  {
    name: "0460-202-1631",
    href: "/webshop/0460-202-1631.html",
    image: "/images/products/related/0460-202-1631.jpg",
    price: "Quote",
  },
  {
    name: "1062-12-0144",
    href: "/webshop/1062-12-0144.html",
    image: "/images/1062-12-0144.jpg",
    price: "Quote",
  },
  {
    name: "491116",
    href: "/491116.html",
    image: "/images/AEI_isoliert_114.jpg",
    price: "Quote",
  },
  {
    name: "J08T6B3 - terminal contacts with 6 position",
    href: "/j08t6b3-terminal-contacts-with-6-position.html",
    image: "/images/j08t6b3__2_.jpg",
    price: "Quote",
  },
  {
    name: "FHN0-C0A5-C0A5 - Fuse Holder",
    href: "/fhn0-c0a5-c0a5-fuse-holder.html",
    image: "/images/portafusibili.jpg",
    price: "Quote",
  },
  {
    name: "08MA3A1Z - M8 connectors, 90° with PVC moulded cable",
    href: "/08ma3a1z-m8-connectors-90-with-pvc-moulded-cable.html",
    image: "/images/08ma3c1z.jpg",
    price: "Quote",
  },
  {
    name: "38712c.60",
    href: "/38712c-60.html",
    image: "/images/Rb01c2_f3_3.jpg",
    price: "Quote",
  },
];
