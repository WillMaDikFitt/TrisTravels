import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import type { Experience } from "@/data/experiences";
import { formatINR, cn } from "@/lib/utils";
import { WishlistButton } from "./WishlistButton";

type Props = {
  experience: Experience;
  className?: string;
  variant?: "tile" | "feature" | "row";
};

export function ExperienceCard({ experience, className, variant = "tile" }: Props) {
  return (
    <Link
      href={`/experiences/${experience.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-[1.5rem]",
        variant === "feature" && "min-h-[28rem] md:min-h-[32rem]",
        variant === "tile" && "aspect-[4/5] w-full",
        variant === "row" && "min-h-[14rem]",
        className,
      )}
    >
      <Image
        src={experience.image}
        alt={experience.name}
        fill
        className="object-cover transition duration-700 ease-out group-hover:scale-105"
        sizes={
          variant === "feature"
            ? "(max-width:1024px) 100vw, 50vw"
            : "(max-width:640px) 50vw, 25vw"
        }
        quality={75}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      <div className="absolute top-3 right-3 left-3 flex items-start justify-between gap-2">
        <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] text-on-accent uppercase">
          {experience.category}
        </span>
        <div className="flex items-center gap-1.5">
          {(experience.communityLed || experience.sustainabilityFocus) && (
            <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-bold tracking-[0.1em] text-white uppercase backdrop-blur-sm">
              {experience.communityLed ? "Community" : "Gives back"}
            </span>
          )}
          <WishlistButton slug={experience.slug} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="mb-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-white/75">
          <span className="inline-flex items-center gap-1">
            <MapPin size={10} />
            <span className="line-clamp-1">{experience.location}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={10} />
            {experience.duration}
          </span>
        </div>
        <h3
          className={cn(
            "line-clamp-2 font-display leading-snug text-white",
            variant === "feature" ? "text-3xl md:text-4xl" : "text-lg md:text-xl",
          )}
        >
          {experience.name}
        </h3>
        {variant === "feature" && (
          <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/75">{experience.tagline}</p>
        )}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] tracking-wider text-white/60 uppercase">From</p>
            <p className="font-display text-base text-white md:text-lg">{formatINR(experience.priceFrom)}</p>
          </div>
          <span className="text-[9px] font-bold tracking-[0.12em] text-accent uppercase">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
