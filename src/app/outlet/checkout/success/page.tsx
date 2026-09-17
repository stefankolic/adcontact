import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { getStripe } from "@/lib/stripe";

export const metadata = { title: "Order confirmed" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const session = session_id
    ? await getStripe().checkout.sessions.retrieve(session_id).catch(() => null)
    : null;

  const description = session?.metadata?.outletDescription;
  const amount =
    session?.amount_total != null ? (session.amount_total / 100).toFixed(2) : null;

  return (
    <div className="mx-auto max-w-lg px-6 py-20 text-center">
      <CheckCircle2 size={48} className="mx-auto mb-5 text-emerald-500" />
      <h1 className="mb-2 text-2xl font-bold text-[#0a1628]">Order confirmed</h1>
      <p className="mb-6 text-sm leading-relaxed text-[#64748b]">
        {description ? (
          <>
            Thanks for your order — <span className="font-semibold text-[#0a1628]">{description}</span>
            {amount && <> ({amount} EUR)</>}. You&apos;ll receive an email receipt shortly, and we&apos;ll
            be in touch with shipping details.
          </>
        ) : (
          <>Thanks for your order. You&apos;ll receive an email receipt shortly, and we&apos;ll be in touch with shipping details.</>
        )}
      </p>
      <Link
        href="/outlet/components"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]"
      >
        Back to the Components Outlet
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
