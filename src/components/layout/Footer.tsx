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
    <footer className="relative overflow-hidden border-t border-outline-variant/20 bg-surface pt-12 pb-8 md:pt-16 md:pb-10 lg:pt-20">
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-10 lg:max-w-md lg:flex-col lg:gap-0">
            <div className="mx-auto max-w-sm text-center md:mx-0 md:text-left">
              <Link href="/" className="inline-block">
                <BrandLogo
                  on="light"
                  size="lg"
                  className="mx-auto h-28 w-auto sm:h-32 md:mx-0 md:h-28 lg:h-32"
                />
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:mt-5 md:text-base lg:text-lg">
                Community-rooted journeys across Meghalaya — authentic experiences that leave hosts
                stronger.
              </p>
            </div>

            <div className="text-center md:ml-auto md:shrink-0 md:text-right lg:ml-0 lg:mt-8 lg:text-left">
              <p className="label-caps text-accent">Proudly recognized by</p>
              <RecognitionLogos
                compact
                className="mt-3 justify-center md:mt-4 md:justify-end lg:justify-start"
              />
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:max-w-xl lg:justify-self-end">
            {columns.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <span className="label-caps mb-1 text-primary">{col.title}</span>
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
            ))}
          </div>
        </div>

        <div className="mt-10 border-t border-outline-variant/20 pt-5 text-right md:mt-12 md:pt-6">
          <p className="text-xs text-on-surface-variant/60 sm:text-sm">
            © {new Date().getFullYear()} TRIS Meghalaya Travels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
