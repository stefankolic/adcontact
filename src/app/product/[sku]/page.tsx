import Link from "next/link";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, Clock, Package, Phone, Mail, ArrowRight } from "lucide-react";
import {
  getUnifiedProduct,
  getRelatedProducts,
  productDetailHref,
  type UnifiedProduct,
} from "@/data/productLookup";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/productSchema";
import QuoteForm from "@/components/QuoteForm";
import { brands } from "@/data/brands";

const BRAND_TO_SLUG: Record<string, string> = {
  deutsch: "deutsch",
  "te connectivity": "deutsch",
  stocko: "stocko",
  htp: "htp",
  cvilux: "cvilux",
  vogt: "vogt",
};

function findBrand(name: string) {
  const slug = BRAND_TO_SLUG[name.toLowerCase()];
  return slug ? brands.find((b) => b.id === slug) : null;
}

type Props = { params: Promise<{ sku: string }> };

/** One-line description, shared by the meta tag and the Product schema. */
function productDescription(product: UnifiedProduct): string {
  const desc = Object.entries(product.specs)
    .filter(([k]) => k !== "Brand")
    .slice(0, 4)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
  return `${product.sku} from ${product.brand}.${desc ? " " + desc + "." : ""} Request a quote from Adcontact, Nordic stocking distributor.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params;
  const product = getUnifiedProduct(sku);
  if (!product) return {};
  return {
    title: `${product.sku} | ${product.brand}`,
    description: productDescription(product),
    alternates: { canonical: `https://www.adcontact.se${productDetailHref(product.sku)}` },
  };
}

// Treat Magento's "no photo"/placeholder graphic as no image, so the clean
// fallback shows instead of the dated "image coming soon" placeholder.
function cleanImage(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/no_photo|placeholder/i.test(path)) return null;
  return path;
}

function RelatedCard({ sku, image }: { sku: string; image: string | null }) {
  const cleaned = cleanImage(image);
  return (
    <Link
      href={productDetailHref(sku)}
      className="group flex flex-col overflow-hidden rounded-xl border border-[#e5e7eb] bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#bfdbfe] hover:shadow-[0_16px_30px_-16px_rgba(15,23,42,0.22)]"
    >
      <div className="relative aspect-square w-full bg-white">
        {cleaned ? (
          <Image
            src={cleaned}
            alt={sku}
            fill
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 45vw, 150px"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
            <Package size={24} className="text-[#cbd5e1]" />
          </div>
        )}
      </div>
      <div className="border-t border-[#f1f5f9] px-3 py-2 text-center">
        <span className="font-mono text-[11px] font-semibold text-[#0a1628] group-hover:text-[#2563eb]">
          {sku}
        </span>
      </div>
    </Link>
  );
}

