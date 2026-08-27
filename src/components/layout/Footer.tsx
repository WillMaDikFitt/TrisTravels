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

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/20 bg-surface pt-10 pb-6 md:pt-12 md:pb-7">
      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="mx-auto max-w-sm text-center md:mx-0 md:text-left lg:max-w-md">
            <Link href="/" className="inline-block">
              <BrandLogo
                on="light"
                size="lg"
                className="mx-auto h-24 w-auto sm:h-28 md:mx-0 md:h-24 lg:h-28"
              />
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-on-surface-variant md:text-sm">
              Community-rooted journeys across Meghalaya — authentic experiences that leave hosts
              stronger.
            </p>
          </div>

          <div className="md:hidden">
            <p className="label-caps text-center text-highlight">Proudly recognized by</p>
            <RecognitionLogos compact className="mt-2 justify-center" />
          </div>

          <div className="grid grid-cols-2 items-stretch gap-x-8 gap-y-6 sm:grid-cols-3 sm:gap-x-10">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-2">
                <span className="label-caps text-primary">{col.title}</span>
                <div className="mt-auto flex flex-col gap-2">
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
        </div>

        <div className="mt-6 border-t border-outline-variant/20 pt-4 md:mt-7 md:pt-5">
          <p className="text-center text-xs text-on-surface-variant/60 sm:text-sm md:hidden">
            © {new Date().getFullYear()} TRIS Meghalaya Travels. All rights reserved.
          </p>
          <div className="hidden items-end justify-between gap-8 md:flex">
            <div>
              <p className="label-caps text-highlight">Proudly recognized by</p>
              <RecognitionLogos compact className="mt-2 justify-start" />
            </div>
            <p className="shrink-0 text-sm text-on-surface-variant/60">
              © {new Date().getFullYear()} TRIS Meghalaya Travels. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
