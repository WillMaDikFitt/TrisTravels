"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/Form";
import { useAuth } from "@/components/auth/AuthProvider";
import { listBookingsForEmail } from "@/lib/actions/bookings";
import { listEnquiriesForUser } from "@/lib/actions/enquiries";
import type { BookingRecord, EnquiryRecord } from "@/lib/types";
import { formatINR, cn } from "@/lib/utils";
import type { Experience } from "@/data/experiences";
import { fetchPublicExperiences } from "@/lib/actions/content-read";

type Tab = "profile" | "wishlist" | "bookings" | "enquiries";

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "confirmed" || status === "closed"
      ? "bg-emerald-50 text-emerald-800"
      : status === "requested" || status === "hold" || status === "new" || status === "in-progress"
        ? "bg-amber-50 text-amber-900"
        : "bg-[#f3efe8] text-[#5c6350]";
  return <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", tone)}>{status}</span>;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, logout, configured, updateAccount, isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [catalog, setCatalog] = useState<Experience[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user && configured) router.push("/login");
  }, [loading, user, configured, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  useEffect(() => {
    const email = profile?.email || user?.email;
    if (!email) return;
    listBookingsForEmail(email).then(setBookings);
    listEnquiriesForUser(email).then(setEnquiries);
    fetchPublicExperiences().then(setCatalog).catch(() => setCatalog([]));
  }, [profile?.email, user?.email]);

  const wished = catalog.filter((e) => profile?.wishlist.includes(e.slug));

  if (loading) {
    return <div className="pt-header p-16 text-on-surface-variant">Loading your account…</div>;
  }

  if (!configured) {
    return (
      <div className="bg-background pt-header">
        <div className="mx-auto max-w-xl px-margin-mobile py-20">
          <h1 className="font-display text-3xl text-primary">Account</h1>
          <p className="mt-3 text-on-surface-variant">
            Accounts aren’t available right now. Please try again later.
          </p>
          <Button href="/login" className="mt-6">
            Log in
          </Button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (profile?.name || "T")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "profile", label: "Profile" },
    { id: "wishlist", label: "Wishlist", count: wished.length },
    { id: "bookings", label: "Bookings", count: bookings.length },
    { id: "enquiries", label: "Enquiries", count: enquiries.length },
  ];

  return (
    <div className="bg-background pt-header">
      <div className="border-b border-outline-variant/25 bg-surface-container-lowest">
        <div className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-12">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary font-display text-xl text-on-primary">
                {initials}
              </div>
              <div>
                <p className="label-caps text-primary">Your account</p>
                <h1 className="mt-1 font-display text-3xl text-secondary md:text-4xl">
                  {profile?.name || "Traveller"}
                </h1>
                <p className="mt-1 text-on-surface-variant">{profile?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {isAdmin && <Button href="/admin">Open studio</Button>}
              <Button variant="ghost" onClick={() => logout().then(() => router.push("/"))}>
                Log out
              </Button>
            </div>
          </div>
          <div className="mt-8 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase",
                  tab === t.id ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                {t.label}
                {typeof t.count === "number" ? ` · ${t.count}` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        {tab === "profile" && (
          <div className="mx-auto max-w-lg rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-ambient md:p-8">
            <h2 className="font-display text-2xl text-primary">Profile</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Used on bookings and enquiries.</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setSaved("");
                try {
                  await updateAccount({ name, phone });
                  setSaved("Saved.");
                } catch (err) {
                  setSaved(err instanceof Error ? err.message : "Could not save");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <FormInput label="Full name" name="name" value={name} onChange={setName} required />
              <FormInput label="Mobile" name="phone" type="tel" value={phone} onChange={setPhone} />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={profile?.email ?? ""}
                readOnly
                hint="Managed by your login. Contact us to change it."
              />
              {saved && <p className="text-sm text-primary">{saved}</p>}
              <Button type="submit" disabled={busy}>
                {busy ? "Saving…" : "Save profile"}
              </Button>
            </form>
          </div>
        )}

        {tab === "wishlist" && (
          <div>
            {wished.length ? (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wished.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/experiences/${e.slug}`}
                      className="group flex overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-ambient"
                    >
                      <div className="relative h-28 w-28 shrink-0">
                        <Image src={e.image} alt={e.name} fill className="object-cover" sizes="112px" />
                      </div>
                      <div className="p-4">
                        <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">{e.category}</p>
                        <p className="mt-1 font-display text-lg leading-snug group-hover:text-primary">{e.name}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">{e.duration}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 px-6 py-16 text-center">
                <p className="font-display text-xl text-secondary">Nothing saved yet</p>
                <p className="mt-2 text-sm text-on-surface-variant">Tap the heart on an experience to keep it here.</p>
                <Button href="/experiences" className="mt-6">
                  Browse experiences
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "bookings" && (
          <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest">
            {bookings.length ? (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-surface-container-low text-on-surface-variant">
                  <tr>
                    <th className="px-5 py-3 font-medium">Experience</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-t border-outline-variant/20">
                      <td className="px-5 py-4">
                        <p className="font-medium">{b.experienceName}</p>
                        <p className="text-xs text-on-surface-variant">
                          {b.slot} · {b.guests} guests · {b.id}
                        </p>
                      </td>
                      <td className="px-5 py-4">{b.date}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="px-5 py-4">{formatINR(b.customerTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="font-display text-xl text-secondary">No bookings yet</p>
                <Button href="/experiences" className="mt-6">
                  Check availability
                </Button>
              </div>
            )}
          </div>
        )}

        {tab === "enquiries" && (
          <ul className="space-y-3">
            {enquiries.map((e) => (
              <li key={e.id} className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold tracking-wider text-primary uppercase">
                    {e.source.replace(/-/g, " ")}
                  </p>
                  <StatusPill status={e.status} />
                </div>
                <p className="mt-2 text-secondary">{e.message}</p>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {new Date(e.createdAt).toLocaleDateString("en-IN")}
                </p>
              </li>
            ))}
            {!enquiries.length && (
              <li className="rounded-2xl border border-dashed border-outline-variant/40 px-6 py-16 text-center">
                <p className="font-display text-xl text-secondary">No enquiries yet</p>
                <Button href="/craft-my-journey" className="mt-6">
                  Craft a journey
                </Button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