export default async function ProductPage({ params }: Props) {
  const { sku } = await params;
  const product = getUnifiedProduct(sku);
  if (!product) notFound();

  // Deutsch has a richer dedicated page (full spec fallback to Magento
  // attributes, compatible contacts/mating connectors/accessories, CAD
  // files) — send it there instead of rendering this thinner generic
  // template. Mirrors the same redirect in webshop/[...path]/page.tsx.
  // Found 2026-09-09: outlet links were pointing here directly, landing
  // visitors on a noticeably thinner page than the canonical one.
  if (product.brand === "Deutsch") {
    permanentRedirect(`/products/deutsch-connectors/${product.sku.toLowerCase()}`);
  }

  // No brand reaches this template with rich curated detail data today —
  // Deutsch (the only brand `getProductDetail` covers) redirected above.
  const specs = product.specs;
  const image = cleanImage(product.image);

  const chips = Object.entries(specs)
    .filter(([k]) => k !== "Brand" && k !== "Part Number")
    .slice(0, 5);

  const related = getRelatedProducts(product, 6);

  const productLd = productJsonLd({
    name: `${product.brand} ${product.sku}`,
    partNumber: product.sku,
    brand: product.brand,
    description: productDescription(product),
    image,
    url: productDetailHref(product.sku),
    // Quote-only on this template — outlet items are all Deutsch, which
    // redirects to the rich page above, so no priced offer here.
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Webshop", url: "/webshop.html" },
    { name: product.brand, url: product.brandHref },
    { name: product.sku, url: productDetailHref(product.sku) },
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
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-3">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748b]">
            <Link href="/" className="transition-colors hover:text-[#0a1628]">Adcontact</Link>
            <ChevronRight size={11} />
            <Link href="/webshop.html" className="transition-colors hover:text-[#0a1628]">Webshop</Link>
            <ChevronRight size={11} />
            <Link href={product.brandHref} className="transition-colors hover:text-[#0a1628]">
              {product.brand}
            </Link>
            <ChevronRight size={11} />
            <span className="font-medium text-[#0a1628]">{product.sku}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-6 py-10">
        {/* ── Top: image + key info ─────────────────────────────────────── */}
        <div className="mb-12 grid gap-10 lg:grid-cols-2">
          <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
            {image ? (
              <Image
                src={image}
                alt={product.sku}
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

          <div className="flex flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#2563eb]">
                {product.brand}
              </span>
              {chips.slice(0, 3).map(([k, v]) => (
                <span
                  key={k}
                  className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-xs font-medium text-[#475569]"
                >
                  {v}
                </span>
              ))}
            </div>

            <h1 className="mb-2 font-mono text-3xl font-bold tracking-tight text-[#0a1628] lg:text-4xl">
              {product.sku}
            </h1>
            <p className="mb-6 text-sm text-[#64748b]">
              {product.brand}
              {specs["Series"] ? ` · ${specs["Series"]}` : ""}
              {specs["No. of cavities"] ? ` · ${specs["No. of cavities"]}-way` : ""}
            </p>

            {/* Spec highlights */}
            {chips.length > 0 && (
              <div className="mb-8 grid grid-cols-2 gap-3">
                {chips.map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-[#e5e7eb] bg-white p-3">
                    <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                      {k}
                    </div>
                    <div className="text-sm font-semibold text-[#0a1628]">{v}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Lead time */}
            <div className="mb-6 flex w-fit items-center gap-2 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] p-3">
              <Clock size={14} className="text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                Generally high availability — ask for current lead time
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#quote"
                className="btn-elevate btn-elevate-amber flex items-center justify-center gap-2 rounded-lg bg-[#f59e0b] px-6 py-3.5 font-semibold text-[#0a1628] transition-colors hover:bg-[#d97706]"
              >
                Request a quote
                <ArrowRight size={15} />
              </a>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-6 py-3.5 font-medium text-[#374151] transition-colors hover:bg-[#f8fafc]"
              >
                <Phone size={14} />
                Call us
              </Link>
              <a
                href={`mailto:info@adcontact.se?subject=Quote request: ${encodeURIComponent(product.sku)}`}
                className="flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-6 py-3.5 font-medium text-[#374151] transition-colors hover:bg-[#f8fafc]"
              >
                <Mail size={14} />
                Email
              </a>
            </div>
          </div>
        </div>

        {/* ── Specs + quote form ────────────────────────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div>
            <h2 className="mb-4 text-lg font-bold text-[#0a1628]">Specifications</h2>
            <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-[#f1f5f9]">
                  {Object.entries(specs).map(([key, value], i) => (
                    <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                      <td className="w-56 px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#64748b]">
                        {key}
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#0a1628]">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Quote form (sticky) */}
          <div id="quote" className="scroll-mt-28">
            <div className="lg:sticky lg:top-[168px]">
              <QuoteForm defaultPartNumber={product.sku} title={`Request a quote for ${product.sku}`} />
            </div>
          </div>
        </div>

        {/* ── More from brand ───────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 text-lg font-bold text-[#0a1628]">More from {product.brand}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {related.map((p) => (
                <RelatedCard key={p.sku} sku={p.sku} image={p.image} />
              ))}
            </div>
          </section>
        )}

        {/* ── About the manufacturer ────────────────────────────────────── */}
        {(() => {
          const brand = findBrand(product.brand);
          if (!brand) return null;
          return (
            <section className="mt-14 rounded-xl border border-[#e5e7eb] bg-white p-6">
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
      </div>
    </div>
  );
}
