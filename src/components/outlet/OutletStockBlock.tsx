import Link from "next/link";
import { Mail, Tag } from "lucide-react";
import type { OutletComponent } from "@/data/deutschOutlet";
import { outletStock } from "@/data/outletStock";
import { BuyOutletButton } from "@/components/outlet/BuyOutletButton";

export function OutletStockBlock({
  item,
  canBuy,
  className = "",
}: {
  item: OutletComponent;
  canBuy: boolean;
  className?: string;
}) {
  const quantity = outletStock(item);

  if (quantity <= 0) {
    const enquiry = `mailto:info@adcontact.se?subject=${encodeURIComponent(`Outlet enquiry: ${item.sku}`)}`;
    return (
      <div className={`rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Tag size={14} className="flex-none text-slate-600" />
          <p className="text-sm font-bold text-slate-800">Outlet stock: sold out</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          This surplus stock has been sold. Ask us whether we can source more, or browse the rest
          of the{" "}
          <Link
            href="/outlet/components"
            className="font-semibold text-slate-800 underline decoration-2 underline-offset-2 hover:no-underline"
          >
            Components Outlet
          </Link>
          .
        </p>
        <a
          href={enquiry}
          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
        >
          <Mail size={13} />
          Ask about this part
        </a>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Tag size={14} className="flex-none text-amber-700" />
        <p className="text-sm font-bold text-amber-900">
          Outlet stock, €{item.priceEur.toFixed(2)} per unit
        </p>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-amber-800">
        {quantity.toLocaleString("en-US")} in stock at our Keila warehouse, price for 1 to 10
        pieces, while quantities last.{" "}
        <Link
          href="/outlet/components"
          className="font-semibold text-amber-900 underline decoration-2 underline-offset-2 hover:no-underline"
        >
          Browse the Components Outlet
        </Link>
      </p>
      {canBuy && (
        <div className="mt-3">
          <BuyOutletButton
            sku={item.sku}
            maxQuantity={Math.min(quantity, 99)}
            className="rounded-md bg-amber-500 px-4 py-2 text-xs font-semibold text-amber-950 transition-colors hover:bg-amber-600 disabled:opacity-60"
          />
        </div>
      )}
    </div>
  );
}
