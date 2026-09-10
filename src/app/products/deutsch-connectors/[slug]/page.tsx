import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, ArrowRight, Download, Phone, Mail, Clock, Package, Tag } from "lucide-react";
import type { Metadata } from "next";
import { getProductDetail, type RelatedProduct, type DrawingFile } from "@/data/deutschProductDetails";
import { deutschProducts } from "@/data/deutschConnectors";
import { deutschOutletComponents } from "@/data/deutschOutlet";
import { brands } from "@/data/brands";
import {
  findCatalogueProductByReference,
  getProductAttributeEntries,
  catalogueProductLegacyRoute,
  type CatalogueProduct,
  type CatalogueFile,
} from "@/lib/magentoCatalogue";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/productSchema";
import QuoteForm from "@/components/QuoteForm";

export function generateStaticParams() {
  return deutschProducts.map((p) => ({ slug: p.partNumber.toLowerCase() }));
}

const SERIES_LABELS: Record<string, string> = {
  DT: "DT Series",
  DT13: "DT13 Flanged Series",
  DT15: "DT15 Flanged Series",
  DTF13: "DTF13 Flanged Series",
  DTF15: "DTF15 Flanged Series",
  DTM: "DTM Miniature Series",
  DTP: "DTP Power Series",
  HDP: "HDP Heavy Power Series",
  JS: "JS Series",
  SRK: "SRK Series",
  AT: "AT Series",
};

type DeutschCatalogueProduct = (typeof deutschProducts)[number];

/** One source of truth for the part's one-line description — used for both the
 *  meta description and the Product schema so the two never drift apart. */
