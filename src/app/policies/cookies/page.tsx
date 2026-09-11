import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CookieSettingsLink from "@/components/CookieSettingsLink";

export const metadata: Metadata = {
  title: "Cookie Policy",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies", href: "/policies" }, { label: "Cookie Policy" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-2">Cookie Policy</h1>
      <p className="text-xs text-[#94a3b8] mb-6">Last updated: July 2026</p>

      <div className="prose prose-sm text-[#374151] leading-7 max-w-2xl">
        <p>
          This policy explains how our website uses cookies and similar technologies, and how you can
          control them. Cookies are small text files stored on your device that help the site work,
          remember your choices and, with your consent, measure how the site is used.
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Your choice</h2>
        <p>
          When you first visit, we ask for your consent. <strong>Strictly necessary cookies</strong> are
          always active because the site cannot function without them. <strong>Analytics and embedded-video
          cookies load only if you select &ldquo;Accept all.&rdquo;</strong> If you choose &ldquo;Necessary
          only,&rdquo; no analytics or video cookies are set.
        </p>
        <p>
          You can change or withdraw your choice at any time using the{" "}
          <CookieSettingsLink className="font-semibold text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]" />{" "}
          option (also in the site footer), or by clearing cookies in your browser. We remember your
          preference locally on your device; this stores no personal data.
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Cookies we use</h2>

        <h3 className="text-sm font-bold text-[#0a1628] mt-4 mb-1">Strictly necessary (always on)</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>hCaptcha:</strong> when you use a form, our anti-spam provider may set cookies to
            distinguish humans from bots. Required to submit forms securely.
          </li>
          <li>
            <strong>Hosting &amp; security:</strong> our hosting and security infrastructure may set
            short-lived cookies needed to serve pages safely.
          </li>
        </ul>

        <h3 className="text-sm font-bold text-[#0a1628] mt-4 mb-1">Analytics (only after you accept)</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Google Analytics (GA4):</strong> sets <code>_ga</code> / <code>_ga_*</code> cookies to
            measure visits (pages viewed, approximate location, device type) so we can improve the site.
            IP addresses are anonymised. Loads only after you select &ldquo;Accept all.&rdquo;
          </li>
        </ul>

        <h3 className="text-sm font-bold text-[#0a1628] mt-4 mb-1">Embedded video (only when loaded)</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>YouTube:</strong> some pages can embed YouTube videos (in privacy-enhanced
            &ldquo;no-cookie&rdquo; mode). YouTube sets cookies only once you accept cookies or click to
            load a video.
          </li>
        </ul>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Managing cookies</h2>
        <p>
          Use the cookie-settings option above to change your choice at any time. You can also block or
          delete cookies in your browser settings, although blocking strictly necessary cookies may stop
          parts of the site from working.
        </p>

        <p>For any questions about this policy, please contact us.</p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#f1f5f9]">
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
          Contact us <ArrowRight size={13} />
        </Link>
      </div>
    </>
  );
}
