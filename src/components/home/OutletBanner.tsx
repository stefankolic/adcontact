import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

/**
 * Launch-window banner for the new Outlet section — positioned right after
 * the hero search, before the brands carousel: visible, but secondary to the
 * main search/hero, which stays the primary path. Meant to be temporary —
 * once Outlet's own nav entry can carry ongoing awareness on its own, this
 * can come out or shrink.
 *
 * Brand-orange strip, centered, one line of black text (design pass
 * 2026-09-09, post-board-approval) — text color matches the near-black navy
 * already used on every other orange element site-wide (nav badge, "Send us
 * your enquiry" buttons), not literal #000, so it stays consistent with the
 * rest of the orange/black CTA convention rather than introducing a new one.
 *
 * Background fades lighter-orange → full orange → lighter-orange from edge
 * to edge (Stefan's request), full color held behind the centered content.
 * The content's actual width is dynamic (viewport + font rendering), so the
 * gradient stops are tuned to reach full color comfortably before typical
 * desktop text width rather than measured exactly — a JS-measured fade would
 * be fragile (resize/font-load) for a decorative banner.
 */
export default function OutletBanner() {
  return (
    <section className="border-b border-[#d97706] bg-[linear-gradient(to_right,#fcd34d_0%,#f59e0b_30%,#f59e0b_70%,#fcd34d_100%)]">
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
