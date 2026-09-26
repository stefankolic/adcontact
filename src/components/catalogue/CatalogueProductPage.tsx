import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Archive, Check, Clock, Download, FileImage, FileText, Mail, Package, Phone } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { OutletStockBlock } from "@/components/outlet/OutletStockBlock";
import { brands } from "@/data/brands";
import { outletItemForCatalogueProduct } from "@/data/deutschOutlet";
import { OUTLET_CATALOGUE_PAGES } from "@/data/outletCatalogueLinks";
import { outletSoldOut } from "@/data/outletStock";
import { outletSeo } from "@/data/outletSeo";
import { CHECKOUT_ELIGIBLE_SKUS } from "@/data/outletCheckoutPilot";
import { productJsonLd } from "@/lib/productSchema";
import { normalizeLegacyHtml, stripLegacyHtml, stripInlineStyles } from "@/lib/legacyHtml";
import {
  catalogueProductLegacyRoute,
  findCatalogueProductByReference,
  getProductAttributeEntries,
  getProductBreadcrumbs,
  productDisplaySku,
  titleForProduct,
  PRODUCT_PRESENTATIONS,
  type CatalogueProduct,
} from "@/lib/magentoCatalogue";

type CatalogueFile = CatalogueProduct["files"][number];

const LINKED_ATTRIBUTE_GROUPS = [
  { title: "Contacts", attributes: ["Tab Connectors", "Pin Connectors", "Socket Connectors"] },
  { title: "Mating connectors", attributes: ["Mating Connectors"] },
  { title: "Required components", attributes: ["Required Components", "Required Wedgelock"] },
  { title: "Accessories", attributes: ["Accessories"] },
];

const RELATIONSHIP_ATTRIBUTES = new Set(
  LINKED_ATTRIBUTE_GROUPS.flatMap((group) => group.attributes),
);

function magentoImageSrc(path: string | null | undefined): string | null {
  if (!path) return null;
  // Treat Magento's "no photo" placeholder as no image, so the clean fallback
  // shows instead of the dated placeholder graphic.
  if (/no_photo|placeholder/i.test(path)) return null;
  if (path.startsWith("/")) return path;
  return path;
}

function splitPartReferences(value: string) {
  return [...new Set(value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean))];
}

function ProductReferenceCard({ reference }: { reference: string }) {
  const linkedProduct = findCatalogueProductByReference(reference);

  if (!linkedProduct) {
    return (
      <div className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3">
        <div className="font-mono text-sm font-bold text-[#0a1628]">{reference}</div>
      </div>
    );
  }

  return (
    <Link
      href={catalogueProductLegacyRoute(linkedProduct)}
      className="group grid min-w-0 grid-cols-[72px_1fr] overflow-hidden rounded-lg border border-[#e5e7eb] bg-white transition-colors hover:border-[#93c5fd]"
    >
      <div className="relative min-h-20 bg-[#f8fafc]">
        {magentoImageSrc(linkedProduct.thumbnail ?? linkedProduct.image) ? (
          <Image
            src={magentoImageSrc(linkedProduct.thumbnail ?? linkedProduct.image)!}
            alt={linkedProduct.name}
            fill
            unoptimized
            sizes="72px"
            className="object-contain p-2"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package size={18} className="text-[#cbd5e1]" />
          </div>
        )}
      </div>
      <div className="min-w-0 p-3">
        <div className="truncate font-mono text-sm font-bold text-[#0a1628] group-hover:text-[#2563eb]">
          {linkedProduct.name}
        </div>
        {productDisplaySku(linkedProduct) !== linkedProduct.name && (
          <div className="mt-1 truncate text-xs text-[#64748b]">
            {productDisplaySku(linkedProduct)}
          </div>
        )}
      </div>
    </Link>
  );
}

function LinkedProductSection({
  title,
  references,
}: {
  title: string;
  references: string[];
}) {
  if (references.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-[#0a1628]">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {references.map((reference) => (
          <ProductReferenceCard key={`${title}-${reference}`} reference={reference} />
        ))}
      </div>
    </section>
  );
}

