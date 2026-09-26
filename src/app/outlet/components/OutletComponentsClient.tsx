"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronDown, Package } from "lucide-react";
import {
  deutschOutletComponents,
  outletComponentHref,
  outletComponentImageSrc,
  outletDisplayName,
  outletSearchKeys,
  type OutletComponent,
} from "@/data/deutschOutlet";
import { deutschSeoTitleByPartNumber } from "@/data/deutschConnectors";
import { CHECKOUT_ELIGIBLE_SKUS } from "@/data/outletCheckoutPilot";
import { outletSoldOut, outletStock } from "@/data/outletStock";
import { BuyOutletButton } from "@/components/outlet/BuyOutletButton";

const PAGE_SIZE = 50;

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

// One lookup per row, built once: the searchable fields and the display name,
// both reduced to letters and digits so spaces and hyphens never block a match.
const SEARCH_INDEX = new Map(
  deutschOutletComponents.map((item) => [
    item.sku,
    { keys: outletSearchKeys(item), name: alnum(outletDisplayName(item)) },
  ]),
);

// Sold-out rows stay listed (their pages stay indexable) but sink to the bottom.
const ORDERED = [...deutschOutletComponents].sort(
  (a, b) => Number(outletSoldOut(a)) - Number(outletSoldOut(b)),
);

export default function OutletComponentsClient() {
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const raw = search.trim();
    if (!raw) return ORDERED;
    const q = alnum(raw);
    const tokens = raw.toLowerCase().split(/[\s,;]+/).map(alnum).filter(Boolean);
    const hits: { item: OutletComponent; score: number }[] = [];
    for (const item of ORDERED) {
      const idx = SEARCH_INDEX.get(item.sku)!;
      const found =
        idx.keys.some((k) => k.includes(q)) ||
        (tokens.length > 1 && tokens.every((t) => idx.keys.some((k) => k.includes(t))));
      if (!found) continue;
      const pos = idx.name.indexOf(q);
      hits.push({ item, score: pos === -1 ? 1000 : pos });
    }
    hits.sort(
      (a, b) => Number(outletSoldOut(a.item)) - Number(outletSoldOut(b.item)) || a.score - b.score,
    );
    return hits.map((h) => h.item);
  }, [search]);

  const shown = filtered.slice(0, visible);

  function handleSearch(value: string) {
    setSearch(value);
    setVisible(PAGE_SIZE);
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search part number or SKU, e.g. DRC16-40 or dt 16"
            className="w-full rounded-lg border border-[#e2e8f0] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0a1628] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]"
          />
        </div>
        <p className="text-sm text-[#64748b]">
          <span className="font-semibold text-[#0a1628]">{filtered.length}</span> of{" "}
          {deutschOutletComponents.length} SKUs
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="ml-3 inline-flex items-center gap-1 text-[#2563eb] hover:text-[#1d4ed8]"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-[#e2e8f0] bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
              <th className="w-14 px-4 py-3">
                <span className="sr-only">Photo</span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#374151]">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#374151]">
                Part / description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#374151]">
                Qty available
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#374151]">
                Outlet price
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#374151]">
                Enquire
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {shown.map((item) => {
              const href = outletComponentHref(item);
              const imageSrc = outletComponentImageSrc(item);
              const soldOut = outletSoldOut(item);
              // Keeps the visible cell compact (a dense SKU table, not a
              // place for a full sentence) while still giving crawlers and
              // screen readers a fully descriptive, keyword-rich accessible
              // name per part - the same SEO title used on the part's own
              // page, so the two stay consistent (2026-09-12 SEO review).
              const seoLabel = item.matchedPartNumber
                ? deutschSeoTitleByPartNumber(item.matchedPartNumber)
                : null;
              return (
                <tr
                  key={item.sku}
                  className={`odd:bg-white even:bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors ${soldOut ? "opacity-60" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border border-[#e2e8f0] bg-[#f8fafc]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={outletDisplayName(item)}
                          fill
                          unoptimized
                          sizes="40px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package size={16} strokeWidth={1.4} className="text-[#cbd5e1]" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#64748b]">{item.sku}</td>
                  <td className="px-4 py-3">
                    {href ? (
                      <Link
                        href={href}
                        aria-label={seoLabel ? `Buy ${seoLabel} here` : undefined}
                        className="font-mono text-sm font-semibold text-[#0a1628] hover:text-[#2563eb]"
                      >
                        {outletDisplayName(item)}
                      </Link>
                    ) : (
                      <span className="font-mono text-sm font-semibold text-[#0a1628]">
                        {outletDisplayName(item)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-[#374151]">
                    {soldOut ? (
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Sold out</span>
                    ) : (
                      outletStock(item).toLocaleString()
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0a1628]">
                    €{item.priceEur.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {soldOut ? (
                      <span className="text-xs font-semibold text-[#94a3b8]">Sold out</span>
                    ) : CHECKOUT_ELIGIBLE_SKUS.has(item.sku) ? (
                      <BuyOutletButton
                        sku={item.sku}
                        maxQuantity={Math.min(outletStock(item), 99)}
                        className="rounded-md bg-[#f59e0b] px-3 py-1.5 text-xs font-semibold text-[#0a1628] transition-colors hover:bg-[#d97706] disabled:opacity-60"
                      />
                    ) : (
                      <a
                        href={`mailto:info@adcontact.se?subject=${encodeURIComponent(
                          `Outlet enquiry: ${item.sku}`
                        )}&body=${encodeURIComponent(
                          `Hi,\n\nI'd like to order the following from your components outlet:\n\nSKU: ${item.sku}\nPart / description: ${outletDisplayName(item)}\nQuantity wanted: \n\nThanks!`
                        )}`}
                        className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                      >
                        Enquire →
                      </a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-[#64748b]">
            No outlet stock matches &quot;{search}&quot;.
          </div>
        )}
      </div>

      {visible < filtered.length && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-[#64748b]">
            Showing {shown.length} of {filtered.length}
          </p>
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-6 py-3 text-sm font-semibold text-[#374151] transition-colors hover:border-[#2563eb] hover:text-[#2563eb]"
          >
            Load more
            <ChevronDown size={15} />
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-[#94a3b8]">
        Prices shown apply to 1 to 10 pieces. Buying in bulk? Ask about volume pricing, we can
        often beat standard distributor rates when stock allows.
      </p>
      <p className="mt-1.5 text-xs text-[#94a3b8]">
        Quantities update as orders come in, so confirm availability before ordering.
      </p>
      <p className="mt-1.5 text-xs text-[#94a3b8]">
        Prices excl. VAT and given in Euro ExWorks Keila, Estonia. While stocks last.
      </p>
    </section>
  );
}
