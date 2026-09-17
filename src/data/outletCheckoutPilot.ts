/**
 * Pilot batch for the outlet's real Stripe checkout (2026-09), per Stefan's
 * "controlled quantities" rollout plan — only these SKUs get a real "Buy Now"
 * button; every other outlet row keeps the existing "Enquire" mailto flow
 * until the pilot proves out end-to-end (checkout -> webhook -> stock
 * decrement -> actual fulfillment), then this list widens to the rest of the
 * outlet catalogue. See the outlet-checkout memory playbook for the full plan.
 *
 * Picked for a clean pilot: matched to a real product page, moderate price
 * (1-15 EUR) and moderate stock (10-100 units) - not the cheapest cent-level
 * rows or the largest batches, to keep the first real transactions easy to
 * reason about.
 */
export const PILOT_CHECKOUT_SKUS = new Set<string>([
  "242001-0812", // DT06-08SA-CE12
  "242001-121", // DT06-12SB
  "242001-123", // DT06-12SD Brown
  "242002-121", // DT04-12PB Black
  "242002-122", // DT04-12PC
  "242002-123", // DT04-12PD Brown
  "242006-004", // DTHD06-1-4S
  "242006-008", // DTHD06-1-8S
  "242006-012", // DTHD06-1-12S
  "242006-0413", // DT06-4S-CE13
  "242007-004", // DTHD04-1-4P
  "242012-040", // DT06-4S-LC01
]);
