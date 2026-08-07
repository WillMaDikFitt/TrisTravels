import Link from "next/link";
import { BrandLogo, RecognitionLogos } from "@/components/brand/BrandLogo";

const columns = [
  {
    title: "Travel",
    links: [
      { href: "/experiences", label: "Experiences" },
      { href: "/journeys", label: "Curated Journeys" },
      { href: "/journeys", label: "Small Group Journeys" },
      { href: "/craft-my-journey", label: "Craft My Journey" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/destinations", label: "Destinations" },
      { href: "/artisans", label: "Local Crafts" },
      { href: "/stories", label: "Stories" },
      { href: "/about", label: "About TRIS" },
      { href: "/partner", label: "Partner with Us" },
    ],
  },
  {
    title: "Connect",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/craft-my-journey", label: "Plan a trip" },
      { href: "/experiences", label: "Book an experience" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-outline-variant/20 bg-surface pt-16 pb-10 md:pt-20">
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative z-10 mx-auto grid max-w-container-max grid-cols-1 gap-12 px-margin-mobile md:grid-cols-12 md:gap-10 md:px-margin-desktop">
        <div className="md:col-span-5">
          <Link href="/" className="inline-block">
            <BrandLogo size="md" className="h-20 w-20 md:h-24 md:w-24" />
          </Link>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-on-surface-variant md:text-lg">
            Community-rooted journeys across Meghalaya — authentic experiences that leave hosts
            stronger.
          </p>
          <div className="mt-8">
            <p className="label-caps text-accent">Proudly recognized by</p>
            <RecognitionLogos compact className="mt-4 justify-start" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 md:col-span-7 md:grid-cols-3">
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
      <div className="relative z-10 mx-auto mt-14 max-w-container-max border-t border-outline-variant/20 px-margin-mobile pt-6 md:px-margin-desktop">
        <p className="text-sm text-on-surface-variant/60">
          © {new Date().getFullYear()} TRIS Meghalaya Travels. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
