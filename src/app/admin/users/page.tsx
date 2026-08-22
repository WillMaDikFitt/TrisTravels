"use client";

import { useEffect, useState } from "react";
import { listUsersAdmin, updateUserRole } from "@/lib/actions/cms";
import { listBookingsForEmail } from "@/lib/actions/bookings";
import { listEnquiriesForUser } from "@/lib/actions/enquiries";
import type { BookingRecord, EnquiryRecord, UserRole } from "@/lib/types";
import {
  Badge,
  EmptyState,
  LoadingBlock,
  Notice,
  PageHeader,
  bookingTone,
  inputClass,
} from "@/components/admin/ui";
import { cn, formatINR } from "@/lib/utils";

type Row = {
  uid?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  createdAt?: string;
  profileMissing?: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Row | null>(null);
  const [relatedBookings, setRelatedBookings] = useState<BookingRecord[]>([]);
  const [relatedEnquiries, setRelatedEnquiries] = useState<EnquiryRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadWarning, setLoadWarning] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listUsersAdmin()
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setLoadError(result.error);
          setUsers([]);
          return;
        }
        setUsers(result.users as Row[]);
        if ("authPartial" in result && result.authPartial) {
          setLoadWarning(
            "Some signed-up travellers may not appear in this list yet. If someone is missing, contact your site developer.",
          );
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load travellers right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open?.email) {
      setRelatedBookings([]);
      setRelatedEnquiries([]);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    Promise.all([listBookingsForEmail(open.email), listEnquiriesForUser(open.email)])
      .then(([bookings, enquiries]) => {
        if (cancelled) return;
        setRelatedBookings(bookings);
        setRelatedEnquiries(enquiries);
      })
      .catch(() => {
        if (cancelled) return;
        setRelatedBookings([]);
        setRelatedEnquiries([]);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open?.email]);

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Travellers"
        description="People who have signed up on the site. Give someone staff or admin access if they need to open Studio."
      />
      {loadError && (
        <div className="mb-6">
          <Notice tone="warn">{loadError}</Notice>
        </div>
      )}
      {loadWarning && !loadError && (
        <div className="mb-6">
          <Notice tone="info">{loadWarning}</Notice>
        </div>
      )}
      <div className="flex w-full min-w-0 flex-col gap-6">
        {loading ? (
          <LoadingBlock label="Loading travellers…" />
        ) : users.length ? (
          <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-[#e4dfd4] bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#f7f4ee] text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.uid ?? u.email}
                    className={cn(
                      "cursor-pointer border-t border-[#f0ebe3]",
                      open?.uid === u.uid ? "bg-[#f7f4ee]" : "hover:bg-[#faf8f3]",
                    )}
                    onClick={() => setOpen(u)}
                  >
                    <td className="px-4 py-3 font-medium">
                      {u.name || "—"}
                      {u.profileMissing && (
                        <span className="ml-2 rounded-full bg-[#f0ebe3] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6b734f] uppercase">
                          Profile pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[#5c6350]">{u.email}</td>
                    <td className="px-4 py-3 text-[#8a917c]">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={u.role || "traveller"}
                        className={`${inputClass} bg-white py-1.5 text-xs`}
                        onChange={async (ev) => {
                          const role = ev.target.value as UserRole;
                          if (!u.uid) return;
                          await updateUserRole(u.uid, role);
                          setUsers((prev) =>
                            prev.map((row) => (row.uid === u.uid ? { ...row, role } : row)),
                          );
                          setOpen((prev) => (prev?.uid === u.uid ? { ...prev, role } : prev));
                        }}
                      >
                        <option value="traveller">Traveller</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No travellers yet" body="No one has created an account on the site yet." />
        )}

        {open && (
          <div className="w-full min-w-0 space-y-4 rounded-2xl border border-[#e4dfd4] bg-white p-5 shadow-[0_8px_24px_rgba(42,46,31,0.05)] md:p-6">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">Traveller</p>
              <h2 className="mt-1 font-display text-xl">{open.name || "—"}</h2>
              <p className="text-sm text-[#5c6350]">{open.email}</p>
              <Badge tone={open.role === "admin" || open.role === "staff" ? "olive" : "neutral"}>
                {open.role || "traveller"}
              </Badge>
            </div>
            {detailLoading ? (
              <p className="text-sm text-[#8a917c]">Loading bookings and enquiries…</p>
            ) : (
              <>
                <div className="w-full min-w-0">
                  <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                    Recent bookings
                  </p>
                  <div className="mt-2 w-full min-w-0 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-semibold tracking-wider text-[#8a917c] uppercase">
                        <tr>
                          <th className="pb-1.5">Date</th>
                          <th className="pb-1.5">Experience</th>
                          <th className="pb-1.5">Status</th>
                          <th className="pb-1.5 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedBookings.map((b) => (
                          <tr key={b.id} className="border-t border-[#f0ebe3]">
                            <td className="py-2 text-[#5c6350]">{b.date}</td>
                            <td className="py-2 font-medium">{b.experienceName}</td>
                            <td className="py-2">
                              <Badge tone={bookingTone(b.status)}>{b.status}</Badge>
                            </td>
                            <td className="py-2 text-right text-[#5c6350]">{formatINR(b.customerTotal)}</td>
                          </tr>
                        ))}
                        {!relatedBookings.length && (
                          <tr>
                            <td colSpan={4} className="py-3 text-[#8a917c]">
                              No bookings for this email.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="w-full min-w-0">
                  <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                    Recent enquiries
                  </p>
                  <div className="mt-2 w-full min-w-0 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-[10px] font-semibold tracking-wider text-[#8a917c] uppercase">
                        <tr>
                          <th className="pb-1.5">Source</th>
                          <th className="pb-1.5">Preview</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relatedEnquiries.map((e) => (
                          <tr key={e.id} className="border-t border-[#f0ebe3]">
                            <td className="py-2 text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                              {e.source === "story" ? "Guest story" : e.source.replace(/-/g, " ")}
                            </td>
                            <td className="py-2 text-[#5c6350]">
                              <p className="line-clamp-2">{e.message}</p>
                            </td>
                          </tr>
                        ))}
                        {!relatedEnquiries.length && (
                          <tr>
                            <td colSpan={2} className="py-3 text-[#8a917c]">
                              No enquiries for this email.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
