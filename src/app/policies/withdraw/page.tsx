import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import WithdrawalForm from "@/components/withdrawal/WithdrawalForm";

export const metadata: Metadata = {
  title: "Withdraw from contract",
  description:
    "Private individuals who bought through the Components Outlet can withdraw from the contract within 14 days of receiving the goods.",
};

export default function WithdrawPage() {
  return (
    <>
      <Breadcrumbs crumbs={[{ label: "Policies", href: "/policies" }, { label: "Withdraw from contract" }]} />
      <h1 className="text-2xl font-bold text-[#0a1628] mt-4 mb-6">Withdraw from contract</h1>
      <div className="prose prose-sm text-[#374151] leading-7 space-y-4 max-w-2xl">
        <p>
          If you bought as a private individual through our Components Outlet checkout, you can withdraw
          from the contract within 14 days of receiving the goods, without giving a reason. Fill in the form
          below and we confirm your withdrawal by email straight away.
        </p>
        <p>
          This function is for private individuals. If you bought for your business, see our{" "}
          <Link href="/policies/returns" className="text-[#2563eb] hover:text-[#1d4ed8]">
            Return &amp; Refund Policy
          </Link>
          .
        </p>
      </div>
      <div className="mt-8 max-w-xl">
        <WithdrawalForm />
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-7 text-[#6b7280]">
        After you withdraw you have a further 14 days to send the goods back. Return shipping is at your
        own cost unless we have agreed otherwise in writing, and we refund your payment within 14 days
        after we receive the goods or proof that you sent them. The full conditions are in the{" "}
        <Link href="/policies/returns" className="text-[#2563eb] hover:text-[#1d4ed8]">
          Return &amp; Refund Policy
        </Link>
        .
      </p>
    </>
  );
}
