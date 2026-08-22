import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { CARD_MOTION, HOVER_REVEAL, HOVER_REVEAL_INNER, clipClean } from "./cardText";

type Props = {
  experience: Experience;
  className?: string;
};

const TITLE_MAX = 34;
const DESCRIPTION_MAX = 96;

export function ExperienceCard({ experience, className }: Props) {
  const title = clipClean(experience.name, TITLE_MAX);
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
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm">
          {experience.duration}
        </span>
        <WishlistButton slug={experience.slug} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pt-16 pb-5 pointer-events-none">
        <h3
          className="truncate font-display text-[1.45rem] leading-tight text-white md:text-[1.55rem]"
          title={experience.name}
        >
          {title}
        </h3>

        {highlights && (
          <p className="mt-2 line-clamp-2 text-sm leading-snug text-white/85">{highlights}</p>
        )}

        <div className={HOVER_REVEAL}>
          <div className={HOVER_REVEAL_INNER}>
            <div className="pt-3">
              <p className="text-[11px] font-medium tracking-[0.08em] text-white/65 uppercase">
                {experience.location}
              </p>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/75" title={experience.tagline}>
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/20 pt-3.5">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[0.95rem] font-semibold tracking-tight text-white">
              <span className="mr-1.5 text-[10px] font-semibold tracking-[0.14em] text-white/55 uppercase">
                From
              </span>
              {formatINR(experience.priceFrom)}
              <span className="ml-1 text-[11px] font-medium text-white/60">/ person</span>
            </p>
          </div>
          <Link
            href={`/experiences/${experience.slug}/book`}
            className="pointer-events-auto relative z-20 inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-4 py-2.5 text-[10px] font-bold tracking-[0.12em] text-on-accent uppercase transition-[filter,transform] duration-300 ease-out hover:brightness-110"
          >
            Book now
          </Link>
        </div>
      </div>
    </article>
  );
}
