import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CookieSettingsLink from "@/components/CookieSettingsLink";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies", href: "/policies" }, { label: "Privacy Policy" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-2">Privacy Policy</h1>
      <p className="text-xs text-[#94a3b8] mb-6">Last updated: July 2026</p>

      <div className="prose prose-sm text-[#374151] leading-7 max-w-2xl">
        <p>
          This policy explains what personal data we collect when you use our website or contact us,
          why we collect it, who we share it with, and the rights you have. We are committed to
          handling your data in line with the EU General Data Protection Regulation (GDPR).
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Who we are</h2>
        <p>
          Adcontact is operated jointly by two companies, who act as the data controllers for the
          personal data described in this policy:
        </p>
        <div className="not-prose my-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <p className="font-semibold text-[#0a1628]">Gammeter OÜ</p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Keki tn 6/1
              <br />
              76606 Keila, Estonia
            </p>
          </div>
          <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-4">
            <p className="font-semibold text-[#0a1628]">Adcontact AB</p>
            <p className="mt-1 text-sm text-[#6b7280]">
              Ekbacksvägen 22
              <br />
              SE-168 69 Bromma, Sweden
            </p>
          </div>
        </div>
        <p>
          For any privacy question or request, please reach us through the form on our{" "}
          <Link href="/contact" className="font-semibold text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]">
            Contact
          </Link>{" "}
          page.
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">What we collect, why, and our legal basis</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Contact and quote forms.</strong> When you send an enquiry or quote request, we
            collect the details you provide (such as your name, company, email, phone number and
            message) so we can respond and, where relevant, prepare a quotation.{" "}
            <em>Legal basis:</em> our legitimate interest in answering business enquiries, and taking
            steps at your request before entering into a contract.
          </li>
          <li>
            <strong>Spam protection.</strong> Our forms use hCaptcha to tell humans from bots.{" "}
            <em>Legal basis:</em> our legitimate interest in keeping the site and our inbox secure.
          </li>
          <li>
            <strong>Website analytics.</strong> If you select &ldquo;Accept all&rdquo; in the cookie
            banner, Google Analytics measures how the site is used (pages viewed, approximate
            location, device type) so we can improve it. <em>Legal basis:</em> your consent, which you
            can withdraw at any time.
          </li>
          <li>
            <strong>Technical data.</strong> Our hosting and content-delivery providers automatically
            process technical information (such as IP address and browser type) to serve pages, keep
            the site secure and prevent abuse. <em>Legal basis:</em> our legitimate interest in
            operating a secure, reliable website.
          </li>
        </ul>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Who we share it with</h2>
        <p>
          We do not sell your personal data. We share it only with the service providers who help us
          run the website and respond to you, acting as our processors:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Web3Forms:</strong> delivers form submissions to our inbox.</li>
          <li><strong>Google (Google Analytics):</strong> website analytics, only with your consent.</li>
          <li><strong>hCaptcha (Intuition Machines):</strong> form spam protection.</li>
          <li><strong>Vercel:</strong> website hosting.</li>
          <li><strong>Cloudflare:</strong> content delivery and media hosting.</li>
          <li><strong>Our email provider:</strong> receiving and storing your correspondence.</li>
        </ul>
        <p>We may also disclose data where we are required to do so by law.</p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">International transfers</h2>
        <p>
          Some of these providers are based outside the EU/EEA (for example in the United States).
          Where personal data is transferred outside the EU/EEA, it is protected by appropriate
          safeguards, such as the European Commission&rsquo;s Standard Contractual Clauses or an
          adequacy decision.
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">How long we keep it</h2>
        <p>
          We keep enquiry and quote correspondence for as long as needed to handle your request and
          for our legitimate business and record-keeping purposes, after which it is deleted.
          Analytics data is retained according to our Google Analytics settings, and technical logs
          are kept only for a short period.
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Your rights</h2>
        <p>Under the GDPR you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>access the personal data we hold about you;</li>
          <li>ask us to correct inaccurate data;</li>
          <li>ask us to erase your data;</li>
          <li>restrict or object to our processing;</li>
          <li>receive your data in a portable format;</li>
          <li>
            withdraw consent at any time (for analytics, use the{" "}
            <CookieSettingsLink className="font-semibold text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]" />{" "}
            option in the footer).
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us through the form on our Contact page. You also
          have the right to lodge a complaint with a supervisory authority: in Estonia, the Data
          Protection Inspectorate (Andmekaitse Inspektsioon); in Sweden, the Authority for Privacy
          Protection (IMY).
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Cookies</h2>
        <p>
          For details of the cookies we use and how to control them, please see our{" "}
          <Link href="/policies/cookies" className="font-semibold text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]">
            Cookie Policy
          </Link>
          .
        </p>

        <h2 className="text-base font-bold text-[#0a1628] mt-6 mb-2">Changes to this policy</h2>
        <p>
          We may update this policy from time to time. The date at the top of the page shows when it
          was last revised.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-[#f1f5f9]">
        <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors">
          Contact us <ArrowRight size={13} />
        </Link>
      </div>
    </>
  );
}
