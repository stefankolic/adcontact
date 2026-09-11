import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, RefreshCw, Mail } from "lucide-react";
import TrustSection from "@/components/home/TrustSection";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Quality Management | ISO 9001:2015",
  description:
    "Adcontact is ISO 9001:2015 certified. Learn about our quality management system, continuous improvement processes, and commitment to delivering reliable industrial components.",
};

export default function QualityPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PageHeader
        crumbs={[{ label: "Quality Management" }]}
        title="Quality Management"
        intro="We are committed to continuous improvement across every process, product and service."
      />

      {/* Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main text */}
          <div className="lg:col-span-2 space-y-10">
            {/* Section 1 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={18} className="text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-bold text-[#0a1628]">Our quality management</h2>
              </div>
              <p className="text-[#374151] text-sm leading-7">
                We are ISO 9001:2015 certified, ensuring top-quality cable assemblies, connectors, and cable processing solutions. We focus on continuous improvement in all processes and welcome any questions about our quality management or environmental practices.
              </p>
            </div>

            <div className="border-t border-[#f1f5f9]" />

            {/* Section 2 */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[#eff6ff] rounded-lg flex items-center justify-center flex-shrink-0">
                  <RefreshCw size={18} className="text-[#2563eb]" />
                </div>
                <h2 className="text-xl font-bold text-[#0a1628]">Continuous improvement</h2>
              </div>
              <div className="space-y-4 text-[#374151] text-sm leading-7">
                <p>
                  We are committed to delivering the highest quality products and services. We are ISO 9001:2015 certified, reflecting our dedication to consistent quality, reliable processes, and continuous improvement across all aspects of our business.
                </p>
                <p>
                  Our quality management system ensures that every cable assembly, connector, and cable processing solution meets stringent standards and customer expectations. We actively work on continuous improvement of our processes, products, and services, striving to enhance efficiency, reliability, and sustainability.
                </p>
                <p>
                  We welcome any questions regarding our quality management practices or environmental procedures. Please feel free to contact us to learn more about how we maintain and improve our standards.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#0a1628] rounded-xl p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#60a5fa] mb-2">Certified</p>
              <h3 className="text-2xl font-bold mb-1">ISO 9001:2015</h3>
              <p className="text-[#94a3b8] text-xs leading-relaxed mb-4">
                Certified quality management for the sale of components and production equipment for the electronics industry.
              </p>
              <div className="space-y-2 text-xs border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Certificate</span>
                  <span className="font-semibold">0035375</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Issuer</span>
                  <span className="font-semibold">Intertek</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Valid until</span>
                  <span className="font-semibold">12 October 2027</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={14} className="text-[#2563eb]" />
                <h3 className="text-sm font-semibold text-[#0a1628]">Questions about quality?</h3>
              </div>
              <p className="text-xs text-[#6b7280] leading-relaxed mb-4">
                Contact us to learn more about our quality management practices, environmental procedures, or certifications.
              </p>
              <Link
                href="/contact"
                className="flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
              >
                Get in touch <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Adcontact section */}
      <TrustSection />
    </div>
  );
}
