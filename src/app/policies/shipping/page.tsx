import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Shipping & Export Policy",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies", href: "/policies" }, { label: "Shipping & Export Policy" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-6">Shipping & Export Policy</h1>
      <div className="prose prose-sm text-[#374151] leading-7 space-y-4 max-w-2xl">
        <p>
          We ship worldwide. Our main market is Northern Europe, but with our partners and
          logistics network we ensure global coverage, including export shipments outside the EU.
        </p>
        <p>Standard shipping terms are ExWorks from our distribution center in Keila, Estonia.</p>
        <p>Our standard forwarder is FedEx.</p>
        <p>Goods can be picked up at our distribution center in Keila, Estonia.</p>
        <p>For export shipments, we prepare the necessary customs and export documentation on request.</p>
        <p>
          For further questions feel free to contact us by using the form under &quot;Contact us&quot;.
        </p>
        <p className="font-medium">Thank you!</p>
      </div>
      <div className="mt-8 pt-6 border-t border-[#f1f5f9]">
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
          Contact us <ArrowRight size={13} />
        </Link>
      </div>
    </>
  );
}
