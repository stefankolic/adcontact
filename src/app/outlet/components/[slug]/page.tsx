import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Mail, Package, Phone } from "lucide-react";
import type { Metadata } from "next";
import { OUTLET_OWN_PAGES, outletItemBySlug, outletOwnPage, outletSlug } from "@/data/deutschOutlet";
import { CHECKOUT_ELIGIBLE_SKUS } from "@/data/outletCheckoutPilot";
import { OutletStockBlock } from "@/components/outlet/OutletStockBlock";
import { outletSoldOut } from "@/data/outletStock";
import { outletSeo } from "@/data/outletSeo";
import QuoteForm from "@/components/QuoteForm";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/productSchema";

export function generateStaticParams() {
  return Object.values(OUTLET_OWN_PAGES).map((page) => ({ slug: outletSlug(page.partNumber) }));
}

function lookup(slug: string) {
  const item = outletItemBySlug(slug);
  const page = item ? outletOwnPage(item) : null;
  const seo = item ? outletSeo(item) : null;
  return item && page && seo ? { item, page, seo } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = lookup(slug);
  if (!found) return {};
  const { page, seo } = found;
  return {
    title: `${page.partNumber} | Deutsch Connector Outlet`,
    description: seo.description,
    alternates: { canonical: `/outlet/components/${slug}` },
  };
}

export default async function OutletComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = lookup(slug);
  if (!found) notFound();
  const { item, page, seo } = found;

  const pagePath = `/outlet/components/${slug}`;
  const productLd = productJsonLd({
    name: seo.title,
    partNumber: page.partNumber,
    brand: "Deutsch",
    category: "Hardware > Power & Electrical Supplies > Wire Terminals & Connectors",
    description: seo.description,
    image: page.image,
    url: pagePath,
    offer: { priceEur: item.priceEur, inStock: !outletSoldOut(item) },
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Outlet", url: "/outlet" },
    { name: "Components Outlet", url: "/outlet/components" },
    { name: page.partNumber, url: pagePath },
  ]);

  const enquiryHref = `mailto:info@adcontact.se?subject=${encodeURIComponent(
    `Outlet enquiry: ${item.sku}`,
  )}&body=${encodeURIComponent(
    `Hi,\n\nI'd like to ask about this part from your components outlet:\n\nSKU: ${item.sku}\nPart: ${page.partNumber}\nQuantity wanted: \n\nThanks!`,
  )}`;

  // Same header pieces as the regular Deutsch part page: chips, one-line summary, quick spec cards.
  const own = page.seo ?? {};
  const kindLine = own.kind ? `${own.kind}${own.fitsSeries ? ` for ${own.fitsSeries}` : ""}` : "";
  const summary = [
    own.series,
    own.ways ? `${own.ways}-way` : "",
    own.type,
    kindLine,
    own.shellSize ? `${own.kind ? "Size" : "Shell size"} ${own.shellSize}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const quickSpecs = seo.specs.filter(([label]) => !["Part number", "Brand", "Condition"].includes(label));

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-[1440px] mx-auto px-6 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#0a1628] transition-colors">Adcontact</Link>
            <ChevronRight size={11} />
            <Link href="/outlet" className="hover:text-[#0a1628] transition-colors">Outlet</Link>
            <ChevronRight size={11} />
            <Link href="/outlet/components" className="hover:text-[#0a1628] transition-colors">Components Outlet</Link>
            <ChevronRight size={11} />
            <span className="text-[#0a1628] font-medium">{page.partNumber}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-10">
          <div>
            <div className="relative aspect-square max-w-md w-full bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
              {page.image ? (
                <Image
                  src={page.image}
                  alt={seo.title}
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
            {page.reference && (
              <p className="mt-2 max-w-md text-xs text-[#64748b]">
                Reference image of a similar part. Minor details may differ from the part supplied.
              </p>
            )}

            {/* Outlet stock under the image, matched to its width, as on the Deutsch and catalogue part pages. */}
            <OutletStockBlock
              item={item}
              canBuy={CHECKOUT_ELIGIBLE_SKUS.has(item.sku)}
              className="mt-4 max-w-md"
            />

            {!outletSoldOut(item) && (
              <p className="mt-4 max-w-md text-sm leading-6 text-[#475569]">
                Need more than 10 pieces? Where we hold enough stock we can often match or beat other
                distributors&apos; bulk pricing.{" "}
                <a href={enquiryHref} className="inline-flex items-center gap-1 font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
                  <Mail size={13} />
                  Ask us for a price
                </a>
              </p>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                Outlet
              </span>
              {own.series && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {own.series.replace(/\s*Series$/i, "")}
                </span>
              )}
              {own.ways && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {own.ways}-way
                </span>
              )}
              {own.type && (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    own.type === "Socket"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-violet-50 text-violet-700 border-violet-200"
                  }`}
                >
                  {own.type}
                </span>
              )}
              {own.kind && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {own.kind}
                </span>
              )}
              <span className="text-xs text-[#64748b]">Deutsch</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-[#0a1628] mb-2 tracking-tight">
              {seo.title}
            </h1>
            <p className="text-[#64748b] text-sm mb-5">
              {summary || "Surplus stock from our own warehouse, sold at outlet pricing while quantities last."}
            </p>

            {quickSpecs.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {quickSpecs.map(([label, value]) => (
                  <div key={label} className="bg-white border border-[#e5e7eb] rounded-lg p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-0.5">{label}</div>
                    <div className="text-sm font-semibold text-[#0a1628]">{value}</div>
                  </div>
                ))}
              </div>
            )}

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
                href={`mailto:info@adcontact.se?subject=Quote request: ${page.partNumber}`}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#f8fafc] border border-[#e5e7eb] text-[#374151] font-medium rounded-lg transition-colors"
              >
                <Mail size={14} />
                Email
              </a>
            </div>

            <p className="mt-6 max-w-md text-xs leading-5 text-[#64748b]">
              Delivery and returns are covered in our{" "}
              <Link href="/policies/shipping" className="font-semibold text-[#475569] underline underline-offset-2 hover:text-[#2563eb]">
                shipping policy
              </Link>{" "}
              and{" "}
              <Link href="/policies/returns" className="font-semibold text-[#475569] underline underline-offset-2 hover:text-[#2563eb]">
                returns policy
              </Link>
              . More surplus parts are in the{" "}
              <Link href="/outlet/components" className="font-semibold text-[#475569] underline underline-offset-2 hover:text-[#2563eb]">
                Components Outlet
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-bold text-[#0a1628] mb-4">Technical specifications</h2>
              <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {[...seo.specs, ["Our stock code", item.sku] as [string, string], ["Location", "Keila, Estonia"] as [string, string]].map(([key, value], i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"}>
                        <td className="px-5 py-3 font-medium text-[#64748b] w-56 text-xs uppercase tracking-wide">{key}</td>
                        <td className="px-5 py-3 font-semibold text-[#0a1628]">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#64748b]">
                Missing a detail, a drawing or a datasheet? Ask us and we will send what we have.
              </p>
            </section>

            <div>
              <Link
                href="/products/deutsch-connectors"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
              >
                ← Browse Deutsch connectors
              </Link>
            </div>
          </div>

          <aside id="quote" className="scroll-mt-24">
            <div className="lg:sticky lg:top-[140px]">
              <QuoteForm defaultPartNumber={page.partNumber} title={`Request a quote for ${page.partNumber}`} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
