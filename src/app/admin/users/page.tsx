"use client";

import { useEffect, useMemo, useState } from "react";
import { listUsersAdmin, updateUserRole } from "@/lib/actions/cms";
import { listBookings } from "@/lib/actions/bookings";
import { listEnquiries } from "@/lib/actions/enquiries";
import type { BookingRecord, EnquiryRecord, UserRole } from "@/lib/types";
import { Badge, EmptyState, PageHeader, Panel, bookingTone, inputClass } from "@/components/admin/ui";
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
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [open, setOpen] = useState<Row | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    listUsersAdmin().then((result) => {
      if (!result.ok) {
        setLoadError(result.error);
        return;
      }
      setUsers(result.users as Row[]);
    });
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
        description="Firebase accounts and their Studio roles. Change roles carefully — staff and admin can open Studio."
      />
      {loadError && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-[#5c4b18]">
          Couldn’t load Firebase accounts. Add the Firebase Admin environment variables in Vercel, then redeploy.
        </div>
      )}
      <div className="grid gap-6">
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
            body="No Firebase Auth accounts have signed up yet."
          />
        )}

        {open && (
          <Panel className="h-fit max-w-5xl space-y-4">
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
              <table className="mt-2 w-full text-left text-sm">
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
            <div>
              <p className="text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                Recent enquiries
              </p>
              <table className="mt-2 w-full text-left text-sm">
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
                      <td className="max-w-[12rem] py-2 text-[#5c6350]">
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
          </Panel>
        )}
      </div>
    </div>
  );
}
