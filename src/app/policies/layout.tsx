import Link from "next/link";
import { FileText } from "lucide-react";

const policyLinks = [
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Shipping Policy", href: "/policies/shipping" },
  { label: "Return & Refund Policy", href: "/policies/returns" },
  { label: "Cookie Policy", href: "/policies/cookies" },
  { label: "General Terms of Delivery", href: "/policies/terms" },
  { label: "Withdraw from contract", href: "/policies/withdraw" },
];

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={14} className="text-[#2563eb]" />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Policies</p>
              </div>
              <nav className="space-y-0.5">
                {policyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-3 py-2 text-sm text-[#374151] hover:bg-white hover:text-[#2563eb] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
