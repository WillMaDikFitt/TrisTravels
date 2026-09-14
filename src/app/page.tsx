import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeSnapRoot } from "@/components/home/HomeSnapRoot";
import { HomeStory } from "@/components/home/HomeStory";
import { HomeWaysToTravel } from "@/components/home/HomeWaysToTravel";
import { WhyTrisTestimonials } from "@/components/home/WhyTrisTestimonials";
import { HomeClosing } from "@/components/home/HomeClosing";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { stories } from "@/data/stories";
import { media } from "@/data/media";
import { StoryCard } from "@/components/listings/StoryCard";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { getSettings, listStories } from "@/lib/data/repo";
import { activeSharedFaqs, DEFAULT_HOME_FAQS } from "@/data/shared-faqs";
import { activeTestimonials, DEFAULT_TESTIMONIALS } from "@/data/testimonials";

const typeVisuals: Record<string, string> = {
  adventure: media.typeAdventure,
  nature: media.typeNature,
  wildlife: media.typeWildlife,
  "culture-heritage": media.typeCultureHeritage,
  "food-local-life": media.typeFoodLocalLife,
  wellness: media.typeWellness,
  creative: media.typeCreative,
};

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
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-3 lg:mt-5">
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-3.5">
              {EXPERIENCE_CATEGORIES.slice(0, 4).map((c, i) => (
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
                    sizes="25vw"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition duration-500 group-hover:from-black/70 group-hover:via-black/25"
                  />
                  <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/35 font-[family-name:var(--font-playfair)] text-xs text-white/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative z-10 mt-auto">
                    <h3 className="font-[family-name:var(--font-playfair)] text-[1.05rem] leading-tight text-white drop-shadow-sm sm:text-[1.15rem] lg:text-[1.25rem]">
                      {c.id}
                    </h3>
                    <p className="mt-1 line-clamp-2 font-[family-name:var(--font-manrope)] text-[0.68rem] leading-snug text-white/85 sm:text-[0.75rem]">
                      {c.blurb}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 sm:gap-3 lg:mx-auto lg:max-w-[75%] lg:grid-cols-3 lg:gap-3.5">
              {EXPERIENCE_CATEGORIES.slice(4).map((c, i) => (
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
                    sizes="25vw"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition duration-500 group-hover:from-black/70 group-hover:via-black/25"
                  />
                  <span className="relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/35 font-[family-name:var(--font-playfair)] text-xs text-white/80">
                    {String(i + 5).padStart(2, "0")}
                  </span>
                  <div className="relative z-10 mt-auto">
                    <h3 className="font-[family-name:var(--font-playfair)] text-[1.05rem] leading-tight text-white drop-shadow-sm sm:text-[1.15rem] lg:text-[1.25rem]">
                      {c.id}
                    </h3>
                    <p className="mt-1 line-clamp-2 font-[family-name:var(--font-manrope)] text-[0.68rem] leading-snug text-white/85 sm:text-[0.75rem]">
                      {c.blurb}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

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
