"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Marquee } from "@/components/motion/Motion";

const nav = [
  { href: "/experiences", label: "Experiences" },
  { href: "/journeys", label: "Journeys" },
  { href: "/destinations", label: "Destinations" },
  { href: "/craft-my-journey", label: "Craft My Journey" },
  { href: "/artisans", label: "Crafts" },
  { href: "/stories", label: "Stories" },
  { href: "/about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
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

  const solid = scrolled || !isHome || open;

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="bg-primary-container text-primary-fixed">
        <Marquee duration={36} className="py-2 text-[11px] tracking-wide md:text-xs">
          <span>Meaningful journeys, crafted with care — your travel supports local communities</span>
          <span aria-hidden>·</span>
          <span>Community-rooted · Authentic · Deeply personal</span>
          <span aria-hidden>·</span>
          <span>Recognized by Meghalaya Tourism & NIDHI</span>
          <span aria-hidden>·</span>
        </Marquee>
      </div>
      <div
        className={cn(
          "transition-[background-color,border-color,box-shadow] duration-300",
          solid
            ? "bg-surface-container-lowest border-b border-outline-variant/25 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-container-max items-center justify-between px-margin-mobile md:h-20 md:px-margin-desktop">
          <Link href="/" className="relative z-10 flex shrink-0 items-center" aria-label="TRIS Travels home">
            <Image
              src="/brand/tris-logo.png?v=2"
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

          <nav className="hidden items-center gap-5 xl:gap-6 lg:flex">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "label-caps border-b-2 pb-1 transition-colors duration-300",
                    active
                      ? solid
                        ? "border-accent text-accent"
                        : "border-white text-white"
                      : solid
                        ? "border-transparent text-on-surface-variant hover:text-primary"
                        : "border-transparent text-white/75 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5 md:gap-2">
            <Button
              href="/experiences"
              size="sm"
              variant={solid ? "primary" : "light"}
              className="hidden md:inline-flex"
            >
              Explore
            </Button>
            <button
              type="button"
              className={cn(
                "rounded-full p-2 transition-colors lg:hidden",
                solid ? "text-primary" : "text-white",
              )}
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-outline-variant/20 bg-surface px-margin-mobile py-6 lg:hidden">
            <div className="flex flex-col gap-4">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display text-xl text-primary"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/partner" className="text-on-surface-variant">
                Partner with Us
              </Link>
              <Link href="/contact" className="text-on-surface-variant">
                Contact
              </Link>
              <Button href="/experiences" className="mt-2 w-full">
                Explore Experiences
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
