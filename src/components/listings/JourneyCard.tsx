import Image from "next/image";
import Link from "next/link";
import type { Journey } from "@/data/journeys";
import { media } from "@/data/media";
import { formatINR, cn } from "@/lib/utils";
import { CARD_MOTION, CARD_TYPE, HOVER_REVEAL, HOVER_REVEAL_INNER, clipClean, clipTitle } from "./cardText";

type Props = {
  journey: Journey;
  className?: string;
  variant?: "horizontal" | "tile";
};

const CURATED_TITLE_MAX = 18;
const FIXED_TITLE_MAX = 18;

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
  if (!isFixed) {
    return <CuratedJourneyCard journey={journey} className={className} />;
  }
  return (
    <FixedJourneyCard journey={journey} className={className} variant={variant} />
  );
}

function CuratedJourneyCard({ journey, className }: { journey: Journey; className?: string }) {
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const title = clipTitle(journey.name, CURATED_TITLE_MAX);
  const description = journey.tagline.replace(/\s+/g, " ").trim();
  const experience = experienceLine(journey);
  const duration = `${journey.days} days · ${journey.nights} nights`;

  return (
    <article
      className={cn(
        "group relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-black",
        "shadow-[0_18px_44px_-22px_rgba(0,0,0,0.55)]",
        "transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,_1,_0.36,_1)]",
        "hover:-translate-y-1 hover:shadow-[0_28px_55px_-24px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <Image
        src={image}
        alt={journey.name}
        fill
        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.04]"
        sizes="(max-width:640px) 100vw, 50vw"
        quality={90}
      />
      {/* Reference overlay: solid black floor → mid fade → clear photo on top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #000 0%, #000 28%, rgba(0,0,0,0.72) 48%, rgba(0,0,0,0.28) 68%, transparent 82%)",
        }}
      />

      <Link
        href={`/journeys/${journey.slug}`}
        aria-label={`View ${journey.name}`}
        className="absolute inset-0 z-10"
      />

      <div className="absolute top-5 left-5 z-20 md:top-6 md:left-6">
        <span className="inline-block rounded-full bg-primary px-3.5 py-1.5 font-sans text-[10px] font-semibold tracking-[0.16em] text-on-primary uppercase">
          {duration}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5 md:px-6 md:pb-6">
        <h3 className={CARD_TYPE.title} title={journey.name}>
          {title}
        </h3>

        {experience ? (
          <div className="mt-3">
            <p className={cn(CARD_TYPE.label, "text-accent")}>Experiences</p>
            <p className={cn(CARD_TYPE.body, "mt-1")}>{experience}</p>
            <div className="mt-2.5 h-px w-11 bg-primary" />
          </div>
        ) : null}

        <p className={cn(CARD_TYPE.body, "mt-3 max-w-[34rem] leading-[1.55] text-white/85")}>
          {description}
        </p>

        <div className="mt-4 h-px w-full bg-white/20" />

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={cn(CARD_TYPE.label, "text-primary")}>From</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className={CARD_TYPE.price}>{formatINR(price)}</span>
              <span className="font-sans text-[12px] font-normal text-white/65">/ person</span>
            </p>
            <p className={cn(CARD_TYPE.meta, "mt-1.5 text-white/45")}>Based on a group of 4</p>
          </div>

          <div className="pointer-events-auto relative z-20 flex shrink-0 gap-2">
            <Link
              href={`/journeys/${journey.slug}/book`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-on-accent transition hover:brightness-110",
                CARD_TYPE.button,
              )}
            >
              Book now <span aria-hidden>→</span>
            </Link>
            <Link
              href={`/journeys/${journey.slug}/enquire`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-on-primary transition hover:brightness-110",
                CARD_TYPE.button,
              )}
            >
              Customise <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function FixedJourneyCard({
  journey,
  className,
  variant,
}: {
  journey: Journey;
  className?: string;
  variant: "horizontal" | "tile";
}) {
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const horizontal = variant === "horizontal";
  const title = clipTitle(journey.name, FIXED_TITLE_MAX);
  const description = clipClean(journey.tagline, 96);
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
        <span className="rounded-full bg-black/40 px-3 py-1.5 font-sans text-[10px] font-semibold tracking-[0.12em] text-white uppercase backdrop-blur-sm">
          {duration}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-5 pt-16 pb-5 md:px-6 md:pb-6">
        <h3 className={CARD_TYPE.titleCompact} title={journey.name}>
          {title}
        </h3>

        {experience && (
          <div className="mt-2.5">
            <p className={cn(CARD_TYPE.label, "text-accent")}>Experiences</p>
            <p className={cn(CARD_TYPE.body, "mt-1 line-clamp-2")}>{experience}</p>
          </div>
        )}

        <div className={HOVER_REVEAL}>
          <div className={HOVER_REVEAL_INNER}>
            <div className="pt-3">
              {journey.nextDeparture && (
                <p className={cn(CARD_TYPE.meta, "mb-2 text-white/70")}>
                  <span className="font-semibold tracking-[0.12em] text-white/55 uppercase">Next · </span>
                  {journey.nextDeparture}
                </p>
              )}
              <p className={cn(CARD_TYPE.body, "line-clamp-2 leading-relaxed text-white/75")} title={journey.tagline}>
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-white/20 pt-3.5">
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className={cn(CARD_TYPE.label, "mr-1 text-white/55")}>From</span>
            <span className={CARD_TYPE.price}>{formatINR(price)}</span>
            <span className="font-sans text-[11px] font-medium text-white/60">/ person</span>
          </p>
          <div className="pointer-events-auto relative z-20 mt-3.5 flex gap-2">
            <Link
              href={`/journeys/${journey.slug}/enquire`}
              className={cn(
                "inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-on-accent transition-[filter,transform] duration-300 ease-out hover:brightness-110",
                CARD_TYPE.button,
              )}
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
