"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { listManualBookings } from "@/lib/actions/manual-bookings";
import {
  formatManualDate,
  manualProductLabel,
  manualStatusLabel,
  manualStatusTone,
} from "@/lib/manual-bookings";
import type { ManualBookingRecord } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { AdminButton, Badge, EmptyState, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";

export default function ManualBookingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<ManualBookingRecord[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      const token = (await user?.getIdToken()) ?? "";
      const res = await listManualBookings(token);
      if (cancelled) return;
      if (res.ok) {
        setRows(res.bookings);
      } else {
        setError(res.error);
        setRows([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Manual bookings"
        description="Enter bookings that came in directly, then send the client a private page to pay online."
        actions={
          <AdminButton onClick={() => router.push("/admin/manual-bookings/new")}>New manual booking</AdminButton>
        }
      />

      {error ? (
        <div className="mb-4">
          <Notice tone="warn">{error}</Notice>
        </div>
      ) : null}

      {rows === null ? (
        <LoadingBlock label="Loading manual bookings…" />
      ) : rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-[#c5cbb8] bg-white shadow-[0_8px_24px_rgba(42,46,31,0.05)]">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Traveller</th>
                <th className="px-4 py-3">Journey date</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">This link</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => router.push(`/admin/manual-bookings/${encodeURIComponent(b.id)}`)}
                  className="cursor-pointer border-t border-[#dde1d0] transition hover:bg-[#faf8f3]"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.productName}</p>
                    <p className="mt-0.5 text-xs text-[#4a5a50]">{manualProductLabel(b.productType)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{b.travellerName}</p>
                    <p className="mt-0.5 text-xs text-[#4a5a50]">{b.travellerPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-[#4a5a50]">{formatManualDate(b.journeyDate)}</td>
                  <td className="px-4 py-3 text-right">{formatINR(b.totalAmount)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatINR(b.paymentRequested)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={manualStatusTone(b.status)}>{manualStatusLabel[b.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No manual bookings yet"
          body="Use “New manual booking” when a client books with you directly."
        />
      )}
    </div>
  );
}
