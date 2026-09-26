import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Shield, Zap, Thermometer, Droplets, ArrowRight, Phone, Mail, Package, Layers } from "lucide-react";
import type { Metadata } from "next";
import CatalogueClient from "./CatalogueClient";
import { deutschProducts } from "@/data/deutschConnectors";
import { seriesSummaries, type SeriesSummary } from "@/data/deutschAttributes";
import { deutschSeriesByName } from "@/data/deutschSeries";
import { getCatalogueCategory, getCategoryProductCount } from "@/lib/magentoCatalogue";

const PAGE_URL = "https://www.adcontact.se/products/deutsch-connectors";
const OG_IMAGE = "https://www.adcontact.se/images/DT_Series_-_1.png";

export const metadata: Metadata = {
  title: { absolute: "Deutsch Connectors: DT, DTM, DTP, HD & DRC Series | Adcontact" },
  description:
    "DEUTSCH sealed connectors: the DT, DTM, DTP, AT, DRC, HD10 and HD30 series, plus contacts, wedgelocks and crimp tools. IP67 rated, −55 °C to +125 °C, for off-highway, automotive, marine and industrial use. Nordic stock and fast quotes.",
  keywords: [
    "Deutsch connectors",
    "DEUTSCH DT connector",
    "Deutsch DTM connector",
    "Deutsch DTP connector",
    "Deutsch AT connector",
    "sealed connectors",
    "IP67 connector",
    "waterproof connector",
    "off-highway connector",
    "automotive connector",
    "Deutsch crimp tool",
    "Deutsch wedgelock",
    "Deutsch contacts",
    "DT connector distributor",
    "Deutsch connectors Sweden",
    "Deutsch connectors Nordic",
  ],
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    siteName: "Adcontact",
    title: "Deutsch Connectors: DT, DTM, DTP, HD & DRC Series | Adcontact",
    description:
      "IP67-rated DEUTSCH sealed connectors, contacts, wedgelocks and crimp tools for harsh environments. Sixteen connector series, stocked in the Nordics.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "DEUTSCH DT Series sealed connectors",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deutsch Connectors: DT, DTM, DTP, HD & DRC Series | Adcontact",
    description:
      "IP67-rated DEUTSCH sealed connectors, contacts, wedgelocks and crimp tools. Full ranges stocked in the Nordics with technical support.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// ─── Data ────────────────────────────────────────────────────────────────────

const seriesOverview = [
  {
    id: "dt",
    name: "DT Series",
    tagline: "The industry workhorse",
    description:
      "The most widely used Deutsch sealed connector series worldwide. IP67 rated, 13 A per contact (size 16), and available in 2–12 way configurations. The standard choice for automotive, agriculture, and industrial applications.",
    image: "/images/DT06-2S-E003_1.jpg",
    ways: [2, 3, 4, 6, 8, 12],
    contactSize: "16",
    currentRating: "13 A",
    voltageRating: "600 V",
    tempRange: "−55 °C to +125 °C",
    ipRating: "IP67",
    wireRange: "0.5–2.0 mm²",
    colour: "Grey / Black",
    material: "Nylon 66",
    color: "blue",
  },
  {
    id: "dtm",
    name: "DTM Series",
    tagline: "Miniature sealed, space-saving",
    description:
      "Miniature version of the DT series for space-constrained applications. Same IP67 sealing integrity in a smaller housing, using size 20 contacts rated 7.5 A, ideal for sensors, control modules, and compact enclosures.",
    image: "/images/DT06-4S-E008_1.jpg",
    ways: [2, 4, 6, 8, 12],
    contactSize: "20",
    currentRating: "7.5 A",
    voltageRating: "600 V",
    tempRange: "−55 °C to +125 °C",
    ipRating: "IP67",
    wireRange: "0.3–1.3 mm²",
    colour: "Grey / Black",
    material: "Nylon 66",
    color: "indigo",
  },
  {
    id: "dtp",
    name: "DTP Series",
    tagline: "High-current power connectors",
    description:
      "Designed for high-current power distribution. Size 12 contacts carry 25 A continuously. Used in electric vehicles, hydraulic power units, and battery systems where higher current demands exceed the DT series.",
    image: "/images/HDP26-24-47SE-L017_1.jpg",
    ways: [2, 4],
    contactSize: "12",
    currentRating: "25 A",
    voltageRating: "600 V",
    tempRange: "−55 °C to +125 °C",
    ipRating: "IP67",
    wireRange: "2.0–3.3 mm²",
    colour: "Grey / Black",
    material: "Nylon 66",
    color: "amber",
  },
  {
    id: "at",
    name: "AT Series",
    tagline: "Heavy-duty industrial sealed",
    description:
      "Heavier-duty sealed connectors for demanding industrial and off-highway environments. Robust mating assist, keying options, and compatibility with both size 16 and size 12 contacts. Used in construction, agricultural, and mobile machinery.",
    image: "/images/HD36-18-20SN.jpg",
    ways: [2, 3, 4, 6, 8],
    contactSize: "16 / 12",
    currentRating: "12–25 A",
    voltageRating: "600 V",
    tempRange: "−55 °C to +125 °C",
    ipRating: "IP67",
    wireRange: "0.5–6.0 mm²",
    colour: "Grey / Black / Green",
    material: "Nylon 66",
    color: "green",
  },
];

// Connector housings, representative part numbers from the real catalogue
const connectors = [
  // DT Series, sockets (female housing)
  { pn: "DT06-2S", series: "DT", ways: 2, type: "Socket", desc: "2-way socket housing, grey", socket: true },
  { pn: "DT06-2S-E003", series: "DT", ways: 2, type: "Socket", desc: "2-way socket housing, black", socket: true },
  { pn: "DT06-3S", series: "DT", ways: 3, type: "Socket", desc: "3-way socket housing, grey", socket: true },
  { pn: "DT06-4S", series: "DT", ways: 4, type: "Socket", desc: "4-way socket housing, grey", socket: true },
  { pn: "DT06-4S-E003", series: "DT", ways: 4, type: "Socket", desc: "4-way socket housing, black", socket: true },
  { pn: "DT06-6S", series: "DT", ways: 6, type: "Socket", desc: "6-way socket housing, grey", socket: true },
  { pn: "DT06-6S-E003", series: "DT", ways: 6, type: "Socket", desc: "6-way socket housing, black", socket: true },
  { pn: "DT06-8S", series: "DT", ways: 8, type: "Socket", desc: "8-way socket housing, grey", socket: true },
  { pn: "DT06-8S-C015", series: "DT", ways: 8, type: "Socket", desc: "8-way socket housing with cable seal, grey", socket: true },
  { pn: "DT06-12SA", series: "DT", ways: 12, type: "Socket", desc: "12-way socket housing, grey", socket: true },
  // DT Series, plugs (male housing)
  { pn: "DT04-2P", series: "DT", ways: 2, type: "Plug", desc: "2-way plug housing, grey", socket: false },
  { pn: "DT04-2P-E003", series: "DT", ways: 2, type: "Plug", desc: "2-way plug housing, black", socket: false },
  { pn: "DT04-3P", series: "DT", ways: 3, type: "Plug", desc: "3-way plug housing, grey", socket: false },
  { pn: "DT04-4P", series: "DT", ways: 4, type: "Plug", desc: "4-way plug housing, grey", socket: false },
  { pn: "DT04-4P-E003", series: "DT", ways: 4, type: "Plug", desc: "4-way plug housing, black", socket: false },
  { pn: "DT04-6P", series: "DT", ways: 6, type: "Plug", desc: "6-way plug housing, grey", socket: false },
  { pn: "DT04-6P-E003", series: "DT", ways: 6, type: "Plug", desc: "6-way plug housing, black", socket: false },
  { pn: "DT04-8P", series: "DT", ways: 8, type: "Plug", desc: "8-way plug housing, grey", socket: false },
  { pn: "DT04-12PA", series: "DT", ways: 12, type: "Plug", desc: "12-way plug housing, grey", socket: false },
  // DTM Series
  { pn: "DTM06-2S", series: "DTM", ways: 2, type: "Socket", desc: "2-way miniature socket, grey", socket: true },
  { pn: "DTM04-2P", series: "DTM", ways: 2, type: "Plug", desc: "2-way miniature plug, grey", socket: false },
  { pn: "DTM06-4S", series: "DTM", ways: 4, type: "Socket", desc: "4-way miniature socket, grey", socket: true },
  { pn: "DTM04-4P", series: "DTM", ways: 4, type: "Plug", desc: "4-way miniature plug, grey", socket: false },
  { pn: "DTM06-6S", series: "DTM", ways: 6, type: "Socket", desc: "6-way miniature socket, grey", socket: true },
  { pn: "DTM04-6P", series: "DTM", ways: 6, type: "Plug", desc: "6-way miniature plug, grey", socket: false },
  { pn: "DTM06-8S", series: "DTM", ways: 8, type: "Socket", desc: "8-way miniature socket, grey", socket: true },
  { pn: "DTM04-8P", series: "DTM", ways: 8, type: "Plug", desc: "8-way miniature plug, grey", socket: false },
  { pn: "DTM06-12S", series: "DTM", ways: 12, type: "Socket", desc: "12-way miniature socket, grey", socket: true },
  { pn: "DTM04-12P", series: "DTM", ways: 12, type: "Plug", desc: "12-way miniature plug, grey", socket: false },
  // DTP Series
  { pn: "DTP06-2S", series: "DTP", ways: 2, type: "Socket", desc: "2-way power socket, size 12 contacts", socket: true },
  { pn: "DTP04-2P", series: "DTP", ways: 2, type: "Plug", desc: "2-way power plug, size 12 contacts", socket: false },
  { pn: "DTP06-4S", series: "DTP", ways: 4, type: "Socket", desc: "4-way power socket, size 12 contacts", socket: true },
  { pn: "DTP04-4P", series: "DTP", ways: 4, type: "Plug", desc: "4-way power plug, size 12 contacts", socket: false },
  // AT Series
  { pn: "AT06-2S", series: "AT", ways: 2, type: "Socket", desc: "2-way heavy-duty socket, grey", socket: true },
  { pn: "AT04-2P", series: "AT", ways: 2, type: "Plug", desc: "2-way heavy-duty plug, grey", socket: false },
  { pn: "AT06-4S", series: "AT", ways: 4, type: "Socket", desc: "4-way heavy-duty socket, grey", socket: true },
  { pn: "AT04-4P", series: "AT", ways: 4, type: "Plug", desc: "4-way heavy-duty plug, grey", socket: false },
  { pn: "AT06-6S", series: "AT", ways: 6, type: "Socket", desc: "6-way heavy-duty socket, grey", socket: true },
  { pn: "AT04-6P", series: "AT", ways: 6, type: "Plug", desc: "6-way heavy-duty plug, grey", socket: false },
];

const contacts = [
  // Size 16, for DT/DTM/AT series
  {
    pn: "0460-202-16141",
    type: "Socket contact",
    size: "16",
    plating: "Gold",
    wireRange: "0.50–1.00 mm² (AWG 20–18)",
    tempRating: "+125 °C",
    series: "DT / DTM / AT",
    desc: "Gold-plated socket contact, size 16, for lower wire gauges",
  },
  {
    pn: "0460-215-16141",
    type: "Socket contact",
    size: "16",
    plating: "Gold",
    wireRange: "1.00–2.00 mm² (AWG 18–14)",
    tempRating: "+125 °C",
    series: "DT / DTM / AT",
    desc: "Gold-plated socket contact, size 16, for larger wire gauges",
  },
  {
    pn: "0462-201-16141",
    type: "Pin contact",
    size: "16",
    plating: "Gold",
    wireRange: "0.50–1.00 mm² (AWG 20–18)",
    tempRating: "+125 °C",
    series: "DT / DTM / AT",
    desc: "Gold-plated pin contact, size 16, for lower wire gauges",
  },
  {
    pn: "0462-209-16141",
    type: "Pin contact",
    size: "16",
    plating: "Gold",
    wireRange: "1.00–2.00 mm² (AWG 18–14)",
    tempRating: "+125 °C",
    series: "DT / DTM / AT",
    desc: "Gold-plated pin contact, size 16, for larger wire gauges",
  },
  {
    pn: "0460-202-1631",
    type: "Socket contact",
    size: "16",
    plating: "Tin",
    wireRange: "0.50–1.00 mm² (AWG 20–18)",
    tempRating: "+105 °C",
    series: "DT / DTM / AT",
    desc: "Tin-plated socket contact, size 16, economy alternative",
  },
  {
    pn: "0462-201-1631",
    type: "Pin contact",
    size: "16",
    plating: "Tin",
    wireRange: "0.50–1.00 mm² (AWG 20–18)",
    tempRating: "+105 °C",
    series: "DT / DTM / AT",
    desc: "Tin-plated pin contact, size 16, economy alternative",
  },
  // Size 12, for DTP and AT high-current
  {
    pn: "0460-202-12141",
    type: "Socket contact",
    size: "12",
    plating: "Gold",
    wireRange: "2.50–6.00 mm² (AWG 14–10)",
    tempRating: "+125 °C",
    series: "DTP / AT",
    desc: "Gold-plated power socket contact, size 12, 25 A rated",
  },
  {
    pn: "0462-201-12141",
    type: "Pin contact",
    size: "12",
    plating: "Gold",
    wireRange: "2.50–6.00 mm² (AWG 14–10)",
    tempRating: "+125 °C",
    series: "DTP / AT",
    desc: "Gold-plated power pin contact, size 12, 25 A rated",
  },
];

const accessories = [
  // Wedgelocks, plug side (P)
  { pn: "W2P", type: "Wedgelock", for: "DT04-2P", desc: "2-way plug wedgelock, locks contacts in place", colour: "Natural / Grey" },
  { pn: "W3P", type: "Wedgelock", for: "DT04-3P", desc: "3-way plug wedgelock", colour: "Natural / Grey" },
  { pn: "W4P", type: "Wedgelock", for: "DT04-4P", desc: "4-way plug wedgelock", colour: "Natural / Grey" },
  { pn: "W6P", type: "Wedgelock", for: "DT04-6P", desc: "6-way plug wedgelock", colour: "Natural / Grey" },
  { pn: "W8P", type: "Wedgelock", for: "DT04-8P", desc: "8-way plug wedgelock", colour: "Natural / Grey" },
  { pn: "W12P", type: "Wedgelock", for: "DT04-12PA", desc: "12-way plug wedgelock", colour: "Natural / Grey" },
  // Wedgelocks, socket side (S)
  { pn: "W2S", type: "Wedgelock", for: "DT06-2S", desc: "2-way socket wedgelock", colour: "Natural / Grey" },
  { pn: "W3S", type: "Wedgelock", for: "DT06-3S", desc: "3-way socket wedgelock", colour: "Natural / Grey" },
  { pn: "W4S", type: "Wedgelock", for: "DT06-4S", desc: "4-way socket wedgelock", colour: "Natural / Grey" },
  { pn: "W6S", type: "Wedgelock", for: "DT06-6S", desc: "6-way socket wedgelock", colour: "Natural / Grey" },
  { pn: "W8S", type: "Wedgelock", for: "DT06-8S", desc: "8-way socket wedgelock", colour: "Natural / Grey" },
  { pn: "W12S", type: "Wedgelock", for: "DT06-12SA", desc: "12-way socket wedgelock", colour: "Natural / Grey" },
  // Seals / cavity plugs
  { pn: "114017", type: "Cavity plug", for: "DT (size 16)", desc: "Cavity plug for unused size-16 positions, IP67 maintained", colour: "Green" },
  { pn: "W-HS-16", type: "Cavity plug", for: "DT / DTM (size 16)", desc: "Cavity plug for size 16 contacts, seals empty cavities", colour: "Red" },
  { pn: "7165-2193-30", type: "Seal kit", for: "DT Series", desc: "Loose-piece wire seal, size 16, for 0.75–1.5 mm² wire OD", colour: "Green" },
  { pn: "7165-2186-30", type: "Seal kit", for: "DT Series", desc: "Loose-piece wire seal, size 16, for 2.0–3.0 mm² wire OD", colour: "Green" },
  // Dust covers
  { pn: "2511-0151", type: "Dust cover", for: "DT04-2P", desc: "Protective plug dust cover, storage and transport", colour: "Grey" },
  { pn: "2511-0152", type: "Dust cover", for: "DT04-4P", desc: "Protective plug dust cover, 4-way", colour: "Grey" },
  { pn: "2511-0153", type: "Dust cover", for: "DT04-6P", desc: "Protective plug dust cover, 6-way", colour: "Grey" },
  // Backshells / strain reliefs
  { pn: "DRB-06-2S-E003", type: "Backshell", for: "DT06-2S", desc: "90° angled backshell for DT06-2S socket", colour: "Black" },
  { pn: "DRB-06-6S", type: "Backshell", for: "DT06-6S", desc: "Straight backshell / cable clamp for 6-way socket", colour: "Black" },
];

const tools = [
  {
    pn: "HDT-48-00",
    name: "Hand Crimp Tool",
    desc: "The standard Deutsch crimp tool for size-16 contacts (pin and socket). Ratcheting mechanism, won't release until full crimp cycle is complete. Compatible with 0.5–2.0 mm² wire.",
    contacts: "Size 16 (DT / DTM / AT)",
    standard: "DIN EN 60352-2",
    type: "Crimp tool",
  },
  {
    pn: "HDP-20",
    name: "Hand Crimp Tool, DTP",
    desc: "Dedicated ratcheting crimp tool for size-12 DTP power contacts. Covers 2.5–6.0 mm² wire gauges used with DTP series and AT large-contact variants.",
    contacts: "Size 12 (DTP / AT)",
    standard: "DIN EN 60352-2",
    type: "Crimp tool",
  },
  {
    pn: "0411-336-1605",
    name: "Extraction Tool, Size 16",
    desc: "Slim probe-style extraction tool for removing size-16 socket and pin contacts without damaging the housing. Use after releasing the wedgelock.",
    contacts: "Size 16 (DT / DTM / AT)",
    standard: "-",
    type: "Extraction tool",
  },
  {
    pn: "DTT-20",
    name: "Extraction Tool, DTP Size 12",
    desc: "Dedicated extraction tool for DTP size-12 contacts. Required for safe removal without housing damage.",
    contacts: "Size 12 (DTP / AT)",
    standard: "-",
    type: "Extraction tool",
  },
  {
    pn: "3-1579007-6",
    name: "Pneumatic Crimp Applicator",
    desc: "Applicator for use with Mecal or Z&F benchtop crimp presses. Produces consistent, production-grade crimps. For size-16 contacts at high volume.",
    contacts: "Size 16",
    standard: "ISO 8093",
    type: "Press applicator",
  },
];

const applications = [
  "Agricultural machinery (tractors, harvesters)",
  "Construction and off-highway equipment",
  "Commercial vehicle electrical systems",
  "Electric and hybrid vehicles",
  "Hydraulic power units",
  "Industrial automation and control",
  "Marine and defence electronics",
  "Renewable energy (solar, wind)",
  "Railway rolling stock",
  "Mining and heavy equipment",
];

const faqs = [
  {
    q: "What is the difference between Deutsch DT, DTM and DTP connectors?",
    a: "The DT series uses size 16 contacts rated 13 A and is the general-purpose workhorse, available in 2 to 12 way sizes. The DTM series is a miniature version with size 20 contacts rated 7.5 A for space-constrained, lower-current circuits. The DTP series uses size 12 contacts rated 25 A for high-current power connections. All three share the same IP67 sealing and wedgelock locking philosophy.",
  },
  {
    q: "Are Deutsch connectors waterproof?",
    a: "Yes. Deutsch DT, DTM, DTP and AT connectors are rated IP67 when mated, sealing against dust and temporary immersion in water to 1 metre for 30 minutes. Silicone wire seals and an interfacial seal keep them reliable from −55 °C to +125 °C, even under vibration.",
  },
  {
    q: "Can Deutsch contacts be soldered?",
    a: "No. Deutsch contacts are designed to be crimped, not soldered. Use the HDT-48-00 hand crimp tool for size 16 contacts and the HDP-20 for size 12 contacts. For production volumes, a bench-press applicator delivers the most consistent crimp quality.",
  },
  {
    q: "What wire gauge do Deutsch DT connectors accept?",
    a: "DT size 16 contacts accept 0.5–2.0 mm² (14–20 AWG) wire. DTM size 20 contacts suit 0.3–1.3 mm² (16–22 AWG), and DTP size 12 contacts handle 2.0–3.3 mm² (12–14 AWG). Contacts are ordered separately from housings so you can match the exact wire gauge.",
  },
  {
    q: "Do Deutsch connectors need a wedgelock?",
    a: "Yes. The wedgelock locks the contacts into the housing and is required to achieve full contact retention and the IP67 seal. Always order the matching plug (P) and socket (S) wedgelock for each housing, along with cavity plugs to seal any unused positions.",
  },
  {
    q: "Is Adcontact a Deutsch connector distributor?",
    a: "Adcontact is a Nordic stocking distributor of DEUTSCH connectors, holding the DT, DTM, DTP and AT housings, contacts, wedgelocks, seals and crimp tools in Bromma, Sweden, with technical support and fast quotations across Sweden, Finland, Norway, Denmark and Estonia.",
  },
];

// ─── Structured data (JSON-LD) for SEO ──────────────────────────────────────────

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.adcontact.se/" },
    { "@type": "ListItem", position: 2, name: "Webshop", item: "https://www.adcontact.se/webshop.html" },
    { "@type": "ListItem", position: 3, name: "Connectors", item: "https://www.adcontact.se/products" },
    { "@type": "ListItem", position: 4, name: "Deutsch Connectors", item: PAGE_URL },
  ],
};

const seriesItemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Deutsch sealed connector series",
  itemListElement: seriesOverview.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: `DEUTSCH ${s.name}`,
      category: "Sealed industrial connectors",
      brand: { "@type": "Brand", name: "DEUTSCH" },
      description: s.description,
      image: `https://www.adcontact.se${s.image}`,
      additionalProperty: [
        { "@type": "PropertyValue", name: "IP rating", value: s.ipRating },
        { "@type": "PropertyValue", name: "Current rating", value: s.currentRating },
        { "@type": "PropertyValue", name: "Contact size", value: s.contactSize },
        { "@type": "PropertyValue", name: "Operating temperature", value: s.tempRange },
      ],
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/InStock",
        priceCurrency: "SEK",
        seller: { "@type": "Organization", name: "Adcontact AB" },
        url: PAGE_URL,
      },
    },
  })),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

// ─── Sub-components ────────────────────────────────────────────────────────────

// Short marketing taglines per original DEUTSCH series, keyed by the exact
// series label used by the storefront's Series filter.
const SERIES_TAGLINES: Record<string, string> = {
  "DT Series": "The industry workhorse, IP67 sealed.",
  "DTM Series": "Miniature sealed connectors for compact circuits.",
  "DTP Series": "High-current power connectors.",
  "DTHD Series": "Single-cavity DT connectors for high-current power.",
  "DTV Series": "Flange-mount DT-family connector.",
  "HD30 Series": "Heavy-duty circular connectors for demanding industrial wiring.",
  "HD10 Series": "Rugged circular connectors for harsh-environment power and signal.",
  "HDP20 Series": "Large heavy-duty power connectors with high contact counts.",
  "DRC Series": "High-density sealed connectors for harsh environments.",
  "DRB Series": "High-density sealed connectors with up to 128 cavities.",
  "AMPSEAL Series": "Sealed connectors for demanding automotive and transportation wiring.",
  "AMPSEAL 16 Series": "Compact sealed connectors for higher-density signal circuits.",
  "AEC Series": "High-density sealed connector series.",
  "EEC": "Header connectors that accept DT and DTM interfaces.",
  "Jiffy Splice": "Sealed in-line splice connectors for field wiring.",
  "STRIKE Series": "High-density sealed connectors, 32 and 64 cavities.",
};

