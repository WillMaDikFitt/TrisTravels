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
        "group relative block h-full min-h-[22rem] overflow-hidden rounded-[1.75rem] md:min-h-[26rem]",
        className,
      )}
    >
      <Image
        src={destination.image}
        alt={destination.name}
        fill
        className="object-cover transition duration-700 group-hover:scale-105"
        sizes="(max-width:768px) 100vw, 50vw"
        quality={75}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
      <p className="absolute top-4 left-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-on-accent uppercase">
        {destination.region}
      </p>
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h3 className="font-display text-3xl leading-snug text-white">{destination.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/75">{destination.tagline}</p>
        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/70">
          <p className="inline-flex items-center gap-1.5">
            <Navigation size={13} />
            {destination.distances.shillong} from Shillong
          </p>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] text-accent uppercase">
            View
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
