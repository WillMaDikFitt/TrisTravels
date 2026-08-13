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

const journeyCols: {
  href: string;
  title: string;
  body: string;
  tag: string;
  featured?: boolean;
}[] = [
  {
    href: "/journeys?type=curated",
    title: "Curated Journeys",
    body: "Flexible multi-day packages — shape dates and stays.",
    tag: "Enquire",
  },
  {
    href: "/journeys?type=small-group",
    title: "Small Group",
    body: "Fixed departures. Show up and travel with others.",
    tag: "Join a date",
  },
  {
    href: "/craft-my-journey",
    title: "Craft My Journey",
    body: "A brief to our planners — entirely around you.",
    tag: "Personal",
    featured: true,
  },
];

const discoverLinks = [
  {
    href: "/destinations",
    title: "Destinations",
    body: "Villages, rivers, and living bridges we know well.",
  },
  { href: "/stories", title: "Stories", body: "Guest voices from the hills." },
];

const aboutLinks = [
  { href: "/about", title: "Our story", body: "Mei-ieid and the heart behind TRIS." },
  { href: "/partner", title: "Partner with us", body: "Guides, hosts, and local operators." },
  { href: "/contact", title: "Contact", body: "Plan, ask, or say hello." },
];

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const megaOpen = Boolean(mega);
  const solid = scrolled || !isHome || open || megaOpen;
  const darkNav = megaOpen && !open;

  return (
    <header className="fixed top-0 z-[70] w-full" onMouseLeave={() => setMega(null)}>
      <div
        className={cn(
          "transition-[background-color,border-color,box-shadow] duration-300",
          darkNav
            ? "bg-[#2a2e1f] border-b border-white/10"
            : solid
              ? "bg-surface-container-lowest border-b border-outline-variant/25 shadow-sm"
              : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-14 max-w-container-max items-center justify-between gap-3 px-margin-mobile md:h-16 md:px-margin-desktop lg:grid lg:h-20 lg:grid-cols-[1fr_auto_1fr] lg:gap-0">
          <Link
            href="/"
            className="relative z-10 flex shrink-0 items-center lg:justify-self-start"
            aria-label="TRIS Travels home"
          >
            <Image
              src={darkNav || !solid ? TRIS_LOGO_ON_DARK : TRIS_LOGO_ON_LIGHT}
              alt="TRIS Travels"
              width={72}
              height={72}
              priority
              unoptimized
              className={cn(
                "h-9 w-9 object-contain transition sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-14 lg:w-14",
                !solid && !darkNav && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]",
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
                        ? "border-accent text-accent"
                        : darkNav || !solid
                          ? "border-transparent text-white/75 hover:text-white"
                          : "border-transparent text-on-surface-variant hover:text-primary",
                    )}
                  >
                    {label}
                    <ChevronDown size={14} />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:justify-self-end lg:gap-2">
            {user ? (
              <div className="hidden items-center gap-2 lg:flex">
                {isAdmin && (
                  <Button href="/admin" size="sm" variant={darkNav || !solid ? "light" : "ghost"}>
                    Studio
                  </Button>
                )}
                <Button href="/account" size="sm" variant={darkNav || !solid ? "light" : "primary"}>
                  {profile?.name?.split(" ")[0] || "Account"}
                </Button>
              </div>
            ) : (
              <div className="max-lg:hidden">
                <Button
                  href="/login"
                  size="sm"
                  variant={darkNav || !solid ? "light" : "primary"}
                >
                  Log in / Sign up
                </Button>
              </div>
            )}
            <button
              type="button"
              className={cn(
                "rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary lg:hidden",
                darkNav || !solid ? "text-white" : "text-primary",
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
          <div className="hidden bg-[#2a2e1f] text-primary-fixed lg:block">
            <div className="mx-auto max-w-container-max px-margin-desktop py-7">
              {mega === "experiences" && (
                <div>
                  <div className="mb-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="label-caps text-accent">Experience types</p>
                      <p className="mt-1 text-sm text-primary-fixed/70">
                        A few hours to a full day — pick how it should feel.
                      </p>
                    </div>
                    <Link
                      href="/experiences"
                      className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-accent uppercase"
                    >
                      Browse all <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-[#323628]">
                    {EXPERIENCE_CATEGORIES.map((c, i) => (
                      <Link
                        key={c.id}
                        href={`/experiences?type=${c.slug}`}
                        className={cn(
                          "group border-white/10 p-4 transition hover:bg-[#3a4030]",
                          i % 3 !== 2 && "border-r",
                          i < 3 && "border-b",
                        )}
                      >
                        <span className="font-serif text-sm text-accent/80">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="mt-1 font-display text-lg text-primary-fixed group-hover:text-accent">
                          {c.id}
                        </p>
                        <p className="mt-1 text-xs text-primary-fixed/65">{c.blurb}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {mega === "journeys" && (
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 flex flex-col gap-4 lg:col-span-7">
                    {journeyCols
                      .filter((c) => !c.featured)
                      .map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="group rounded-2xl border border-white/10 bg-[#323628] p-6 transition hover:bg-[#3a4030]"
                        >
                          <span className="label-caps text-accent">{c.tag}</span>
                          <p className="mt-3 font-display text-2xl text-primary-fixed group-hover:text-accent">
                            {c.title}
                          </p>
                          <p className="mt-2 text-sm text-primary-fixed/70">{c.body}</p>
                          <span className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.14em] text-accent uppercase">
                            Explore <ArrowRight size={12} />
                          </span>
                        </Link>
                      ))}
                  </div>
                  {journeyCols
                    .filter((c) => c.featured)
                    .map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="group col-span-12 flex flex-col justify-between rounded-2xl border-2 border-accent bg-accent/15 p-8 transition hover:bg-accent/25 lg:col-span-5"
                      >
                        <div>
                          <span className="inline-flex rounded-full bg-accent px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-on-accent uppercase">
                            {c.tag} · recommended
                          </span>
                          <p className="mt-4 font-display text-3xl text-primary-fixed group-hover:text-accent">
                            {c.title}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-primary-fixed/80">{c.body}</p>
                        </div>
                        <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                          Start your brief <ArrowRight size={14} />
                        </span>
                      </Link>
                    ))}
                </div>
              )}

              {mega === "discover" && (
                <div className="grid grid-cols-12 gap-4">
                  {discoverLinks.map((c, i) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className={cn(
                        "group rounded-2xl border border-white/10 bg-[#323628] p-8 transition hover:border-accent/40 hover:bg-[#3a4030]",
                        i === 0 ? "col-span-7" : "col-span-5",
                      )}
                    >
                      <p className="font-display text-3xl text-primary-fixed group-hover:text-accent">
                        {c.title}
                      </p>
                      <p className="mt-3 max-w-sm text-sm text-primary-fixed/70">{c.body}</p>
                      <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-accent uppercase">
                        Open <ArrowRight size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {mega === "about" && (
                <div className="grid grid-cols-12 items-start gap-8">
                  <div className="col-span-5 space-y-1">
                    {aboutLinks.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="group flex items-baseline justify-between gap-4 border-b border-white/10 py-4 transition hover:border-accent/40"
                      >
                        <span className="font-display text-xl text-primary-fixed group-hover:text-accent">
                          {c.title}
                        </span>
                        <ArrowRight
                          size={16}
                          className="shrink-0 text-accent opacity-0 transition group-hover:opacity-100"
                        />
                      </Link>
                    ))}
                  </div>
                  <div className="col-span-7 rounded-2xl border border-white/10 bg-[#323628] p-8">
                    <p className="label-caps text-accent">The TRIS way</p>
                    <p className="mt-3 font-display text-2xl text-primary-fixed">
                      Community-rooted travel in Meghalaya
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-primary-fixed/70">
                      Slow days, local hosts, and journeys that leave communities stronger. Start
                      with our story or reach out directly.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/about"
                        className="inline-flex h-9 items-center rounded-full bg-accent px-5 text-xs font-bold tracking-[0.12em] text-on-accent uppercase"
                      >
                        Our story
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex h-9 items-center rounded-full border border-white/25 px-5 text-xs font-bold tracking-[0.12em] text-primary-fixed uppercase transition hover:border-accent/50 hover:text-accent"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {open && (
          <div
            className="fixed inset-x-0 bottom-0 top-14 z-[70] overflow-y-auto bg-[#f7f4ee] px-margin-mobile py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:top-16 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="mb-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <Button href="/account" size="sm" className="flex-1">
                    {profile?.name?.split(" ")[0] || "Account"}
                  </Button>
                  {isAdmin && (
                    <Button href="/admin" size="sm" variant="ghost">
                      Studio
                    </Button>
                  )}
                  <button
                    type="button"
                    className="px-2 text-sm text-on-surface-variant"
                    onClick={() => logout()}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button href="/login" size="sm" variant="ghost" className="flex-1">
                    Log in
                  </Button>
                  <Button href="/signup" size="sm" className="flex-1">
                    Sign up
                  </Button>
                </div>
              )}
            </div>

            <section className="rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-[0_8px_24px_rgba(42,46,31,0.04)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="label-caps text-accent">Experiences</p>
                  <Link
                    href="/experiences"
                    className="text-[11px] font-bold tracking-[0.12em] text-accent uppercase"
                  >
                    Browse all
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERIENCE_CATEGORIES.map((c) => (
                    <Link
                      key={c.id}
                      href={`/experiences?type=${c.slug}`}
                      className="rounded-xl bg-surface-container-low px-3 py-2.5 text-sm font-medium text-secondary transition active:bg-secondary-container"
                    >
                      {c.id}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-[0_8px_24px_rgba(42,46,31,0.04)]">
                <p className="label-caps text-accent">Journeys</p>
                <div className="mt-1 divide-y divide-outline-variant/20">
                  {journeyCols.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="flex items-center justify-between gap-3 py-3.5"
                    >
                      <span>
                        <span className="block font-medium text-primary">{c.title}</span>
                        <span className="mt-0.5 block text-xs text-on-surface-variant">{c.tag}</span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-accent" />
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-[0_8px_24px_rgba(42,46,31,0.04)]">
                {[...discoverLinks, ...aboutLinks].map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3.5 last:border-b-0"
                  >
                    <span className="font-display text-lg text-primary">{c.title}</span>
                    <ArrowRight size={16} className="shrink-0 text-accent" />
                  </Link>
                ))}
              </section>
          </div>
        )}
      </div>
    </header>
  );
}
