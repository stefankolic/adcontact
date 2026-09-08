"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronDown, Package } from "lucide-react";
import {
  deutschOutletComponents,
  outletComponentHref,
  outletComponentImageSrc,
} from "@/data/deutschOutlet";

const PAGE_SIZE = 50;

export default function OutletComponentsClient() {
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return deutschOutletComponents;
    return deutschOutletComponents.filter(
      (item) =>
        item.sku.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
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
            placeholder="Search SKU or part number…"
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
              return (
                <tr
                  key={item.sku}
                  className="odd:bg-white even:bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border border-[#e2e8f0] bg-[#f8fafc]">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={item.description}
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
                        className="font-mono text-sm font-semibold text-[#0a1628] hover:text-[#2563eb]"
                      >
                        {item.description}
                      </Link>
                    ) : (
                      <span className="font-mono text-sm font-semibold text-[#0a1628]">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-[#374151]">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[#0a1628]">
                    €{item.priceEur.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`mailto:info@adcontact.se?subject=${encodeURIComponent(
                        `Outlet enquiry: ${item.sku}`
                      )}&body=${encodeURIComponent(
                        `Hi,\n\nI'd like to order the following from your components outlet:\n\nSKU: ${item.sku}\nPart / description: ${item.description}\nQuantity wanted: \n\nThanks!`
                      )}`}
                      className="text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
                    >
                      Enquire →
                    </a>
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
