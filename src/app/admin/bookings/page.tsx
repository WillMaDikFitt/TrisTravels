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
              filter === s ? "bg-[#4a5a28] text-[#f7f4ee]" : "bg-white text-[#5c6350] ring-1 ring-[#d4cec0]",
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

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-2">
          {visible.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => openPanel(b)}
              className={cn(
                "w-full rounded-2xl border bg-white p-4 text-left transition",
                open?.id === b.id ? "border-[#4a5a28]" : "border-[#e4dfd4] hover:border-[#c8c2b4]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{b.experienceName}</p>
                  <p className="mt-1 text-sm text-[#5c6350]">
                    {b.date} · {b.slot} · {b.guests} guests
                  </p>
                  <p className="mt-1 text-sm text-[#5c6350]">
                    {b.customerName} · {b.customerEmail}
                  </p>
                </div>
                <div className="text-right">
                  <Badge tone={bookingTone(b.status)}>{statusLabel[b.status]}</Badge>
                  <p className="mt-2 text-sm font-medium">{formatINR(b.customerTotal)}</p>
                </div>
              </div>
            </button>
          ))}
          {!visible.length && (
            <EmptyState title="No bookings in this view" body="Try another filter or search." />
          )}
        </div>

        {open && (
          <Panel className="h-fit space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                {open.id}
              </p>
              <h2 className="mt-1 font-display text-xl">{open.experienceName}</h2>
              <p className="mt-1 text-sm text-[#5c6350]">
                {open.date} · {open.slot} · {open.guests} guests
              </p>
            </div>
            <div className="rounded-xl bg-[#f7f4ee] p-3 text-sm">
              <p className="font-medium">{open.customerName}</p>
              <p className="text-[#5c6350]">{open.customerEmail}</p>
              {open.customerPhone && <p className="text-[#5c6350]">{open.customerPhone}</p>}
            </div>
            <div>
              <p className="text-xs text-[#8a917c] uppercase">Guest total</p>
              <p className="font-display text-2xl">{formatINR(open.customerTotal)}</p>
              {open.internal && (
                <p className="mt-1 text-xs text-[#8a917c]">
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
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">Trail</p>
              <ul className="mt-2 space-y-2">
                {(open.notes ?? []).length === 0 && (
                  <li className="text-sm text-[#8a917c]">No notes yet.</li>
                )}
                {[...(open.notes ?? [])].reverse().map((n, i) => (
                  <li key={`${n.at}-${i}`} className="rounded-xl border border-[#f0ebe3] px-3 py-2 text-sm">
                    <p>{n.text}</p>
                    <p className="mt-1 text-xs text-[#8a917c]">
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
