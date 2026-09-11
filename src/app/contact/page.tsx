import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight, Clock } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Adcontact. Headquarters in Keila, Estonia (Gammeter OÜ) and sales office in Bromma, Sweden (Adcontact AB). Covering the full Nordic region.",
};

const offices = [
  {
    label: "Estonia — Headquarters",
    company: "Gammeter OÜ",
    address: ["Keki tn 6/1", "76606 Keila", "Estonia"],
    phone: "+372 671 22 51",
    phoneHref: "tel:+3726712251",
    email: "info@gammeter.ee",
    topics: ["Admin", "Finance", "Company enquiries"],
  },
  {
    label: "Sweden — Sales Office",
    company: "Adcontact AB",
    address: ["Ekbacksvägen 22", "SE-168 69 Bromma", "Sweden"],
    phone: "+46 (0)8-445 36 00",
    phoneHref: "tel:+46084453600",
    email: "info@adcontact.se",
    topics: ["Sales", "Quotes", "Technical support"],
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PageHeader
        crumbs={[{ label: "Contact" }]}
        title="Contact us"
        intro="Reach us by phone or email, or submit a quote request and we will get back to you within one business day."
      />

      <div className="max-w-[1440px] mx-auto px-6 py-12">

        {/* Office cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {offices.map((office) => (
            <div
              key={office.label}
              className="rounded-2xl border border-[#e2e8f0] bg-white p-7 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-[#2563eb] flex-shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2563eb]">
                  {office.label}
                </span>
              </div>

              <p className="text-xl font-bold text-[#0a1628] mb-1">{office.company}</p>
              <address className="not-italic text-sm leading-6 text-[#6b7280] mb-6">
                {office.address.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>

              <div className="space-y-3 border-t border-[#f3f4f6] pt-5 mb-6">
                <a
                  href={office.phoneHref}
                  className="flex items-center gap-3 text-sm text-[#374151] hover:text-[#2563eb] transition-colors"
                >
                  <Phone size={14} className="text-[#2563eb] flex-shrink-0" />
                  {office.phone}
                </a>
                <a
                  href={`mailto:${office.email}`}
                  className="flex items-center gap-3 text-sm text-[#374151] hover:text-[#2563eb] transition-colors"
                >
                  <Mail size={14} className="text-[#2563eb] flex-shrink-0" />
                  {office.email}
                </a>
              </div>

              <div className="border-t border-[#f3f4f6] pt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#94a3b8] mb-2.5">
                  Contact here for
                </p>
                <div className="flex flex-wrap gap-2">
                  {office.topics.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-[#dbe3ee] bg-[#f1f5f9] px-3 py-1 text-xs font-medium text-[#475569]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Business hours + quote CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] p-7">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-[#2563eb]" />
              <h2 className="text-sm font-semibold text-[#0a1628]">Business hours</h2>
            </div>
            <div className="space-y-2 text-sm text-[#374151] mb-4">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Monday – Friday</span>
                <span className="font-medium">08:00 – 17:00 CET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Saturday – Sunday</span>
                <span className="font-medium text-[#9ca3af]">Closed</span>
              </div>
            </div>
            <p className="text-xs text-[#9ca3af]">
              Enquiries submitted outside business hours are processed the following business day.
            </p>
          </div>

          <div className="rounded-2xl bg-[#0a1628] p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#60a5fa] mb-3">
                Need a price or availability check?
              </p>
              <h2 className="text-xl font-bold text-white mb-2 leading-snug">
                Submit a quote request
              </h2>
              <p className="text-sm text-[#94a3b8] leading-relaxed">
                Fill in your part number, quantity and any application notes. Standard RFQs
                answered within 1 business day.
              </p>
            </div>
            <Link
              href="/contact/quote"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] px-5 py-3 text-sm font-semibold text-[#0a1628] transition-colors self-start"
            >
              Request a quote
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
