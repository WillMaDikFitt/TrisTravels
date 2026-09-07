import Image from "next/image";
import Link from "next/link";
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
          "relative overflow-hidden",
          tall ? "aspect-[3/4]" : "aspect-[4/5]",
        )}
      >
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className="object-cover transition duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.03]"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
          quality={90}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-primary-container/55 via-primary-container/10 to-transparent opacity-90 transition group-hover:opacity-100"
        />
        <span className="absolute top-4 left-4 font-[family-name:var(--font-manrope)] text-[10px] font-semibold tracking-[0.2em] text-white/90 uppercase">
          {destination.region}
        </span>
      </div>

      <div className="mt-5 flex flex-1 flex-col border-t border-primary/15 pt-4">
        <h3 className="font-[family-name:var(--font-playfair)] text-[1.15rem] leading-snug font-medium text-primary transition-opacity group-hover:opacity-80 md:text-[1.25rem]">
          {destination.name}
        </h3>
        <p className="mt-2.5 line-clamp-2 font-[family-name:var(--font-manrope)] text-[0.9rem] leading-relaxed text-on-surface-variant">
          {destination.tagline}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="font-[family-name:var(--font-manrope)] text-[11px] tracking-[0.04em] text-on-surface-variant/70">
            {destination.distances.shillong} from Shillong
          </p>
          <span className="font-[family-name:var(--font-manrope)] text-[12px] font-medium tracking-[0.04em] text-primary transition group-hover:translate-x-0.5">
            Explore →
          </span>
        </div>
      </div>
    </Link>
  );
}