function drawingIcon(file: CatalogueFile) {
  const label = `${file.name ?? ""} ${file.filename ?? ""} ${file.path ?? ""}`.toLowerCase();
  if (label.includes(".pdf") || label.includes("pdf")) {
    return <FileText size={18} className="text-[#dc2626]" />;
  }
  if (label.includes(".tif") || label.includes(".tiff") || label.includes("tif")) {
    return <FileImage size={18} className="text-[#2563eb]" />;
  }
  if (label.includes(".zip") || label.includes("zip") || label.includes("cad")) {
    return <Archive size={18} className="text-[#7c3aed]" />;
  }
  return <Download size={18} className="text-[#64748b]" />;
}

export default function CatalogueProductPage({
  product,
}: {
  product: CatalogueProduct;
}) {
  const sku = productDisplaySku(product);
  const attributes = getProductAttributeEntries(product);
  const additionalInfo = attributes.filter(([label]) => !RELATIONSHIP_ATTRIBUTES.has(label));
  const highlights = attributes.slice(0, 6);
  // Many Magento short descriptions are junk-only WYSIWYG leftovers (bare
  // "&nbsp", empty tags) — strip first, then check for actual content so we
  // never render an empty/junk paragraph.
  const cleanShortDescription = product.shortDescription
    ? stripLegacyHtml(product.shortDescription)
    : "";
  const breadcrumbs = getProductBreadcrumbs(product);
  // Production-equipment products: no lead-time badge, no "Additional
  // information" table, no attribute highlight boxes.
  const isProductionEquipment = breadcrumbs.some((c) => c.route?.includes("/production-equipment"));
  // Curated Features + Specifications boxes (replaces the free-text description).
  const presentation = PRODUCT_PRESENTATIONS[product.id];
  // For production equipment full specs are supplied with the quotation, so the
  // quote CTA doubles as the "full specification on request" ask.
  const quoteLabel = isProductionEquipment
    ? "Request full specification and a quote"
    : "Request a quote";
  const primaryImage = magentoImageSrc(product.image ?? product.gallery[0] ?? product.thumbnail);
  // Only parts with their own outlet listing carry a price, a Buy button and
  // Product schema (Google's validator rejects a Product with no offer). Their
  // H1 and schema name are the outlet SEO title, the same text the Merchant feed uses.
  const outlet = outletItemForCatalogueProduct(product.id);
  const outletLink = outlet ? OUTLET_CATALOGUE_PAGES[outlet.sku] : undefined;
  const outletSeoData = outlet ? outletSeo(outlet) : null;
  const title = outletSeoData?.title ?? titleForProduct(product);
  const outletLd =
    outlet && outletLink && primaryImage
      ? productJsonLd({
          name: outletSeoData?.title ?? `${product.brand ?? product.manufacturer ?? "Deutsch"} ${title}`,
          partNumber: sku,
          brand: product.brand ?? product.manufacturer ?? "Deutsch",
          description: outletSeoData?.description ?? `${title}, surplus outlet stock from Adcontact's own warehouse in Keila.`,
          image: primaryImage,
          url: outletLink.route,
          offer: { priceEur: outlet.priceEur, inStock: !outletSoldOut(outlet) },
        })
      : null;
  const showSkuEyebrow = sku !== title && sku !== product.name;
  const description =
    product.description && product.description !== product.name && product.description !== product.sku
      ? normalizeLegacyHtml(product.description)
      : null;
  const linkedSections = LINKED_ATTRIBUTE_GROUPS.map((group) => ({
    title: group.title,
    references: [
      ...new Set(
        group.attributes.flatMap((attribute) =>
          product.attributes[attribute] ? splitPartReferences(product.attributes[attribute]) : [],
        ),
      ),
    ],
  })).filter((group) => group.references.length > 0);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {outletLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(outletLd) }} />
      )}
      <div className="border-b border-[#e5e7eb] bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-3">
          <Breadcrumbs
            crumbs={[
              { label: "Webshop", href: "/webshop.html" },
              ...breadcrumbs
                .filter((category) => category.route)
                .map((category) => ({
                  label: category.name ?? "Category",
                  href: category.route ?? undefined,
                })),
              { label: sku },
            ]}
          />
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        <div className="mb-8 grid gap-8 lg:grid-cols-[minmax(300px,460px)_1fr]">
          <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                priority
                unoptimized
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-contain p-8"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[#f8fafc]">
                <Package size={52} strokeWidth={1.4} className="text-[#cbd5e1]" />
                <span className="text-xs font-medium text-[#94a3b8]">No image available</span>
              </div>
            )}
          </div>

          {outlet && (
            <OutletStockBlock
              item={outlet}
              canBuy={CHECKOUT_ELIGIBLE_SKUS.has(outlet.sku)}
              className="mt-4"
            />
          )}
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="mb-4 flex flex-wrap gap-2">
              {(product.brand ?? product.manufacturer) && (
                <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2.5 py-1 text-xs font-semibold text-[#2563eb]">
                  {product.brand ?? product.manufacturer}
                </span>
              )}
              <span className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 text-xs font-medium text-[#475569]">
                Catalogue item
              </span>
            </div>

            {showSkuEyebrow && (
              <p className="mb-2 font-mono text-sm font-bold uppercase tracking-[0.12em] text-[#2563eb]">
                {sku}
              </p>
            )}
            <h1 className="text-3xl font-bold leading-tight text-[#0a1628] lg:text-4xl">
              {title}
            </h1>
            {cleanShortDescription && cleanShortDescription !== product.name && (
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#64748b]">
                {cleanShortDescription}
              </p>
            )}

            {/* Lead time (hidden for production equipment) */}
            {!isProductionEquipment && (
              <div className="mt-5 flex w-fit items-center gap-2 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] p-3">
                <Clock size={14} className="text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  Generally high availability — ask for current lead time
                </span>
              </div>
            )}

            {highlights.length > 0 && !isProductionEquipment && (
              <div className="mt-8 grid grid-cols-2 gap-3">
                {highlights.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-[#e5e7eb] bg-white p-3">
                    <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                      {label}
                    </div>
                    <div className="break-words text-sm font-semibold text-[#0a1628] [&_a]:text-[#2563eb] [&_a]:underline [&_a:hover]:text-[#1d4ed8]">
                      {/<[a-z]/i.test(value) ? (
                        <span dangerouslySetInnerHTML={{ __html: stripInlineStyles(value) }} />
                      ) : (
                        value
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#quote"
                className="btn-elevate btn-elevate-amber inline-flex items-center justify-center gap-2 rounded-lg bg-[#f59e0b] px-6 py-3.5 text-center font-semibold text-[#0a1628] hover:bg-[#d97706]"
              >
                {quoteLabel}
                <ArrowRight size={15} className="flex-none" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-6 py-3.5 font-medium text-[#374151] hover:bg-[#f8fafc]"
              >
                <Phone size={14} />
                Call us
              </a>
              <a
                href={`mailto:info@adcontact.se?subject=Quote request: ${encodeURIComponent(sku)}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-6 py-3.5 font-medium text-[#374151] hover:bg-[#f8fafc]"
              >
                <Mail size={14} />
                Email
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {additionalInfo.length > 0 && !isProductionEquipment && (
              <section>
                <h2 className="mb-3 text-base font-bold text-[#0a1628]">Additional information</h2>
                <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {additionalInfo.map(([label, value], index) => (
                        <tr key={label} className={index % 2 ? "bg-[#f8fafc]" : "bg-white"}>
                          <td className="w-56 px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#64748b]">
                            {label}
                          </td>
                          <td className="px-5 py-3 font-semibold text-[#0a1628] [&_a]:text-[#2563eb] [&_a]:underline [&_a:hover]:text-[#1d4ed8]">
                            {/<[a-z]/i.test(value) ? (
                              <span dangerouslySetInnerHTML={{ __html: stripInlineStyles(value) }} />
                            ) : (
                              value
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {linkedSections.map((section) => (
              <LinkedProductSection
                key={section.title}
                title={section.title}
                references={section.references}
              />
            ))}

            {presentation ? (
              <div className={presentation.specifications.length > 0 ? "grid gap-6 md:grid-cols-2" : ""}>
                <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
                  <h2 className="mb-3 text-base font-bold text-[#0a1628]">Features</h2>
                  <ul className="space-y-2.5">
                    {presentation.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-[#374151]">
                        <Check size={15} className="mt-0.5 flex-none text-[#2563eb]" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                {presentation.specifications.length > 0 && (
                  <section className="rounded-xl border border-[#e5e7eb] bg-white p-5">
                    <h2 className="mb-3 text-base font-bold text-[#0a1628]">Specifications</h2>
                    <dl className="divide-y divide-[#f1f5f9] text-sm">
                      {presentation.specifications.map((spec) => (
                        <div key={spec.label} className="flex justify-between gap-4 py-2">
                          <dt className="flex-none text-[#64748b]">{spec.label}</dt>
                          <dd className="text-right font-semibold text-[#0a1628]">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}
              </div>
            ) : (
              description && (
                <section>
                  <h2 className="mb-4 text-lg font-bold text-[#0a1628]">
                    {isProductionEquipment ? "Specification" : "Description"}
                  </h2>
                  <div
                    className="prose prose-sm max-w-none rounded-xl border border-[#e5e7eb] bg-white px-5 py-4 text-[#374151]"
                    dangerouslySetInnerHTML={{ __html: description }}
                  />
                </section>
              )
            )}

            {product.files.length > 0 && !isProductionEquipment && (
              <section>
                <h2 className="mb-3 text-base font-bold text-[#0a1628]">Drawings</h2>
                <div className="space-y-2">
                  {product.files.map((file, index) => (
                    <a
                      key={`${file.id}-${index}`}
                      href={file.legacyDownloadPath || file.link || file.path || "#"}
                      className="group flex items-center justify-between gap-4 rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 hover:border-[#2563eb]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-[#f8fafc] ring-1 ring-[#e5e7eb]">
                          {drawingIcon(file)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-[#374151]">
                            {file.name ?? "Download"}
                          </span>
                          {file.filename && (
                            <span className="mt-0.5 block truncate text-xs text-[#94a3b8]">
                              {file.filename}
                            </span>
                          )}
                        </span>
                      </span>
                      <Download size={15} className="text-[#9ca3af] group-hover:text-[#2563eb]" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside id="quote" className="scroll-mt-28">
            <div className="lg:sticky lg:top-[168px]">
              <QuoteForm
                defaultPartNumber={sku}
                title={`${quoteLabel} for ${sku}`}
              />
            </div>
          </aside>
        </div>

        {/* ── About the manufacturer ────────────────────────────────────── */}
        {(() => {
          const brandName = product.brand ?? product.manufacturer ?? "";
          const lower = brandName.toLowerCase();
          const matched = brands.find((b) =>
            lower.includes(b.id) || lower.includes(b.name.toLowerCase().split(" ")[0]),
          );
          if (!matched) return null;
          return (
            <section className="mt-10 rounded-xl border border-[#e5e7eb] bg-white p-6">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#9ca3af]">About the manufacturer</p>
              <a
                href={matched.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block text-sm font-bold text-[#0a1628] hover:text-[#2563eb] transition-colors"
              >
                {matched.name}
              </a>
              <p className="text-sm leading-relaxed text-[#64748b]">{matched.description}</p>
              <a
                href={matched.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
              >
                Visit {matched.name} website <ArrowRight size={12} />
              </a>
            </section>
          );
        })()}

      </main>
    </div>
  );
}
