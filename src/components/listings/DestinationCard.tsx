import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { cn } from "@/lib/utils";

type Props = {
  destination: Destination;
  className?: string;
  /** Alternate visual rhythm in the grid */
  index?: number;
};

export function DestinationCard({ destination, className, index = 0 }: Props) {
  const tall = index % 5 === 1 || index % 5 === 3;

  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group flex h-full flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl",
          tall ? "aspect-[4/5]" : "aspect-[5/4]",
        )}
      >
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className="object-cover transition duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.04]"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
          quality={90}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#364037]/35 via-transparent to-transparent opacity-80 transition group-hover:opacity-100"
        />
        <span className="absolute top-3.5 left-3.5 font-[family-name:var(--font-manrope)] text-[10px] font-semibold tracking-[0.18em] text-white uppercase drop-shadow-sm">
          {destination.region}
        </span>
        <span
          className={cn(
            "absolute right-3.5 bottom-3.5 grid h-9 w-9 place-items-center rounded-full",
            "bg-[#E8EBDD]/95 text-primary shadow-sm",
            "transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          )}
        >
          <ArrowUpRight size={16} strokeWidth={2.25} />
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col px-0.5">
        <h3
          className="font-[family-name:var(--font-playfair)] text-[1.45rem] leading-[1.15] font-medium text-primary transition-opacity group-hover:opacity-80 md:text-[1.6rem]"
          title={destination.name}
        >
          {destination.name}
        </h3>
        <div className="mt-2.5 h-px w-8 bg-primary/40 transition-[width] duration-500 group-hover:w-12" />
        <p className="mt-3 line-clamp-2 font-[family-name:var(--font-manrope)] text-[0.9rem] leading-relaxed text-on-surface-variant">
          {destination.tagline}
        </p>
        <p className="mt-auto pt-3 font-[family-name:var(--font-manrope)] text-[11px] tracking-[0.06em] text-on-surface-variant/75">
          {destination.distances.shillong} from Shillong
        </p>
      </div>
    </Link>
  );
}
