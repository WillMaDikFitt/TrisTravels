import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn, SlideIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { CtaBand } from "@/components/ui/CtaBand";
import { experiences } from "@/data/experiences";
import { stories } from "@/data/stories";
import { media } from "@/data/media";
import { RecognitionLogos } from "@/components/brand/BrandLogo";
import { ExperienceCard } from "@/components/listings/ExperienceCard";
import { StoryCard } from "@/components/listings/StoryCard";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { listExperiences, listStories } from "@/lib/data/repo";

const typeVisuals: Record<string, string> = {
  adventure: media.heroRoots,
  "nature-wildlife": media.familyWaterfall,
  "culture-heritage": media.valueCommunity,
  "food-local-life": media.kitchen,
  wellness: media.heroMist,
  creative: media.craft,
};

export default async function HomePage() {
  const allExperiences = await listExperiences().catch(() => experiences);
  const allStories = await listStories().catch(() => stories);
  const [lead, ...rest] = allExperiences;
  const featuredRest = rest.slice(0, 2);

  return (
    <>
      <HomeHero />

      <section className="relative overflow-hidden bg-surface pt-12 pb-16 md:pt-16 md:pb-24">
        <div className="relative mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <p className="watermark pointer-events-none absolute top-0 left-0 text-[18vw] leading-none md:text-[8.5rem]">
            MEGHALAYA
          </p>
          <FadeIn className="relative">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">How you travel</p>
            <h2 className="mt-3 font-display text-3xl text-secondary md:text-5xl">
              Three ways to travel with us
            </h2>
          </FadeIn>

          <div className="relative mt-12 grid items-stretch gap-5 lg:grid-cols-12">
            <Link
              href="/experiences"
              className="group relative min-h-[380px] overflow-hidden rounded-[2rem] lg:col-span-7 lg:min-h-[520px]"
            >
              <Image
                src={media.heroRoots}
                alt="Living root bridge experience in Meghalaya"
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width:1024px) 100vw, 58vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute top-6 left-6 rounded-full bg-accent px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase">
                01 · Book online
              </div>
              <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-10">
                <h3 className="font-display text-4xl md:text-5xl">Experiences</h3>
                <p className="mt-3 max-w-md text-white/80">
                  A few hours to a full day — six types, a clear price, a real date.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold tracking-[0.16em] uppercase">
                  Browse types <ArrowRight size={14} />
                </span>
              </div>
            </Link>
            <div className="flex min-h-0 flex-col gap-5 lg:col-span-5">
              <Link
                href="/journeys?type=curated"
                className="group relative min-h-[200px] flex-1 overflow-hidden rounded-[2rem]"
              >
                <Image
                  src={media.packages}
                  alt="Curated journeys through Meghalaya"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="40vw"
                />
                <div className="absolute inset-0 bg-black/50 transition group-hover:bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-8">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-accent uppercase">02 · Enquire</p>
                  <h3 className="mt-2 font-display text-3xl">Curated journeys</h3>
                  <p className="mt-2 text-sm text-white/80">Shape dates, stays, and pace with a planner.</p>
                </div>
              </Link>
              <Link
                href="/journeys?type=small-group"
                className="group relative min-h-[200px] flex-1 overflow-hidden rounded-[2rem]"
              >
                <Image
                  src={media.departures}
                  alt="Small group departure in Meghalaya"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="40vw"
                />
                <div className="absolute inset-0 bg-black/50 transition group-hover:bg-black/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-8">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-accent uppercase">03 · Join a date</p>
                  <h3 className="mt-2 font-display text-3xl">Small group</h3>
                  <p className="mt-2 text-sm text-white/80">Fixed departures. Show up with curiosity.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#2a2e1f] py-16 text-primary-fixed md:py-24">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="ink-rule" />
          <p className="label-caps mt-4 text-accent">Experience types</p>
          <h2 className="mt-3 font-display text-3xl md:text-5xl">Pick how a day should feel</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCE_CATEGORIES.map((c, i) => (
              <Link
                key={c.id}
                href={`/experiences?type=${c.slug}`}
                className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-[#323628] p-6 transition hover:bg-[#3a4030]"
              >
                <Image
                  src={typeVisuals[c.slug] ?? media.forest}
                  alt=""
                  fill
                  className="object-cover opacity-0 transition duration-500 group-hover:opacity-35"
                  sizes="33vw"
                />
                <span className="relative z-10 font-serif text-3xl text-accent/90">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10 mt-8">
                  <h3 className="font-display text-2xl">{c.id}</h3>
                  <p className="mt-2 text-sm text-primary-fixed/70">{c.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {lead && (
        <section className="bg-surface py-16 md:py-24">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <FadeIn>
              <div className="ink-rule" />
              <p className="label-caps mt-4 text-accent">Bookable now</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-3xl text-primary md:text-5xl">Featured days</h2>
                <Link href="/experiences" className="label-caps mb-1 inline-flex items-center gap-2 text-primary">
                  All experiences <ArrowRight size={16} />
                </Link>
              </div>
            </FadeIn>
            <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-2">
              <ExperienceCard experience={lead} variant="feature" className="h-full" />
              <div className="flex min-h-0 flex-col gap-5">
                {featuredRest.map((exp) => (
                  <ExperienceCard key={exp.slug} experience={exp} variant="row" className="min-h-[14rem] flex-1" />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden bg-primary-container py-24 text-center text-primary-fixed md:py-32">
        <div className="relative mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 font-serif text-[7rem] leading-none text-accent/35 md:-top-10 md:text-[10rem]">
            “
          </span>
          <FadeIn className="relative mx-auto max-w-3xl pt-10 md:pt-14">
            <p className="label-caps text-accent">Guest highlight</p>
            <blockquote className="mt-6 font-serif text-3xl leading-snug italic md:text-4xl">
              Wholesome service from planning to the end of the trip. Recommend TRIS to anyone new to
              the North East.
            </blockquote>
            <p className="mt-8 text-sm tracking-wide text-primary-fixed/70">Dr. Suresh Kumar · Chennai</p>
          </FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#2a2e1f] py-16 text-primary-fixed md:py-24">
        <div className="mx-auto grid max-w-container-max items-center gap-10 px-margin-mobile md:grid-cols-12 md:gap-12 md:px-margin-desktop">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
              <Image src={media.aboutPortrait} alt="The heart behind TRIS" fill className="object-cover" sizes="40vw" />
            </div>
          </div>
          <SlideIn from="right" className="md:col-span-7">
            <p className="label-caps text-accent">Our story</p>
            <h2 className="mt-3 font-display text-3xl md:text-5xl">The heart behind TRIS</h2>
            <blockquote className="mt-6 border-l-2 border-accent pl-5 font-serif text-xl leading-relaxed italic text-primary-fixed/90 md:text-2xl">
              Mei-ieid embodied true Khasi hospitality — generous, hard-working, and unconditionally caring.
            </blockquote>
            <p className="mt-6 text-base leading-relaxed text-primary-fixed/75 md:text-lg">
              Born in Mairang, she didn’t speak the language of business. TRIS is a promise to carry her spirit
              through every homestay, meal, guide, and journey we craft for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Community-first", "Slow travel", "Gives back"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold tracking-wide text-primary-fixed/80"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href="/about"
              className="group mt-10 inline-flex items-center gap-3 rounded-full border border-accent bg-accent px-7 py-3.5 text-xs font-bold tracking-[0.14em] text-on-accent uppercase shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition hover:brightness-110"
            >
              Read our story
              <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
            </Link>
          </SlideIn>
        </div>
      </section>

      <section className="bg-surface-container-low py-16 md:py-24">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn>
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">Journal</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-3xl text-primary md:text-5xl">Stories from the hills</h2>
              <Link href="/stories" className="label-caps mb-1 hidden items-center gap-2 text-primary md:inline-flex">
                Read all <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
          <StaggerChildren className="mt-12 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allStories.slice(0, 3).map((s) => (
              <StaggerItem key={s.slug} className="h-full">
                <StoryCard story={s} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <HomeFaq />

      <CtaBand
        eyebrow="Ready when you are"
        title="Start with a day, or a full journey"
        body="Book an experience online, join a small-group date, or send a brief and we’ll shape the week."
        primary={{ href: "/experiences", label: "Browse experiences" }}
        secondary={{ href: "/craft-my-journey", label: "Craft my journey" }}
      />

      <section className="bg-surface px-margin-mobile py-14 text-center md:px-margin-desktop md:py-16">
        <p className="label-caps text-accent">Recognitions</p>
        <p className="mt-3 font-display text-2xl text-primary md:text-3xl">Meghalaya Tourism & NIDHI</p>
        <RecognitionLogos className="mt-10" />
      </section>
    </>
  );
}
