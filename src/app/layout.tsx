import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/CookieConsent";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { IS_OFFICIAL_SITE, SITE_URL } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Site-wide Organization schema — ties the website to the same entity as the
// Google Business Profile (matching name, logo, address, contact), which is
// what lets Google connect the two. Adcontact is the operating brand; Gammeter
// OÜ is the parent (never present Adcontact as a standalone company).
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Adcontact",
  legalName: "Adcontact AB",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logotopmenu.png`,
  description:
    "Nordic specialist distributor of industrial electromechanical components, connectors, heat shrink tubing, crimp contacts and wire-processing production equipment.",
  parentOrganization: { "@type": "Organization", name: "Gammeter OÜ" },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ekbacksvägen 22",
    postalCode: "168 69",
    addressLocality: "Bromma",
    addressCountry: "SE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "sales",
    telephone: "+46 8 445 36 00",
    email: "info@adcontact.se",
    areaServed: ["SE", "FI", "NO", "DK", "EE"],
    availableLanguage: ["English", "Swedish"],
  },
  sameAs: ["https://www.linkedin.com/company/adcontact-gammeter/"],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Adcontact, Industrial Components & Wire-Processing Solutions",
    template: "%s | Adcontact",
  },
  description:
    "Nordic specialist distributor of industrial electromechanical components, connectors, heat shrink tubing, crimp contacts, and wire-processing production equipment. TE Connectivity, Deutsch, Stocko, DSG-Canusa.",
  keywords: [
    "industrial components supplier",
    "electromechanical components",
    "heat shrink tubing",
    "Deutsch connectors",
    "TE Connectivity distributor",
    "wire processing equipment",
    "crimp contacts",
    "M8 M12 connectors",
    "wire ferrules",
    "connector supplier Sweden",
    "Nordic industrial components",
  ],
  openGraph: {
    type: "website",
    locale: "en_SE",
    url: SITE_URL,
    siteName: "Adcontact",
    title: "Adcontact | Industrial Components & Wire-Processing Solutions",
    description:
      "Specialist industrial component and wire-processing partner for Nordic manufacturers.",
  },
  robots: {
    index: IS_OFFICIAL_SITE,
    follow: IS_OFFICIAL_SITE,
  },
  verification: {
    google: "1nEmUxSvdlIZGYD-OMqAfoJ_EljQMiTFucLj_kyQbmk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased"
        style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieConsent />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
