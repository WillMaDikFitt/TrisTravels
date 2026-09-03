import Link from "next/link";
import { BrandLogo, RecognitionLogos } from "@/components/brand/BrandLogo";

const columns = [
  {
    title: "Travel",
    links: [
      { href: "/experiences", label: "Experiences" },
      { href: "/journeys?type=curated", label: "Curated Journeys" },
      { href: "/journeys?type=small-group", label: "Fixed Journeys" },
      { href: "/craft-my-journey", label: "Craft My Journey" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/artisans", label: "Crafts" },
      { href: "/stories", label: "Stories" },
      { href: "/about", label: "Our Story" },
    ],
  },
  {
    title: "TRIS",
    links: [
      { href: "/partner", label: "Partner with Us" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/terms/fixed-departures", label: "Fixed Departure Terms" },
    ],
  },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Cancellation & Refunds" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/pricing", label: "Pricing" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/20 bg-surface pt-7 pb-9 md:pt-8 md:pb-11">
      <div className="relative z-10 mx-auto w-full max-w-[96rem] px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12 xl:gap-16">
          <div className="mx-auto flex max-w-md flex-col text-center md:mx-0 md:max-w-sm md:text-left lg:max-w-xs lg:shrink-0">
            <Link href="/" className="inline-block">
              <BrandLogo
                on="light"
                size="lg"
                className="mx-auto h-20 w-auto md:mx-0 md:h-20 lg:h-24"
              />
            </Link>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant md:text-sm">
              Community-rooted journeys across Meghalaya — authentic experiences that leave hosts
              stronger.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3 sm:gap-x-12 lg:justify-center lg:gap-x-14 xl:gap-x-20">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-2">
                <span className="label-caps text-primary">{col.title}</span>
                <div className="flex flex-col gap-2">
                  {col.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm text-on-surface-variant transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-3 text-center lg:min-w-[15rem] lg:self-stretch">
            <span className="label-caps text-primary">Proudly recognized by</span>
            <RecognitionLogos compact align="center" />
            <p className="mt-2 max-w-[14rem] text-xs leading-relaxed text-on-surface-variant/60">
              © {year} TRIS Meghalaya Travels.
              <br />
              All rights reserved.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-outline-variant/20 pt-5 text-[11px] text-on-surface-variant md:text-xs">
          <nav aria-label="Policies" className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
            {legalLinks.map((link, i) => (
              <span key={link.href} className="inline-flex items-center gap-x-1">
                {i > 0 ? <span className="text-outline-variant/80" aria-hidden>·</span> : null}
                <Link href={link.href} className="transition hover:text-primary">
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
