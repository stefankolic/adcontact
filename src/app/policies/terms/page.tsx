import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "General Terms of Delivery",
};

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies", href: "/policies" }, { label: "General Terms of Delivery" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-6">General Terms of Delivery</h1>
      <div className="prose prose-sm text-[#374151] leading-7 space-y-4 max-w-2xl">
        <p>
          Our deliveries are governed by the IML 2009 standard terms. Download the full document below.
        </p>
      </div>

      <a
        href="/IML-2009.pdf"
        download="IML-2009.pdf"
        className="mt-6 inline-flex items-center gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 text-sm font-semibold text-[#0a1628] transition-all hover:border-[#2563eb] hover:bg-white hover:shadow-md"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] text-white">
          <Download size={16} />
        </span>
        <div>
          <p className="font-semibold text-[#0a1628]">IML 2009 — General Terms of Delivery</p>
          <p className="text-xs font-normal text-[#6b7280]">PDF document</p>
        </div>
      </a>

      <div className="mt-8 pt-6 border-t border-[#f1f5f9] flex items-center gap-6">
        <p className="text-sm text-[#6b7280]">Questions about our terms?</p>
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
          Contact us <ArrowRight size={13} />
        </Link>
      </div>
    </>
  );
}
