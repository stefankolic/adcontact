import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, Package, Recycle } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { usedMachines, getModelDescription } from "@/data/usedMachines";
import { absoluteUrl } from "@/lib/seo";

// Real listing data (Komax Gamma 450) is ready, but showing it publicly is
// gated on a supplier partner's final confirmation — flip this to true the
// moment Stefan says go, no other changes needed. Until then this page shows
// honest "coming soon" copy instead of the internal "Template preview" state,
// which would look broken (not just early) to a real customer.
const SHOW_LISTINGS = false;

export const metadata: Metadata = {
  title: "Used Machines | Outlet | Adcontact",
  description:
    "Second-hand cable-processing machines from Adcontact. We are building our used-machine offering for the Nordic market. Tell us what you are looking for and we will help you source it.",
  alternates: { canonical: absoluteUrl("/outlet/used-machines") },
};

export default function UsedMachinesPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <PageHeader
        crumbs={[{ label: "Outlet", href: "/outlet" }, { label: "Used Machines" }]}
        title="Used machines"
        intro="Secondhand cutting, stripping and crimping machines, sourced through our supplier network for the Nordic market."
      />

      <main className="mx-auto max-w-[1440px] px-6 py-10">
        {!SHOW_LISTINGS && (
          <section className="mb-10 rounded-2xl border border-[#e2e8f0] bg-white px-6 py-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Recycle size={14} />
              Coming soon
            </span>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#475569]">
              We&apos;re building out our secondhand machine listings for the Nordic market,
              cutting, stripping and crimping equipment sourced through our supplier network.
              First listings are on their way. If you&apos;re looking for a specific used
              machine, or have one to sell, tell us below and we&apos;ll help.
            </p>
          </section>
        )}

        {SHOW_LISTINGS && usedMachines.length > 0 && (
          <section className="mb-10">
            {/* Same template as the Ramatech product-line grid: picture LEFT
                (w-28 / sm:w-40, fills the card height), text RIGHT. */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {usedMachines.map((machine) => {
                const description = getModelDescription(machine.brand, machine.model);
                return (
                  <Link
                    key={machine.slug}
                    href={`/outlet/used-machines/${machine.slug}`}
                    className="group flex min-h-[176px] overflow-hidden rounded-lg border border-[#d8dee7] bg-white transition-all hover:-translate-y-0.5 hover:border-[#93c5fd] hover:shadow-[0_18px_34px_-24px_rgba(15,23,42,0.35)]"
                  >
                    <div className="relative w-28 flex-none bg-white sm:w-40">
                      {machine.photos[0] ? (
                        <Image
                          src={machine.photos[0]}
                          alt={`${machine.brand} ${machine.model}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 112px, 160px"
                          className="object-contain p-2 transition-transform duration-300 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-[#94a3b8]">
                          <Package size={22} />
                          <span className="text-[10px] font-medium">No photo yet</span>
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                      <h3 className="text-sm font-bold text-[#0a1628] group-hover:text-[#2563eb] sm:text-base">
                        {machine.brand} {machine.model}
                      </h3>
                      {description && (
                        <p className="mt-1.5 text-[13px] leading-5 text-[#475569]">{description.short}</p>
                      )}
                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-[#0a1628]">
                          {machine.price ?? "On request"}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748b] transition-colors group-hover:text-[#2563eb]">
                          Details
                          <ArrowUpRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 sm:px-8">
          <h2 className="text-lg font-bold text-[#0a1628] sm:text-xl">
            Looking for a used machine, or selling one?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569]">
            Tell us the machine type, brand or application you need, or the machine you want to
            sell, and we will match it to our network across the Nordics.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a
              href="mailto:info@adcontact.se?subject=Used%20machines%20enquiry"
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
