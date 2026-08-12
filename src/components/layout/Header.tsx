"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TRIS_LOGO_ON_DARK, TRIS_LOGO_ON_LIGHT } from "@/components/brand/BrandLogo";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { useAuth } from "@/components/auth/AuthProvider";

const journeyCols = [
  {
    href: "/journeys?type=curated",
    title: "Curated Journeys",
    body: "Flexible multi-day packages — shape dates and stays.",
  },
  {
    href: "/journeys?type=small-group",
    title: "Small Group",
    body: "Fixed departures. Show up and travel with others.",
  },
  {
    href: "/craft-my-journey",
    title: "Craft My Journey",
    body: "A brief to our planners — entirely around you.",
  },
];

const discoverLinks = [
  { href: "/destinations", title: "Destinations", body: "Villages, rivers, and living bridges we know well." },
  { href: "/stories", title: "Stories", body: "Guest voices from the hills." },
];

const aboutLinks = [
  { href: "/about", title: "Our story", body: "Mei-ieid and the heart behind TRIS." },
  { href: "/partner", title: "Partner with us", body: "Guides, hosts, and local operators." },
  { href: "/contact", title: "Contact", body: "Plan, ask, or say hello." },
];

function MegaCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl bg-white px-5 py-4 ring-1 ring-[#e4dfd4] transition hover:ring-accent/40"
    >
      <p className="font-display text-lg text-secondary">{title}</p>
      <p className="mt-1.5 text-sm text-on-surface-variant">{body}</p>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, profile, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMega(null);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMega(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const solid = scrolled || !isHome || open || Boolean(mega);

  return (
    <header className="fixed top-0 z-50 w-full" onMouseLeave={() => setMega(null)}>
      <div
        className={cn(
          "transition-[background-color,border-color,box-shadow] duration-300",
          solid
            ? "bg-surface-container-lowest border-b border-outline-variant/25 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto grid h-16 max-w-container-max grid-cols-[1fr_auto_1fr] items-center px-margin-mobile md:h-20 md:px-margin-desktop">
          <Link href="/" className="relative z-10 flex shrink-0 items-center justify-self-start" aria-label="TRIS Travels home">
            <Image
              src={solid ? TRIS_LOGO_ON_LIGHT : TRIS_LOGO_ON_DARK}
              alt="TRIS Travels"
              width={72}
              height={72}
              priority
              unoptimized
              className={cn(
                "h-12 w-12 object-contain transition md:h-14 md:w-14",
                !solid && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]",
              )}
            />
          </Link>

          <nav className="hidden items-center justify-self-center gap-1 lg:flex">
            {(
              [
                ["experiences", "Experiences", "/experiences"],
                ["journeys", "Journeys", "/journeys"],
                ["discover", "Discover", "/destinations"],
                ["about", "About", "/about"],
              ] as const
            ).map(([key, label, href]) => {
              const active =
                key === "experiences"
                  ? pathname.startsWith("/experiences")
                  : key === "journeys"
                    ? pathname.startsWith("/journeys") || pathname.startsWith("/craft-my-journey")
                    : key === "discover"
                      ? pathname.startsWith("/destinations") || pathname.startsWith("/stories")
                      : pathname.startsWith("/about") ||
                        pathname.startsWith("/partner") ||
                        pathname.startsWith("/contact");
              return (
                <div key={key} onMouseEnter={() => setMega(key)}>
                  <Link
                    href={href}
                    className={cn(
                      "label-caps inline-flex items-center gap-1 border-b-2 px-3 pb-1 transition-colors",
                      active || mega === key
                        ? solid
                          ? "border-accent text-accent"
                          : "border-white text-white"
                        : solid
                          ? "border-transparent text-on-surface-variant hover:text-primary"
                          : "border-transparent text-white/75 hover:text-white",
                    )}
                  >
                    {label}
                    <ChevronDown size={14} />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center justify-self-end gap-1.5 md:gap-2">
            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                {isAdmin && (
                  <Button href="/admin" size="sm" variant={solid ? "ghost" : "light"}>
                    Studio
                  </Button>
                )}
                <Button href="/account" size="sm" variant={solid ? "primary" : "light"}>
                  {profile?.name?.split(" ")[0] || "Account"}
                </Button>
              </div>
            ) : (
              <Button href="/login" size="sm" variant={solid ? "primary" : "light"} className="hidden md:inline-flex">
                Log in / Sign up
              </Button>
            )}
            <button
              type="button"
              className={cn(
                "rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary lg:hidden",
                solid ? "text-primary" : "text-white",
              )}
              aria-label={open ? "Close menu" : "Menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mega && (
          <div className="hidden border-t border-[#e4dfd4] bg-[#f7f4ee] lg:block">
            <div className="mx-auto max-w-container-max px-margin-desktop py-7">
              {mega === "experiences" && (
                <div>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="label-caps text-accent">Experience types</p>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        A few hours to a full day — pick how it should feel.
                      </p>
                    </div>
                    <Link
                      href="/experiences"
                      className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-primary uppercase"
                    >
                      Browse all <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {EXPERIENCE_CATEGORIES.map((c) => (
                      <MegaCard
                        key={c.id}
                        href={`/experiences?type=${c.slug}`}
                        title={c.id}
                        body={c.blurb}
                      />
                    ))}
                  </div>
                </div>
              )}
              {mega === "journeys" && (
                <div className="grid grid-cols-3 gap-3">
                  {journeyCols.map((c) => (
                    <MegaCard key={c.href} href={c.href} title={c.title} body={c.body} />
                  ))}
                </div>
              )}
              {mega === "discover" && (
                <div className="grid max-w-3xl grid-cols-2 gap-3">
                  {discoverLinks.map((c) => (
                    <MegaCard key={c.href} href={c.href} title={c.title} body={c.body} />
                  ))}
                </div>
              )}
              {mega === "about" && (
                <div className="grid grid-cols-3 gap-3">
                  {aboutLinks.map((c) => (
                    <MegaCard key={c.href} href={c.href} title={c.title} body={c.body} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {open && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-outline-variant/20 bg-surface px-margin-mobile py-6 lg:hidden">
            <div className="flex flex-col gap-5">
              <div>
                <p className="label-caps text-accent">Experiences</p>
                <div className="mt-2 flex flex-col gap-2">
                  {EXPERIENCE_CATEGORIES.map((c) => (
                    <Link key={c.id} href={`/experiences?type=${c.slug}`} className="text-secondary">
                      {c.id}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="label-caps text-accent">Journeys</p>
                <div className="mt-2 flex flex-col gap-2">
                  {journeyCols.map((c) => (
                    <Link key={c.href} href={c.href} className="text-secondary">
                      {c.title}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {[...discoverLinks, ...aboutLinks].map((c) => (
                  <Link key={c.href} href={c.href} className="font-display text-xl text-primary">
                    {c.title}
                  </Link>
                ))}
              </div>
              {user ? (
                <>
                  <Button href="/account" className="w-full">
                    Account
                  </Button>
                  {isAdmin && <Button href="/admin" variant="ghost" className="w-full">Admin</Button>}
                  <button type="button" className="text-sm text-on-surface-variant" onClick={() => logout()}>
                    Log out
                  </button>
                </>
              ) : (
                <Button href="/login" className="w-full">
                  Log in / Sign up
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
