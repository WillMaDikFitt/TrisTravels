"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BreathSection } from "@/components/ui/BreathSection";
import {
  FadeIn,
  SlideIn,
  StaggerChildren,
  StaggerItem,
  Marquee,
} from "@/components/motion/Motion";
import { FullBleedParallax, PageHero } from "@/components/motion/FullBleedParallax";
import { experiences } from "@/data/experiences";
import { stories } from "@/data/stories";
import { media } from "@/data/media";
import { RecognitionLogos } from "@/components/brand/BrandLogo";
import { ExperienceCard } from "@/components/listings/ExperienceCard";
import { StoryCard } from "@/components/listings/StoryCard";

const services = [
  {
    title: "Craft My Journey",
    href: "/craft-my-journey",
    cta: "Plan my trip",
    image: media.craft,
  },
  {
    title: "Trusted Local Ride",
    href: "/experiences",
    cta: "Reserve rides",
    image: media.ride,
  },
  {
    title: "Custom Packages",
    href: "/journeys",
    cta: "Explore packages",
    image: media.packages,
  },
  {
    title: "Fixed Departures",
    href: "/journeys?type=small-group",
    cta: "Explore departures",
    image: media.departures,
  },
];

const values = [
  {
    title: "Authentic Encounters",
    body: "Real people and places — traditional food, local hosts, immersive village life.",
    image: media.valueAuthentic,
  },
  {
    title: "Community First",
    body: "90% of services powered by local partners. Shared growth in everything we do.",
    image: media.valueCommunity,
  },
  {
    title: "Travel That Gives Back",
    body: "Each booking contributes. Value flows back to crafts, traditions, and families.",
    image: media.valueGivesBack,
  },
];

