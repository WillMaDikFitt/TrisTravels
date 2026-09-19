import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeSnapRoot } from "@/components/home/HomeSnapRoot";
import { HomeStory } from "@/components/home/HomeStory";
import { HomeWaysToTravel } from "@/components/home/HomeWaysToTravel";
import { HomeExperienceTypes } from "@/components/home/HomeExperienceTypes";
import { WhyTrisTestimonials } from "@/components/home/WhyTrisTestimonials";
import { HomeClosing } from "@/components/home/HomeClosing";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { stories } from "@/data/stories";
import { media } from "@/data/media";
import { StoryCard } from "@/components/listings/StoryCard";
import { getSettings, listStories } from "@/lib/data/repo";
import { activeSharedFaqs, DEFAULT_HOME_FAQS } from "@/data/shared-faqs";
import { activeTestimonials, DEFAULT_TESTIMONIALS } from "@/data/testimonials";

/** Pick up Studio edits (home FAQs, stories) without waiting for a full redeploy. */
export const revalidate = 60;

export default async function HomePage() {
  const [allStories, settings] = await Promise.all([
    listStories().catch(() => stories),
    getSettings().catch(() => null),
  ]);
  const homeFaqs = activeSharedFaqs(settings?.homeFaqs, DEFAULT_HOME_FAQS);

  return (
    <HomeSnapRoot>
      <HomeHero />

      <HomeWaysToTravel />

      <HomeExperienceTypes />

      <WhyTrisTestimonials
        testimonials={activeTestimonials(settings?.homeTestimonials, DEFAULT_TESTIMONIALS)}
      />
      <HomeStory />

      <section className="home-snap-section relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-10 md:h-[100svh] md:max-h-[100svh] md:py-8">
        <Image
          src={media.meadowWalk}
          alt=""
          fill
          className="object-cover object-center scale-105"
          sizes="100vw"
          quality={85}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface/92 via-surface/78 to-surface/62"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 18% 25%, rgba(122,163,90,0.14), transparent 48%), radial-gradient(ellipse at 82% 72%, rgba(54,64,55,0.08), transparent 42%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-container-max flex-col justify-center px-margin-mobile md:px-margin-desktop">
          <FadeIn className="rounded-2xl bg-surface-container-lowest/88 px-5 py-5 shadow-[0_10px_32px_rgba(54,64,55,0.08)] backdrop-blur-[2px] md:px-7 md:py-6">
            <div className="ink-rule bg-primary/25" />
            <p className="label-caps mt-4 text-primary md:text-xs">Journal</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2.35rem,4.5vw,3.65rem)] leading-[1.02] text-primary">
                Stories from the hills
              </h2>
              <Link
                href="/stories"
                className="label-caps mb-1 hidden items-center gap-2 font-semibold text-primary md:inline-flex"
              >
                Read all <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-on-surface md:text-lg">
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
              className="label-caps inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface-container-lowest/90 px-5 py-2.5 font-semibold text-primary shadow-sm"
            >
              Read all <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {homeFaqs.length ? (
        <div className="home-snap-section flex h-[100svh] max-h-[100svh] flex-col overflow-hidden">
          <HomeFaq items={homeFaqs} />
        </div>
      ) : null}

      <ImpactSection
        impact={settings?.impact ?? []}
        backgroundImage={settings?.impactImage}
        className="home-snap-section flex min-h-[100svh] flex-col justify-center"
      />

      <HomeClosing />
    </HomeSnapRoot>
  );
}