// The 795 contacts, accessories and tools that are not in the connector dataset
// live in the Magento subcategories; the hub links to them from each section.
function FullRangeLink({ categoryId, noun }: { categoryId: number; noun: string }) {
  const category = getCatalogueCategory(categoryId);
  if (!category?.route) return null;
  const count = getCategoryProductCount(category);
  return (
    <Link
      href={category.route}
      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] transition-colors hover:text-[#1d4ed8]"
    >
      Browse all {count.toLocaleString("en-US")} Deutsch {noun} in the webshop
      <ArrowRight size={14} />
    </Link>
  );
}

function seriesCode(label: string): string {
  return label.replace(/\s*Series$/i, "");
}

function SeriesOverviewCard({ s }: { s: SeriesSummary }) {
  const tagline = SERIES_TAGLINES[s.label] ?? "Sealed DEUTSCH connector series.";
  const facts = deutschSeriesByName.get(s.label)?.features?.slice(0, 2);
  return (
    <Link
      href={`/products/deutsch-connectors?series=${encodeURIComponent(s.label)}#catalogue`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#bfdbfe] hover:shadow-[0_16px_30px_-16px_rgba(15,23,42,0.2)]"
    >
      {/* Representative photo for the series, with a parts-count overlay so the
          card reads as a family of products rather than a single item. */}
      <div className="relative aspect-[4/3] w-full bg-white">
        {s.image ? (
          <Image
            src={s.image}
            alt={`Deutsch ${s.label}`}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
            <Package size={28} className="text-[#cbd5e1]" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-md bg-[#0a1628] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          {seriesCode(s.label)}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-[#475569] shadow-sm ring-1 ring-[#e5e7eb] backdrop-blur-sm">
          {s.count} {s.count === 1 ? "product" : "products"}
        </span>
      </div>

      <div className="flex flex-1 flex-col border-t border-[#f1f5f9] p-5">
        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
          <Layers size={12} className="text-[#2563eb]" />
          Series
        </div>
        <h3 className="text-base font-bold text-[#0a1628] transition-colors group-hover:text-[#2563eb]">
          {s.label}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#64748b]">{tagline}</p>
        {facts && (
          <ul className="mt-2 space-y-0.5 text-[11px] leading-snug text-[#475569]">
            {facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
        <div className="flex-1" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {s.minCav !== null && (
            <span className="rounded border border-[#e5e7eb] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-medium text-[#475569]">
              {s.minCav === s.maxCav ? `${s.minCav}-way` : `${s.minCav}–${s.maxCav} way`}
            </span>
          )}
          {s.styles.map((t) => (
            <span
              key={t}
              className="rounded border border-[#e5e7eb] bg-[#f8fafc] px-2 py-0.5 text-[10px] font-medium text-[#475569]"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1.5 border-t border-[#f1f5f9] pt-3 text-xs font-semibold text-[#2563eb]">
          View {s.count} {s.count === 1 ? "product" : "products"}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeutschConnectorsPage() {
  const size16Contacts = contacts.filter((c) => c.size === "16");
  const size12Contacts = contacts.filter((c) => c.size === "12");

  const wedgelocks = accessories.filter((a) => a.type === "Wedgelock");
  const sealsAndPlugs = accessories.filter(
    (a) => a.type === "Cavity plug" || a.type === "Seal kit"
  );
  const coversAndBackshells = accessories.filter(
    (a) => a.type === "Dust cover" || a.type === "Backshell"
  );

  // Live portfolio facts, derived from the crawled catalogue.
  const totalProducts = deutschProducts.length;
  const seriesCount = seriesSummaries.length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Structured data (JSON-LD) ──────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesItemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      {/* ── Hero / header ──────────────────────────────────────────────────── */}
      <div className="bg-[#0a1628] text-white relative overflow-hidden">
        <div className="absolute inset-0 tech-grid opacity-30" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2563eb] opacity-[0.07] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative max-w-[1440px] mx-auto px-6 py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#475569] mb-8">
            <Link href="/" className="hover:text-white transition-colors">
              Adcontact
            </Link>
            <ChevronRight size={12} />
            <Link href="/webshop.html" className="hover:text-white transition-colors">
              Webshop
            </Link>
            <ChevronRight size={12} />
            <Link href="/webshop/components/sealed-connectors.html" className="hover:text-white transition-colors">
              Connectors
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#93c5fd]">Deutsch</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 max-w-2xl">
              {/* Brand logo + badge */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <div className="relative h-11 w-28 flex-none rounded-lg bg-white px-3 py-2">
                  <Image
                    src="/images/partners/te-connectivity.svg"
                    alt="TE Connectivity"
                    fill
                    sizes="112px"
                    className="object-contain p-1.5"
                    unoptimized
                  />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1a2f5a] border border-[#1e3a6e] rounded-full">
                  <div className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full" />
                  <span className="text-xs font-medium text-[#fbbf24]">Authorised stocking distributor</span>
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Deutsch Connectors
                <span className="block text-[#60a5fa] text-2xl lg:text-3xl font-medium mt-2">
                  The complete sealed connector program
                </span>
              </h1>

              <p className="text-[#94a3b8] text-lg leading-relaxed mb-6 max-w-xl">
                From the general-purpose DT series to high-density DRC and heavy-duty HD30 and HDP20
                power connectors. {totalProducts.toLocaleString()} sealed DEUTSCH parts stocked in the
                Nordics, with the contacts, wedgelocks and crimp tools to match.
              </p>

              {/* Family list */}
              <div className="flex flex-wrap gap-2 mb-7">
                {["DT", "DTM", "DTP", "DTHD", "DRC", "HD30", "HDP20"].map((fam) => (
                  <span
                    key={fam}
                    className="text-xs font-semibold text-[#93c5fd] bg-[#0f2042] border border-[#1e3a6e] rounded-full px-3 py-1"
                  >
                    {fam}
                  </span>
                ))}
              </div>

              {/* Key specs pill row */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { icon: Droplets, label: "IP67 / IP68 sealed" },
                  { icon: Thermometer, label: "−55 °C to +125 °C" },
                  { icon: Zap, label: "Up to 100 A per contact" },
                  { icon: Shield, label: "Vibration-resistant locking" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f2042] border border-[#1e3a6e] rounded-lg"
                  >
                    <Icon size={14} className="text-[#2563eb]" />
                    <span className="text-sm text-[#e2e8f0]">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact/quote"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a1628] font-semibold text-sm rounded-lg transition-colors"
                >
                  Request a quote
                  <ArrowRight size={15} />
                </Link>
                <a
                  href="#catalogue"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-lg transition-colors border border-white/20 hover:border-white/30"
                >
                  Browse all {totalProducts.toLocaleString()} products
                  <ArrowRight size={15} />
                </a>
                <a
                  href="tel:+46084453600"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a2f5a] hover:bg-[#1e3a6e] text-white font-medium text-sm rounded-lg transition-colors border border-[#1e3a6e]"
                >
                  <Phone size={14} />
                  Technical support
                </a>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3.5">
                <span className="text-sm text-[#94a3b8]">
                  Can&apos;t find what you&apos;re looking for? Browse the full Deutsch range directly with the manufacturer.
                </span>
                <a
                  href="https://www.te.com/en/products/brands/deutsch.html?tab=pgp-story"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold text-[#fbbf24] hover:text-[#f59e0b] transition-colors"
                >
                  Go to TE Connectivity / Deutsch
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Right, at-a-glance stats */}
            <div className="lg:flex-shrink-0 grid grid-cols-2 gap-3 min-w-[300px]">
              {[
                { label: "Products in stock", value: totalProducts.toLocaleString() },
                { label: "Connector series", value: `${seriesCount} families` },
                { label: "Positions", value: "2 – 70+ way" },
                { label: "Contact sizes", value: "Size 20 – 4" },
                { label: "Current rating", value: "7.5 – 100 A" },
                { label: "Sealing", value: "IP67 / IP68" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#0f2042] border border-[#1e3a6e] rounded-lg p-4"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#475569] mb-1">
                    {item.label}
                  </div>
                  <div className="text-sm font-semibold text-[#e2e8f0]">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Jump nav ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-16 lg:top-[112px] z-30 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {[
              { label: "Series overview", href: "#series" },
              { label: "Catalogue", href: "#catalogue" },
              { label: "Contacts", href: "#contacts" },
              { label: "Accessories", href: "#accessories" },
              { label: "Tools", href: "#tools" },
              { label: "Applications", href: "#applications" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-5 py-4 text-sm font-medium text-[#64748b] hover:text-[#0a1628] border-b-2 border-transparent hover:border-[#2563eb] transition-all whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-16">
        {/* ── Series overview ───────────────────────────────────────────────── */}
        <section id="series" className="mb-20 scroll-mt-28">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Browse by series</div>
            <h2 className="text-3xl font-bold text-[#0a1628] mb-3">{seriesSummaries.length} connector series to choose from</h2>
            <p className="text-[#64748b] max-w-2xl">
              Each card below is a complete DEUTSCH <strong className="font-semibold text-[#374151]">series</strong>, not a single product, from the general-purpose DT series to high-density DRC and heavy-duty HD power connectors. Select a series to filter the {totalProducts.toLocaleString()} parts in the catalogue below; the count on each card shows how many parts it holds.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {seriesSummaries.map((s) => (
              <SeriesOverviewCard key={s.label} s={s} />
            ))}
          </div>
        </section>

        {/* ── Catalogue ────────────────────────────────────────────────────── */}
        <div className="mb-20">
          <Suspense fallback={null}>
            <CatalogueClient />
          </Suspense>
        </div>

        {/* ── Contacts ─────────────────────────────────────────────────────── */}
        <section id="contacts" className="mb-20 scroll-mt-28">
          <div className="mb-8 flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Contacts</div>
              <h2 className="text-3xl font-bold text-[#0a1628] mb-3">Contacts and terminals</h2>
              <p className="text-[#64748b] max-w-2xl">
                All Deutsch DT/DTM series use size-16 contacts. DTP and high-current AT series use size-12 contacts. Contacts are sold separately from housings, choose the wire gauge that matches your application.
              </p>
              <FullRangeLink categoryId={122} noun="contacts" />
            </div>
            <div className="flex gap-3 flex-shrink-0">
              {["/images/0460-202-1631.jpg", "/images/0460-204-0490_1.jpg"].map((src) => (
                <div key={src} className="relative w-28 h-28 bg-[#f8fafc] rounded-xl border border-[#e5e7eb] overflow-hidden">
                  <Image src={src} alt="Deutsch contact" fill className="object-contain p-3" sizes="112px" />
                </div>
              ))}
            </div>
          </div>

          {[
            {
              label: "Size 16 contacts, DT / DTM / AT series (12 A)",
              items: size16Contacts,
            },
            {
              label: "Size 12 contacts, DTP / AT high-current (25 A)",
              items: size12Contacts,
            },
          ].map(({ label, items }) => (
            <div key={label} className="mb-10">
              <h3 className="text-base font-bold text-[#0a1628] mb-3">{label}</h3>
              <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                      <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Part number</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Plating</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Wire range</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Max temp</th>
                      <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider hidden xl:table-cell">Compatible series</th>
                      <th className="text-right px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Quote</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {items.map((item) => (
                      <tr key={item.pn} className="hover:bg-[#f8fafc] transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-[#0a1628] text-sm">{item.pn}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            item.type === "Socket contact"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-violet-50 text-violet-700"
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            item.plating === "Gold"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {item.plating}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#64748b] text-xs font-mono">{item.wireRange}</td>
                        <td className="px-4 py-3 text-[#64748b] text-xs">{item.tempRating}</td>
                        <td className="px-4 py-3 text-[#64748b] text-xs hidden xl:table-cell">{item.series}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/contact?pn=${item.pn}`} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                            RFQ →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Crimping note */}
          <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5">
            <div className="flex gap-3">
              <Zap size={18} className="text-[#2563eb] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[#1e40af] mb-1">Crimping note</p>
                <p className="text-sm text-[#1d4ed8]">
                  Deutsch contacts must be crimped, they cannot be soldered. Use the HDT-48-00 hand crimp tool for size 16, or HDP-20 for size 12. For production volumes, a Mecal or Zoller &amp; Fröhlich applicator on a bench press delivers the most consistent crimp quality. Contact Adcontact for tooling recommendations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Accessories ──────────────────────────────────────────────────── */}
        <section id="accessories" className="mb-20 scroll-mt-28">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Accessories</div>
            <h2 className="text-3xl font-bold text-[#0a1628] mb-3">Accessories</h2>
            <p className="text-[#64748b] max-w-2xl">
              Wedgelocks mechanically retain contacts and are required for IP67 sealing, always order them with your housings. Cavity plugs seal unused positions in the same housing.
            </p>
            <FullRangeLink categoryId={121} noun="accessories" />
          </div>

          {/* Wedgelocks */}
          <div className="mb-10">
            <h3 className="text-base font-bold text-[#0a1628] mb-3">Wedgelocks</h3>
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Part number</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Fits housing</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Description</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {wedgelocks.map((item) => (
                    <tr key={item.pn} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#0a1628] text-sm">{item.pn}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{item.for}</td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">{item.desc}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/contact?pn=${item.pn}`} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                          RFQ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seals & cavity plugs */}
          <div className="mb-10">
            <h3 className="text-base font-bold text-[#0a1628] mb-3">Wire seals and cavity plugs</h3>
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Part number</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">For</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Description</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {sealsAndPlugs.map((item) => (
                    <tr key={item.pn} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#0a1628] text-sm">{item.pn}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b] font-mono">{item.for}</td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">{item.desc}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/contact?pn=${item.pn}`} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                          RFQ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dust covers & backshells */}
          <div>
            <h3 className="text-base font-bold text-[#0a1628] mb-3">Dust covers and backshells</h3>
            <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Part number</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Fits</th>
                    <th className="text-left px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Description</th>
                    <th className="text-right px-4 py-3 font-semibold text-[#374151] text-xs uppercase tracking-wider">Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {coversAndBackshells.map((item) => (
                    <tr key={item.pn} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-[#0a1628] text-sm">{item.pn}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#64748b] font-mono">{item.for}</td>
                      <td className="px-4 py-3 text-xs text-[#64748b]">{item.desc}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/contact?pn=${item.pn}`} className="text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                          RFQ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Tools ────────────────────────────────────────────────────────── */}
        <section id="tools" className="mb-20 scroll-mt-28">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Tooling</div>
            <h2 className="text-3xl font-bold text-[#0a1628] mb-3">Crimp tools and extraction tools</h2>
            <p className="text-[#64748b] max-w-2xl">
              Deutsch contacts require the correct crimp tool to achieve the specified crimp quality. Using the wrong tool, or pliers, will result in a non-conforming crimp that cannot be detected visually. Always verify the contact size before selecting the tool.
            </p>
            <FullRangeLink categoryId={123} noun="tools" />
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <div
                key={tool.pn}
                className="bg-white border border-[#e5e7eb] rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af] mb-1">
                    {tool.type}
                  </div>
                  <div className="font-mono font-bold text-[#0a1628] text-lg mb-0.5">{tool.pn}</div>
                  <div className="font-semibold text-[#374151] text-sm mb-3">{tool.name}</div>
                  <p className="text-xs text-[#64748b] leading-relaxed">{tool.desc}</p>
                </div>

                <div className="space-y-2 text-xs border-t border-[#f1f5f9] pt-4">
                  <div className="flex justify-between">
                    <span className="text-[#9ca3af]">For contacts</span>
                    <span className="font-medium text-[#374151]">{tool.contacts}</span>
                  </div>
                  {tool.standard !== "-" && (
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Standard</span>
                      <span className="font-medium text-[#374151]">{tool.standard}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/contact?pn=${tool.pn}`}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#374151] text-xs font-semibold rounded-lg transition-colors"
                >
                  Request a quote
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Applications ─────────────────────────────────────────────────── */}
        <section id="applications" className="mb-20 scroll-mt-28">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#2563eb] mb-2">Applications</div>
            <h2 className="text-3xl font-bold text-[#0a1628] mb-3">Where Deutsch connectors are used</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {applications.map((app) => (
              <div
                key={app}
                className="flex items-center gap-3 bg-white border border-[#e5e7eb] rounded-lg px-4 py-3"
              >
                <div className="w-1.5 h-1.5 bg-[#2563eb] rounded-full flex-shrink-0" />
                <span className="text-sm text-[#374151]">{app}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section id="faq" className="mb-20 scroll-mt-28">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-widest text-[#2563eb] mb-2">FAQ</div>
            <h2 className="text-3xl font-bold text-[#0a1628] mb-3">Deutsch connectors: frequently asked questions</h2>
            <p className="text-[#64748b] max-w-2xl">
              Common questions from engineers and buyers specifying DEUTSCH DT, DTM, DTP and AT sealed connectors.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group bg-white border border-[#e5e7eb] rounded-xl p-5 open:shadow-md transition-shadow"
              >
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <h3 className="text-sm font-semibold text-[#0a1628] leading-snug">{faq.q}</h3>
                  <ChevronRight
                    size={16}
                    className="flex-shrink-0 mt-0.5 text-[#94a3b8] transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="mt-3 text-sm text-[#64748b] leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="bg-[#0a1628] rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 tech-grid opacity-20" />
          <div className="relative flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                Need a quote or technical help?
              </h2>
              <p className="text-[#94a3b8] leading-relaxed">
                Our technical sales team in Bromma can advise on the right series, contact size, and tooling for your application. We stock the full DT, DTM, DTP, and AT ranges, including contacts, wedgelocks, and crimp tools.
              </p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link
                href="/contact/quote"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a1628] font-semibold rounded-lg transition-colors"
              >
                Request a quote
                <ArrowRight size={15} />
              </Link>
              <a
                href="tel:+46084453600"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#1a2f5a] hover:bg-[#1e3a6e] text-white font-medium rounded-lg transition-colors border border-[#1e3a6e]"
              >
                <Phone size={14} />
                +46 (0)8-445 36 00
              </a>
              <a
                href="mailto:info@adcontact.se"
                className="flex items-center gap-2 px-7 py-3.5 bg-[#1a2f5a] hover:bg-[#1e3a6e] text-white font-medium rounded-lg transition-colors border border-[#1e3a6e]"
              >
                <Mail size={14} />
                info@adcontact.se
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
