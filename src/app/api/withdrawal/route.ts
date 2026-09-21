import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * Electronic withdrawal function (Article 11a, Consumer Rights Directive, in
 * force from 2026-06-19): records a consumer's withdrawal statement and sends
 * the acknowledgement, with the statement and its date and time, on a durable
 * medium (email). Deliberately no captcha and no login - the rule says
 * withdrawing must not be harder than buying - so abuse is limited by a
 * honeypot field, length limits and a per-email rate check instead.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTIFY_TO_FALLBACK = "info@adcontact.se";

function formatStamp(d: Date): string {
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Stockholm",
    dateStyle: "long",
    timeStyle: "medium",
  }).format(d);
  const utc = d.toISOString().replace("T", " ").slice(0, 19);
  return `${local} (Stockholm time), ${utc} UTC`;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({
      ok: true,
      reference: "-",
      submittedAt: new Date().toISOString(),
      stamp: formatStamp(new Date()),
      emailed: false,
    });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const orderRef = typeof body.orderRef === "string" ? body.orderRef.trim() : "";

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (orderRef.length > 200) {
    return NextResponse.json({ error: "The order reference is too long." }, { status: 400 });
  }

  const emailKey = email.toLowerCase();
  const sql = getDb();

  const [recent] = await sql`
    SELECT count(*)::int AS n FROM outlet_withdrawals
    WHERE lower(email) = ${emailKey} AND created_at > now() - interval '10 minutes'
  `;
  if (recent.n >= 5) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a few minutes." },
      { status: 429 },
    );
  }

  // Best-effort match to the customer's most recent order, for whoever
  // processes the refund. A missing match never blocks the withdrawal itself.
  const [order] = await sql`
    SELECT stripe_session_id, description FROM outlet_orders
    WHERE lower(customer_email) = ${emailKey}
    ORDER BY created_at DESC LIMIT 1
  `;

  const [row] = await sql`
    INSERT INTO outlet_withdrawals (name, email, order_ref, matched_stripe_session_id, matched_description)
    VALUES (${name}, ${email}, ${orderRef || null}, ${order?.stripe_session_id ?? null}, ${order?.description ?? null})
    RETURNING id, created_at
  `;

  const submittedAt = new Date(row.created_at);
  const stamp = formatStamp(submittedAt);
  const reference = `W-${String(row.id).padStart(5, "0")}`;
  const origin = new URL(req.url).origin;
  const contract = orderRef || order?.description || "Not specified";

  const ack = await sendEmail({
    to: email,
    subject: `We have received your withdrawal (reference ${reference})`,
    text: [
      `Hello ${name},`,
      "",
      "We confirm that we have received your statement withdrawing from your contract with Gammeter OÜ.",
      "",
      "Your statement",
      `Name: ${name}`,
      `Email: ${email}`,
      `Order or product: ${contract}`,
      `Received: ${stamp}`,
      `Reference: ${reference}`,
      "",
      "What happens next",
      "Please send the goods back within 14 days of your statement, and quote your reference in the parcel.",
      "Return address: Gammeter OÜ, Keki tn 6/1, 76606 Keila, Estonia.",
      "Return shipping is at your own cost unless we have agreed otherwise in writing.",
      "When we receive the goods, or proof that you have sent them, we refund your payment within 14 days, using your original payment method.",
      `Full terms: ${origin}/policies/returns`,
      "",
      "Gammeter OÜ (trading as Adcontact)",
      "info@adcontact.se",
    ].join("\n"),
  });

  const notify = await sendEmail({
    to: process.env.WITHDRAWAL_NOTIFY_TO || NOTIFY_TO_FALLBACK,
    replyTo: email,
    subject: `Withdrawal received ${reference}`,
    text: [
      `A consumer withdrew from a contract through the website (${reference}).`,
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Order or product stated: ${orderRef || "Not stated"}`,
      `Received: ${stamp}`,
      order
        ? `Matched order: ${order.description} (Stripe session ${order.stripe_session_id})`
        : "No order matched this email address. Check the payment manually in Stripe.",
      "",
      `Confirmation email to the customer: ${ack.sent ? "sent" : "NOT sent, contact the customer"}`,
    ].join("\n"),
  });

  await sql`
    UPDATE outlet_withdrawals
    SET ack_sent_at = CASE WHEN ${ack.sent} THEN now() END,
        notify_sent_at = CASE WHEN ${notify.sent} THEN now() END
    WHERE id = ${row.id}
  `;

  return NextResponse.json({
    ok: true,
    reference,
    submittedAt: submittedAt.toISOString(),
    stamp,
    emailed: ack.sent,
  });
}
