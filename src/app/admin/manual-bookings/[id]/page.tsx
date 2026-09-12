"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cancelManualBooking, getManualBookingAdmin } from "@/lib/actions/manual-bookings";
import {
  formatManualDate,
  manualPaymentLabel,
  manualProductLabel,
  manualStatusLabel,
  manualStatusTone,
} from "@/lib/manual-bookings";
import type { ManualBookingRecord } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import {
  AdminButton,
  Badge,
  EmptyState,
  Notice,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-[#dde1d0] py-3 first:border-t-0 first:pt-0 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">{label}</dt>
      <dd className="text-sm break-words text-[#26352b]">{children}</dd>
    </div>
  );
}

/** wa.me needs the number with country code; bare 10-digit numbers are Indian. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

export default function ManualBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params.id ?? ""));
  const router = useRouter();
  const { user, loading } = useAuth();
  const [booking, setBooking] = useState<ManualBookingRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchBooking = async () => {
    const token = (await user?.getIdToken()) ?? "";
    return getManualBookingAdmin(token, id);
  };

  const applyResult = (res: Awaited<ReturnType<typeof getManualBookingAdmin>>) => {
    if (res.ok) {
      setBooking(res.booking);
      setError("");
    } else {
      setError(res.error);
    }
    setLoaded(true);
  };

  const load = async () => applyResult(await fetchBooking());

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      const res = await fetchBooking();
      if (!cancelled) applyResult(res);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, id]);

  const backButton = (
    <AdminButton variant="ghost" onClick={() => router.push("/admin/manual-bookings")}>
      Back to list
    </AdminButton>
  );

  if (!loaded) {
    return <p className="text-sm text-[#4a5a50]">Loading booking…</p>;
  }

  if (!booking) {
    return (
      <div>
        <PageHeader eyebrow="Manual booking" title="Booking not found" actions={backButton} />
        <EmptyState title="Couldn’t open this booking" body={error || "Check the link and try again."} />
      </div>
    );
  }

  // The page only renders after a client-side fetch, so window is always available here.
  const link = `${window.location.origin}/pay/${booking.token}`;
  const whatsappText = `Hi ${booking.travellerName}, here are your booking details for ${booking.productName} on ${formatManualDate(booking.journeyDate)}. You can pay ${formatINR(booking.paymentRequested)} securely here: ${link}`;
  const travellers = `${booking.adults} adult${booking.adults === 1 ? "" : "s"}${
    booking.children ? ` · ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""
  }`;

  const copyLink = () =>
    navigator.clipboard
      .writeText(link)
      .then(() => setNote("Link copied — paste it into WhatsApp or email."))
      .catch(() => setNote("Couldn’t copy automatically. Select the link and copy it."));

  const cancel = async () => {
    if (!window.confirm("Cancel this payment link? The client won’t be able to pay through it.")) return;
    setBusy(true);
    const token = (await user?.getIdToken()) ?? "";
    const res = await cancelManualBooking(token, booking.id);
    setBusy(false);
    if (!res.ok) setNote(res.error);
    load();
  };

  return (
    <div>
      <PageHeader
        eyebrow={`Manual booking · ${booking.id}`}
        title={booking.productName}
        description={`${booking.travellerName} · ${formatManualDate(booking.journeyDate)} · ${travellers}`}
        actions={backButton}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          <Panel className="space-y-3">
            <h2 className="font-display text-lg">Client payment link</h2>
            <p className="text-sm text-[#4a5a50]">
              Send this private link to the client. The page shows their booking and a Pay Now button, and the
              status here updates by itself once they pay.
            </p>
            <input value={link} readOnly onFocus={(e) => e.target.select()} className={inputClass} />
            <div className="flex flex-wrap gap-2">
              <AdminButton onClick={copyLink}>Copy link</AdminButton>
              <AdminButton
                variant="ghost"
                onClick={() =>
                  window.open(
                    `https://wa.me/${whatsappNumber(booking.travellerPhone)}?text=${encodeURIComponent(whatsappText)}`,
                    "_blank",
                    "noopener",
                  )
                }
              >
                Send on WhatsApp
              </AdminButton>
              <AdminButton variant="ghost" onClick={() => window.open(link, "_blank", "noopener")}>
                Open client page
              </AdminButton>
            </div>
            {note ? <Notice tone="ok">{note}</Notice> : null}
          </Panel>

          <Panel>
            <h2 className="mb-4 font-display text-lg">Booking</h2>
            <dl>
              <DetailRow label="Product">
                {booking.productName}{" "}
                <span className="text-[#4a5a50]">· {manualProductLabel(booking.productType)}</span>
              </DetailRow>
              {booking.productSubheading ? (
                <DetailRow label="Subheading">{booking.productSubheading}</DetailRow>
              ) : null}
              <DetailRow label="Journey date">{formatManualDate(booking.journeyDate)}</DetailRow>
              <DetailRow label="Travellers">{travellers}</DetailRow>
              <DetailRow label="Traveller">{booking.travellerName}</DetailRow>
              <DetailRow label="Phone / WhatsApp">
                <a href={`tel:${booking.travellerPhone}`} className="underline-offset-2 hover:underline">
                  {booking.travellerPhone}
                </a>
              </DetailRow>
              {booking.travellerEmail ? (
                <DetailRow label="Email">
                  <a href={`mailto:${booking.travellerEmail}`} className="underline-offset-2 hover:underline">
                    {booking.travellerEmail}
                  </a>
                </DetailRow>
              ) : null}
              {booking.remarks ? (
                <DetailRow label="Remarks">
                  <span className="whitespace-pre-line">{booking.remarks}</span>
                </DetailRow>
              ) : null}
              <DetailRow label="Created">
                {new Date(booking.createdAt).toLocaleString("en-IN")}
                {booking.createdBy ? ` · ${booking.createdBy}` : ""}
              </DetailRow>
            </dl>
          </Panel>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">Status</p>
              <Badge tone={manualStatusTone(booking.status)}>{manualStatusLabel[booking.status]}</Badge>
            </div>
            <div>
              <p className="text-xs text-[#4a5a50] uppercase">
                {booking.status === "paid" ? "Paid through this link" : "This link collects"}
              </p>
              <p className="font-display text-3xl">{formatINR(booking.paymentRequested)}</p>
            </div>
            <dl>
              <DetailRow label="Payment type">{manualPaymentLabel(booking.paymentType)}</DetailRow>
              <DetailRow label="Total">{formatINR(booking.totalAmount)}</DetailRow>
              {booking.alreadyPaid > 0 ? (
                <DetailRow label="Already paid">{formatINR(booking.alreadyPaid)}</DetailRow>
              ) : null}
              <DetailRow label="Balance after">{formatINR(booking.balanceAmount)}</DetailRow>
              {booking.paymentDueDate ? (
                <DetailRow label="Due by">{formatManualDate(booking.paymentDueDate)}</DetailRow>
              ) : null}
              {booking.paidAt ? (
                <DetailRow label="Paid on">{new Date(booking.paidAt).toLocaleString("en-IN")}</DetailRow>
              ) : null}
              {booking.razorpayPaymentId ? (
                <DetailRow label="Payment ID">{booking.razorpayPaymentId}</DetailRow>
              ) : null}
            </dl>
            <div className="grid gap-2">
              <AdminButton variant="ghost" disabled={busy} onClick={load}>
                Refresh status
              </AdminButton>
              {booking.status === "pending" ? (
                <AdminButton variant="danger" disabled={busy} onClick={cancel}>
                  Cancel link
                </AdminButton>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
