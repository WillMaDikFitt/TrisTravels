import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";

const typeVisuals: Record<string, string> = {
  adventure: media.typeAdventure,
  nature: media.typeNature,
  wildlife: media.typeWildlife,
  "culture-heritage": media.typeCultureHeritage,
  "food-local-life": media.typeFoodLocalLife,
  wellness: media.typeWellness,
  creative: media.typeCreative,
};

/** Culture & Heritage leads as the wide card; the rest follow in reading order. */
const ORDER = [
  "culture-heritage",
  "adventure",
  "nature",
  "wildlife",
  "food-local-life",
  "wellness",
  "creative",
];

const CARDS = ORDER.map((slug) => EXPERIENCE_CATEGORIES.find((c) => c.slug === slug)).filter(
  (c): c is (typeof EXPERIENCE_CATEGORIES)[number] => Boolean(c),
);

export function HomeExperienceTypes() {
  return (
    <section className="home-snap-section relative flex h-[100svh] max-h-[100svh] flex-col overflow-hidden bg-[#1f3a2b] text-primary-fixed">
      <Image
        src={media.experienceTypesBg}
        alt=""
        fill
        className="object-cover object-bottom"
        sizes="100vw"
        quality={85}
      />
      {/* Light tint so card text stays readable over the artwork */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#1f3a2b]/25" />
      <div className="relative mx-auto flex h-full w-full max-w-container-max flex-col px-margin-mobile py-5 md:px-margin-desktop md:py-6 lg:py-7">
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

        {/* One grid: the lead card takes two columns, so row one is lead + two and row two is four. */}
        <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 grid-rows-4 gap-2.5 sm:gap-3 lg:mt-5 lg:grid-cols-4 lg:grid-rows-2 lg:gap-3.5">
          {CARDS.map((card, index) => {
            const featured = index === 0;
            return (
              <Link
                key={card.id}
                href={`/experiences?type=${card.slug}`}
                className={cn(
                  "group relative flex min-h-0 flex-col justify-between overflow-hidden rounded-xl p-3 sm:rounded-2xl sm:p-4",
                  featured && "col-span-2",
                )}
              >
                <Image
                  src={typeVisuals[card.slug] ?? media.forest}
                  alt=""
                  fill
                  className="object-cover transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  sizes={featured ? "(max-width:1024px) 100vw, 50vw" : "(max-width:1024px) 50vw, 25vw"}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 transition duration-500 group-hover:from-black/70 group-hover:via-black/25"
                />

                <div className="relative z-10">
                  <span aria-hidden className="block h-px w-6 bg-white/50" />
                  <span className="mt-1.5 block font-[family-name:var(--font-playfair)] text-xs text-white/80">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="relative z-10 mt-auto">
                  <h3
                    className={cn(
                      "font-[family-name:var(--font-playfair)] leading-tight text-white drop-shadow-sm",
                      featured
                        ? "text-[1.3rem] sm:text-[1.6rem] lg:text-[2rem]"
                        : "text-[1.05rem] sm:text-[1.15rem] lg:text-[1.25rem]",
                    )}
                  >
                    {card.id}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 line-clamp-2 font-[family-name:var(--font-manrope)] leading-snug text-white/85",
                      featured ? "text-[0.75rem] sm:text-[0.85rem]" : "text-[0.68rem] sm:text-[0.75rem]",
                    )}
                  >
                    {card.blurb}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1.5 border-b border-white/45 pb-0.5 text-[9px] font-bold tracking-[0.16em] text-white uppercase transition group-hover:border-white sm:text-[10px]">
                    Explore
                    <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
