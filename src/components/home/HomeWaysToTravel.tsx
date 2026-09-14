import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Backpack, CalendarDays, Compass, MapPinned } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";

const WAYS = [
  {
    href: "/experiences",
    title: "Experiences",
    body: "Discover a few hours or a full day through something local and meaningful.",
    cta: "Explore experiences",
    Icon: Backpack,
  },
  {
    href: "/journeys?type=curated",
    title: "Curated Journeys",
    body: "Thoughtfully designed journeys with room to make them your own.",
    cta: "Explore journeys",
    Icon: MapPinned,
  },
  {
    href: "/journeys?type=small-group",
    title: "Fixed Journeys",
    body: "Ready-to-go journeys with set dates and itineraries.",
    cta: "View fixed departures",
    Icon: CalendarDays,
  },
  {
    href: "/craft-my-journey",
    title: "Craft My Journey",
    body: "Tell us what you want, and we'll build the journey around you.",
    cta: "Start planning",
    Icon: Compass,
  },
];

/** "Four ways to travel with TRIS" — dark green cards on the illustrated cream band. */
export function HomeWaysToTravel() {
  return (
    <section className="home-snap-section relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-10 md:py-12">
      <Image
        src="/images/choose-section-bg.jpg"
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        quality={90}
        priority
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-surface/55" />

      <div className="relative mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
        <FadeIn className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-highlight uppercase md:text-xs">
            Four ways to travel with TRIS
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.65rem)] leading-tight whitespace-nowrap text-primary max-[420px]:whitespace-normal">
            Choose the way that suits you best
          </h2>
        </FadeIn>

        <StaggerChildren className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {WAYS.map((way, index) => (
            <StaggerItem key={way.href}>
              <Link
                href={way.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-primary p-5 text-on-primary shadow-[0_14px_38px_rgba(54,64,55,0.22)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(54,64,55,0.3)] md:p-6"
              >
                {/* Warm light in the corner keeps the green from reading flat */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-70 transition duration-500 group-hover:opacity-100"
                  style={{
                    backgroundImage:
                      "radial-gradient(ellipse 70% 60% at 85% 0%, rgba(200,220,180,0.18) 0%, transparent 70%)",
                  }}
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -bottom-8 h-28 w-28 rounded-full bg-highlight/10 blur-2xl"
                />

                <div className="relative flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-highlight ring-1 ring-white/15 transition duration-300 group-hover:bg-white/15">
                    <way.Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-display text-lg leading-tight text-on-primary sm:hidden md:text-[1.3rem]">
                    {way.title}
                  </h3>
                  <span className="ml-auto font-display text-sm text-on-primary/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="relative mt-4 hidden font-display text-xl leading-tight text-on-primary sm:block md:text-[1.35rem]">
                  {way.title}
                </h3>

                <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-on-primary/75">
                  {way.body}
                </p>

                <span className="relative mt-5 inline-flex items-center gap-1.5 border-t border-white/12 pt-4 text-[11px] font-bold tracking-[0.14em] text-highlight uppercase">
                  {way.cta}
                  <ArrowRight
                    size={14}
                    className="transition duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
