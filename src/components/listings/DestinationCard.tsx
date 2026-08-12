import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Navigation } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";

type Props = {
  destination: Destination;
  className?: string;
};

export function DestinationCard({ destination, className }: Props) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem]",
        className,
      )}
    >
      <Image
        src={destination.image}
        alt={destination.name}
        fill
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes="25vw"
        quality={75}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
      <p className="absolute top-3 left-3 rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-on-accent uppercase">
        {destination.region}
      </p>
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className="line-clamp-2 font-display text-xl leading-snug text-white md:text-2xl">
          {destination.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-white/75 md:text-sm">{destination.tagline}</p>
        <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-white/70">
          <p className="inline-flex items-center gap-1 line-clamp-1">
            <Navigation size={11} />
            {destination.distances.shillong}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold tracking-[0.12em] text-accent uppercase">
            View
            <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
