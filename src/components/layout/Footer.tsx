import Link from "next/link";
import { BrandLogo, RecognitionLogos } from "@/components/brand/BrandLogo";

const columns = [
  {
    title: "Travel",
    links: [
      { href: "/experiences", label: "Experiences" },
      { href: "/journeys?type=curated", label: "Curated Journeys" },
      { href: "/journeys?type=small-group", label: "Small Group Journeys" },
      { href: "/craft-my-journey", label: "Craft My Journey" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/stories", label: "Stories" },
      { href: "/about", label: "About TRIS" },
      { href: "/partner", label: "Partner with Us" },
    ],
  },
  {
    title: "Connect",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Log in / Sign up" },
      { href: "/stories#share", label: "Share a story" },
      { href: "/experiences", label: "Book an experience" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/20 bg-surface pt-16 pb-10 md:pt-20">
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="max-w-sm shrink-0">
            <Link href="/" className="inline-block">
              <BrandLogo on="light" size="md" className="h-20 w-20 md:h-24 md:w-24" />
            </Link>
            <p className="mt-5 text-base leading-relaxed text-on-surface-variant md:text-lg">
              Community-rooted journeys across Meghalaya — authentic experiences that leave hosts
              stronger.
            </p>
            <div className="mt-8">
              <p className="label-caps text-accent">Proudly recognized by</p>
              <RecognitionLogos compact className="mt-4 justify-start" />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:max-w-xl lg:justify-self-end">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <span className="label-caps mb-1 text-primary">{col.title}</span>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-on-surface-variant transition hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-outline-variant/20 pt-6 text-right">
          <p className="text-sm text-on-surface-variant/60">
            © {new Date().getFullYear()} TRIS Meghalaya Travels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
