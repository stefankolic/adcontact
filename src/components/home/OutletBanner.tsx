import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

/**
 * Launch-window banner for the new Outlet section — positioned right after
 * the hero search, before the brands carousel: visible, but secondary to the
 * main search/hero, which stays the primary path. Meant to be temporary —
 * once Outlet's own nav entry can carry ongoing awareness on its own, this
 * can come out or shrink.
 *
 * Solid brand-orange strip, centered, one line of black text (design pass
 * 2026-09-09, post-board-approval) — text color matches the near-black navy
 * already used on every other orange element site-wide (nav badge, "Send us
 * your enquiry" buttons), not literal #000, so it stays consistent with the
 * rest of the orange/black CTA convention rather than introducing a new one.
 */
export default function OutletBanner() {
  return (
    <section className="border-b border-[#d97706] bg-[#f59e0b]">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-6 py-4 text-center">
        <Tag size={16} className="flex-none text-[#0a1628]" />
        <p className="text-sm text-[#0a1628]">
          <span className="font-bold">New: the Outlet.</span>{" "}
          Secondhand machines and surplus component stock, at outlet pricing while it lasts.
        </p>
        <Link
          href="/outlet"
          className="inline-flex flex-none items-center gap-1.5 text-sm font-bold text-[#0a1628] underline decoration-2 underline-offset-2 hover:no-underline"
        >
          Browse the Outlet
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
