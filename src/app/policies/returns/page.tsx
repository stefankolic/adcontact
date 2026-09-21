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
          Most of our business is B2B, where each customer has an individual commercial agreement with us. The terms below apply to those purchases. A small number of products in our Components Outlet are also available for direct purchase by individuals, if that&apos;s you, see &quot;For individual consumers&quot; below, which takes priority for that purchase.
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
        <h2 className="text-lg font-bold text-[#0a1628] pt-2">For individual consumers (EU/EEA)</h2>
        <p>
          If you&apos;re a private individual (not buying for your business) and purchased through our Components Outlet checkout, EU law gives you a 14-day right of withdrawal from the day you receive the goods, for any reason, no explanation needed.
        </p>
        <p>
          To withdraw, use the <Link href="/policies/withdraw" className="text-[#2563eb] hover:text-[#1d4ed8]">Withdraw from contract here</Link> function within those 14 days. It confirms your withdrawal by email straight away. You then have a further 14 days to send the goods back.
        </p>
        <p>
          Return shipping is at your own cost, unless we&apos;ve agreed otherwise in writing. Once we receive the goods back (or you provide proof you&apos;ve sent them), we&apos;ll refund your payment within 14 days, using your original payment method.
        </p>
        <p>
          You&apos;re welcome to inspect and test the item as you would in a shop before buying. If it&apos;s been used, altered, or handled beyond that, for example soldered, crimped into a harness, or otherwise permanently changed, we may deduct an amount reflecting the reduction in its value from your refund.
        </p>
        <p>
          This section applies only to purchases made as an individual consumer through the Components Outlet checkout. It doesn&apos;t change the terms above for our standard B2B trade.
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
