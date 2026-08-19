import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";

type Props = {
  experience: Experience;
  className?: string;
};

export function ExperienceCard({ experience, className }: Props) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-lowest",
        className,
      )}
    >
      <Link
        href={`/experiences/${experience.slug}`}
        aria-label={`View ${experience.name}`}
        className="absolute inset-0 z-10"
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
        <Image
          src={experience.image}
          alt={experience.name}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        <span className="absolute top-3 left-3 rounded-full bg-[#f7f4ee]/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] text-secondary uppercase">
          {experience.category}
        </span>
        <div className="absolute top-3 right-3 z-20">
          <WishlistButton slug={experience.slug} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-5 pt-4 pb-5 md:px-6 md:pt-5 md:pb-6">
        <p className="text-[11px] font-medium tracking-wide text-on-surface-variant">
          <span className="line-clamp-1">{experience.location}</span>
          <span className="mt-0.5 block">{experience.duration}</span>
        </p>

        <h3 className="mt-3 line-clamp-2 min-h-[2.4em] font-display text-[1.45rem] leading-[1.15] text-secondary">
          {experience.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.6em] text-sm leading-relaxed text-on-surface-variant">
          {experience.tagline}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <p className="font-display text-lg leading-none text-secondary">
            <span className="mr-1.5 text-[10px] font-semibold tracking-[0.1em] text-on-surface-variant uppercase">
              From
            </span>
            {formatINR(experience.priceFrom)}
          </p>
          <Link
            href={`/experiences/${experience.slug}/book`}
            className="relative z-20 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[10px] font-bold tracking-[0.1em] text-on-accent uppercase"
          >
            Book now
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
