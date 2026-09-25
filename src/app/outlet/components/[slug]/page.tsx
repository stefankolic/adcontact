import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight, Mail, Package } from "lucide-react";
import type { Metadata } from "next";
import { OUTLET_OWN_PAGES, outletItemBySlug, outletOwnPage, outletSlug } from "@/data/deutschOutlet";
import { CHECKOUT_ELIGIBLE_SKUS } from "@/data/outletCheckoutPilot";
import { OutletStockBlock } from "@/components/outlet/OutletStockBlock";
import { outletSoldOut, outletStock } from "@/data/outletStock";
import { productJsonLd, breadcrumbJsonLd } from "@/lib/productSchema";

export function generateStaticParams() {
  return Object.values(OUTLET_OWN_PAGES).map((page) => ({ slug: outletSlug(page.partNumber) }));
}

function describe(partNumber: string, priceEur: number, quantity: number): string {
  const base = `Deutsch ${partNumber}, surplus outlet stock from Adcontact's own warehouse in Keila. New, EUR ${priceEur.toFixed(2)} per unit`;
  return quantity > 0
    ? `${base}, ${quantity.toLocaleString("en-US")} in stock. Buy online or ask for volume pricing.`
    : `${base}. Currently sold out, ask us whether we can source more.`;
}

function lookup(slug: string) {
  const item = outletItemBySlug(slug);
  const page = item ? outletOwnPage(item) : null;
  return item && page ? { item, page } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = lookup(slug);
  if (!found) return {};
  const { item, page } = found;
  return {
    title: `Deutsch ${page.partNumber}, Outlet Surplus Stock`,
    description: describe(page.partNumber, item.priceEur, outletStock(item)),
    alternates: { canonical: `/outlet/components/${slug}` },
  };
}

export default async function OutletComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = lookup(slug);
  if (!found) notFound();
  const { item, page } = found;

  const pagePath = `/outlet/components/${slug}`;
  const productLd = productJsonLd({
    name: `Deutsch ${page.partNumber}, outlet surplus stock`,
    partNumber: page.partNumber,
    brand: "Deutsch",
    category: "Hardware > Power & Electrical Supplies > Wire Terminals & Connectors",
    description: describe(page.partNumber, item.priceEur, outletStock(item)),
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

  const facts: { label: string; value: string }[] = [
    { label: "Part number", value: page.partNumber },
    { label: "Brand", value: "Deutsch" },
    { label: "Condition", value: "New, surplus stock" },
    { label: "Our stock code", value: item.sku },
    { label: "In stock", value: outletSoldOut(item) ? "Sold out" : outletStock(item).toLocaleString("en-US") },
    { label: "Location", value: "Keila, Estonia" },
  ];

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
                  alt={`Deutsch ${page.partNumber}`}
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
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                Outlet
              </span>
              <span className="text-xs text-[#64748b]">Deutsch</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-[#0a1628] mb-2 tracking-tight">
              Deutsch {page.partNumber}
            </h1>
            <p className="text-[#64748b] text-sm mb-6">
              Surplus stock from our own warehouse, sold at outlet pricing while quantities last.
            </p>

            <OutletStockBlock
              item={item}
              canBuy={CHECKOUT_ELIGIBLE_SKUS.has(item.sku)}
              className="max-w-md"
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

            <dl className="mt-8 grid max-w-md grid-cols-2 gap-3">
              {facts.map((f) => (
                <div key={f.label} className="rounded-lg border border-[#e5e7eb] bg-white p-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-0.5">{f.label}</dt>
                  <dd className="text-sm font-semibold text-[#0a1628]">{f.value}</dd>
                </div>
              ))}
            </dl>

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
      </main>
    </div>
  );
}
