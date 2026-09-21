"use client";

import { useState } from "react";

type Step = "form" | "review" | "done";
type Result = { reference: string; stamp: string; emailed: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "w-full rounded-lg border border-[#e2e8f0] bg-white px-3.5 py-2.5 text-sm text-[#0a1628] placeholder:text-[#9ca3af] focus:border-[#2563eb] focus:outline-none focus:ring-1 focus:ring-[#2563eb]";

const labelClass = "mb-1.5 block text-sm font-semibold text-[#0a1628]";

/**
 * Two-step electronic withdrawal function (Article 11a, Consumer Rights
 * Directive): step 1 collects the statement, step 2 is a stand-alone
 * "Confirm withdrawal here" button with nothing bundled into it.
 */
export default function WithdrawalForm() {
  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  function goToReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setStep("review");
  }

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, orderRef, website }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again, or contact us.");
        return;
      }
      setResult({ reference: data.reference, stamp: data.stamp, emailed: data.emailed });
      setStep("done");
    } catch {
      setError("Something went wrong. Please try again, or contact us.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "done" && result) {
    return (
      <div role="status" className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-6">
        <h2 className="text-lg font-bold text-[#0a1628]">Withdrawal received</h2>
        <p className="mt-2 text-sm leading-7 text-[#374151]">
          We received your withdrawal on <strong>{result.stamp}</strong>. Your reference is{" "}
          <strong>{result.reference}</strong>.
        </p>
        {result.emailed ? (
          <p className="mt-2 text-sm leading-7 text-[#374151]">
            We have sent a confirmation to <strong>{email.trim()}</strong>.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-7 text-[#374151]">
            We could not send the confirmation email automatically. Your withdrawal is recorded with the
            reference and time above. Please keep this page, and write to info@adcontact.se if you do
            not hear from us.
          </p>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-sm font-semibold text-[#0a1628] hover:border-[#2563eb] hover:text-[#2563eb]"
        >
          Print this confirmation
        </button>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-6">
        <h2 className="text-lg font-bold text-[#0a1628]">Check your statement</h2>
        <p className="mt-2 text-sm leading-7 text-[#374151]">
          I withdraw from my contract with Gammeter OÜ.
        </p>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-[160px_1fr]">
          <dt className="font-semibold text-[#0a1628]">Name</dt>
          <dd className="text-[#374151]">{name.trim()}</dd>
          <dt className="font-semibold text-[#0a1628]">Email</dt>
          <dd className="break-all text-[#374151]">{email.trim()}</dd>
          <dt className="font-semibold text-[#0a1628]">Order or product</dt>
          <dd className="text-[#374151]">{orderRef.trim() || "Not specified"}</dd>
        </dl>
        {error && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {busy ? "Sending" : "Confirm withdrawal here"}
          </button>
          <button
            type="button"
            onClick={() => setStep("form")}
            disabled={busy}
            className="text-sm font-semibold text-[#2563eb] underline underline-offset-2 hover:text-[#1d4ed8]"
          >
            Change details
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={goToReview} noValidate className="space-y-5">
      <div>
        <label htmlFor="wd-name" className={labelClass}>
          Your name
        </label>
        <input
          id="wd-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="wd-email" className={labelClass}>
          Email address used for the order
        </label>
        <input
          id="wd-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-[#6b7280]">We send your confirmation to this address.</p>
      </div>
      <div>
        <label htmlFor="wd-ref" className={labelClass}>
          Order reference or product <span className="font-normal text-[#6b7280]">(optional)</span>
        </label>
        <input
          id="wd-ref"
          type="text"
          value={orderRef}
          onChange={(e) => setOrderRef(e.target.value)}
          maxLength={200}
          placeholder="For example the product name, or the receipt number"
          className={inputClass}
        />
      </div>
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="wd-website">Leave this field empty</label>
        <input
          id="wd-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
      >
        Continue
      </button>
    </form>
  );
}
