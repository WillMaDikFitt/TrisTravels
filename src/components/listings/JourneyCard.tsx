import Image from "next/image";
import Link from "next/link";
import type { Journey } from "@/data/journeys";
import { media } from "@/data/media";
import { formatINR, cn } from "@/lib/utils";
import { CARD_TYPE, clipClean } from "./cardText";

type Props = {
  journey: Journey;
  className?: string;
  variant?: "horizontal" | "tile";
};

/**
 * Curated listing layout switch.
 * - "split": GetYourGuide-style — photo on top, content panel below (no text-on-image clash)
 * - "overlay": previous full-bleed photo with bottom scrim (kept for easy revert)
 */
const CURATED_LAYOUT: "split" | "overlay" = "split";

const CARD_TITLE =
  "font-[family-name:var(--font-playfair)] text-[1.05rem] font-medium leading-snug text-primary md:text-[1.15rem]";
const CARD_TITLE_ON_DARK =
  "font-[family-name:var(--font-playfair)] text-[1.05rem] font-medium leading-snug text-white md:text-[1.15rem] [text-shadow:0_1px_18px_rgba(0,0,0,0.55)]";

function experienceLine(journey: Journey) {
  const items = (journey.experienceHighlights?.length
    ? journey.experienceHighlights
    : journey.highlights ?? []
  )
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 8);
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
  if (CURATED_LAYOUT === "overlay") {
    return <CuratedOverlayCard journey={journey} className={className} />;
  }
  return <CuratedSplitCard journey={journey} className={className} />;
}

