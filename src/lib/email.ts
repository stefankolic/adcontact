type SendResult = { sent: boolean; reason?: string };

/**
 * Sends a plain-text email through Resend's HTTP API. Deliberately inert until
 * RESEND_API_KEY and EMAIL_FROM are set, so the site builds and runs without an
 * email provider; callers must handle `sent: false`.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) {
    console.warn("Email not configured (RESEND_API_KEY / EMAIL_FROM), not sending:", opts.subject);
    return { sent: false, reason: "not-configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error("Email provider rejected the message:", res.status, await res.text());
      return { sent: false, reason: `http-${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { sent: false, reason: "network" };
  }
}
