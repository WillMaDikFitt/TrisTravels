import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";

type Props = {
  destination: Destination;
  className?: string;
};

/**
 * Destinations — scannable place cards with region + distance cues.
 */
export function DestinationCard({ destination, className }: Props) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group grid overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-ambient",
        "sm:grid-cols-[1.05fr_1fr]",
        className,
      )}
    >
      <div className="relative aspect-[16/11] sm:aspect-auto sm:min-h-[200px]">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 40vw"
          quality={75}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-black/20" />
      </div>

      <div className="flex flex-col justify-between p-5 md:p-6">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
            <MapPin size={12} />
            {destination.region}
          </p>
          <h3 className="mt-2 font-display text-2xl leading-snug text-secondary transition group-hover:text-primary">
            {destination.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {destination.tagline}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant/25 pt-4">
          <p className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant">
            <Navigation size={13} className="text-primary" />
            {destination.distances.shillong} from Shillong
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-primary uppercase">
            View
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
