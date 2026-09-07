import Link from "next/link";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { CARD_TYPE, clipClean } from "./cardText";
import { ListingCardMedia, listingImageSrc } from "./ListingMedia";

type Props = {
  experience: Experience;
  className?: string;
};

const DESCRIPTION_MAX = 96;
const CARD_TITLE =
  "font-[family-name:var(--font-playfair)] text-[1.05rem] font-medium leading-snug text-primary md:text-[1.15rem]";

export function ExperienceCard({ experience, className }: Props) {
  const description = clipClean(experience.tagline ?? "", DESCRIPTION_MAX);
  const image = listingImageSrc(experience.image, experience.gallery);

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
          href={`/experiences/${experience.slug}`}
          aria-label={`View ${experience.name}`}
          className="absolute inset-0 z-10"
        />
        <ListingCardMedia src={image} alt={experience.name} sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw" />
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2">
          <span className="rounded-full bg-surface-container-lowest/95 px-3 py-1.5 font-sans text-[10px] font-semibold tracking-[0.12em] text-primary uppercase">
            {experience.duration}
          </span>
          <WishlistButton slug={experience.slug} tone="on-light" />
        </div>
        <Link
          href={`/experiences/${experience.slug}`}
          className={cn(
            "absolute right-3.5 bottom-3.5 z-20 inline-flex items-center gap-1.5 rounded-full bg-cta px-4 py-2.5 text-on-cta shadow-[0_8px_20px_rgba(54,64,55,0.28)] transition hover:brightness-110",
            CARD_TYPE.button,
          )}
        >
          View experience <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3 className={CARD_TITLE}>
          <Link href={`/experiences/${experience.slug}`} className="transition-opacity hover:opacity-80">
            {experience.name}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-2 font-sans text-[13px] leading-[1.55] text-on-surface-variant md:text-[14px]">
          {description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-outline-variant/30 pt-4">
          <div className="min-w-0">
            <p className={cn(CARD_TYPE.label, "text-on-surface-variant")}>From</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
              <span className="font-sans text-[1.2rem] font-semibold tracking-tight text-primary md:text-[1.3rem]">
                {formatINR(experience.priceFrom)}
              </span>
              <span className="font-sans text-[12px] font-normal text-on-surface-variant">/ person</span>
            </p>
          </div>
          <Link
            href={`/experiences/${experience.slug}/book`}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full bg-cta px-4 py-2.5 text-on-cta transition hover:brightness-110",
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
