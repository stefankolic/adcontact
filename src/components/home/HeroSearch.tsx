"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { featuredProducts } from "@/data/featuredProducts";

const conveyorTrack = [...featuredProducts, ...featuredProducts];

const conveyorCss = `
@keyframes adc-hero-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.adc-hero-track {
  animation: adc-hero-marquee 55s linear infinite;
  will-change: transform;
}
.adc-hero-viewport:hover .adc-hero-track {
  animation-play-state: paused;
}
.adc-hero-mask {
  -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .adc-hero-track { animation: none; }
}
`;

const quickLinks = [
  { label: "Deutsch connectors", href: "/products/deutsch-connectors" },
  { label: "Heat shrink tubing", href: "/webshop/components/heat-shrinkable.html" },
  { label: "Crimping equipment", href: "/webshop/production-equipment/crimping-equipment.html" },
  { label: "M8/M12 connectors", href: "/webshop/components/sealed-connectors/htp.html" },
  { label: "Wire ferrules", href: "/webshop/components/sealed-connectors/zoller-frohlich.html" },
];

const trustBadges = [
  "Specialist supplier since 1985",
  "ISO 9001:2015 certified",
  "Global coverage",
  "High availability on stock",
];

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0a1628] min-h-[500px] sm:min-h-[520px] md:min-h-[540px] lg:min-h-[560px] flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: conveyorCss }} />
      {/* Background video */}
      <video
        className="hero-background-video absolute inset-0 h-full w-full object-cover object-center hidden md:block"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/background-poster.jpg"
        aria-hidden="true"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Dark gradient overlay, keeps text legible over the footage */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/98 via-[#0a1628]/78 to-[#0a1628]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 via-transparent to-[#0a1628]/20" />

      {/* Subtle tech grid on top */}
      <div className="absolute inset-0 tech-grid opacity-40" />

      {/* Blue glow accents */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] bg-[#2563eb] opacity-[0.06] rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] bg-[#1d4ed8] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-16 lg:py-10 w-full flex-1 flex items-center">
        <div className="max-w-3xl animate-fade-up">
          {/* Headline */}
          <h1 className="text-[clamp(1.625rem,5.5vw,3.125rem)] font-extrabold text-white leading-[1.1] tracking-[-0.025em] text-balance mb-4 sm:mb-5">
            Source the right component.{" "}
            <span className="bg-gradient-to-r from-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
              Build the right process.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[#a3b2c7] text-[15px] sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-7 max-w-2xl">
            Industrial components, connection systems and wire-processing equipment, backed by
            technical support from people who understand the complete production chain.
          </p>

          {/* Search + quick links — mobile only; desktop nav already has a search bar */}
          <div className="lg:hidden">
            <form onSubmit={handleSearch} action="/products" method="GET" className="relative mb-5 sm:mb-6">
              <div className="flex items-center bg-white rounded-2xl shadow-[0_8px_50px_rgba(0,0,0,0.35)] border border-white/10 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-[#2563eb]/60 focus-within:shadow-[0_8px_60px_rgba(37,99,235,0.35)]">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 pl-4 sm:pl-5">
                  <Search size={18} className="text-[#9ca3af] flex-shrink-0" />
                  <input
                    type="text"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search product, brand or part number…"
                    className="flex-1 min-w-0 py-3.5 sm:py-4 text-[#111827] text-[15px] sm:text-base placeholder:text-[#9ca3af] bg-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Search"
                  className="m-1.5 flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-semibold text-sm transition-colors h-11 w-11 sm:h-auto sm:w-auto sm:px-6 sm:py-3"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight size={18} className="sm:size-[15px]" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#64748b]">Quick search:</span>
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#0f2042]/80 hover:bg-[#1a2f5a] text-[#93c5fd] text-[11px] sm:text-xs font-medium rounded-full border border-[#1e3a6e] hover:border-[#2563eb] transition-all duration-200 hover:-translate-y-0.5"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Compact proof points */}
        <div className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 flex-col gap-3">
          {trustBadges.map((badge, i) => (
            <div
              key={badge}
              className="flex items-center gap-2.5 bg-[#0f2042]/80 border border-[#1e3a6e] backdrop-blur-sm rounded-lg px-4 py-3 min-w-[200px]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CheckCircle size={14} className="text-[#2563eb] flex-shrink-0" />
              <span className="text-xs font-medium text-[#e2e8f0]">{badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Product conveyor — bottom of hero */}
      <div className="relative w-full border-t border-[#e5eaf0] bg-white py-3">
        <p className="mb-2 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-[#94a3b8]">
          Featured products
        </p>
        <div className="adc-hero-viewport adc-hero-mask overflow-hidden">
          <div className="adc-hero-track flex w-max items-center gap-3 px-4">
            {conveyorTrack.map((product, i) => (
              <Link
                key={`${product.href}-${i}`}
                href={product.href}
                aria-hidden={i >= featuredProducts.length}
                tabIndex={i >= featuredProducts.length ? -1 : undefined}
                className="group flex w-28 sm:w-32 flex-none flex-col overflow-hidden rounded-lg border border-[#e5eaf0] bg-[#f8fafc] transition-all duration-200 hover:border-[#2563eb]/40 hover:bg-white hover:shadow-sm"
              >
                <div className="relative h-16 sm:h-20 w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.05]"
                    sizes="128px"
                    unoptimized
                  />
                </div>
                <div className="px-2 pb-2">
                  <p className="line-clamp-1 text-[10px] font-medium leading-tight text-[#64748b] group-hover:text-[#2563eb]">
                    {product.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
