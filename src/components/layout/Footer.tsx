import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { productionEquipmentGroup } from "@/data/navigation";
import CookieSettingsLink from "@/components/CookieSettingsLink";

const footerLinks = {
  "Industrial Components": [
    { label: "Connectors", href: "/webshop/components/sealed-connectors.html" },
    { label: "Heat Shrink Tubing and Protective Sleeves", href: "/webshop/components/heat-shrinkable.html" },
    { label: "Contacts & Terminals", href: "/webshop/components/contacts.html" },
    { label: "Accessories", href: "/webshop/components/accessories.html" },
    { label: "Tools", href: "/webshop/components/tools.html" },
    { label: "Wire Ferrules", href: "/webshop/components/sealed-connectors/zoller-frohlich.html" },
  ],
  // Derived from the mega-menu's single source of truth so the two can never
  // drift out of sync. To change a Production-Equipment section, edit ONLY
  // productionEquipmentGroup.items in src/data/navigation.ts.
  "Production Equipment": productionEquipmentGroup.items.map((item) => ({
    label: item.label,
    href: item.href,
  })),
  Brands: [
    { label: "Deutsch", href: "/brands" },
    { label: "TE Connectivity", href: "/brands" },
    { label: "Stocko", href: "/brands" },
    { label: "DSG-Canusa", href: "/brands" },
    { label: "Mecal", href: "/brands" },
    { label: "Zoller & Fröhlich", href: "/brands" },
    { label: "View all brands →", href: "/brands" },
  ],
  Company: [
    { label: "About Adcontact", href: "/about" },
    { label: "Quality & ISO", href: "/quality" },
    { label: "Contact & Offices", href: "/contact" },
    { label: "Shipping & Export", href: "/policies/shipping" },
  ],
};

// Group companies, shown as stacked address boxes on the right of the footer.
const offices = [
  {
    company: "Gammeter OÜ",
    role: "Headquarters",
    address: ["Keki tn 6/1", "76606 Keila, Estonia"],
    phone: "+372 671 22 51",
    phoneHref: "tel:+3726712251",
    email: "info@gammeter.ee",
  },
  {
    company: "Adcontact AB",
    role: "Sales office",
    address: ["Ekbacksvägen 22", "SE-168 69 Bromma, Sweden"],
    phone: "+46 (0)8-445 36 00",
    phoneHref: "tel:+46084453600",
    email: "info@adcontact.se",
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white">
      {/* CTA strip */}
      <div className="border-b border-[#1a2f5a]">
        <div className="max-w-[1440px] mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-1">Ready to source your components?</h3>
            <p className="text-[#94a3b8] text-sm">
              Request a quote or speak with a technical sales specialist across the Nordics.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/contact/quote"
              className="btn-elevate btn-elevate-amber flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-[#0a1628] text-sm font-semibold rounded-lg"
            >
              Request a quote
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2f5a] hover:bg-[#1e3a6e] text-white text-sm font-medium rounded-md transition-colors"
            >
              <Phone size={14} />
              Call us
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-3 lg:-mt-3">
            <div className="mb-4">
              <Image
                src="/images/bottomlogotransparant.png"
                alt="Gammeter Adcontact"
                width={190}
                height={102}
                className="h-auto w-[190px] object-contain object-left"
                unoptimized
              />
            </div>
            <p className="text-[#64748b] text-xs leading-relaxed mb-5 max-w-xs">
              Specialist industrial component and wire-processing partner for Nordic manufacturers.
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.linkedin.com/company/adcontact-gammeter/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-[#1a2f5a] hover:bg-[#2563eb] rounded-md flex items-center justify-center transition-colors text-xs font-bold text-[#60a5fa]"
                aria-label="LinkedIn"
              >
                in
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {Object.entries(footerLinks).map(([heading, links]) => (
                <div key={heading}>
                  <h4 className="text-xs font-semibold text-[#e2e8f0] uppercase tracking-widest mb-4">
                    {heading}
                  </h4>
                  <ul className="space-y-2">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-xs text-[#64748b] hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Company address boxes (stacked, right) */}
          <div className="space-y-4 lg:col-span-3">
            {offices.map((office) => (
              <div
                key={office.company}
                className="rounded-lg border border-[#1a2f5a] bg-[#0d1e3d] p-4"
              >
                <h5 className="text-sm font-bold text-white">{office.company}</h5>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#60a5fa]">
                  {office.role}
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-[#94a3b8]">
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
                    <span>
                      {office.address.map((line, i) => (
                        <span key={line}>
                          {line}
                          {i < office.address.length - 1 && <br />}
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="flex-shrink-0 text-[#2563eb]" />
                    <a href={office.phoneHref} className="hover:text-white transition-colors">
                      {office.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="flex-shrink-0 text-[#2563eb]" />
                    <a
                      href={`mailto:${office.email}`}
                      className="hover:text-white transition-colors"
                    >
                      {office.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#0f2042]">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-col items-center gap-1.5">
          <p className="text-center text-xs text-[#334155]">
            © {new Date().getFullYear()} Gammeter OÜ &amp; Adcontact AB. All rights reserved.
          </p>
          <CookieSettingsLink className="text-[11px] text-[#334155] underline underline-offset-2 transition-colors hover:text-[#64748b]" />
        </div>
      </div>
    </footer>
  );
}