function productDescription(
  cp: DeutschCatalogueProduct,
  detail: ReturnType<typeof getProductDetail>,
): string {
  if (detail) {
    return `${cp.partNumber}: ${detail.specs["Series"] ?? "Deutsch"} sealed connector, ${detail.specs["No. of cavities"] ?? ""} way, contact size ${detail.specs["Contact Size"] ?? ""}. Request a quote from Adcontact Sweden.`;
  }
  return `${cp.partNumber}: ${SERIES_LABELS[cp.series] ?? cp.series} sealed connector${cp.ways ? `, ${cp.ways}-way` : ""}. Request a quote from Adcontact Sweden.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalogueProduct = deutschProducts.find((p) => p.partNumber.toLowerCase() === slug);
  if (!catalogueProduct) return {};
  const detail = getProductDetail(slug);
  return {
    title: `${catalogueProduct.partNumber} | Deutsch Connector | Adcontact`,
    description: productDescription(catalogueProduct, detail),
    alternates: { canonical: `/products/deutsch-connectors/${slug}` },
  };
}

const FILE_TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-50 text-red-700 border-red-200",
  dxf: "bg-blue-50 text-blue-700 border-blue-200",
  step: "bg-green-50 text-green-700 border-green-200",
  iges: "bg-purple-50 text-purple-700 border-purple-200",
  tif: "bg-amber-50 text-amber-700 border-amber-200",
  zip: "bg-slate-50 text-slate-700 border-slate-200",
};

const SERIES_COLORS: Record<string, string> = {
  DT: "bg-blue-50 text-blue-700 border-blue-200",
  DT13: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DT15: "bg-violet-50 text-violet-700 border-violet-200",
  DTF13: "bg-purple-50 text-purple-700 border-purple-200",
  DTF15: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  DTM: "bg-sky-50 text-sky-700 border-sky-200",
  DTP: "bg-amber-50 text-amber-700 border-amber-200",
  HDP: "bg-orange-50 text-orange-700 border-orange-200",
  JS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SRK: "bg-teal-50 text-teal-700 border-teal-200",
  AT: "bg-green-50 text-green-700 border-green-200",
};

function splitRefs(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((s) => s.trim()).filter(Boolean))];
}

// Treat Magento's "no photo"/placeholder graphic as no image, so the clean
// fallback shows instead of the dated "image coming soon" placeholder.
function cleanImage(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/no_photo|placeholder/i.test(path)) return null;
  return path;
}

// Horizontal card — small 72 px thumbnail on the left, part number + name on the right.
function RelatedCard({ partNumber, name, imageUrl, href }: {
  partNumber: string;
  name?: string;
  imageUrl?: string | null;
  href: string | null;
}) {
  const inner = (
    <div className="grid min-w-0 grid-cols-[72px_1fr] overflow-hidden rounded-lg border border-[#e5e7eb] bg-white transition-colors group-hover:border-[#93c5fd]">
      <div className="relative min-h-[72px] bg-[#f8fafc]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={partNumber}
            fill
            unoptimized
            sizes="72px"
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={18} className="text-[#cbd5e1]" />
          </div>
        )}
      </div>
      <div className="min-w-0 p-3">
        <div className="truncate font-mono text-sm font-bold text-[#0a1628] group-hover:text-[#2563eb]">
          {partNumber}
        </div>
        {name && name !== partNumber && (
          <div className="mt-1 truncate text-xs text-[#64748b]">{name}</div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="group block">{inner}</Link>;
  }
  return <div>{inner}</div>;
}

// Resolves a part number to a RelatedCard — checks deutschProducts first, then Magento.
function PartCard({ partNumber, magentoProduct }: {
  partNumber: string;
  magentoProduct: CatalogueProduct | undefined;
}) {
  const deutsch = deutschProducts.find(
    (p) => p.partNumber.toUpperCase() === partNumber.toUpperCase(),
  );
  const href = deutsch
    ? `/products/deutsch-connectors/${deutsch.partNumber.toLowerCase()}`
    : magentoProduct ? catalogueProductLegacyRoute(magentoProduct) : null;
  const imageUrl = cleanImage(deutsch?.imageUrl ?? magentoProduct?.thumbnail ?? magentoProduct?.image);
  const name = magentoProduct?.name;

  return <RelatedCard partNumber={partNumber} name={name} imageUrl={imageUrl} href={href} />;
}

// Wraps a rich-detail RelatedProduct (from deutschProductDetails).
function DetailRelatedCard({ item }: { item: RelatedProduct }) {
  const deutsch = deutschProducts.find(
    (p) => p.partNumber.toLowerCase() === item.partNumber.toLowerCase(),
  );
  // Non-connector related parts (contacts, wedgelocks, accessories) aren't in
  // deutschProducts, so resolve them against the Magento catalogue to get an
  // internal /webshop route. Only fall back to the item's legacy adcontact.se
  // URL when the part can't be found on the site at all.
  const magentoProduct = deutsch ? undefined : findCatalogueProductByReference(item.partNumber);
  const href = deutsch
    ? `/products/deutsch-connectors/${deutsch.partNumber.toLowerCase()}`
    : magentoProduct
      ? catalogueProductLegacyRoute(magentoProduct)
      : item.url ?? null;
  const imageUrl = cleanImage(item.imageUrl ?? deutsch?.imageUrl ?? magentoProduct?.thumbnail ?? magentoProduct?.image);

  return <RelatedCard partNumber={item.partNumber} imageUrl={imageUrl} href={href} />;
}

function catalogueFileType(file: CatalogueFile): string {
  const s = `${file.name ?? ""} ${file.filename ?? ""} ${file.path ?? ""}`.toLowerCase();
  if (s.includes(".pdf") || s.includes("pdf")) return "pdf";
  if (s.includes(".tif") || s.includes(".tiff")) return "tif";
  if (s.includes(".dxf")) return "dxf";
  if (s.includes(".step") || s.includes(".stp")) return "step";
  if (s.includes(".iges") || s.includes(".igs")) return "iges";
  return "zip";
}

function CatalogueFileRow({ file }: { file: CatalogueFile }) {
  const type = catalogueFileType(file);
  const colorClass = FILE_TYPE_COLORS[type] ?? FILE_TYPE_COLORS.zip;
  const href = file.legacyDownloadPath || file.link || file.path || "#";
  return (
    <a
      href={href}
      className="flex items-center justify-between gap-4 py-3 px-4 bg-white border border-[#e5e7eb] hover:border-[#2563eb] rounded-lg transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${colorClass}`}>{type}</span>
        <span className="text-sm text-[#374151] group-hover:text-[#0a1628] transition-colors">
          {file.name ?? "Download"}
        </span>
      </div>
      <Download size={14} className="text-[#9ca3af] group-hover:text-[#2563eb] transition-colors" />
    </a>
  );
}

