import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import type { Journey } from "@/data/journeys";
import { formatINR, cn } from "@/lib/utils";

type Props = {
  journey: Journey;
  className?: string;
};

export function JourneyCard({ journey, className }: Props) {
  const isFixed = journey.type === "small-group";

  return (
    <Link
      href={`/journeys/${journey.slug}`}
      className={cn(
        "group grid overflow-hidden rounded-[1.75rem] bg-surface-container-lowest shadow-[0_10px_40px_rgba(42,46,31,0.06)] transition duration-300",
        "hover:-translate-y-0.5 hover:shadow-ambient",
        "md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]",
        className,
      )}
    >
      <div className="relative aspect-[16/11] md:aspect-auto md:min-h-[280px]">
        <Image
          src={journey.image}
          alt={journey.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 50vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-on-accent uppercase">
            {isFixed ? "Small group" : "Curated"}
          </span>
          <span className="rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-sm">
            {journey.days}D · {journey.nights}N
          </span>
        </div>
        {journey.nextDeparture && (
          <span className="absolute bottom-4 left-4 line-clamp-1 max-w-[85%] rounded-full bg-[#f7f4ee]/95 px-3 py-1.5 text-[11px] font-medium text-secondary">
            {journey.nextDeparture}
          </span>
        )}
      </div>

      <div className="flex flex-col p-6 md:p-8">
        <div className="flex min-h-[1.75rem] flex-wrap gap-1.5">
          {journey.style.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full border border-outline-variant/35 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-on-surface-variant uppercase"
            >
              {s}
            </span>
          ))}
        </div>

        <h3 className="mt-3 line-clamp-2 min-h-[3.5rem] font-display text-2xl leading-snug text-secondary transition group-hover:text-accent md:text-[1.65rem]">
          {journey.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-on-surface-variant">
          {journey.tagline}
        </p>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-t border-outline-variant/25 pt-5">
          <div className="min-w-0 space-y-1.5 text-xs text-on-surface-variant">
            <p className="flex items-start gap-1.5">
              <CalendarDays size={13} className="mt-0.5 shrink-0 text-accent" />
              <span className="line-clamp-2">{journey.season}</span>
            </p>
            <p className="flex items-start gap-1.5">
              <Users size={13} className="mt-0.5 shrink-0 text-accent" />
              <span className="line-clamp-1">{journey.groupSize ?? "Flexible group"}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] tracking-wider text-on-surface-variant uppercase">From</p>
            <p className="font-display text-xl leading-none text-secondary">{formatINR(journey.priceFrom)}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-accent uppercase">
              View journey
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
