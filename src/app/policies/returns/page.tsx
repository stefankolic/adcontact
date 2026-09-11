import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Return & Refund Policy",
};

export default function ReturnsPolicyPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies", href: "/policies" }, { label: "Return & Refund Policy" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-6">Return & Refund Policy</h1>
      <div className="prose prose-sm text-[#374151] leading-7 space-y-4 max-w-2xl">
        <p>
          We operate exclusively in the B2B sector, where each customer has an individual commercial agreement established with us.
        </p>
        <p>
          We offer an 8-day claim period from the date of receival for any issues related to received goods. All claims must be submitted in writing within this period, including a description of the issue and relevant documentation.
        </p>
        <p>
          Returns are only accepted after written approval from our quality team. Products must be returned in their original condition and packaging unless otherwise agreed.
        </p>
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
