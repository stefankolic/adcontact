import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Policies",
};

const policies = [
  { label: "Privacy Policy", href: "/policies/privacy", description: "How we collect and handle personal data." },
  { label: "Shipping Policy", href: "/policies/shipping", description: "Delivery terms, forwarder, and collection options." },
  { label: "Return & Refund Policy", href: "/policies/returns", description: "Claim periods, return conditions, and the approval process." },
  { label: "Cookie Policy", href: "/policies/cookies", description: "How we use cookies and how to manage them." },
  { label: "General Terms of Delivery", href: "/policies/terms", description: "Our standard delivery terms (IML 2009)." },
];

export default function PoliciesIndexPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-2">Policies</h1>
      <p className="text-sm text-[#6b7280] mb-8">Select a policy to read the full details.</p>
      <div className="space-y-3">
        {policies.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex items-center justify-between rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-5 py-4 hover:border-[#2563eb] hover:bg-white transition-all"
          >
            <div>
              <p className="text-sm font-semibold text-[#0a1628] group-hover:text-[#2563eb] transition-colors">{p.label}</p>
              <p className="text-xs text-[#6b7280] mt-0.5">{p.description}</p>
            </div>
            <ArrowRight size={15} className="text-[#9ca3af] group-hover:text-[#2563eb] flex-shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </>
  );
}
