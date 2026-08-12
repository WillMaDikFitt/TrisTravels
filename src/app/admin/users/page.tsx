"use client";

import { useEffect, useMemo, useState } from "react";
import { listUsersAdmin, updateUserRole } from "@/lib/actions/cms";
import { listBookings } from "@/lib/actions/bookings";
import { listEnquiries } from "@/lib/actions/enquiries";
import type { BookingRecord, EnquiryRecord, UserRole } from "@/lib/types";
import { Badge, EmptyState, PageHeader, Panel, bookingTone, inputClass } from "@/components/admin/ui";
import { cn, formatINR } from "@/lib/utils";

type Row = { uid?: string; name?: string; email?: string; role?: UserRole; createdAt?: string };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [open, setOpen] = useState<Row | null>(null);

  useEffect(() => {
    listUsersAdmin().then((rows) => setUsers(rows as Row[]));
    listBookings().then(setBookings);
    listEnquiries().then(setEnquiries);
  }, []);

  const relatedBookings = useMemo(() => {
    if (!open?.email) return [];
    const email = open.email.toLowerCase();
    return bookings.filter((b) => b.customerEmail.toLowerCase() === email).slice(0, 8);
  }, [open, bookings]);

  const relatedEnquiries = useMemo(() => {
    if (!open?.email) return [];
    const email = open.email.toLowerCase();
    return enquiries.filter((e) => e.email.toLowerCase() === email).slice(0, 8);
  }, [open, enquiries]);

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Travellers"
        description="People who have signed up. Change roles carefully — staff and admin can open Studio."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {users.length ? (
          <div className="overflow-hidden rounded-2xl border border-[#e4dfd4] bg-white">
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
                      "border-t border-[#f0ebe3] cursor-pointer",
                      open?.uid === u.uid ? "bg-[#f7f4ee]" : "hover:bg-[#faf8f3]",
                    )}
                    onClick={() => setOpen(u)}
                  >
                    <td className="px-4 py-3 font-medium">{u.name || "—"}</td>
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
                        <option value="traveller">traveller</option>
                        <option value="staff">staff</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No travellers yet"
            body="Accounts appear here after someone signs up on the site."
          />
        )}

        {open && (
          <Panel className="h-fit space-y-4">
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">Traveller</p>
              <h2 className="mt-1 font-display text-xl">{open.name || "—"}</h2>
              <p className="text-sm text-[#5c6350]">{open.email}</p>
              <Badge tone={open.role === "admin" || open.role === "staff" ? "olive" : "neutral"}>
                {open.role || "traveller"}
              </Badge>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                Recent bookings
              </p>
              <ul className="mt-2 space-y-2">
                {relatedBookings.map((b) => (
                  <li key={b.id} className="rounded-xl border border-[#f0ebe3] px-3 py-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-medium">{b.experienceName}</span>
                      <Badge tone={bookingTone(b.status)}>{b.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[#8a917c]">
                      {b.date} · {formatINR(b.customerTotal)}
                    </p>
                  </li>
                ))}
                {!relatedBookings.length && (
                  <li className="text-sm text-[#8a917c]">No bookings for this email.</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                Recent enquiries
              </p>
              <ul className="mt-2 space-y-2">
                {relatedEnquiries.map((e) => (
                  <li key={e.id} className="rounded-xl border border-[#f0ebe3] px-3 py-2 text-sm">
                    <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                      {e.source === "story" ? "Guest story" : e.source.replace(/-/g, " ")}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[#5c6350]">{e.message}</p>
                  </li>
                ))}
                {!relatedEnquiries.length && (
                  <li className="text-sm text-[#8a917c]">No enquiries for this email.</li>
                )}
              </ul>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
