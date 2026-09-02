"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
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
  { href: "/partner", label: "Partner with us", match: "partner" },
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

const moreGroups = [
  {
    label: "Discover",
    links: [
      { href: "/destinations", title: "Destinations", tag: "Places beyond the guidebook" },
      { href: "/artisans", title: "Crafts", tag: "Hard-to-find work from local makers" },
      { href: "/stories", title: "Stories", tag: "Notes from the hills" },
    ],
  },
  {
    label: "TRIS",
    links: [
      { href: "/about", title: "About", tag: "The heart behind the journeys" },
      { href: "/partner", title: "Partner with us", tag: "Hosts, makers, and drivers" },
      { href: "/contact", title: "Contact", tag: "Write to the team" },
    ],
  },
] as const;

const offeringPaths = new Set(offeringLinks.map((item) => item.href.split("?")[0]));
const moreHrefs = moreGroups
  .flatMap((group) => group.links.map((link) => link.href))
  .filter((href) => !offeringPaths.has(href));

function pathMatches(pathname: string, href: string) {
  const path = pathname.replace(/\/$/, "") || "/";
  const base = href.split("?")[0].replace(/\/$/, "") || "/";
  return path === base || (base !== "/" && path.startsWith(`${base}/`));
}

function isOfferingActive(match: string, pathname: string, journeyType: string | null) {
  if (match === "experiences") return pathMatches(pathname, "/experiences");
  if (match === "curated") return pathMatches(pathname, "/journeys") && journeyType === "curated";
  if (match === "fixed") return pathMatches(pathname, "/journeys") && journeyType === "small-group";
  if (match === "craft") return pathMatches(pathname, "/craft-my-journey");
  if (match === "partner") return pathMatches(pathname, "/partner");
  return false;
}

function isMoreActive(pathname: string) {
  return moreHrefs.some((href) => pathMatches(pathname, href));
}

function navLinkClass(active: boolean, onLight = false) {
  return cn(
    "inline-flex h-11 items-center whitespace-nowrap px-2.5 text-[13px] font-bold tracking-[0.1em] uppercase transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] xl:px-3 xl:text-[14px]",
    onLight
      ? active
        ? "text-primary"
        : "text-primary/85 hover:text-primary"
      : active
        ? "text-white"
        : "text-white/65 hover:text-white",
  );
}

