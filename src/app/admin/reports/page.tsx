"use client";

import { useEffect, useMemo, useState } from "react";
import { listBookings } from "@/lib/actions/bookings";
import { listEnquiries } from "@/lib/actions/enquiries";
import { fetchStoriesAdmin } from "@/lib/actions/content-read";
import type { BookingRecord, EnquiryRecord } from "@/lib/types";
import type { Story } from "@/data/stories";
import { AdminButton, Notice, PageHeader, Panel, StatCard } from "@/components/admin/ui";
import { formatINR, cn } from "@/lib/utils";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function recordDay(iso?: string) {
  return (iso || "").slice(0, 10);
}

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadError, setLoadError] = useState("");
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([listBookings(), listEnquiries(), fetchStoriesAdmin()])
      .then(([nextBookings, nextEnquiries, nextStories]) => {
        setBookings(nextBookings);
        setEnquiries(nextEnquiries);
        setStories(nextStories);
        if (!nextBookings.length && !nextEnquiries.length) {
          setLoadError(
            "No bookings or enquiries were returned. If people have already submitted on the live site, ask your developer to check the live connection.",
          );
        }
      })
      .catch(() => {
        setLoadError("Could not load report data from the server.");
      });
  }, []);

  const inRange = useMemo(() => {
    return bookings.filter((b) => {
      const day = recordDay(b.createdAt) || recordDay(b.date);
      return day >= from && day <= to;
    });
  }, [bookings, from, to]);

  const enquiriesInRange = useMemo(() => {
    return enquiries.filter((e) => {
      const day = recordDay(e.createdAt);
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
    const day = recordDay(e.createdAt);
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
        description="Counts use when a booking or enquiry was created, not the trip date. Revenue is the sum of confirmed guest totals in the selected period."
        actions={
          <AdminButton type="button" onClick={exportCsv}>
            Export bookings CSV
          </AdminButton>
        }
      />

      {loadError && (
        <div className="mb-6">
          <Notice tone="warn">{loadError}</Notice>
        </div>
      )}

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
        <StatCard label="Bookings in period" value={inRange.length} hint={`${bookings.length} total loaded`} />
        <StatCard label="Confirmed revenue" value={formatINR(revenue)} hint="Guest totals only" />
        <StatCard label="Enquiries in period" value={enquiriesInRange.length} hint={`${enquiries.length} total loaded`} />
        <StatCard
          label="Guest stories"
          value={`${guestInRange.length} / ${stories.length}`}
          hint="Submitted in period / published journal"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-display text-lg">Bookings by status</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
              <tr>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Bookings</th>
              </tr>
            </thead>
            <tbody>
            {Object.entries(byStatus).map(([status, count]) => (
              <tr key={status} className="border-t border-[#f0ebe3]">
                <td className="py-2 capitalize">{status}</td>
                <td className="py-2 text-right font-medium">{count}</td>
              </tr>
            ))}
            {!Object.keys(byStatus).length && (
              <tr>
                <td colSpan={2} className="py-4 text-[#8a917c]">No bookings in this range.</td>
              </tr>
            )}
            </tbody>
          </table>
        </Panel>
        <Panel>
          <h2 className="font-display text-lg">Enquiries by source</h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
              <tr>
                <th className="pb-2">Source</th>
                <th className="pb-2 text-right">Enquiries</th>
              </tr>
            </thead>
            <tbody>
            {Object.entries(bySource).map(([source, count]) => (
              <tr key={source} className="border-t border-[#f0ebe3]">
                <td className={cn("py-2 capitalize")}>
                  {source === "story" ? "Guest story" : source.replace(/-/g, " ")}
                </td>
                <td className="py-2 text-right font-medium">{count}</td>
              </tr>
            ))}
            {!Object.keys(bySource).length && (
              <tr>
                <td colSpan={2} className="py-4 text-[#8a917c]">No enquiries in this range.</td>
              </tr>
            )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
