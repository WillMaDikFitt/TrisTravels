"use client";

import { useEffect, useMemo, useState } from "react";
import { listBookings } from "@/lib/actions/bookings";
import { listEnquiries } from "@/lib/actions/enquiries";
import { fetchStoriesAdmin } from "@/lib/actions/content-read";
import type { BookingRecord, EnquiryRecord } from "@/lib/types";
import type { Story } from "@/data/stories";
import { AdminButton, PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { formatINR, cn } from "@/lib/utils";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    listBookings().then(setBookings);
    listEnquiries().then(setEnquiries);
    fetchStoriesAdmin().then(setStories).catch(() => setStories([]));
  }, []);

  const inRange = useMemo(() => {
    return bookings.filter((b) => {
      const day = b.date || b.createdAt.slice(0, 10);
      return day >= from && day <= to;
    });
  }, [bookings, from, to]);

  const enquiriesInRange = useMemo(() => {
    return enquiries.filter((e) => {
      const day = e.createdAt.slice(0, 10);
      return day >= from && day <= to;
    });
  }, [enquiries, from, to]);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of inRange) map[b.status] = (map[b.status] ?? 0) + 1;
    return map;
  }, [inRange]);

  const revenue = useMemo(
    () =>
      inRange
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + (b.customerTotal || 0), 0),
    [inRange],
  );

  const bySource = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of enquiriesInRange) map[e.source] = (map[e.source] ?? 0) + 1;
    return map;
  }, [enquiriesInRange]);

  const guestStories = enquiries.filter((e) => e.source === "story");
  const guestInRange = guestStories.filter((e) => {
    const day = e.createdAt.slice(0, 10);
    return day >= from && day <= to;
  });

  const exportCsv = () => {
    const header = ["id", "experience", "date", "slot", "guests", "name", "email", "status", "total"];
    const lines = [
      header.join(","),
      ...inRange.map((b) =>
        [
          b.id,
          JSON.stringify(b.experienceName),
          b.date,
          b.slot,
          b.guests,
          JSON.stringify(b.customerName),
          b.customerEmail,
          b.status,
          b.customerTotal,
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tris-bookings-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Reports"
        description="Lightweight ops snapshot for the selected period. Revenue is the sum of confirmed guest totals."
        actions={
          <AdminButton type="button" onClick={exportCsv}>
            Export bookings CSV
          </AdminButton>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <label className="text-sm">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 block rounded-xl border border-[#d4cec0] bg-white px-3 py-2"
          />
        </label>
        <label className="text-sm">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 block rounded-xl border border-[#d4cec0] bg-white px-3 py-2"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Bookings in period" value={inRange.length} />
        <StatCard label="Confirmed revenue" value={formatINR(revenue)} hint="Guest totals only" />
        <StatCard label="Enquiries in period" value={enquiriesInRange.length} />
        <StatCard
          label="Guest stories"
          value={`${guestInRange.length} / ${stories.length}`}
          hint="Submitted in period / published journal"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-lg">Bookings by status</h2>
          <ul className="mt-4 space-y-2">
            {Object.entries(byStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between border-b border-[#f0ebe3] py-2 text-sm">
                <span className="capitalize">{status}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
            {!Object.keys(byStatus).length && (
              <li className="text-sm text-[#8a917c]">No bookings in this range.</li>
            )}
          </ul>
        </Panel>
        <Panel>
          <h2 className="font-display text-lg">Enquiries by source</h2>
          <ul className="mt-4 space-y-2">
            {Object.entries(bySource).map(([source, count]) => (
              <li key={source} className="flex justify-between border-b border-[#f0ebe3] py-2 text-sm">
                <span className={cn("capitalize")}>
                  {source === "story" ? "Guest story" : source.replace(/-/g, " ")}
                </span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
            {!Object.keys(bySource).length && (
              <li className="text-sm text-[#8a917c]">No enquiries in this range.</li>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