function proxyDownloadUrl(url: string): string {
  // Rewrite absolute adcontact.se amfilerating URLs to go through our local
  // proxy, which bypasses the Magento auth redirect and fetches the file directly.
  try {
    const u = new URL(url);
    const match = u.pathname.match(/^\/amfilerating\/file\/download\/file_id\/(\d+)\/?$/);
    if (match) return `/amfilerating/file/download/file_id/${match[1]}/`;
  } catch {
    // not a valid URL — return as-is
  }
  return url;
}

function DownloadRow({ file }: { file: DrawingFile }) {
  const colorClass = FILE_TYPE_COLORS[file.type] ?? FILE_TYPE_COLORS.zip;
  const href = proxyDownloadUrl(file.url);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-4 py-3 px-4 bg-white border border-[#e5e7eb] hover:border-[#2563eb] rounded-lg transition-all group"
    >
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${colorClass}`}>{file.type}</span>
        <span className="text-sm text-[#374151] group-hover:text-[#0a1628] transition-colors">{file.label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {file.size && <span className="text-xs text-[#9ca3af]">{file.size}</span>}
        <Download size={14} className="text-[#9ca3af] group-hover:text-[#2563eb] transition-colors" />
      </div>
    </a>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const catalogueProduct = deutschProducts.find((p) => p.partNumber.toLowerCase() === slug);
  if (!catalogueProduct) notFound();

  const detail = getProductDetail(slug);
  const partNumber = catalogueProduct.partNumber;

  // Surfaces this exact part's own outlet listing (surplus stock, reduced
  // price) when one exists, so a regular-catalogue visitor discovers the
  // cheaper option, and so this page carries a real price for Merchant
  // Center feed consistency (the feed price must match what the linked page
  // shows — this page otherwise has no price at all, it's quote-only).
  const outletListing = deutschOutletComponents.find(
    (o) => o.matchedPartNumber?.toUpperCase() === partNumber.toUpperCase(),
  );
  const seriesLabel = SERIES_LABELS[catalogueProduct.series] ?? catalogueProduct.series;
  const seriesColor = SERIES_COLORS[catalogueProduct.series] ?? "bg-slate-50 text-slate-700 border-slate-200";

  // Pull Magento catalogue data for every product — provides specs, contacts, accessories, files.
  const magentoProduct = findCatalogueProductByReference(partNumber);
  const magentoSpecs = magentoProduct ? getProductAttributeEntries(magentoProduct) : [];

  // Relationship part number lists from Magento attributes.
  const magentoContactRefs = [
    ...splitRefs(magentoProduct?.attributes["Pin Connectors"]),
    ...splitRefs(magentoProduct?.attributes["Socket Connectors"]),
    ...splitRefs(magentoProduct?.attributes["Tab Connectors"]),
    ...splitRefs(magentoProduct?.attributes["Stamped/Formed Contacts"]),
    ...splitRefs(magentoProduct?.attributes["Solid Contacts"]),
  ];
  const magentoMatingRefs = splitRefs(magentoProduct?.attributes["Mating Connectors"]);
  const magentoRequiredRefs = [
    ...splitRefs(magentoProduct?.attributes["Required Components"]),
    ...splitRefs(magentoProduct?.attributes["Required Wedgelock"]),
  ];
  const magentoAccessoryRefs = splitRefs(magentoProduct?.attributes["Accessories"]);

  // Resolve each related part number to its Magento product (for images/links in PartCard).
  const resolveRef = (pn: string) => findCatalogueProductByReference(pn);

  // Image priority: rich detail > deutsch CDN > magento image.
  const mainImage = cleanImage(detail?.largImageUrl ?? catalogueProduct.imageUrl ?? magentoProduct?.image ?? magentoProduct?.thumbnail);

  // Quick spec grid entries.
  const quickSpecs = detail
    ? [
        { label: "Cavities", value: detail.specs["No. of cavities"] },
        { label: "Contact size", value: detail.specs["Contact Size"] },
        { label: "Current rating", value: detail.specs["Current Rating"] },
        { label: "Wire size (AWG)", value: detail.specs["Wire Size (AWG)"] ?? detail.specs["Wire Size"] },
        { label: "Color", value: detail.specs["Color"] },
        { label: "Required wedgelock", value: detail.specs["Required Wedgelock"] },
      ].filter((s) => s.value)
    : [
        { label: "Cavities", value: magentoProduct?.attributes["No. of cavities"] ?? (catalogueProduct.ways !== null ? String(catalogueProduct.ways) : undefined) },
        { label: "Contact size", value: magentoProduct?.attributes["Contact Size"] },
        { label: "Series", value: seriesLabel },
        { label: "Type", value: catalogueProduct.type ?? undefined },
        { label: "Current rating", value: magentoProduct?.attributes["Current Rating"] },
        { label: "Wire size", value: magentoProduct?.attributes["Wire Size (AWG)"] ?? magentoProduct?.attributes["Wire Size"] },
        { label: "Color", value: magentoProduct?.attributes["Color"] },
      ].filter((s) => s.value);

  // Determine what spec table and relationship sections to show.
  const hasDetailSpecs = detail && Object.keys(detail.specs).length > 0;
  const hasMagentoSpecs = magentoSpecs.length > 0;
  const hasDetailContacts = detail && detail.contacts.length > 0;
  const hasDetailMating = detail && detail.matingConnectors.length > 0;
  const hasDetailRequired = detail && detail.requiredComponents.length > 0;
  const hasDetailAccessories = detail && detail.accessories.length > 0;

  const pagePath = `/products/deutsch-connectors/${slug}`;
  const productLd = productJsonLd({
    name: `Deutsch ${partNumber}${seriesLabel ? `, ${seriesLabel}` : ""}`,
    partNumber,
    brand: "Deutsch",
    description: productDescription(catalogueProduct, detail),
    image: mainImage,
    url: pagePath,
    // Only the parts with real outlet stock carry a visible price on the page.
    offer: outletListing ? { priceEur: outletListing.priceEur } : undefined,
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Webshop", url: "/webshop.html" },
    { name: "Deutsch Connectors", url: "/webshop/components/sealed-connectors/deutsch/connectors.html" },
    { name: partNumber, url: pagePath },
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {/* Breadcrumb */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[1440px] mx-auto px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#0a1628] transition-colors">Adcontact</Link>
            <ChevronRight size={11} />
            <Link href="/webshop.html" className="hover:text-[#0a1628] transition-colors">Webshop</Link>
            <ChevronRight size={11} />
            <Link href="/webshop/components/sealed-connectors/deutsch/connectors.html" className="hover:text-[#0a1628] transition-colors">Deutsch Connectors</Link>
            <ChevronRight size={11} />
            <span className="text-[#0a1628] font-medium">{partNumber}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-10">
        {/* ── Top section ───────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Product image */}
          <div>
            <div className="relative aspect-square max-w-md w-full bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={partNumber}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[#f8fafc]">
                  <Package size={52} strokeWidth={1.4} className="text-[#cbd5e1]" />
                  <span className="text-xs font-medium text-[#94a3b8]">No image available</span>
                </div>
              )}
            </div>

            {/* Outlet stock — under the image, matched to its width. Only shown
                when this exact part has its own outlet listing. */}
            {outletListing && (
              <div className="mt-4 max-w-md rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="flex-none text-amber-700" />
                  <p className="text-sm font-bold text-amber-900">
                    Outlet stock, €{outletListing.priceEur.toFixed(2)} per unit
                  </p>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  {outletListing.quantity.toLocaleString()} in stock at our Keila warehouse, price
                  for 1 to 10 pieces, while quantities last.{" "}
                  <Link
                    href="/outlet/components"
                    className="font-semibold text-amber-900 underline decoration-2 underline-offset-2 hover:no-underline"
                  >
                    Browse the Components Outlet
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Key info */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${seriesColor}`}>
                {catalogueProduct.series}
              </span>
              {catalogueProduct.ways !== null && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {catalogueProduct.ways}-way
                </span>
              )}
              {catalogueProduct.type && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  catalogueProduct.type === "Socket"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-violet-50 text-violet-700 border-violet-200"
                }`}>
                  {catalogueProduct.type}
                </span>
              )}
              <span className="text-xs text-[#64748b]">Deutsch</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-[#0a1628] mb-2 font-mono tracking-tight">
              {partNumber}
            </h1>
            <p className="text-[#64748b] text-sm mb-5">
              {seriesLabel}
              {catalogueProduct.ways !== null ? ` · ${catalogueProduct.ways}-way` : ""}
              {catalogueProduct.type ? ` · ${catalogueProduct.type}` : ""}
              {(detail?.specs["Contact Size"] ?? magentoProduct?.attributes["Contact Size"]) &&
                ` · Size ${detail?.specs["Contact Size"] ?? magentoProduct?.attributes["Contact Size"]} contacts`}
            </p>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-[#f0fdf4] border border-[#dcfce7] rounded-lg w-fit">
              <Clock size={14} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Generally high availability — ask for current lead time
              </span>
            </div>

            {/* Quick specs grid */}
            {quickSpecs.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {quickSpecs.map((s) => (
                  <div key={s.label} className="bg-white border border-[#e5e7eb] rounded-lg p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-0.5">{s.label}</div>
                    <div className="text-sm font-semibold text-[#0a1628]">{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="#quote"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a1628] font-semibold rounded-lg transition-colors"
              >
                Request a quote
                <ArrowRight size={15} />
              </a>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#f8fafc] border border-[#e5e7eb] text-[#374151] font-medium rounded-lg transition-colors"
              >
                <Phone size={14} />
                Call us
              </Link>
              <a
                href={`mailto:info@adcontact.se?subject=Quote request: ${partNumber}`}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#f8fafc] border border-[#e5e7eb] text-[#374151] font-medium rounded-lg transition-colors"
              >
                <Mail size={14} />
                Email
              </a>
            </div>
          </div>
        </div>

        {/* ── Content + sticky quote sidebar ────────────────────────────── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">

        {/* ── Technical specifications ──────────────────────────────────── */}
        {hasDetailSpecs && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#0a1628] mb-4">Technical specifications</h2>
            <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#f1f5f9]">
                  {Object.entries(detail.specs).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                      <td className="px-5 py-3 font-medium text-[#64748b] w-56 text-xs uppercase tracking-wide">{key}</td>
                      <td className="px-5 py-3 font-semibold text-[#0a1628]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {!hasDetailSpecs && hasMagentoSpecs && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#0a1628] mb-4">Technical specifications</h2>
            <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#f1f5f9]">
                  {magentoSpecs.map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                      <td className="px-5 py-3 font-medium text-[#64748b] w-56 text-xs uppercase tracking-wide">{key}</td>
                      <td className="px-5 py-3 font-semibold text-[#0a1628] [&_a]:text-[#2563eb] [&_a]:underline [&_a:hover]:text-[#1d4ed8]">
                        {/<[a-z]/i.test(value) ? (
                          <span dangerouslySetInnerHTML={{ __html: value }} />
                        ) : (
                          value
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Compatible contacts ───────────────────────────────────────── */}
        {hasDetailContacts && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-3">Compatible contacts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.contacts.map((c) => <DetailRelatedCard key={c.partNumber} item={c} />)}
            </div>
          </section>
        )}

        {!hasDetailContacts && magentoContactRefs.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-3">Compatible contacts</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {magentoContactRefs.map((pn) => (
                <PartCard key={pn} partNumber={pn} magentoProduct={resolveRef(pn)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Mating connectors ─────────────────────────────────────────── */}
        {hasDetailMating && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-3">Mating connectors</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.matingConnectors.map((c) => <DetailRelatedCard key={c.partNumber} item={c} />)}
            </div>
          </section>
        )}

        {!hasDetailMating && magentoMatingRefs.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-3">Mating connectors</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {magentoMatingRefs.map((pn) => (
                <PartCard key={pn} partNumber={pn} magentoProduct={resolveRef(pn)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Required components ───────────────────────────────────────── */}
        {hasDetailRequired && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-1">Required components</h2>
            <p className="text-xs text-[#64748b] mb-3">Must be ordered together with the housing.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.requiredComponents.map((c) => <DetailRelatedCard key={c.partNumber} item={c} />)}
            </div>
          </section>
        )}

        {!hasDetailRequired && magentoRequiredRefs.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-1">Required components</h2>
            <p className="text-xs text-[#64748b] mb-3">Must be ordered together with the housing.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {magentoRequiredRefs.map((pn) => (
                <PartCard key={pn} partNumber={pn} magentoProduct={resolveRef(pn)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Accessories ───────────────────────────────────────────────── */}
        {hasDetailAccessories && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-3">Accessories</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {detail.accessories.map((c) => <DetailRelatedCard key={c.partNumber} item={c} />)}
            </div>
          </section>
        )}

        {!hasDetailAccessories && magentoAccessoryRefs.length > 0 && (
          <section>
            <h2 className="text-base font-bold text-[#0a1628] mb-3">Accessories</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {magentoAccessoryRefs.map((pn) => (
                <PartCard key={pn} partNumber={pn} magentoProduct={resolveRef(pn)} />
              ))}
            </div>
          </section>
        )}

        {/* ── Drawings & CAD files ──────────────────────────────────────── */}
        {detail && detail.drawings.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#0a1628] mb-4">Drawings & CAD files</h2>
            <div className="space-y-2">
              {detail.drawings.map((file) => <DownloadRow key={file.url} file={file} />)}
            </div>
          </section>
        )}

        {(!detail || detail.drawings.length === 0) && magentoProduct && magentoProduct.files.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-[#0a1628] mb-4">Drawings & CAD files</h2>
            <div className="space-y-2">
              {magentoProduct.files.map((file, i) => (
                <CatalogueFileRow key={`${file.id}-${i}`} file={file} />
              ))}
            </div>
          </section>
        )}

        {/* ── About TE Connectivity / Deutsch ───────────────────────────── */}
        {(() => {
          const brand = brands.find((b) => b.id === "deutsch");
          if (!brand) return null;
          return (
            <section className="rounded-xl border border-[#e5e7eb] bg-white p-6">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]">About the manufacturer</p>
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block text-sm font-bold text-[#0a1628] hover:text-[#2563eb] transition-colors"
              >
                {brand.name}
              </a>
              <p className="text-sm leading-relaxed text-[#64748b]">{brand.description}</p>
              <a
                href={brand.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
              >
                Visit {brand.name} website <ArrowRight size={12} />
              </a>
            </section>
          );
        })()}

        {/* ── Back to catalogue ─────────────────────────────────────────── */}
        <div>
          <Link
            href="/webshop/components/sealed-connectors/deutsch/connectors.html"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
          >
            ← Back to Deutsch connector catalogue
          </Link>
        </div>

        </div>{/* end content column */}

        {/* ── Sticky quote form sidebar ─────────────────────────────────── */}
        <aside id="quote" className="scroll-mt-24">
          <div className="lg:sticky lg:top-[140px]">
            <QuoteForm
              defaultPartNumber={partNumber}
              title={`Request a quote for ${partNumber}`}
            />
          </div>
        </aside>

        </div>{/* end grid */}
      </div>
    </div>
  );
}
