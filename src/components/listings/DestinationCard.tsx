import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Navigation } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";
import { CARD_TYPE, clipTitle } from "./cardText";

type Props = {
  destination: Destination;
  className?: string;
};

export function DestinationCard({ destination, className }: Props) {
  const title = clipTitle(destination.name, 18);

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
        sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
        quality={80}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/10" />
      <p className="absolute top-3 left-3 rounded-full bg-accent px-2 py-0.5 font-sans text-[9px] font-bold tracking-[0.14em] text-on-accent uppercase">
        {destination.region}
      </p>
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <h3 className={CARD_TYPE.titleCompact} title={destination.name}>
          {title}
        </h3>
        <p className={cn(CARD_TYPE.body, "mt-1.5 line-clamp-2 text-xs text-white/75 md:text-sm")}>
          {destination.tagline}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2 font-sans text-[10px] text-white/70">
          <p className="inline-flex items-center gap-1 line-clamp-1">
            <Navigation size={11} />
            {destination.distances.shillong}
          </p>
          <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold tracking-[0.12em] text-white uppercase">
            View
            <ArrowRight size={11} className="transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
