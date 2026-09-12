"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addBookingNote,
  confirmBooking,
  listBookings,
  setBookingPaymentRef,
  updateBookingStatus,
} from "@/lib/actions/bookings";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  AdminButton,
  Badge,
  EmptyState,
  Field,
  PageHeader,
  Panel,
  bookingTone,
  inputClass,
} from "@/components/admin/ui";

const statusLabel: Record<BookingStatus, string> = {
  hold: "On hold",
  requested: "Request",
  confirmed: "Confirmed",
  expired: "Expired",
  cancelled: "Cancelled",
};

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-[#dde1d0] py-3 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">{label}</dt>
      <dd className="text-sm text-[#26352b]">{children}</dd>
    </div>
  );
}

export default function AdminBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params.id ?? ""));
  const router = useRouter();
  const { profile } = useAuth();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () =>
    listBookings().then((list) => {
      const found = list.find((b) => b.id === id) ?? null;
      setBooking(found);
      setLoaded(true);
      return found;
    });

  useEffect(() => {
    refresh().then((found) => setPaymentRef(found?.paymentRef ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const staff = profile?.name || profile?.email;
  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    await action();
    setBusy(false);
    refresh();
  };

  const backButton = (
    <AdminButton variant="ghost" onClick={() => router.push("/admin/bookings")}>
      Back to bookings
    </AdminButton>
  );

  if (!loaded) {
    return <p className="text-sm text-[#4a5a50]">Loading booking…</p>;
  }

  if (!booking) {
    return (
      <div>
        <PageHeader eyebrow="Booking" title="Booking not found" actions={backButton} />
        <EmptyState title="No booking with this reference" body={id || "Check the link and try again."} />
      </div>
    );
  }

  const adults = booking.adults ?? booking.guests;
  const transport = booking.transportation;

  return (
    <div>
      <PageHeader
        eyebrow={`Booking · ${booking.id}`}
        title={booking.experienceName}
        description={`${booking.date} · ${booking.slot} · ${booking.guests} guest${booking.guests === 1 ? "" : "s"}`}
        actions={backButton}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          <Panel>
            <h2 className="mb-4 font-display text-lg">Trip</h2>
            <dl>
              <DetailRow label="Date">{booking.date}</DetailRow>
              <DetailRow label="Time">{booking.slot}</DetailRow>
              <DetailRow label="Guests">
                {adults} adult{adults === 1 ? "" : "s"}
                {booking.children
                  ? ` · ${booking.children} child${booking.children === 1 ? "" : "ren"}`
                  : ""}
                {booking.childAges?.length ? ` (ages ${booking.childAges.join(", ")})` : ""}
              </DetailRow>
              <DetailRow label="Transport">
                {transport?.requested ? (
                  <>
                    {transport.vehicleLabel ?? "Requested"}
                    {transport.vehicleCount && transport.vehicleCount > 1 ? ` × ${transport.vehicleCount}` : ""}
                    {transport.price ? ` · ${formatINR(transport.price)}` : ""}
                  </>
                ) : (
                  "Own arrangement"
                )}
              </DetailRow>
              {transport?.pickupAddress ? (
                <DetailRow label="Pickup">{transport.pickupAddress}</DetailRow>
              ) : null}
              {booking.backendId ? <DetailRow label="Backend ID">{booking.backendId}</DetailRow> : null}
              <DetailRow label="Booked on">{new Date(booking.createdAt).toLocaleString("en-IN")}</DetailRow>
              {booking.expiresAt && booking.status === "hold" ? (
                <DetailRow label="Hold expires">{new Date(booking.expiresAt).toLocaleString("en-IN")}</DetailRow>
              ) : null}
            </dl>
          </Panel>

          <Panel>
            <h2 className="mb-4 font-display text-lg">Guest</h2>
            <dl>
              <DetailRow label="Name">{booking.customerName}</DetailRow>
              <DetailRow label="Email">
                <a href={`mailto:${booking.customerEmail}`} className="underline-offset-2 hover:underline">
                  {booking.customerEmail}
                </a>
              </DetailRow>
              {booking.customerPhone ? (
                <DetailRow label="Phone">
                  <a href={`tel:${booking.customerPhone}`} className="underline-offset-2 hover:underline">
                    {booking.customerPhone}
                  </a>
                </DetailRow>
              ) : null}
            </dl>
          </Panel>

          <Panel className="space-y-4">
            <h2 className="font-display text-lg">Internal trail</h2>
            <Field label="Add a note">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className={inputClass}
                placeholder="Visible only to staff"
              />
            </Field>
            <AdminButton
              type="button"
              variant="ghost"
              disabled={busy || !noteText.trim()}
              onClick={() =>
                run(async () => {
                  await addBookingNote(booking.id, noteText, staff);
                  setNoteText("");
                })
              }
            >
              Add note
            </AdminButton>
            <ul className="space-y-2">
              {(booking.notes ?? []).length === 0 && <li className="text-sm text-[#4a5a50]">No notes yet.</li>}
              {[...(booking.notes ?? [])].reverse().map((n, i) => (
                <li key={`${n.at}-${i}`} className="rounded-xl border border-[#dde1d0] px-3 py-2 text-sm">
                  <p>{n.text}</p>
                  <p className="mt-1 text-xs text-[#4a5a50]">
                    {new Date(n.at).toLocaleString("en-IN")}
                    {n.by ? ` · ${n.by}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Panel className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">Status</p>
              <Badge tone={bookingTone(booking.status)}>{statusLabel[booking.status]}</Badge>
            </div>
            <div>
              <p className="text-xs text-[#4a5a50] uppercase">Guest total</p>
              <p className="font-display text-3xl">{formatINR(booking.customerTotal)}</p>
              {booking.internal && (
                <p className="mt-1 text-xs text-[#4a5a50]">
                  Internal: base {formatINR(booking.internal.base)} · staff {formatINR(booking.internal.staffCost)} ·
                  fee {formatINR(booking.internal.serviceFee)} · GST {formatINR(booking.internal.gst)}
                </p>
              )}
            </div>

            <Field label="Payment reference">
              <div className="flex gap-2">
                <input
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className={inputClass}
                  placeholder="UTR / Razorpay id"
                />
                <AdminButton
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => run(() => setBookingPaymentRef(booking.id, paymentRef))}
                >
                  Save
                </AdminButton>
              </div>
            </Field>

            <div className="grid gap-2">
              <AdminButton
                type="button"
                disabled={busy || booking.status === "confirmed"}
                onClick={() => run(() => confirmBooking(booking.id, { paymentRef, by: staff }))}
              >
                Confirm / mark paid
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await addBookingNote(booking.id, "Requested more info from guest", staff);
                    if (booking.status === "hold") await updateBookingStatus(booking.id, "requested");
                  })
                }
              >
                Request more info
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                disabled={busy || booking.status === "cancelled"}
                onClick={() =>
                  run(async () => {
                    await updateBookingStatus(booking.id, "cancelled");
                    await addBookingNote(booking.id, "Cancelled by staff", staff);
                  })
                }
              >
                Cancel booking
              </AdminButton>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
