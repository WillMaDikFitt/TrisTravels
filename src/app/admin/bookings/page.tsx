"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listBookings } from "@/lib/actions/bookings";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import { formatINR, cn } from "@/lib/utils";
import { Badge, EmptyState, PageHeader, bookingTone, inputClass } from "@/components/admin/ui";

const statuses: BookingStatus[] = ["hold", "requested", "confirmed", "expired", "cancelled"];
const statusLabel: Record<BookingStatus, string> = {
  hold: "On hold",
  requested: "Request",
  confirmed: "Confirmed",
  expired: "Expired",
  cancelled: "Cancelled",
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  const [experience, setExperience] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    listBookings().then(setRows);
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
                  onClick={() => router.push(`/admin/bookings/${encodeURIComponent(b.id)}`)}
                  className="cursor-pointer border-t border-[#dde1d0] transition hover:bg-[#faf8f3]"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[#4a5a50]">{b.id}</td>
                  <td className="px-4 py-3 font-medium">
                    <p>{b.experienceName}</p>
                    {b.backendId ? (
                      <p className="mt-0.5 text-[11px] font-normal tracking-wide text-[#4a5a50]">
                        ID {b.backendId}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-[#4a5a50]">
                    {b.date}
                    <span className="mt-0.5 block text-xs text-[#4a5a50]">
                      {b.slot} · {b.guests} guest{b.guests === 1 ? "" : "s"}
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
    </div>
  );
}
