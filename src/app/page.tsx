import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Backpack, CalendarDays, Compass, HandHeart, Leaf, MapPinned, Users } from "lucide-react";
import { FadeIn, SlideIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeSnapRoot } from "@/components/home/HomeSnapRoot";
import { WhyTrisTestimonials } from "@/components/home/WhyTrisTestimonials";
import { CtaBand } from "@/components/ui/CtaBand";
import { stories } from "@/data/stories";
import { media } from "@/data/media";
import { StoryCard } from "@/components/listings/StoryCard";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { listStories } from "@/lib/data/repo";

const typeVisuals: Record<string, string> = {
  adventure: media.typeAdventure,
  "nature-wildlife": media.typeNatureWildlife,
  "culture-heritage": media.typeCultureHeritage,
  "food-local-life": media.typeFoodLocalLife,
  wellness: media.typeWellness,
  creative: media.typeCreative,
};

export default async function HomePage() {
  const allStories = await listStories().catch(() => stories);

  return (
    <HomeSnapRoot>
      <HomeHero />

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#e8ebdd]/55"
        />
        <div className="relative mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-highlight uppercase md:text-xs">
              Four ways to travel with TRIS
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.5rem,3.2vw,2.65rem)] leading-tight whitespace-nowrap text-primary max-[420px]:whitespace-normal">
              Choose the way that suits you best
            </h2>
          </FadeIn>

          <StaggerChildren className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {[
              {
                href: "/experiences",
                title: "Experiences",
                body: "Discover a few hours or a full day through something local and meaningful.",
                cta: "Explore experiences",
                Icon: Backpack,
                iconBg: "bg-secondary-container",
                iconColor: "text-primary",
                ctaColor: "text-primary",
              },
              {
                href: "/journeys?type=curated",
                title: "Curated Journeys",
                body: "Thoughtfully designed journeys with room to make them your own.",
                cta: "Explore journeys",
                Icon: MapPinned,
                iconBg: "bg-[#f0ddd0]",
                iconColor: "text-accent",
                ctaColor: "text-accent",
              },
              {
                href: "/journeys?type=small-group",
                title: "Fixed Journeys",
                body: "Ready-to-go journeys with set dates and itineraries.",
                cta: "View fixed departures",
                Icon: CalendarDays,
                iconBg: "bg-[#dde5d6]",
                iconColor: "text-primary",
                ctaColor: "text-primary",
              },
              {
                href: "/craft-my-journey",
                title: "Craft My Journey",
                body: "Tell us what you want, and we'll build the journey around you.",
                cta: "Start planning",
                Icon: Compass,
                iconBg: "bg-[#e4e8d8]",
                iconColor: "text-primary",
                ctaColor: "text-primary",
              },
            ].map((card) => (
              <StaggerItem key={card.href}>
                <Link
                  href={card.href}
                  className="group flex h-full flex-col items-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-5 py-7 text-center shadow-[0_10px_32px_rgba(54,64,55,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(54,64,55,0.14)]"
                >
                  <span
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${card.iconBg}`}
                  >
                    <card.Icon className={`h-6 w-6 ${card.iconColor}`} strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-6 font-display text-xl text-primary md:text-[1.35rem]">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-on-surface-variant">
                    {card.body}
                  </p>
                  <span
                    className={`mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.14em] uppercase ${card.ctaColor}`}
                  >
                    {card.cta}
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

      <section className="home-snap-section flex h-[100svh] max-h-[100svh] flex-col overflow-hidden bg-primary-container text-primary-fixed">
        <div className="mx-auto flex h-full w-full max-w-container-max flex-col px-margin-mobile py-5 md:px-margin-desktop md:py-6 lg:py-7">
          <div className="shrink-0">
            <div className="ink-rule" />
            <p className="label-caps mt-2 text-highlight">Experience types</p>
            <h2 className="mt-1.5 font-[family-name:var(--font-playfair)] text-[clamp(1.55rem,2.8vw,2.4rem)] leading-tight font-semibold tracking-[-0.02em]">
              Pick how a day should feel
            </h2>
            <p className="mt-1 max-w-xl font-[family-name:var(--font-manrope)] text-sm text-primary-fixed/75">
              From adventure to quiet moments, choose the kind of day that speaks to you.
            </p>
          </div>
          <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-2.5 sm:gap-3 lg:mt-5 lg:grid-cols-3 lg:gap-3.5">
            {EXPERIENCE_CATEGORIES.map((c, i) => (
              <Link
                key={c.id}
                href={`/experiences?type=${c.slug}`}
                className="group relative flex min-h-0 flex-col justify-between overflow-hidden rounded-xl p-3 sm:rounded-2xl sm:p-4"
              >
                <Image
                  src={typeVisuals[c.slug] ?? media.forest}
                  alt=""
                  fill
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  sizes="33vw"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition duration-500 group-hover:from-black/70 group-hover:via-black/25"
                />
                <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/35 font-[family-name:var(--font-playfair)] text-xs text-white/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10 mt-auto">
                  <h3 className="font-[family-name:var(--font-playfair)] text-[1.1rem] leading-tight text-white drop-shadow-sm sm:text-[1.25rem] lg:text-[1.4rem]">
                    {c.id}
                  </h3>
                  <p className="mt-1 line-clamp-2 font-[family-name:var(--font-manrope)] text-[0.7rem] leading-snug text-white/85 sm:text-[0.8rem] lg:text-[0.85rem]">
                    {c.blurb}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <WhyTrisTestimonials />

      <section className="home-snap-section relative flex min-h-[100svh] items-center overflow-hidden py-10 md:py-12">
        <Image
          src={media.aboutSectionBg}
          alt=""
          fill
          className="object-cover object-[center_bottom]"
          sizes="100vw"
          quality={90}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#f8f6f1]/78" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 80% at 78% 50%, rgba(248,246,241,0.92) 0%, transparent 70%), radial-gradient(ellipse 50% 70% at 20% 50%, rgba(248,246,241,0.35) 0%, transparent 65%)",
          }}
        />
        <div className="relative mx-auto grid w-full max-w-container-max md:grid-cols-12 md:items-stretch">
          <div className="relative z-10 hidden min-h-0 md:col-span-5 md:block">
            <Image
              src={media.aboutPortrait}
              alt="Mei-ieid — the heart behind TRIS"
              fill
              className="object-cover"
              sizes="42vw"
              priority={false}
            />
          </div>

          <div className="relative z-10 flex flex-col justify-center px-margin-mobile py-2 md:col-span-7 md:px-10 lg:px-14 xl:px-16">
            {/* Mobile image strip */}
            <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden md:hidden">
              <Image
                src={media.aboutPortrait}
                alt="Mei-ieid — the heart behind TRIS"
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>

            <SlideIn from="right">
              <div className="rounded-2xl bg-surface-container-lowest/92 px-5 py-6 shadow-[0_12px_36px_rgba(54,64,55,0.06)] backdrop-blur-[2px] md:bg-transparent md:px-0 md:py-0 md:shadow-none md:backdrop-blur-none">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-on-surface-variant uppercase">
                  Our story
                </p>
                <span className="mt-1.5 block h-px w-10 bg-on-surface-variant/50" />
              </div>

              <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[clamp(1.85rem,3.2vw,2.75rem)] leading-[1.08] text-primary">
                The heart behind TRIS{" "}
                <Leaf
                  aria-hidden
                  className="ml-1 inline-block h-5 w-5 -translate-y-0.5 text-highlight md:h-6 md:w-6"
                  strokeWidth={1.5}
                />
              </h2>

              <p className="mt-3 max-w-xl font-[family-name:var(--font-playfair)] text-base leading-snug text-highlight italic md:text-lg">
                Mei-ieid embodied true Khasi hospitality — generous, hard-working, and unconditionally
                caring.
              </p>

              <div className="mt-4 max-w-xl space-y-3 text-sm leading-relaxed text-on-surface md:text-[0.95rem] md:leading-[1.65]">
                <p>
                  Born in Mairang, she didn&apos;t speak the language of business.{" "}
                  <span className="font-semibold text-primary">
                    TRIS is our promise to carry her spirit forward
                  </span>{" "}
                  through every homestay, meal, guide and journey we craft.
                </p>
                <p>
                  We create journeys that go beyond sightseeing — connecting you more deeply with the
                  people, culture and landscapes of Meghalaya.
                </p>
              </div>

              <div className="mt-6 flex max-w-xl flex-col gap-3 sm:flex-row sm:items-stretch sm:divide-x sm:divide-outline-variant/40">
                {[
                  { label: "Community first", Icon: Users },
                  { label: "Slow travel", Icon: Leaf },
                  { label: "Gives back", Icon: HandHeart },
                ].map(({ label, Icon }) => (
                  <div
                    key={label}
                    className="flex flex-1 items-center gap-2.5 sm:flex-col sm:justify-center sm:gap-2 sm:px-3 sm:text-center"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-surface-container-lowest/80 text-primary">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span className="text-xs font-medium text-primary md:text-sm">{label}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/about"
                className="group mt-6 inline-flex w-fit items-center gap-2.5 rounded-lg bg-cta px-6 py-3 text-xs font-bold tracking-[0.14em] text-on-cta uppercase transition hover:brightness-110"
              >
                Read our story
                <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
              </Link>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      <section className="home-snap-section relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-surface py-10 md:h-[100svh] md:max-h-[100svh] md:py-8">
        {/* Soft pinboard wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 30%, rgba(122,163,90,0.12), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(54,64,55,0.06), transparent 40%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(54,64,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(54,64,55,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-container-max flex-col justify-center px-margin-mobile md:px-margin-desktop">
          <FadeIn>
            <div className="ink-rule" />
            <p className="label-caps mt-3 text-highlight">Journal</p>
            <div className="mt-1.5 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.85rem,3.2vw,2.75rem)] text-primary">
                Stories from the hills
              </h2>
              <Link
                href="/stories"
                className="label-caps mb-1 hidden items-center gap-2 text-primary md:inline-flex"
              >
                Read all <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Notes pinned from travellers, guides and friends — pick one up and read.
            </p>
          </FadeIn>
          <StaggerChildren className="mt-8 grid items-stretch gap-6 pt-1 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-8">
            {allStories.slice(0, 3).map((s, i) => (
              <StaggerItem key={s.slug} className="h-full px-0.5 pt-1">
                <StoryCard story={s} variant="tile" tiltIndex={i} compact />
              </StaggerItem>
            ))}
          </StaggerChildren>
          <div className="mt-6 text-center md:hidden">
            <Link
              href="/stories"
              className="label-caps inline-flex items-center gap-2 text-primary"
            >
              Read all <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="home-snap-section flex h-[100svh] max-h-[100svh] flex-col overflow-hidden">
        <HomeFaq />
      </div>

      <div className="home-snap-section flex min-h-[100svh] flex-col justify-center">
        <CtaBand
          className="border-t border-outline-variant/20 py-8 md:py-10"
          eyebrow="Ready when you are"
          title="Start with a day, or a full journey"
          body="Book an experience online, join a small-group date, or send a brief and we’ll shape the week."
          primary={{ href: "/experiences", label: "Browse experiences" }}
          secondary={{ href: "/craft-my-journey", label: "Craft my journey" }}
        />
      </div>
    </HomeSnapRoot>
  );
}
