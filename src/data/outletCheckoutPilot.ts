import {
  deutschOutletComponents,
  outletComponentHref,
  outletComponentImageSrc,
} from "@/data/deutschOutlet";

/**
 * SKUs eligible for a real "Buy now" checkout - every outlet row that has
 * BOTH a real linked product page AND a real photo. This is deliberately the
 * exact same "real image + real page" rule the Google Merchant Center feed
 * itself uses (see the outlet-completion-procedure memory playbook), not a
 * separately maintained list - a row that gains a real photo through that
 * ongoing process becomes checkout-eligible automatically on the next
 * deploy, no code change needed per SKU.
 *
 * Started 2026-09-17 as a hand-picked 12-SKU pilot batch to prove the full
 * loop (checkout -> webhook -> stock decrement -> fulfillment) end-to-end
 * before trusting it with the full catalogue. Widened to this computed rule
 * 2026-09-18 once the pilot proved out and Stefan asked to launch on every
 * GMC/GSC-relevant item (currently ~150 of 260 rows) — see the outlet-
 * checkout-stripe-project memory playbook for the full history.
 */
export const CHECKOUT_ELIGIBLE_SKUS: Set<string> = new Set(
  deutschOutletComponents
    .filter(
      (item) => outletComponentHref(item) !== null && outletComponentImageSrc(item) !== null,
    )
    .map((item) => item.sku),
);
