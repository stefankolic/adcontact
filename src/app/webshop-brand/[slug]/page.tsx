import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Boxes,
  ChevronRight,
  ExternalLink,
  Mail,
  PackageCheck,
} from "lucide-react";
import ProductCatalogue from "./ProductCatalogue";
import { getWebshopBrand, webshopBrands } from "@/data/webshopBrands";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return webshopBrands.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = getWebshopBrand(slug);
  if (!brand) return {};

  return {
    title: `${brand.name} Webshop`,
    description: brand.description,
    alternates: {
      canonical: `https://www.adcontact.se/webshop/components/sealed-connectors/${brand.slug}.html`,
    },
  };
}

export default async function WebshopBrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getWebshopBrand(slug);
  if (!brand) notFound();

  const itemCount = brand.products.length || brand.categories.length;
  const itemLabel = brand.products.length ? "catalogue products" : "product families";

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[#071425] text-white">
        <div className="absolute inset-0 tech-grid opacity-40" />
        <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl ${brand.accent} opacity-20 blur-3xl`} />
        <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6 pt-7 pb-16 sm:pb-20">
          <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-10" aria-label="Breadcrumb">
            <Link href="/webshop.html" className="hover:text-white transition-colors">Webshop</Link>
            <ChevronRight size={13} />
            <Link href="/webshop/components/sealed-connectors.html" className="hover:text-white transition-colors">
              Sealed connectors
            </Link>
            <ChevronRight size={13} />
            <span className="text-white">{brand.name}</span>
          </nav>

          <div className="grid lg:grid-cols-[1fr_390px] items-center gap-10 lg:gap-16">
            <div className="max-w-3xl animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
                <PackageCheck size={14} />
                {brand.label}
              </div>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.02]">
                {brand.name}
                <span className="block text-blue-300">webshop catalogue</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base sm:text-lg leading-8 text-slate-300">
                {brand.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#catalogue"
                  className="btn-elevate inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8]"
                >
                  Browse catalogue <ArrowRight size={16} />
                </a>
                <Link
                  href="/contact/quote"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
                >
                  <Mail size={16} /> Ask a product specialist
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/95 p-8 sm:p-10 shadow-2xl shadow-black/30">
              <div className="relative h-28 w-full">
                <Image
                  src={brand.logo}
                  alt={`${brand.name} logo`}
                  fill
                  priority
                  sizes="390px"
                  className="object-contain"
                />
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-slate-200 pt-6">
                <div>
                  <div className="text-2xl font-extrabold text-[#0a1628]">{itemCount}</div>
                  <div className="mt-1 text-xs font-medium text-[#64748b]">{itemLabel}</div>
                </div>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-end gap-1.5 text-right text-xs font-bold text-[#2563eb] hover:text-[#1d4ed8]"
                >
                  Manufacturer site <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {brand.products.length > 0 ? (
        <ProductCatalogue products={brand.products} />
      ) : (
        <section id="catalogue" className="relative py-16 sm:py-20 bg-canvas">
          <div className="absolute inset-0 grid-overlay pointer-events-none" />
          <div className="relative max-w-[1440px] mx-auto px-5 sm:px-6">
            <div className="max-w-2xl mb-9">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb] mb-3">
                Product catalogue
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#0a1628]">Choose a product family</h2>
              <p className="mt-3 text-[#64748b]">{brand.catalogueNote}</p>
            </div>

            <div className={`grid gap-5 ${brand.slug === "htp" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-2"}`}>
              {brand.categories.map((category, index) => (
                <article key={category.href} className="surface-card group rounded-2xl overflow-hidden flex flex-col">
                  {category.image ? (
                    <Link href={category.href} className="relative h-48 bg-white border-b border-[#edf1f5]">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between px-6 pt-6">
                      <div className="icon-tile flex h-11 w-11 items-center justify-center rounded-xl">
                        <Boxes size={20} />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#94a3b8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <Link href={category.href} className="group/title flex items-start justify-between gap-4">
                      <h3 className="text-lg font-bold text-[#0a1628] group-hover/title:text-[#2563eb] transition-colors">
                        {category.title}
                      </h3>
                      <ArrowRight className="mt-1 shrink-0 text-[#2563eb] transition-transform group-hover/title:translate-x-1" size={17} />
                    </Link>
                    {category.children && category.children.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {category.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-2.5 py-1.5 text-[11px] font-semibold text-[#475569] hover:border-[#93c5fd] hover:bg-blue-50 hover:text-[#1d4ed8] transition-colors"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-12 border-t border-[#e5e7eb]">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-6">
          <div className="rounded-2xl bg-[#0a1628] px-6 py-7 sm:px-9 sm:py-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Technical support</p>
              <h2 className="mt-2 text-2xl font-bold">Need help selecting the right {brand.name} part?</h2>
              <p className="mt-2 text-sm text-slate-300">Send us your requirements, drawing, or existing part number.</p>
            </div>
            <Link
              href="/contact/quote"
              className="btn-elevate inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0a1628] hover:bg-blue-50"
            >
              Contact Adcontact <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
