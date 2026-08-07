import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import type { Journey } from "@/data/journeys";
import { formatINR, cn } from "@/lib/utils";

type Props = {
  journey: Journey;
  className?: string;
};

/**
 * Journeys — itinerary / package cards.
 * Horizontal editorial: duration figure + copy + landscape.
 */
export function JourneyCard({ journey, className }: Props) {
  const isFixed = journey.type === "small-group";

  return (
    <Link
      href={`/journeys/${journey.slug}`}
      className={cn(
        "group grid overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition duration-300",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-ambient",
        "md:grid-cols-[6.5rem_1fr]",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-row items-center justify-between gap-4 px-5 py-4 md:flex-col md:items-start md:justify-between md:py-6",
          isFixed ? "bg-primary" : "bg-primary-container",
        )}
      >
        <div>
          <p
            className={cn(
              "text-[10px] font-bold tracking-[0.14em] uppercase",
              isFixed ? "text-on-primary/80" : "text-primary-fixed-dim",
            )}
          >
            {isFixed ? "Fixed" : "Package"}
          </p>
          <p
            className={cn(
              "mt-1 font-display text-4xl leading-none md:text-[2.75rem]",
              isFixed ? "text-on-primary" : "text-primary-fixed",
            )}
          >
            {journey.days}
          </p>
          <p
            className={cn(
              "mt-1 text-xs",
              isFixed ? "text-on-primary/75" : "text-primary-fixed/70",
            )}
          >
            days · {journey.nights}N
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase",
            isFixed ? "bg-secondary text-on-secondary" : "bg-secondary/15 text-secondary",
          )}
        >
          {isFixed ? "Departure" : "Flexible"}
        </span>
      </div>

      <div className="grid sm:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col justify-between p-5 md:p-6">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {journey.style.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-outline-variant/35 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase"
                >
                  {s}
                </span>
              ))}
            </div>
            <h3 className="mt-3 font-display text-xl leading-snug text-secondary transition group-hover:text-primary md:text-2xl">
              {journey.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
              {journey.tagline}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-outline-variant/25 pt-4">
            <div className="space-y-1.5 text-xs text-on-surface-variant">
              <p className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} className="text-primary" />
                {journey.season}
              </p>
              {journey.groupSize && (
                <p className="inline-flex items-center gap-1.5">
                  <Users size={13} className="text-primary" />
                  {journey.groupSize}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] tracking-wider text-on-surface-variant uppercase">From</p>
              <p className="font-display text-xl text-secondary">{formatINR(journey.priceFrom)}</p>
            </div>
          </div>

          <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">
            View journey
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>

        <div className="relative min-h-[160px] sm:min-h-full">
          <Image
            src={journey.image}
            alt={journey.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:640px) 100vw, 28vw"
            quality={75}
          />
          {journey.nextDeparture && (
            <span className="absolute right-3 bottom-3 max-w-[90%] rounded-lg bg-background/80 px-2.5 py-1.5 text-[10px] font-medium text-secondary backdrop-blur-sm">
              {journey.nextDeparture}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
