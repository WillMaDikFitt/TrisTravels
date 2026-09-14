import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/Button";
import { media } from "@/data/media";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

const serif = "font-[family-name:var(--font-playfair)]";

const WAYS = [
  {
    href: "/experiences",
    label: "Day experiences",
    body: "A few hours or a full day, hosted by people who live here.",
  },
  {
    href: "/journeys?type=curated",
    label: "Curated journeys",
    body: "Multi-day trips shaped around your dates and pace.",
  },
  {
    href: "/journeys?type=small-group",
    label: "Fixed departures",
    body: "Set dates and small groups — seats fill up early.",
  },
  {
    href: "/craft-my-journey",
    label: "Craft my journey",
    body: "Send a brief and we plan the week around you.",
  },
];

/** Closing screen on the homepage: the call to action, the four ways to travel, and contact. */
export function HomeClosing() {
  return (
    <section className="home-snap-section relative flex min-h-[100svh] flex-col justify-center overflow-hidden">
      <Image
        src={media.heroMist}
        alt=""
        fill
        sizes="100vw"
        quality={85}
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(40,48,41,0.90) 0%, rgba(40,48,41,0.94) 55%, rgba(40,48,41,0.98) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-container-max px-margin-mobile py-14 md:px-margin-desktop md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="label-caps text-highlight">Ready when you are</p>
          <h2
            className={cn(
              serif,
              "mt-3 text-[clamp(2rem,4vw,3.1rem)] leading-tight text-balance text-surface-container-lowest",
            )}
          >
            Start with a day, or a full journey
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-surface-container-lowest/80 md:text-base">
            Book an experience online, join a small-group date, or send a brief and we&apos;ll shape
            the week around you.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button href="/experiences" size="lg">
              Browse experiences
            </Button>
            <Button href="/craft-my-journey" variant="secondary" size="lg">
              Craft my journey
            </Button>
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {WAYS.map((way) => (
            <Link
              key={way.href}
              href={way.href}
              className="group rounded-2xl border border-white/70 bg-white/92 p-4 shadow-[0_12px_32px_rgba(54,64,55,0.18)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="flex items-center justify-between gap-2 text-sm font-semibold text-primary">
                {way.label}
                <ArrowRight
                  size={15}
                  className="shrink-0 text-highlight transition group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-1.5 block text-xs leading-relaxed text-on-surface-variant">
                {way.body}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-surface-container-lowest/15 pt-6 text-sm text-surface-container-lowest/80 md:mt-10">
          <a
            href={`tel:+${site.whatsappE164}`}
            className="inline-flex items-center gap-2 transition hover:text-surface-container-lowest"
          >
            <Phone size={15} className="text-highlight" />
            {site.phoneDisplay}
          </a>
          <a
            href={site.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition hover:text-surface-container-lowest"
          >
            <WhatsAppIcon size={15} className="text-highlight" />
            WhatsApp
          </a>
          <a
            href={`mailto:${site.email}`}
            className="inline-flex items-center gap-2 transition hover:text-surface-container-lowest"
          >
            <Mail size={15} className="text-highlight" />
            {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}
