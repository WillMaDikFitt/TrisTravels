import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Journey } from "@/data/journeys";
import { media } from "@/data/media";
import { formatINR, cn } from "@/lib/utils";

type Props = {
  journey: Journey;
  className?: string;
  variant?: "horizontal" | "tile";
};

export function JourneyCard({ journey, className, variant = "horizontal" }: Props) {
  const isFixed = journey.type === "small-group";
  const image = typeof journey.image === "string" && journey.image.trim() ? journey.image : media.packages;
  const price = Number(journey.priceFrom);
  const horizontal = variant === "horizontal";

  return (
    <article
      className={cn(
        "group relative grid h-full overflow-hidden rounded-[1.5rem] border border-outline-variant/25 bg-surface-container-lowest",
        horizontal && "md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]",
        className,
      )}
    >
      <Link
        href={`/journeys/${journey.slug}`}
        aria-label={`View ${journey.name}`}
        className="absolute inset-0 z-10"
      />
      <div
        className={cn(
          "relative overflow-hidden bg-surface-container",
          horizontal ? "aspect-[16/10] md:aspect-auto md:min-h-[310px]" : "aspect-[16/10]",
        )}
      >
        <Image
          src={image}
          alt={journey.name}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          sizes={horizontal ? "(max-width:768px) 100vw, 40vw" : "(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"}
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/5" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f7f4ee]/95 px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] text-secondary uppercase shadow-sm">
            {isFixed ? "Fixed departure" : "Curated journey"}
          </span>
          <span className="rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-bold tracking-[0.08em] text-white uppercase backdrop-blur-sm">
            {journey.days} days · {journey.nights} nights
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-col p-5 md:p-6">
        <h3 className="line-clamp-2 min-h-[2.4em] font-display text-[1.45rem] leading-[1.15] text-secondary">
          {journey.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-[2.6em] text-sm leading-relaxed text-on-surface-variant">
          {journey.tagline}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-outline-variant/25 pt-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.1em] text-on-surface-variant uppercase">
              From
            </p>
            <p className="mt-0.5 font-display text-xl leading-none text-secondary md:text-2xl">
              {formatINR(price)}
            </p>
          </div>
          <Link
            href={`/journeys/${journey.slug}/enquire`}
            className="relative z-20 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-[10px] font-bold tracking-[0.1em] text-on-accent uppercase transition-[transform,filter] duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            {isFixed ? "Book now" : "Enquire"}
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