function MoreMenu({ onLight = false }: { onLight?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = isMoreActive(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={navLinkClass(active, onLight)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-current={active ? "true" : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        More
        <ChevronDown
          size={12}
          className={cn("ml-1 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full left-1/2 z-[80] mt-4 w-max min-w-[20rem] -translate-x-1/2 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(54,64,55,0.18)]"
          >
            <div className="flex gap-10">
              {moreGroups.map((group) => (
                <div key={group.label}>
                  <p className="label-caps text-highlight">{group.label}</p>
                  <div className="mt-3 space-y-1">
                    {group.links
                      .filter((link) => link.href !== "/partner")
                      .map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block rounded-xl px-3 py-2.5 transition hover:bg-surface"
                      >
                        <span className="block text-sm font-semibold text-primary">{link.title}</span>
                        <span className="mt-0.5 block text-xs text-on-surface-variant">{link.tag}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DesktopNav({ onLight = false }: { onLight?: boolean }) {
  const pathname = usePathname();
  const journeyType = useSearchParams().get("type");

  return (
    <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:gap-2 lg:flex">
      {offeringLinks.map((item) => {
        const active = isOfferingActive(item.match, pathname, journeyType);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={navLinkClass(active, onLight)}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
      <MoreMenu onLight={onLight} />
    </nav>
  );
}

export function Header() {
  const pathname = usePathname();
  const { user, profile, logout, isAdmin } = useAuth();
  const reduceMotion = useReducedMotion();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(!isHome);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;

      if (!isHome) {
        setScrolled(true);
      } else {
        setScrolled((current) => (current ? y > 24 : y > 48));
      }

      if (open || y < 48) {
        setHidden(false);
      } else if (delta > 6 && y > 80) {
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }

      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome, open]);

  useEffect(() => {
    setOpen(false);
    setHidden(false);
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
    setHidden(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const solid = !isHome || scrolled || open;
  const logoSrc = solid ? TRIS_LOGO_ON_DARK : TRIS_LOGO_ON_LIGHT;
  const onLight = !solid;

  return (
    <header
      className={cn(
        "fixed top-0 z-[70] w-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden && !open ? "-translate-y-full" : "translate-y-0",
        reduceMotion && "transition-none",
      )}
    >
      <div
        className={cn(
          "transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          solid
            ? "border-b border-white/10 bg-primary-container shadow-[0_8px_28px_rgba(38,53,43,0.18)]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="flex h-[5.75rem] w-full items-center justify-between gap-4 px-5 md:h-[6.5rem] md:px-8 lg:h-[6.75rem] lg:gap-8 lg:px-10 xl:px-12">
          <Link
            href="/"
            className="relative z-10 flex shrink-0 items-center pt-1 md:pt-1.5 md:pl-1"
            aria-label="TRIS Travels home"
          >
            <span className="relative block h-[4.75rem] w-[4.75rem] overflow-hidden md:h-[5.35rem] md:w-[5.35rem] lg:h-[6.15rem] lg:w-[6.15rem]">
              <Image
                src={logoSrc}
                alt="TRIS Travels"
                fill
                priority
                unoptimized
                className={cn(
                  "object-contain",
                  /* Light (black) asset has more transparent padding — scale to match cream mark */
                  onLight ? "scale-[1.22]" : "drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]",
                )}
              />
            </span>
          </Link>

          <Suspense fallback={<nav className="hidden lg:flex" aria-hidden />}>
            <DesktopNav onLight={onLight} />
          </Suspense>

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <div className="hidden items-center gap-2 lg:flex">
                {isAdmin && (
                  <Button
                    href="/admin"
                    size="sm"
                    variant="secondary"
                    className={
                      onLight
                        ? "border-primary/35 bg-transparent text-primary hover:bg-primary/5"
                        : "border-white/35 bg-transparent text-white hover:bg-white/10"
                    }
                  >
                    Studio
                  </Button>
                )}
                <Button
                  href="/account"
                  size="sm"
                  variant="secondary"
                  className={
                    onLight
                      ? "border-primary/35 bg-transparent text-primary hover:bg-primary/5"
                      : "border-white/35 bg-transparent text-white hover:bg-white/10"
                  }
                >
                  {profile?.name?.split(" ")[0] || "Account"}
                </Button>
              </div>
            ) : (
              <div className="max-lg:hidden">
                <Button
                  href="/login"
                  size="sm"
                  variant="secondary"
                  className={
                    onLight
                      ? "border-primary/40 bg-transparent text-primary hover:border-primary hover:bg-primary/5"
                      : "border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10"
                  }
                >
                  Log in / Sign up
                </Button>
              </div>
            )}
            <button
              type="button"
              className={cn(
                "rounded-full p-2 transition-colors focus-visible:ring-2 lg:hidden",
                onLight
                  ? "text-primary focus-visible:ring-primary/40"
                  : "text-white focus-visible:ring-white/60",
              )}
              aria-label={open ? "Close menu" : "Menu"}
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "menu"}
                  initial={reduceMotion ? false : { opacity: 0, rotate: -20, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, rotate: 20, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {open ? <X size={24} /> : <Menu size={24} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
          <motion.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0.01 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 top-[5.75rem] z-[70] overflow-y-auto bg-surface px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:top-[6.5rem] lg:hidden"
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

            <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-[0_8px_24px_rgba(54,64,55,0.06)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="label-caps text-highlight">Experiences</p>
                <Link
                  href="/experiences"
                  className="text-[11px] font-bold tracking-[0.12em] text-highlight uppercase"
                >
                  Browse all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    href={`/experiences?type=${category.slug}`}
                    className="rounded-xl bg-surface px-3 py-2.5 text-sm font-medium text-secondary transition active:bg-secondary-container"
                  >
                    {category.id}
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-4 shadow-[0_8px_24px_rgba(54,64,55,0.06)]">
              <p className="label-caps text-highlight">Journeys</p>
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
                    <ArrowRight size={16} className="shrink-0 text-highlight" />
                  </Link>
                ))}
              </div>
            </section>

            {moreGroups.map((group) => (
              <section
                key={group.label}
                className="mt-4 overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_8px_24px_rgba(54,64,55,0.06)]"
              >
                <p className="label-caps px-4 pt-4 text-highlight">{group.label}</p>
                {group.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between gap-3 border-b border-outline-variant/20 px-4 py-3.5 last:border-b-0"
                  >
                    <span>
                      <span className="block font-display text-lg text-primary">{item.title}</span>
                      <span className="mt-0.5 block text-xs text-on-surface-variant">{item.tag}</span>
                    </span>
                    <ArrowRight size={16} className="shrink-0 text-highlight" />
                  </Link>
                ))}
              </section>
            ))}
          </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
