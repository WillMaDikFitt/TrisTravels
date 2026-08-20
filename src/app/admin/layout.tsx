"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TRIS_LOGO_ON_DARK } from "@/components/brand/BrandLogo";
import { fetchStudioHealth } from "@/lib/actions/studio-health";
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
  const [health, setHealth] = useState<{
    adminConfigured: boolean;
    adminConnected: boolean;
    adminError?: string;
  } | null>(null);

  useEffect(() => {
    fetchStudioHealth().then(setHealth);
  }, []);

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
  const currentPage =
    [...flatLinks].sort((a, b) => b.href.length - a.href.length).find((link) =>
      linkActive(pathname, link.href),
    )?.label ?? "Studio";

  return (
    <div className="flex min-h-screen bg-[#f4f2ec] text-[#24281c]">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-black/10 bg-[#252a1e] text-[#f7f4ee] md:flex">
        <Link href="/admin" className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <Image
            src={TRIS_LOGO_ON_DARK}
            alt="TRIS Travels"
            width={44}
            height={44}
            unoptimized
            className="h-11 w-11 object-contain"
          />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#d99a70] uppercase">TRIS Studio</p>
            <p className="text-sm font-medium text-white">Operations hub</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-white/45 uppercase">
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
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-[#d99a70] font-semibold text-[#282419] shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
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
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d99a70] text-xs font-semibold text-[#282419]">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{profile?.name || "Admin"}</p>
              <p className="truncate text-xs text-white/50">{profile?.email || "Preview mode"}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href="/"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-white/20 py-1.5 text-[11px] font-semibold text-white/80 uppercase transition hover:bg-white/10"
            >
              <ExternalLink size={12} /> Site
            </Link>
            <button
              type="button"
              onClick={() => logout().then(() => router.push("/"))}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-full border border-white/20 py-1.5 text-[11px] font-semibold text-white/80 uppercase transition hover:bg-white/10"
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
            Studio is in preview mode — changes won’t be saved permanently until the live site is fully connected.
          </p>
        )}
        {configured && health && !health.adminConfigured && (
          <p className="mx-4 mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 md:mx-8">
            Studio can’t load live travellers, bookings, or reports yet. Ask your developer to finish connecting
            the live site, then redeploy.
          </p>
        )}
        {configured && health?.adminConfigured && !health.adminConnected && (
          <p className="mx-4 mt-4 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900 md:mx-8">
            {health.adminError ||
              "Studio can’t reach the live site records right now. Ask your developer to check the server connection."}
          </p>
        )}
        {configured && health?.adminConnected && health.adminError && (
          <p className="mx-4 mt-4 rounded-xl bg-[#f3efe8] px-4 py-2.5 text-sm text-[#5c6350] md:mx-8">
            {health.adminError}
          </p>
        )}
        <header className="sticky top-0 z-30 hidden h-[4.5rem] items-center border-b border-[#ded9cd] bg-white/90 px-8 backdrop-blur-xl md:flex">
          <div>
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#8a917c] uppercase">
              TRIS Studio
            </p>
            <p className="mt-0.5 text-sm font-semibold text-[#2a2e1f]">{currentPage}</p>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4.5rem)] bg-[radial-gradient(circle_at_top_right,rgba(194,100,58,0.08),transparent_32%),linear-gradient(180deg,#f8f6f1_0%,#f1eee7_100%)]">
          <main className="mx-auto w-full max-w-[1600px] p-4 md:p-8 lg:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
