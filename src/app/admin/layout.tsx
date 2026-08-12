"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Inbox,
  Compass,
  Map,
  BookOpen,
  MapPin,
  PenLine,
  CalendarOff,
  Users,
  Settings,
  BarChart3,
  ExternalLink,
  LogOut,
} from "lucide-react";

const sections: { label: string; links: { href: string; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: "Operations",
    links: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
      { href: "/admin/story-submissions", label: "Guest stories", icon: PenLine },
      { href: "/admin/availability", label: "Availability", icon: CalendarOff },
    ],
  },
  {
    label: "Catalogue",
    links: [
      { href: "/admin/experiences", label: "Experiences", icon: Compass },
      { href: "/admin/journeys", label: "Journeys", icon: Map },
      { href: "/admin/places", label: "Places", icon: MapPin },
      { href: "/admin/journal", label: "Journal", icon: BookOpen },
    ],
  },
  {
    label: "People & system",
    links: [
      { href: "/admin/users", label: "Travellers", icon: Users },
      { href: "/admin/reports", label: "Reports", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const flatLinks = sections.flatMap((s) => s.links);

function linkActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, isAdmin, configured, profile, logout, user } = useAuth();

  useEffect(() => {
    if (loading || !configured) return;
    if (!user) router.replace("/login?next=/admin");
  }, [loading, configured, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f4ee] text-[#5c6350]">
        Loading studio…
      </div>
    );
  }

  if (configured && user && !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f7f4ee] px-6 text-center">
        <p className="font-display text-2xl text-[#2a2e1f]">Studio is for TRIS staff</p>
        <p className="mt-2 max-w-sm text-sm text-[#5c6350]">
          You’re signed in, but this account doesn’t have admin access.
        </p>
        <Link href="/account" className="mt-6 text-sm font-semibold text-[#4a5a28] underline">
          Back to your account
        </Link>
      </div>
    );
  }

  const initials = (profile?.name || "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f7f4ee] text-[#2a2e1f]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[#e4dfd4] bg-white md:flex">
        <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
          <Image
            src="/brand/tris-logo-on-light.png?v=1"
            alt=""
            width={36}
            height={36}
            unoptimized
            className="h-9 w-9 object-contain"
          />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#6b734f] uppercase">TRIS Studio</p>
            <p className="text-sm font-medium">Ops & catalogue</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-1.5 px-3 text-[10px] font-semibold tracking-[0.16em] text-[#8a917c] uppercase">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.links.map((l) => {
                  const active = linkActive(pathname, l.href);
                  const Icon = l.icon;
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-[#e4e8d4] font-medium text-[#3d4a28]"
                          : "text-[#5c6350] hover:bg-[#f3efe8]",
                      )}
                    >
                      <Icon size={16} />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-[#e4dfd4] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4a5a28] text-xs font-semibold text-[#f7f4ee]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.name || "Admin"}</p>
              <p className="truncate text-xs text-[#8a917c]">{profile?.email || "Preview mode"}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[#d4cec0] py-1.5 text-[11px] font-semibold uppercase"
            >
              <ExternalLink size={12} /> Site
            </Link>
            <button
              type="button"
              onClick={() => logout().then(() => router.push("/"))}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-[#d4cec0] py-1.5 text-[11px] font-semibold uppercase"
            >
              <LogOut size={12} /> Out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex gap-2 overflow-x-auto border-b border-[#e4dfd4] bg-white px-4 py-3 md:hidden">
          {flatLinks.map((l) => {
            const active = linkActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                  active ? "bg-[#e4e8d4] text-[#3d4a28]" : "text-[#5c6350]",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        {!configured && (
          <p className="mx-4 mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 md:mx-8">
            Studio is in preview mode — edits won’t be saved permanently until the site is fully connected.
          </p>
        )}
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
