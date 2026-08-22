import Image from "next/image";
import Link from "next/link";
import type { Journey } from "@/data/journeys";
import { media } from "@/data/media";
import { formatINR, cn } from "@/lib/utils";
import { CARD_MOTION, HOVER_REVEAL, HOVER_REVEAL_INNER, clipClean } from "./cardText";

type Props = {
  journey: Journey;
  className?: string;
  variant?: "horizontal" | "tile";
};

const TITLE_MAX = 32;
const DESCRIPTION_MAX = 96;

function experienceLine(journey: Journey) {
  const items = (journey.experienceHighlights?.length
    ? journey.experienceHighlights
    : journey.highlights
  )
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 5);
  return items.join(" · ");
}

export function JourneyCard({ journey, className, variant = "horizontal" }: Props) {
  const isFixed = journey.type === "small-group";
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const horizontal = variant === "horizontal";
  const title = clipClean(journey.name, TITLE_MAX);
  const description = clipClean(journey.tagline, DESCRIPTION_MAX);
  const experience = experienceLine(journey);
  const duration = `${journey.days} days · ${journey.nights} nights`;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem]",
        "shadow-[0_16px_40px_-22px_rgba(42,46,31,0.5)]",
        CARD_MOTION.shell,
        horizontal ? "aspect-[16/10] md:aspect-[5/4]" : "aspect-[4/5]",
        className,
      )}
    >
      <Link
        href={`/journeys/${journey.slug}`}
        aria-label={`View ${journey.name}`}
        className="absolute inset-0 z-10"
      />

      <Image
        src={image}
        alt={journey.name}
        fill
        className={CARD_MOTION.image}
        sizes={horizontal ? "(max-width:768px) 100vw, 50vw" : "(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"}
        quality={85}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/15" />
      <div className={CARD_MOTION.dim} />

      <div className="absolute top-3 left-3 z-20">
        <span className="rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm">
          {duration}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pt-16 pb-5 pointer-events-none md:px-6 md:pb-6">
        <h3
          className="truncate font-display text-[1.5rem] leading-tight text-white md:text-[1.65rem]"
          title={journey.name}
        >
          {title}
        </h3>

        {experience && (
          <div className="mt-2.5">
            <p className="text-[9px] font-semibold tracking-[0.2em] text-accent uppercase">Experiences</p>
            <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/90">{experience}</p>
          </div>
        )}

        <div className={HOVER_REVEAL}>
          <div className={HOVER_REVEAL_INNER}>
            <div className="pt-3">
              {isFixed && journey.nextDeparture && (
                <p className="mb-2 text-[11px] text-white/70">
                  <span className="font-semibold tracking-[0.12em] text-white/55 uppercase">Next · </span>
                  {journey.nextDeparture}
                </p>
              )}
              <p className="line-clamp-2 text-sm leading-relaxed text-white/75" title={journey.tagline}>
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-white/20 pt-3.5">
          <p className="text-[0.95rem] font-semibold tracking-tight text-white">
            <span className="mr-1.5 text-[10px] font-semibold tracking-[0.14em] text-white/55 uppercase">
              From
            </span>
            {formatINR(price)}
            <span className="ml-1 text-[11px] font-medium text-white/60">/ person</span>
            {!isFixed && (
              <span className="ml-2 text-[11px] font-medium text-white/55">
                · Based on a group of 4
              </span>
            )}
          </p>
          <div className="pointer-events-auto relative z-20 mt-3.5 flex gap-2">
            {isFixed ? (
              <Link
                href={`/journeys/${journey.slug}/enquire`}
                className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-[10px] font-bold tracking-[0.12em] text-on-accent uppercase transition-[filter,transform] duration-300 ease-out hover:brightness-110"
              >
                Book now
              </Link>
            ) : (
              <>
                <Link
                  href={`/journeys/${journey.slug}/book`}
                  className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-[10px] font-bold tracking-[0.12em] text-on-accent uppercase transition-[filter,transform] duration-300 ease-out hover:brightness-110"
                >
                  Book now
                </Link>
                <Link
                  href={`/journeys/${journey.slug}/enquire`}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2.5 text-[10px] font-bold tracking-[0.12em] text-on-primary uppercase transition-[filter,transform] duration-300 ease-out hover:brightness-110"
                >
                  Customise
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
