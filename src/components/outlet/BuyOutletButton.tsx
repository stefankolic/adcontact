"use client";

import { useState } from "react";

/**
 * Shared "Buy now" button for any pilot outlet SKU - used on the
 * /outlet/components table AND on a part's own product page, so the
 * checkout-creation/error-handling logic lives in exactly one place.
 */
export function BuyOutletButton({
  sku,
  className,
  label = "Buy now",
}: {
  sku: string;
  className?: string;
  label?: string;
}) {
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/outlet-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(
        res.status === 409
          ? "Sorry, this item just sold out."
          : "Something went wrong starting checkout - please try again or use Enquire.",
      );
    } catch {
      setError("Something went wrong starting checkout - please try again or use Enquire.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={buying} className={className}>
        {buying ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-1.5 text-xs font-medium text-red-700">{error}</p>}
    </div>
  );
}
