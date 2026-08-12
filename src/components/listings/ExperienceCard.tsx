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
        "group relative block overflow-hidden rounded-[1.75rem]",
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
            : "(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
        }
        quality={75}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

      <div className="absolute top-4 right-4 left-4 flex items-start justify-between gap-2">
        <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-on-accent uppercase">
          {experience.category}
        </span>
        <div className="flex items-center gap-2">
          {(experience.communityLed || experience.sustainabilityFocus) && (
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-bold tracking-[0.1em] text-white uppercase backdrop-blur-sm">
              {experience.communityLed ? "Community" : "Gives back"}
            </span>
          )}
          <WishlistButton slug={experience.slug} />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/75">
          <span className="inline-flex items-center gap-1">
            <MapPin size={11} />
            {experience.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={11} />
            {experience.duration}
          </span>
        </div>
        <h3
          className={cn(
            "font-display leading-snug text-white",
            variant === "feature" ? "text-3xl md:text-4xl" : "text-xl md:text-2xl",
          )}
        >
          {experience.name}
        </h3>
        {variant === "feature" && (
          <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/75">{experience.tagline}</p>
        )}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-wider text-white/60 uppercase">From</p>
            <p className="font-display text-lg text-white">{formatINR(experience.priceFrom)}</p>
          </div>
          <span className="text-[10px] font-bold tracking-[0.12em] text-accent uppercase">
            View & book
          </span>
        </div>
      </div>
    </Link>
  );
}
