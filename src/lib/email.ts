/** Outbound booking / enquiry notifications via Gmail SMTP (Nodemailer). */

import nodemailer from "nodemailer";

const DEFAULT_BOOKINGS = "tristravelbookings@gmail.com";
const BRAND = {
  green: "#1F4E3D",
  forest: "#364037",
  cream: "#F8F6F1",
  mist: "#E8EBDD",
  muted: "#5C6350",
  accent: "#C96A3D",
  white: "#FFFFFF",
};

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

function siteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "https://tristravels.com";
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
    const info = await transport.sendMail({
      from: emailFromAddress(),
      to: Array.isArray(input.to) ? input.to.join(", ") : input.to,
      subject: input.subject,
      html: input.html,
      replyTo: input.replyTo,
    });
    console.info("sendEmail ok:", {
      to: input.to,
      subject: input.subject,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
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

function emailShell(input: {
  eyebrow: string;
  title: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
}) {
  const origin = siteOrigin();
  const cta = input.cta
    ? `<p style="margin:28px 0 8px">
        <a href="${esc(input.cta.href)}" style="display:inline-block;padding:14px 22px;background:${BRAND.forest};color:${BRAND.white};text-decoration:none;border-radius:999px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">${esc(input.cta.label)}</a>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:${BRAND.mist}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.mist};padding:28px 12px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.cream};border-radius:24px;overflow:hidden;border:1px solid #d5dcc8">
          <tr>
            <td style="background:${BRAND.forest};padding:22px 28px">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.04em;color:${BRAND.cream}">TRIS Travels</p>
              <p style="margin:6px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.mist}">Meghalaya · Community-rooted journeys</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;font-family:Georgia,'Times New Roman',serif;color:${BRAND.green};line-height:1.55">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.accent}">${esc(input.eyebrow)}</p>
              <h1 style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:400;color:${BRAND.green}">${esc(input.title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 28px 28px;font-family:Georgia,'Times New Roman',serif;color:${BRAND.green};line-height:1.6;font-size:16px">
              ${input.bodyHtml}
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid #d5dcc8;background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:${BRAND.muted}">
              <p style="margin:0">TRIS Travels · Meghalaya</p>
              <p style="margin:6px 0 0">
                <a href="${esc(origin)}" style="color:${BRAND.forest};text-decoration:none">${esc(origin.replace(/^https?:\/\//, ""))}</a>
                · ${esc(bookingsNotifyEmail())}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailTable(rows: { label: string; value: string }[]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-collapse:collapse">
    ${rows
      .map(
        (row) => `<tr>
      <td style="padding:8px 0;border-bottom:1px solid #dde3d2;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${BRAND.muted}">${esc(row.label)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #dde3d2;text-align:right;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${BRAND.green}"><strong>${esc(row.value)}</strong></td>
    </tr>`,
      )
      .join("")}
  </table>`;
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
  const html = emailShell({
    eyebrow: `New ${input.kind}`,
    title: input.name,
    bodyHtml: `
      ${detailTable([
        { label: "Reference", value: input.id },
        { label: "Name", value: input.name },
        { label: "Email", value: input.email || "—" },
        { label: "Phone", value: input.phone || "—" },
      ])}
      ${input.summary ? `<p style="margin:0 0 12px"><strong>Summary</strong><br/>${esc(input.summary)}</p>` : ""}
      ${input.message ? `<p style="margin:0"><strong>Message</strong><br/>${esc(input.message)}</p>` : ""}
    `,
    cta: { label: "Open Studio", href: `${siteOrigin()}/admin` },
  });
  return sendEmail({
    to,
    subject,
    html,
    replyTo: input.email?.includes("@") ? input.email : undefined,
  });
}

export async function notifyGuestExperienceBooking(input: {
  to: string;
  name: string;
  experienceName: string;
  refId: string;
  date: string;
  slot: string;
  guests: number;
  total: string;
  status: string;
  backendId?: string;
  paid?: boolean;
}) {
  const paid = Boolean(input.paid);
  const html = emailShell({
    eyebrow: paid ? "Payment received" : "Booking received",
    title: input.experienceName,
    bodyHtml: `
      <p style="margin:0 0 12px">Hi ${esc(input.name)},</p>
      <p style="margin:0 0 12px">${
        paid
          ? "Thanks for booking with TRIS. We’ve received your payment and your place is confirmed."
          : input.status === "requested"
            ? "Thanks for your enquiry. Our team will confirm availability and share payment next steps shortly."
            : "We’ve reserved your place while payment is completed. Your booking is <strong>not confirmed</strong> until payment is received — reply to this email or WhatsApp us if you need help paying."
      }</p>
      ${detailTable([
        { label: "Reference", value: input.refId },
        ...(input.backendId ? [{ label: "Backend ID", value: input.backendId }] : []),
        { label: "Date", value: input.date },
        { label: "Slot", value: input.slot },
        { label: "Guests", value: String(input.guests) },
        { label: "Status", value: paid ? "Confirmed · paid" : input.status === "requested" ? "Enquiry" : "Held · payment pending" },
        { label: "Amount", value: input.total },
      ])}
      <p style="margin:0;font-size:14px;color:${BRAND.muted}">Questions? Reply to this email or write to ${esc(bookingsNotifyEmail())}.</p>
    `,
    cta: { label: "Your account", href: `${siteOrigin()}/account` },
  });
  return sendEmail({
    to: input.to,
    subject: `${paid ? "Booking confirmed" : "Booking received"} · ${input.experienceName} · ${input.refId}`,
    html,
    replyTo: bookingsNotifyEmail(),
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
  const rows = [
    { label: "Reference", value: input.refId },
    { label: "Total (incl. GST)", value: input.totalAmount },
    { label: "Advance paid", value: input.advanceAmount },
    { label: "Balance due", value: input.balanceAmount },
  ];
  if (input.balanceDueDate) rows.push({ label: "Balance due by", value: input.balanceDueDate });
  if (input.preferredFrom) {
    rows.push({
      label: "Travel dates",
      value: `${input.preferredFrom}${input.preferredTo ? ` → ${input.preferredTo}` : ""}`,
    });
  }

  const html = emailShell({
    eyebrow: "Advance received",
    title: `Booking confirmed — ${input.journeyName}`,
    bodyHtml: `
      <p style="margin:0 0 12px">Hi ${esc(input.name)},</p>
      <p style="margin:0 0 12px">We’ve received your <strong>50% advance</strong>. Your journey is confirmed pending final arrangements.</p>
      ${detailTable(rows)}
      ${input.itineraryHtml || `<p style="margin:0">Your detailed journey plan will follow from our team shortly.</p>`}
      <p style="margin:18px 0 0;font-size:14px;color:${BRAND.muted}">50% to confirm. 50% before you travel. Questions? Reply to this email or write to ${esc(bookingsNotifyEmail())}.</p>
    `,
    cta: { label: "View journeys", href: `${siteOrigin()}/journeys` },
  });
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
  const html = emailShell({
    eyebrow: "Payment reminder",
    title: "Balance payment due",
    bodyHtml: `
      <p style="margin:0 0 12px">Hi ${esc(input.name)},</p>
      <p style="margin:0 0 12px">Your remaining balance of <strong>${esc(input.balanceAmount)}</strong> for <strong>${esc(input.journeyName)}</strong> is due by <strong>${esc(input.balanceDueDate)}</strong>.</p>
      ${detailTable([
        { label: "Reference", value: input.refId },
        { label: "Balance due", value: input.balanceAmount },
        { label: "Due by", value: input.balanceDueDate },
      ])}
      ${
        input.paymentLink
          ? ""
          : `<p style="margin:0;font-size:14px;color:${BRAND.muted}">Please reply to this email or contact ${esc(bookingsNotifyEmail())} to complete payment.</p>`
      }
    `,
    cta: input.paymentLink
      ? { label: "Pay balance now", href: input.paymentLink }
      : { label: "Contact TRIS", href: `mailto:${bookingsNotifyEmail()}` },
  });
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
  const html = emailShell({
    eyebrow: "Fully paid",
    title: "See you in Meghalaya",
    bodyHtml: `
      <p style="margin:0 0 12px">Hi ${esc(input.name)},</p>
      <p style="margin:0 0 12px">Your booking for <strong>${esc(input.journeyName)}</strong> is now <strong>fully paid</strong>.</p>
      ${detailTable([{ label: "Reference", value: input.refId }])}
      <p style="margin:0">We’ll be in touch with final meeting points and packing notes closer to your travel dates.</p>
    `,
    cta: { label: "Your account", href: `${siteOrigin()}/account` },
  });
  return sendEmail({
    to: input.to,
    subject: `Fully paid · ${input.journeyName} · ${input.refId}`,
    html,
    replyTo: bookingsNotifyEmail(),
  });
}