/** GetYourGuide-style: clear photo on top, readable content below. */
function CuratedSplitCard({ journey, className }: { journey: Journey; className?: string }) {
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const tagline = (journey.tagline ?? "").replace(/\s+/g, " ").trim();
  const experience = experienceLine(journey);
  const season = (journey.season ?? "").replace(/\s+/g, " ").trim();
  const duration = `${journey.days} days · ${journey.nights} nights`;

  return (
    <article
      className={cn(
        "group flex h-full min-h-[36rem] flex-col overflow-hidden rounded-[1.5rem] bg-surface-container-lowest",
        "border border-outline-variant/25",
        "shadow-[0_14px_36px_-22px_rgba(42,46,31,0.35)]",
        "transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,_1,_0.36,_1)]",
        "hover:-translate-y-1 hover:shadow-[0_24px_48px_-22px_rgba(42,46,31,0.45)]",
        "md:min-h-[38rem]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
        <Link
          href={`/journeys/${journey.slug}`}
          aria-label={`View ${journey.name}`}
          className="absolute inset-0 z-10"
        />
        <Image
          src={image}
          alt={journey.name}
          fill
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.04]"
          sizes="(max-width:640px) 100vw, 50vw"
          quality={90}
        />
        <div className="absolute top-3.5 left-3.5 z-20">
          <span className="inline-block rounded-full bg-surface-container-lowest/95 px-3.5 py-1.5 font-sans text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
            {duration}
          </span>
        </div>
        <Link
          href={`/journeys/${journey.slug}`}
          className={cn(
            "absolute right-3.5 bottom-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-on-cta shadow-[0_8px_20px_rgba(54,64,55,0.28)] transition hover:brightness-110",
            CARD_TYPE.button,
          )}
        >
          View Journey <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-5 pb-6 md:px-6 md:pt-6 md:pb-7">
        <h3 className={CARD_TITLE}>
          <Link href={`/journeys/${journey.slug}`} className="transition-opacity hover:opacity-80">
            {journey.name}
          </Link>
        </h3>

        {tagline ? (
          <p className="mt-2.5 line-clamp-3 font-sans text-[13px] leading-[1.55] text-on-surface-variant md:text-[14px]">
            {tagline}
          </p>
        ) : null}

        {experience ? (
          <div className="mt-4">
            <p className={cn(CARD_TYPE.label, "text-highlight")}>Experiences</p>
            <p className="mt-1.5 line-clamp-3 font-sans text-[13px] leading-[1.55] text-on-surface md:text-[14px]">
              {experience}
            </p>
          </div>
        ) : null}

        {season ? (
          <div className="mt-4">
            <p className={cn(CARD_TYPE.label, "text-on-surface-variant")}>Best season</p>
            <p className="mt-1 font-sans text-[13px] leading-snug text-primary md:text-[14px]">{season}</p>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-3 border-t border-outline-variant/30 pt-5">
          <div className="min-w-0">
            <p className={cn(CARD_TYPE.label, "text-on-surface-variant")}>From</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-sans text-[1.25rem] font-semibold tracking-tight text-primary md:text-[1.4rem]">
                {formatINR(price)}
              </span>
              <span className="font-sans text-[12px] font-normal text-on-surface-variant">/ person</span>
            </p>
            <p className="mt-1.5 font-sans text-[11px] text-on-surface-variant/80">Based on a group of 4</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`/journeys/${journey.slug}/book`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-on-cta transition hover:brightness-110",
                CARD_TYPE.button,
              )}
            >
              Book now
            </Link>
            <Link
              href={`/journeys/${journey.slug}/enquire`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 px-4 py-2.5 text-primary transition hover:border-primary/40",
                CARD_TYPE.button,
              )}
            >
              Customise
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Previous full-bleed overlay card — flip CURATED_LAYOUT to "overlay" to restore. */
function CuratedOverlayCard({ journey, className }: { journey: Journey; className?: string }) {
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const tagline = (journey.tagline ?? "").replace(/\s+/g, " ").trim();
  const experience = experienceLine(journey);
  const season = (journey.season ?? "").replace(/\s+/g, " ").trim();
  const duration = `${journey.days} days · ${journey.nights} nights`;

  return (
    <article
      className={cn(
        "group relative aspect-[1/1] overflow-hidden rounded-[1.75rem] bg-black",
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, #000 0%, #000 28%, rgba(0,0,0,0.92) 46%, rgba(0,0,0,0.72) 60%, rgba(0,0,0,0.35) 76%, rgba(0,0,0,0.1) 88%, transparent 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-black via-black/45 to-transparent"
      />

      <Link
        href={`/journeys/${journey.slug}`}
        aria-label={`View ${journey.name}`}
        className="absolute inset-0 z-10"
      />

      <div className="absolute top-5 left-5 z-20 md:top-6 md:left-6">
        <span className="inline-block rounded-full bg-surface-container-lowest/95 px-3.5 py-1.5 font-sans text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
          {duration}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-5 md:px-6 md:pb-6">
        <h3 className={CARD_TITLE_ON_DARK}>{journey.name}</h3>

        {tagline ? (
          <p className={cn(CARD_TYPE.body, "mt-2 line-clamp-3 leading-[1.55] text-white/90")}>{tagline}</p>
        ) : null}

        {experience ? (
          <div className="mt-3">
            <p className={cn(CARD_TYPE.label, "text-highlight")}>Experiences</p>
            <p className={cn(CARD_TYPE.body, "mt-1 line-clamp-3 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)]")}>
              {experience}
            </p>
          </div>
        ) : null}

        {season ? (
          <p className={cn(CARD_TYPE.meta, "mt-3 text-white/75")}>Best season · {season}</p>
        ) : null}

        <div className="mt-4 h-px w-full bg-white/20" />

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className={cn(CARD_TYPE.label, "text-white")}>From</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className={CARD_TYPE.price}>{formatINR(price)}</span>
              <span className="font-sans text-[12px] font-normal text-white/80">/ person</span>
            </p>
            <p className={cn(CARD_TYPE.meta, "mt-1.5 text-white/70")}>Based on a group of 4</p>
          </div>

          <div className="pointer-events-auto relative z-20 flex shrink-0 gap-2">
            <Link
              href={`/journeys/${journey.slug}/book`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-on-cta transition hover:brightness-110",
                CARD_TYPE.button,
              )}
            >
              Book now <span aria-hidden>→</span>
            </Link>
            <Link
              href={`/journeys/${journey.slug}/enquire`}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-primary bg-surface-container-lowest px-4 py-2.5 text-primary transition hover:bg-surface",
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
}: {
  journey: Journey;
  className?: string;
  variant: "horizontal" | "tile";
}) {
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const description = clipClean(journey.tagline ?? "", 96);
  const duration = `${journey.days} days · ${journey.nights} nights`;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-surface-container-lowest",
        "border border-outline-variant/25",
        "shadow-[0_14px_36px_-22px_rgba(42,46,31,0.35)]",
        "transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.22,_1,_0.36,_1)]",
        "hover:-translate-y-1 hover:shadow-[0_24px_48px_-22px_rgba(42,46,31,0.45)]",
        className,
      )}
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
        <Link
          href={`/journeys/${journey.slug}`}
          aria-label={`View ${journey.name}`}
          className="absolute inset-0 z-10"
        />
        <Image
          src={image}
          alt={journey.name}
          fill
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.04]"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
          quality={85}
        />
        <div className="absolute top-3.5 left-3.5 z-20">
          <span className="inline-block rounded-full bg-surface-container-lowest/95 px-3.5 py-1.5 font-sans text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
            {duration}
          </span>
        </div>
        <Link
          href={`/journeys/${journey.slug}`}
          className={cn(
            "absolute right-3.5 bottom-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-on-cta shadow-[0_8px_20px_rgba(54,64,55,0.28)] transition hover:brightness-110",
            CARD_TYPE.button,
          )}
        >
          View Journey <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className={CARD_TITLE}>
          <Link href={`/journeys/${journey.slug}`} className="transition-opacity hover:opacity-80">
            {journey.name}
          </Link>
        </h3>

        {journey.nextDeparture ? (
          <p className="mt-2 font-sans text-[12px] text-on-surface-variant">
            <span className="font-semibold tracking-[0.1em] uppercase">Next · </span>
            {journey.nextDeparture}
          </p>
        ) : null}

        <p className="mt-3 line-clamp-2 font-sans text-[13px] leading-[1.55] text-on-surface-variant md:text-[14px]">
          {description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-outline-variant/30 pt-4">
          <div className="min-w-0">
            <p className={cn(CARD_TYPE.label, "text-on-surface-variant")}>From</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-sans text-[1.2rem] font-semibold tracking-tight text-primary md:text-[1.3rem]">
                {formatINR(price)}
              </span>
              <span className="font-sans text-[12px] font-normal text-on-surface-variant">/ person</span>
            </p>
          </div>
          <Link
            href={`/journeys/${journey.slug}/enquire`}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full bg-cta px-4 py-2.5 text-on-cta transition hover:brightness-110",
              CARD_TYPE.button,
            )}
          >
            Reserve my seat
          </Link>
        </div>
      </div>
    </article>
  );
}
