"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

/**
 * Shared "Buy now" control for any pilot outlet SKU - used on the
 * /outlet/components table AND on a part's own product page, so the
 * checkout-creation/error-handling logic lives in exactly one place.
 *
 * Quantity is picked here, on our own page, rather than relying on Stripe
 * Checkout's own adjustable_quantity stepper - that control renders quite
 * small on Stripe's hosted page and was hard to notice (Stefan's own
 * feedback testing it). It's still enabled server-side as a fallback for
 * last-minute changes, but this is the primary way to choose an amount.
 */
export function BuyOutletButton({
  sku,
  maxQuantity = 99,
  className,
  label = "Buy now",
}: {
  sku: string;
  maxQuantity?: number;
  className?: string;
  label?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function adjust(delta: number) {
    setQuantity((q) => Math.min(maxQuantity, Math.max(1, q + delta)));
  }

  async function handleClick() {
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/outlet-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku, quantity }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(
        res.status === 409 && typeof data.error === "string"
          ? data.error
          : "Something went wrong starting checkout - please try again or use Enquire.",
      );
    } catch {
      setError("Something went wrong starting checkout - please try again or use Enquire.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center rounded-md border border-[#cbd5e1] bg-white">
        <button
          type="button"
          onClick={() => adjust(-1)}
          disabled={quantity <= 1}
          aria-label="Decrease quantity"
          className="flex h-8 w-8 items-center justify-center text-[#374151] hover:bg-[#f1f5f9] disabled:opacity-40"
        >
          <Minus size={13} />
        </button>
        <span className="w-7 text-center text-sm font-bold tabular-nums text-[#0a1628]">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => adjust(1)}
          disabled={quantity >= maxQuantity}
          aria-label="Increase quantity"
          className="flex h-8 w-8 items-center justify-center text-[#374151] hover:bg-[#f1f5f9] disabled:opacity-40"
        >
          <Plus size={13} />
        </button>
      </div>
      <div>
        <button type="button" onClick={handleClick} disabled={buying} className={className}>
          {buying ? "Redirecting…" : label}
        </button>
        {error && <p className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
      </div>
    </div>
  );
}
