/** Outbound booking / enquiry notifications via Gmail SMTP (Nodemailer). */

import nodemailer from "nodemailer";

const DEFAULT_BOOKINGS = "tristravelbookings@gmail.com";

export function bookingsNotifyEmail() {
  return (
    process.env.NOTIFY_BOOKINGS_EMAIL?.trim() ||
    process.env.NEXT_PUBLIC_BOOKINGS_EMAIL?.trim() ||
    process.env.GMAIL_USER?.trim() ||
    DEFAULT_BOOKINGS
  );
}

export function emailFromAddress() {
  const user = process.env.GMAIL_USER?.trim() || bookingsNotifyEmail();
  return process.env.EMAIL_FROM?.trim() || `TRIS Travels <${user}>`;
}

export function emailConfigured() {
  return Boolean(process.env.GMAIL_USER?.trim() && process.env.GMAIL_APP_PASSWORD?.trim());
}

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

function createTransport() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim()?.replace(/\s+/g, "");
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  const transport = createTransport();
  if (!transport) {
    console.warn("sendEmail skipped: GMAIL_USER / GMAIL_APP_PASSWORD not set");
    return { ok: false, error: "Email not configured" };
  }

  try {
    await transport.sendMail({
      from: emailFromAddress(),
      to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    return { ok: true };
  } catch (err) {
    console.error("sendEmail error:", err);
    return { ok: false, error: "Email send failed" };
  }
}

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function notifyStaffNewLead(input: {
  kind: "enquiry" | "booking";
  id: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  summary?: string;
}) {
  const to = bookingsNotifyEmail();
  const subject = `[TRIS] New ${input.kind} · ${input.name} · ${input.id}`;
  const html = `
    <div style="font-family:Georgia,serif;color:#1F4E3D;line-height:1.5">
      <h2 style="margin:0 0 12px">New ${esc(input.kind)}</h2>
      <p><strong>Ref:</strong> ${esc(input.id)}</p>
      <p><strong>Name:</strong> ${esc(input.name)}</p>
      <p><strong>Email:</strong> ${esc(input.email || "—")}</p>
      <p><strong>Phone:</strong> ${esc(input.phone || "—")}</p>
      ${input.summary ? `<p><strong>Summary:</strong><br/>${esc(input.summary)}</p>` : ""}
      ${input.message ? `<p><strong>Message:</strong><br/>${esc(input.message)}</p>` : ""}
    </div>
  `;
  return sendEmail({
    to,
    subject,
    html,
    replyTo: input.email?.includes("@") ? input.email : undefined,
  });
}

export async function notifyGuestAdvancePaid(input: {
  to: string;
  name: string;
  journeyName: string;
  refId: string;
  advanceAmount: string;
  balanceAmount: string;
  totalAmount: string;
  preferredFrom?: string;
  preferredTo?: string;
  balanceDueDate?: string;
  itineraryHtml?: string;
}) {
  const html = `
    <div style="font-family:Georgia,serif;color:#1F4E3D;line-height:1.55;max-width:560px">
      <h1 style="font-size:22px;margin:0 0 8px">Booking confirmed — ${esc(input.journeyName)}</h1>
      <p>Hi ${esc(input.name)},</p>
      <p>We’ve received your <strong>50% advance</strong>. Your journey is confirmed pending final arrangements.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:6px 0">Reference</td><td style="padding:6px 0;text-align:right"><strong>${esc(input.refId)}</strong></td></tr>
        <tr><td style="padding:6px 0">Total (incl. GST)</td><td style="padding:6px 0;text-align:right"><strong>${esc(input.totalAmount)}</strong></td></tr>
        <tr><td style="padding:6px 0">Advance paid</td><td style="padding:6px 0;text-align:right"><strong>${esc(input.advanceAmount)}</strong></td></tr>
        <tr><td style="padding:6px 0">Balance due</td><td style="padding:6px 0;text-align:right"><strong>${esc(input.balanceAmount)}</strong></td></tr>
        ${
          input.balanceDueDate
            ? `<tr><td style="padding:6px 0">Balance due by</td><td style="padding:6px 0;text-align:right"><strong>${esc(input.balanceDueDate)}</strong></td></tr>`
            : ""
        }
        ${
          input.preferredFrom
            ? `<tr><td style="padding:6px 0">Travel dates</td><td style="padding:6px 0;text-align:right">${esc(input.preferredFrom)}${input.preferredTo ? ` → ${esc(input.preferredTo)}` : ""}</td></tr>`
            : ""
        }
      </table>
      ${input.itineraryHtml || "<p>Your detailed journey plan will follow from our team shortly.</p>"}
      <p style="margin-top:20px;font-size:13px;color:#5c6350">50% to confirm. 50% before you travel. Questions? Reply to this email or write to ${esc(bookingsNotifyEmail())}.</p>
    </div>
  `;
  return sendEmail({
    to: input.to,
    subject: `Advance received · ${input.journeyName} · ${input.refId}`,
    html,
    replyTo: bookingsNotifyEmail(),
  });
}

export async function notifyGuestBalanceDue(input: {
  to: string;
  name: string;
  journeyName: string;
  refId: string;
  balanceAmount: string;
  balanceDueDate: string;
  paymentLink?: string;
}) {
  const html = `
    <div style="font-family:Georgia,serif;color:#1F4E3D;line-height:1.55;max-width:560px">
      <h1 style="font-size:22px;margin:0 0 8px">Balance payment due</h1>
      <p>Hi ${esc(input.name)},</p>
      <p>Your remaining balance of <strong>${esc(input.balanceAmount)}</strong> for <strong>${esc(input.journeyName)}</strong> is due by <strong>${esc(input.balanceDueDate)}</strong>.</p>
      <p>Reference: ${esc(input.refId)}</p>
      ${
        input.paymentLink
          ? `<p><a href="${esc(input.paymentLink)}" style="display:inline-block;padding:12px 18px;background:#364037;color:#fff;text-decoration:none;border-radius:999px">Pay balance now</a></p>`
          : `<p>Please reply to this email or contact ${esc(bookingsNotifyEmail())} to complete payment.</p>`
      }
    </div>
  `;
  return sendEmail({
    to: input.to,
    subject: `Balance due · ${input.journeyName} · ${input.refId}`,
    html,
    replyTo: bookingsNotifyEmail(),
  });
}

export async function notifyGuestFullyPaid(input: {
  to: string;
  name: string;
  journeyName: string;
  refId: string;
}) {
  const html = `
    <div style="font-family:Georgia,serif;color:#1F4E3D;line-height:1.55;max-width:560px">
      <h1 style="font-size:22px;margin:0 0 8px">Fully paid — see you in Meghalaya</h1>
      <p>Hi ${esc(input.name)},</p>
      <p>Your booking for <strong>${esc(input.journeyName)}</strong> is now <strong>fully paid</strong>. Reference ${esc(input.refId)}.</p>
      <p>We’ll be in touch with final meeting points and packing notes closer to your travel dates.</p>
    </div>
  `;
  return sendEmail({
    to: input.to,
    subject: `Fully paid · ${input.journeyName} · ${input.refId}`,
    html,
    replyTo: bookingsNotifyEmail(),
  });
}
