import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Mountain, MapPin } from "lucide-react";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";

type Props = {
  experience: Experience;
  className?: string;
};

/**
 * Compact experience card — 3-up on desktop.
 * Image band + structured meta (not a heavy overlay slab).
 */
export function ExperienceCard({ experience, className }: Props) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-ambient",
        className,
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-surface-container">
        <Image
          src={experience.image}
          alt={experience.name}
          fill
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          <span className="rounded-full bg-secondary/95 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-on-secondary uppercase">
            {experience.category}
          </span>
          {(experience.communityLed || experience.sustainabilityFocus) && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-on-primary uppercase">
              {experience.communityLed ? "Community" : "Gives back"}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} className="text-primary" />
            {experience.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} className="text-primary" />
            {experience.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <Mountain size={11} className="text-primary" />
            {experience.difficulty}
          </span>
        </div>

        <h3 className="font-display text-lg leading-snug text-secondary transition group-hover:text-primary md:text-[1.2rem]">
          {experience.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
          {experience.tagline}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant/25 pt-3">
          <div>
            <p className="text-[10px] tracking-wider text-on-surface-variant uppercase">From</p>
            <p className="font-display text-lg text-secondary">{formatINR(experience.priceFrom)}</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/40 text-secondary transition group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
