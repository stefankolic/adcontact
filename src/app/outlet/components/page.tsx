import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { absoluteUrl } from "@/lib/seo";
import { deutschOutletComponents } from "@/data/deutschOutlet";
import OutletComponentsClient from "./OutletComponentsClient";

export const metadata: Metadata = {
  // Deutsch-only for now, so the <title> can be brand-specific and target real
  // search intent ("deutsch connector outlet / surplus / clearance"). The
  // visible H1 stays the brand-agnostic "Components outlet" — this becomes a
  // multi-brand section as more surplus stock is added.
  title: "Deutsch Connector Outlet, Surplus Stock at Reduced Prices | Adcontact",
  description:
    "Surplus Deutsch connector stock from Adcontact's own warehouse, at outlet pricing while quantities last.",
  alternates: { canonical: absoluteUrl("/outlet/components") },
};

export default function ComponentsOutletPage() {
  const skuCount = deutschOutletComponents.length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <PageHeader
        crumbs={[{ label: "Outlet", href: "/outlet" }, { label: "Components Outlet" }]}
        title="Components outlet"
        intro="Surplus connector and terminal stock from our own Keila warehouse, sold at reduced prices while quantities last."
        aside={
          <div className="rounded-2xl border border-[#1e3a6e] bg-[#0f2042] p-4 lg:w-[400px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">
              Volume pricing available
            </p>
            <p className="mt-2 text-xs leading-snug text-[#cbd5e1]">
              Listed prices apply to orders of 1 to 10 pieces. Buying more, or a large volume on
              any of these parts? Ask us, where we hold enough stock we can often match or beat
              other distributors&apos; bulk pricing.
            </p>
          </div>
        }
      />

      <main className="mx-auto max-w-[1440px] px-6 py-10">
        {/* Lives outside PageHeader on purpose — these badges caused the hero
            to grow past the shared 156px height before, so they moved here
            where they can't affect it again. */}
        <div className="mb-5 flex flex-wrap gap-3">
          <div className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
              SKUs listed
            </div>
            <div className="text-sm font-semibold text-[#0a1628]">{skuCount}</div>
          </div>
          <div className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8]">
              Brand
            </div>
            <div className="text-sm font-semibold text-[#0a1628]">Deutsch</div>
          </div>
        </div>

        <OutletComponentsClient />

        <section className="mt-10 rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 sm:px-8">
          <h2 className="text-lg font-bold text-[#0a1628] sm:text-xl">
            Looking for surplus stock on a specific part?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            This list is a fixed batch from our own stock, it won&apos;t cover everything. Tell us
            the part number, brand or application, and we will check whether it is available
            elsewhere in our outlet stock.
          </p>
          <div className="mt-4 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-900">Best price on request</p>
            <p className="mt-1 text-sm leading-6 text-amber-800">
              Our listed prices apply to orders of 1 to 10 pieces. Ordering in volume? Send us a
              request and, on items where we hold enough stock, we will do our best to match or
              beat what you would pay elsewhere at that quantity.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="mailto:info@adcontact.se?subject=Components%20outlet%20enquiry"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#f59e0b] px-4 py-2.5 text-sm font-semibold text-[#0a1628] transition-colors hover:bg-[#d97706]"
            >
              <Mail size={15} />
              Send us your enquiry
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#475569] transition-colors hover:text-[#2563eb]"
            >
              Contact Adcontact
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
