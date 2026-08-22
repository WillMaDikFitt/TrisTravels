import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { CARD_MOTION, CARD_TYPE, HOVER_REVEAL, HOVER_REVEAL_INNER, clipClean, clipTitle } from "./cardText";

type Props = {
  experience: Experience;
  className?: string;
};

/** Keep experience titles on a single line on listing cards. */
const TITLE_MAX = 14;
const DESCRIPTION_MAX = 96;

export function ExperienceCard({ experience, className }: Props) {
  const title = clipTitle(experience.name, TITLE_MAX);
  const description = clipClean(experience.tagline, DESCRIPTION_MAX);
  const highlights = (experience.highlights ?? [])
    .map((h) => h.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4)
    .join(" · ");

  return (
    <article
      className={cn(
        "group relative aspect-[4/5] overflow-hidden rounded-[1.5rem]",
        "shadow-[0_16px_40px_-22px_rgba(42,46,31,0.5)]",
        CARD_MOTION.shell,
        className,
      )}
    >
      <Link
        href={`/experiences/${experience.slug}`}
        aria-label={`View ${experience.name}`}
        className="absolute inset-0 z-10"
      />

      <Image
        src={experience.image}
        alt={experience.name}
        fill
        className={CARD_MOTION.image}
        sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />
      <div className={CARD_MOTION.dim} />

      <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2">
        <span className="rounded-full bg-black/40 px-3 py-1.5 font-sans text-[10px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm">
          {experience.duration}
        </span>
        <WishlistButton slug={experience.slug} />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pt-16 pb-5">
        <h3 className={CARD_TYPE.titleCompact} title={experience.name}>
          {title}
        </h3>

        {highlights ? (
          <p className={cn(CARD_TYPE.body, "mt-2 line-clamp-2 text-white/85")}>{highlights}</p>
        ) : null}

        <div className={HOVER_REVEAL}>
          <div className={HOVER_REVEAL_INNER}>
            <div className="pt-3">
              <p className={cn(CARD_TYPE.meta, "tracking-[0.08em] text-white/65 uppercase")}>
                {experience.location}
              </p>
              <p
                className={cn(CARD_TYPE.body, "mt-1.5 line-clamp-2 leading-relaxed text-white/75")}
                title={experience.tagline}
              >
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/20 pt-3.5">
          <div className="min-w-0">
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className={cn(CARD_TYPE.label, "text-white/55")}>From</span>
              <span className={CARD_TYPE.price}>{formatINR(experience.priceFrom)}</span>
              <span className="font-sans text-[11px] font-medium text-white/60">/ person</span>
            </p>
          </div>
          <Link
            href={`/experiences/${experience.slug}/book`}
            className={cn(
              "pointer-events-auto relative z-20 inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-4 py-2.5 text-on-accent transition-[filter,transform] duration-300 ease-out hover:brightness-110",
              CARD_TYPE.button,
            )}
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
