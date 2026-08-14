"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { TRIS_LOGO_ON_DARK, TRIS_LOGO_ON_LIGHT } from "@/components/brand/BrandLogo";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { useAuth } from "@/components/auth/AuthProvider";

const offeringLinks = [
  { href: "/experiences", label: "Experiences", match: "experiences" },
  { href: "/journeys?type=curated", label: "Curated Journeys", match: "curated" },
  { href: "/journeys?type=small-group", label: "Fixed Journeys", match: "fixed" },
  { href: "/craft-my-journey", label: "Craft My Journey", match: "craft" },
  { href: "/about", label: "About", match: "about" },
  { href: "/contact", label: "Contact", match: "contact" },
] as const;

const journeyLinks = [
  {
    href: "/journeys?type=curated",
    title: "Curated Journeys",
    tag: "Shape dates and stays",
  },
  {
    href: "/journeys?type=small-group",
    title: "Fixed Journeys",
    tag: "Join a fixed departure",
  },
  {
    href: "/craft-my-journey",
    title: "Craft My Journey",
    tag: "Designed entirely around you",
  },
];

const secondaryLinks = [
  { href: "/about", title: "About" },
  { href: "/contact", title: "Contact" },
  { href: "/destinations", title: "Destinations" },
  { href: "/stories", title: "Stories" },
  { href: "/partner", title: "Partner with us" },
];

function isOfferingActive(match: string, pathname: string, journeyType: string | null) {
  if (match === "experiences") return pathname.startsWith("/experiences");
  if (match === "curated") return pathname.startsWith("/journeys") && journeyType === "curated";
  if (match === "fixed") return pathname.startsWith("/journeys") && journeyType === "small-group";
  if (match === "craft") return pathname.startsWith("/craft-my-journey");
  if (match === "about") return pathname.startsWith("/about");
  if (match === "contact") return pathname.startsWith("/contact");
  return false;
}

function DesktopNav({ solid }: { solid: boolean }) {
  const pathname = usePathname();
  const journeyType = useSearchParams().get("type");

  return (
    <nav className="hidden items-center justify-self-center gap-0.5 lg:flex">
      {offeringLinks.map((item) => {
        const active = isOfferingActive(item.match, pathname, journeyType);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "inline-flex items-center whitespace-nowrap border-b-2 px-2 pb-1 text-[10px] font-bold tracking-[0.08em] uppercase transition-colors xl:px-2.5 xl:text-[11px]",
              active
                ? "border-accent text-accent"
                : !solid
                  ? "border-transparent text-white/80 hover:text-white"
                  : "border-transparent text-on-surface-variant hover:text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, profile, logout, isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const solid = scrolled || !isHome || open;

  return (
    <header className="fixed top-0 z-[70] w-full">
      <div
        className={cn(
          "transition-[background-color,border-color,box-shadow] duration-300",
          solid
            ? "border-b border-outline-variant/25 bg-surface-container-lowest shadow-sm"
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
              src={!solid ? TRIS_LOGO_ON_DARK : TRIS_LOGO_ON_LIGHT}
              alt="TRIS Travels"
              width={72}
              height={72}
              priority
              unoptimized
              className={cn(
                "h-9 w-9 object-contain transition sm:h-10 sm:w-10 md:h-11 md:w-11 lg:h-14 lg:w-14",
                !solid && "drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]",
              )}
            />
          </Link>

          <Suspense fallback={<nav className="hidden lg:flex" aria-hidden />}>
            <DesktopNav solid={solid} />
          </Suspense>

          <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
            {user ? (
              <div className="hidden items-center gap-2 lg:flex">
                {isAdmin && (
                  <Button href="/admin" size="sm" variant={!solid ? "light" : "ghost"}>
                    Studio
                  </Button>
                )}
                <Button href="/account" size="sm" variant={!solid ? "light" : "primary"}>
                  {profile?.name?.split(" ")[0] || "Account"}
                </Button>
              </div>
            ) : (
              <div className="max-lg:hidden">
                <Button href="/login" size="sm" variant={!solid ? "light" : "primary"}>
                  Log in / Sign up
                </Button>
              </div>
            )}
            <button
              type="button"
              className={cn(
                "rounded-full p-2 transition-colors focus-visible:ring-2 focus-visible:ring-primary lg:hidden",
                !solid ? "text-white" : "text-primary",
              )}
              aria-label={open ? "Close menu" : "Menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

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
                {EXPERIENCE_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/experiences?type=${category.slug}`}
                    className="rounded-xl bg-surface-container-low px-3 py-2.5 text-sm font-medium text-secondary transition active:bg-secondary-container"
                  >
                    {category.id}
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-outline-variant/25 bg-white p-4 shadow-[0_8px_24px_rgba(42,46,31,0.04)]">
              <p className="label-caps text-accent">Journeys</p>
              <div className="mt-1 divide-y divide-outline-variant/20">
                {journeyLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between gap-3 py-3.5"
                  >
                    <span>
                      <span className="block font-medium text-primary">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-on-surface-variant">{item.tag}</span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-accent" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/25 bg-white shadow-[0_8px_24px_rgba(42,46,31,0.04)]">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3.5 last:border-b-0"
                >
                  <span className="font-display text-lg text-primary">{item.title}</span>
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
