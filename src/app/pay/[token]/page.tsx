import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getManualBookingByToken } from "@/lib/manual-bookings-store";
import { formatManualDate, manualPaymentLabel, manualProductLabel } from "@/lib/manual-bookings";
import { razorpayConfigured } from "@/lib/razorpay";
import { formatINR } from "@/lib/utils";
import { PayNowButton } from "./PayNowButton";

type Props = { params: Promise<{ token: string }> };

/** Always read the live status so a finished payment shows straight away. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your TRIS booking",
  robots: { index: false, follow: false },
};

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-container-lowest px-5 py-4">
      <dt className="text-[10px] leading-tight font-semibold tracking-[0.12em] text-on-surface-variant/75 uppercase">
        {label}
      </dt>
      <dd className="mt-1 break-words font-serif text-[15px] text-primary">{value}</dd>
    </div>
  );
}

function AmountRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={strong ? "font-semibold text-primary" : "text-on-surface-variant"}>{label}</dt>
      <dd className={strong ? "font-display text-2xl text-primary" : "font-medium text-primary"}>{value}</dd>
    </div>
  );
}

export default async function ManualBookingPaymentPage({ params }: Props) {
  const { token } = await params;
  const booking = await getManualBookingByToken(token).catch(() => null);
  if (!booking) notFound();

  const travellers = [
    `${booking.adults} adult${booking.adults === 1 ? "" : "s"}`,
    booking.children ? `${booking.children} child${booking.children === 1 ? "" : "ren"}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-background pt-header">
      <div className="mx-auto max-w-3xl px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        <p className="label-caps text-accent">
          {manualProductLabel(booking.productType)} · Booking {booking.id}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-balance text-primary md:text-5xl">
          {booking.productName}
        </h1>
        {booking.productSubheading ? (
          <p className="mt-3 text-lg leading-relaxed text-pretty text-on-surface-variant">
            {booking.productSubheading}
          </p>
        ) : null}

        <div className="mt-8 overflow-hidden rounded-3xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_12px_35px_rgba(42,46,31,0.06)]">
          <dl className="grid gap-px bg-outline-variant/20 sm:grid-cols-2">
            <Detail label="Traveller" value={booking.travellerName} />
            <Detail label="Phone / WhatsApp" value={booking.travellerPhone} />
            {booking.travellerEmail ? <Detail label="Email" value={booking.travellerEmail} /> : null}
            <Detail label="Journey date" value={formatManualDate(booking.journeyDate)} />
            <Detail label="Travellers" value={travellers} />
            <Detail label="Payment type" value={manualPaymentLabel(booking.paymentType)} />
          </dl>

          <dl className="border-t border-outline-variant/20 px-5 py-4 md:px-6">
            <AmountRow label="Total booking amount" value={formatINR(booking.totalAmount)} />
            {booking.alreadyPaid > 0 ? (
              <AmountRow label="Already paid" value={formatINR(booking.alreadyPaid)} />
            ) : null}
            <AmountRow label="Balance after this payment" value={formatINR(booking.balanceAmount)} />
            {booking.paymentDueDate && booking.status === "pending" ? (
              <AmountRow label="Payment due by" value={formatManualDate(booking.paymentDueDate)} />
            ) : null}
            <div className="mt-2 border-t border-outline-variant/20 pt-2">
              <AmountRow
                label={booking.status === "paid" ? "Amount paid" : "Payment requested"}
                value={formatINR(booking.paymentRequested)}
                strong
              />
            </div>
          </dl>
        </div>

        <div className="mt-6">
          {booking.status === "paid" ? (
            <div className="flex gap-3 rounded-2xl bg-highlight/15 px-5 py-4 text-primary">
              <Check className="mt-0.5 shrink-0" size={20} />
              <div>
                <p className="font-semibold">Payment received — thank you!</p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  We’ve received {formatINR(booking.paymentRequested)}
                  {booking.paidAt ? ` on ${new Date(booking.paidAt).toLocaleDateString("en-IN")}` : ""}.
                  {booking.razorpayPaymentId ? ` Payment reference: ${booking.razorpayPaymentId}.` : ""}
                </p>
              </div>
            </div>
          ) : booking.status === "cancelled" ? (
            <p className="rounded-2xl bg-terracotta/10 px-5 py-4 text-sm text-terracotta">
              This payment link is no longer active. Please contact TRIS if you need help with your booking.
            </p>
          ) : razorpayConfigured() ? (
            <PayNowButton token={booking.token} amount={booking.paymentRequested} />
          ) : (
            <p className="rounded-2xl bg-surface-container px-5 py-4 text-sm text-on-surface-variant">
              Online payment isn’t available right now. Please contact TRIS to complete your payment.
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-on-surface-variant">
          Payments are processed securely by Razorpay. This page is private to you — please don’t share the link.
        </p>
      </div>
    </div>
  );
}
