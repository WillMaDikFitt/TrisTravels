"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addBookingNote,
  confirmBooking,
  listBookings,
  setBookingPaymentRef,
  updateBookingStatus,
} from "@/lib/actions/bookings";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import { formatINR, cn } from "@/lib/utils";
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

const statuses: BookingStatus[] = ["hold", "requested", "confirmed", "expired", "cancelled"];
const statusLabel: Record<BookingStatus, string> = {
  hold: "On hold",
  requested: "Request",
  confirmed: "Confirmed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export default function AdminBookingsPage() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  const [experience, setExperience] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<BookingRecord | null>(null);
  const [noteText, setNoteText] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = () =>
    listBookings().then((list) => {
      setRows(list);
      setOpen((prev) => (prev ? list.find((b) => b.id === prev.id) ?? null : null));
    });

  useEffect(() => {
    refresh();
  }, []);

  const experiences = useMemo(
    () => [...new Set(rows.map((b) => b.experienceName))].sort(),
    [rows],
  );

  const visible = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (experience !== "all" && b.experienceName !== experience) return false;
      if (from && b.date < from) return false;
      if (to && b.date > to) return false;
      if (!query) return true;
      return (
        b.id.toLowerCase().includes(query) ||
        b.customerName.toLowerCase().includes(query) ||
        b.customerEmail.toLowerCase().includes(query) ||
        b.experienceName.toLowerCase().includes(query)
      );
    });
  }, [rows, filter, experience, from, to, q]);

  const openPanel = (b: BookingRecord) => {
    setOpen(b);
    setPaymentRef(b.paymentRef ?? "");
    setNoteText("");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Confirm requests, mark paid, cancel, and keep an internal trail. Guests only ever see the total."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              filter === s ? "bg-[#364037] text-[#f8f6f1]" : "bg-white text-[#4a5a50] ring-1 ring-[#c5cbb8]",
            )}
          >
            {s === "all" ? "All" : statusLabel[s]}
          </button>
        ))}
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, ref…"
          className={inputClass}
        />
        <select value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass}>
          <option value="all">All experiences</option>
          {experiences.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
      </div>

      <div className="grid gap-6">
        {visible.length ? (
          <div className="overflow-x-auto rounded-2xl border border-[#c5cbb8] bg-white shadow-[0_8px_24px_rgba(42,46,31,0.05)]">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Date & slot</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => openPanel(b)}
                    className={cn(
                      "cursor-pointer border-t border-[#dde1d0] transition hover:bg-[#faf8f3]",
                      open?.id === b.id && "bg-[#eef0e3]",
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#4a5a50]">{b.id}</td>
                    <td className="px-4 py-3 font-medium">{b.experienceName}</td>
                    <td className="px-4 py-3 text-[#4a5a50]">
                      {b.date}
                      <span className="mt-0.5 block text-xs text-[#4a5a50]">
                        {b.slot} · {b.guests} guests
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.customerName}</p>
                      <p className="mt-0.5 text-xs text-[#4a5a50]">{b.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={bookingTone(b.status)}>{statusLabel[b.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatINR(b.customerTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No bookings in this view" body="Try another filter or search." />
        )}

        {open && (
          <Panel className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                {open.id}
              </p>
              <h2 className="mt-1 font-display text-xl">{open.experienceName}</h2>
              <p className="mt-1 text-sm text-[#4a5a50]">
                {open.date} · {open.slot} · {open.adults ?? open.guests} adult
                {(open.adults ?? open.guests) === 1 ? "" : "s"}
                {open.children ? ` · ${open.children} child${open.children === 1 ? "" : "ren"}` : ""}
                {open.childAges?.length ? ` (ages ${open.childAges.join(", ")})` : ""}
              </p>
              {open.transportation?.requested ? (
                <p className="mt-1 text-sm text-[#4a5a50]">
                  Transport: {open.transportation.vehicleLabel ?? "Requested"}
                  {open.transportation.price
                    ? ` · ${formatINR(open.transportation.price)}`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="rounded-xl bg-[#f8f6f1] p-3 text-sm">
              <p className="font-medium">{open.customerName}</p>
              <p className="text-[#4a5a50]">{open.customerEmail}</p>
              {open.customerPhone && <p className="text-[#4a5a50]">{open.customerPhone}</p>}
            </div>
            <div>
              <p className="text-xs text-[#4a5a50] uppercase">Guest total</p>
              <p className="font-display text-2xl">{formatINR(open.customerTotal)}</p>
              {open.internal && (
                <p className="mt-1 text-xs text-[#4a5a50]">
                  Internal: base {formatINR(open.internal.base)} · staff{" "}
                  {formatINR(open.internal.staffCost)} · fee {formatINR(open.internal.serviceFee)} · GST{" "}
                  {formatINR(open.internal.gst)}
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
                  onClick={async () => {
                    setBusy(true);
                    await setBookingPaymentRef(open.id, paymentRef);
                    setBusy(false);
                    refresh();
                  }}
                >
                  Save
                </AdminButton>
              </div>
            </Field>

            <div className="flex flex-wrap gap-2">
              <AdminButton
                type="button"
                disabled={busy || open.status === "confirmed"}
                onClick={async () => {
                  setBusy(true);
                  await confirmBooking(open.id, {
                    paymentRef,
                    by: profile?.name || profile?.email,
                  });
                  setBusy(false);
                  refresh();
                }}
              >
                Confirm / mark paid
              </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await addBookingNote(
                    open.id,
                    "Requested more info from guest",
                    profile?.name || profile?.email,
                  );
                  if (open.status === "hold") await updateBookingStatus(open.id, "requested");
                  setBusy(false);
                  refresh();
                }}
              >
                Request more info
              </AdminButton>
              <AdminButton
                type="button"
                variant="danger"
                disabled={busy || open.status === "cancelled"}
                onClick={async () => {
                  setBusy(true);
                  await updateBookingStatus(open.id, "cancelled");
                  await addBookingNote(open.id, "Cancelled by staff", profile?.name || profile?.email);
                  setBusy(false);
                  refresh();
                }}
              >
                Cancel
              </AdminButton>
            </div>

            <Field label="Internal note">
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
              onClick={async () => {
                setBusy(true);
                await addBookingNote(open.id, noteText, profile?.name || profile?.email);
                setNoteText("");
                setBusy(false);
                refresh();
              }}
            >
              Add note
            </AdminButton>

            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">Trail</p>
              <ul className="mt-2 space-y-2">
                {(open.notes ?? []).length === 0 && (
                  <li className="text-sm text-[#4a5a50]">No notes yet.</li>
                )}
                {[...(open.notes ?? [])].reverse().map((n, i) => (
                  <li key={`${n.at}-${i}`} className="rounded-xl border border-[#dde1d0] px-3 py-2 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-[#4a5a50]">
                      {new Date(n.at).toLocaleString("en-IN")}
                      {n.by ? ` · ${n.by}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
