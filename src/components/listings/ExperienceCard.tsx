import Image from "next/image";
import Link from "next/link";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";
import { CARD_TYPE, clipClean, clipTitle } from "./cardText";

type Props = {
  experience: Experience;
  className?: string;
};

const TITLE_MAX = 14;
const DESCRIPTION_MAX = 96;

export function ExperienceCard({ experience, className }: Props) {
  const title = clipTitle(experience.name, TITLE_MAX);
  const description = clipClean(experience.tagline, DESCRIPTION_MAX);

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
        <Image
          src={experience.image}
          alt={experience.name}
          fill
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.04]"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
          quality={85}
        />
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2">
          <span className="rounded-full bg-primary px-3 py-1.5 font-sans text-[10px] font-semibold tracking-[0.12em] text-on-primary uppercase">
            {experience.duration}
          </span>
          <WishlistButton slug={experience.slug} tone="on-light" />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <h3
          className="truncate whitespace-nowrap font-[family-name:var(--font-playfair)] text-[1.35rem] font-medium leading-none text-primary md:text-[1.5rem]"
          title={experience.name}
        >
          <Link href={`/experiences/${experience.slug}`} className="transition-opacity hover:opacity-80">
            {title}
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
              "inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-4 py-2.5 text-on-accent transition hover:brightness-110",
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