export default function HomePage() {
  const featured = experiences.slice(0, 3);

  return (
    <>
      <PageHero
        src={media.heroForest}
        alt="Misty Meghalaya forest"
        eyebrow="TRIS Travels · Meghalaya"
        title={
          <>
            Experience the unseen.
            <br />
            <span className="font-serif font-normal italic text-primary-fixed-dim">
              Travel your way, with us.
            </span>
          </>
        }
        body="Community-rooted journeys that feel like coming home — and leave communities stronger."
        primaryCta={{ href: "/experiences", label: "Explore experiences" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Craft my journey" }}
      />

      {/* Breathe after hero */}
      <BreathSection
        size="md"
        eyebrow="Travel with us"
        title="Four ways to begin"
        body="Whether you want a single day with a local host, a scheduled small-group departure, or a journey built around you — start wherever feels right."
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group relative block aspect-[4/5] overflow-hidden lg:aspect-[3/4]"
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              className="object-cover transition duration-[1.2s] ease-out group-hover:scale-110"
              sizes="(max-width:1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <h3 className="font-display text-2xl leading-tight">{s.title}</h3>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold tracking-widest uppercase text-primary-fixed-dim transition group-hover:gap-2">
                {s.cta} <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <BreathSection
        size="lg"
        eyebrow="Featured journey"
        title="Root Trails"
        body="An offbeat living-root-bridge journey for travellers who want Meghalaya beyond the postcard route — village stays, quiet paths, groups of 4–10."
        cta={{ href: "/journeys/offbeat-living-root-bridge", label: "Discover Root Trails" }}
      />

      <FullBleedParallax
        src={media.heroRoots}
        alt="Living root bridge trail"
        title="Walk with the forest, not against it."
        height="md"
        align="center"
        overlay="soft"
        speed={0.3}
      />

      {/* Experiences with breathing header + gaps */}
      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <p className="label-caps text-accent">Travel deeper</p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              Featured Experiences
            </h2>
            <p className="mt-4 text-on-surface-variant">
              Immersive days led by local custodians — bookable online with clear pricing.
            </p>
          </FadeIn>
          <StaggerChildren className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
            {featured.map((exp) => (
              <StaggerItem key={exp.slug}>
                <ExperienceCard experience={exp} />
              </StaggerItem>
            ))}
          </StaggerChildren>
          <div className="mt-10 text-center">
            <Link
              href="/experiences"
              className="inline-flex items-center gap-2 label-caps text-primary hover:text-accent"
            >
              View all experiences <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Soft quote on white — not another full-bleed pile-up */}
      <section className="bg-surface-container-low py-20 md:py-28">
        <FadeIn className="mx-auto max-w-3xl px-margin-mobile text-center md:px-margin-desktop">
          <p className="label-caps text-accent">Guest highlight</p>
          <blockquote className="mt-6 font-serif text-2xl leading-snug text-primary italic md:text-3xl">
            “Wholesome service from planning to the end of the trip. Recommend TRIS to anyone new to
            the North East.”
          </blockquote>
          <p className="mt-6 text-on-surface-variant">Dr. Suresh Kumar · Chennai</p>
        </FadeIn>
      </section>

      <FullBleedParallax
        src={media.familyWaterfall}
        alt="Travellers at a Meghalaya waterfall"
        title="Travel that feels like coming home."
        height="md"
        align="center"
        overlay="soft"
        speed={0.28}
      />

      {/* About with breathing room in text column */}
      <section className="bg-surface">
        <Marquee duration={40} className="border-b border-outline-variant/15 py-4 opacity-40">
          <span className="font-display text-3xl tracking-tight text-primary md:text-5xl">
            THE HEART BEHIND TRIS
          </span>
          <span className="font-display text-3xl tracking-tight text-primary md:text-5xl" aria-hidden>
            THE HEART BEHIND TRIS
          </span>
        </Marquee>
        <div className="mx-auto grid max-w-container-max items-center gap-10 px-margin-mobile py-16 md:grid-cols-2 md:gap-16 md:px-margin-desktop md:py-24">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
              src={media.aboutPortrait}
              alt="The heart behind TRIS"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <SlideIn from="right">
            <p className="label-caps text-accent">Our story</p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
              The heart behind TRIS
            </h2>
            <p className="mt-6 leading-relaxed text-on-surface-variant">
              At the soul of TRIS is Mei-ieid — grandmother. Born in Mairang, she embodied true Khasi
              hospitality: generous, hard-working, and unconditionally caring.
            </p>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              TRIS is a promise to carry her spirit forward through every homestay, meal, guide, and
              journey.
            </p>
            <Button href="/about" variant="ghost" className="mt-8">
              Learn more
            </Button>
          </SlideIn>
        </div>
      </section>

      <BreathSection
        size="md"
        eyebrow="Our values"
        title="What we stand for"
        body="Authenticity, community, and travel that gives back — the principles behind every TRIS journey."
      />

      <section className="bg-surface pb-20 md:pb-28">
        <div className="mx-auto grid max-w-container-max gap-6 px-margin-mobile md:grid-cols-3 md:gap-8 md:px-margin-desktop">
          {values.map((v) => (
            <FadeIn key={v.title}>
              <div className="overflow-hidden rounded-2xl bg-surface-container-low">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={v.image}
                    alt={v.title}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
                <div className="p-6 md:p-7">
                  <h3 className="font-display text-xl text-primary">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{v.body}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <FullBleedParallax
        src={media.craft}
        alt="Local Meghalaya craft and handmade work"
        eyebrow="Artisan's Hub"
        title="Hard-to-find crafts, within reach"
        body="Local crafts can be hard to find and stock isn’t always certain — we connect you with suppliers who have them."
        cta={{ href: "/artisans", label: "Browse crafts" }}
        height="lg"
        align="left"
        overlay="left"
        speed={0.42}
        contentClassName="max-w-4xl"
        titleClassName="whitespace-nowrap text-[1.65rem] sm:text-3xl md:text-5xl"
      />

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn className="flex items-end justify-between gap-4">
            <div>
              <p className="label-caps text-accent">Journal</p>
              <h2 className="mt-2 font-display text-3xl text-primary md:text-4xl">Your Stories</h2>
              <p className="mt-2 text-on-surface-variant">From the misty hills.</p>
            </div>
            <Link
              href="/stories"
              className="hidden items-center gap-2 label-caps text-primary hover:text-accent md:flex"
            >
              Read all <ArrowRight size={16} />
            </Link>
          </FadeIn>
          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
            {stories.slice(0, 3).map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </div>
        </div>
      </section>

      <BreathSection
        size="lg"
        eyebrow="Travel your way"
        title="Craft a journey around you"
        body="Share your dates, pace, and curiosities — we design a personalised Meghalaya itinerary with local hosts and trusted partners."
        cta={{ href: "/craft-my-journey", label: "Start planning" }}
      />

      <FullBleedParallax
        src={media.heroMist}
        alt="Cloud-covered hills"
        title="The hills are waiting."
        height="md"
        align="center"
        overlay="soft"
        speed={0.32}
      />

      <FadeIn>
        <section className="bg-surface px-margin-mobile py-16 text-center md:px-margin-desktop md:py-20">
          <p className="label-caps text-accent">Recognitions</p>
          <p className="mt-3 font-display text-2xl text-primary md:text-3xl">
            Recognized by Meghalaya Tourism & NIDHI
          </p>
          <RecognitionLogos className="mt-10" />
        </section>
      </FadeIn>
    </>
  );
}
