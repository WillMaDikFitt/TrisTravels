import Image from "next/image";
import { HandHeart, Heart, Home, Leaf, Users } from "lucide-react";
import { media } from "@/data/media";
import type { ImpactStat } from "@/lib/types";
import { cn } from "@/lib/utils";

const serif = "font-[family-name:var(--font-playfair)]";

const IMPACT_ICONS = [Users, Leaf, Home, Users, HandHeart] as const;

/** "Our impact" stats, shared by the About page and the homepage. Numbers come from Studio → Settings. */
export function ImpactSection({
  impact,
  className,
  compact = false,
  backgroundImage,
}: {
  impact: ImpactStat[];
  className?: string;
  /** Tighter layout so values + impact can sit in one About-page viewport. */
  compact?: boolean;
  /** Optional Studio / Drive still (folder name: The Impact). */
  backgroundImage?: string;
}) {
  if (!impact.length) return null;

  const Tag = compact ? "div" : "section";
  const bg = backgroundImage?.trim() || media.theImpact;

  return (
    <Tag
      className={cn(
        "relative overflow-hidden",
        compact
          ? "mt-12 w-full md:mt-16"
          : "border-t border-outline-variant/25 px-margin-mobile py-16 md:px-margin-desktop md:py-20",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src={bg}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-surface/55" />
      </div>
      <div
        className={cn(
          "relative mx-auto w-full max-w-container-max text-center",
          compact && "flex min-h-[min(70vh,40rem)] flex-col justify-center px-margin-mobile py-24 md:min-h-[min(78vh,46rem)] md:px-margin-desktop md:py-36",
        )}
      >
        {compact ? null : <p className="label-caps text-highlight">Our impact</p>}
        <h2
          className={cn(
            serif,
            "leading-tight font-medium text-primary",
            compact
              ? "text-[clamp(1.7rem,2.6vw,2.25rem)]"
              : "mt-3 text-[clamp(1.9rem,3.5vw,2.75rem)]",
          )}
        >
          The impact you make.
        </h2>
        {compact ? null : (
          <>
            <Leaf aria-hidden className="mx-auto mt-4 h-5 w-5 text-highlight" strokeWidth={1.5} />
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant md:text-base">
              Every journey creates ripples beyond the traveller.
            </p>
          </>
        )}

        <dl
          className={cn(
            "grid sm:grid-cols-2 lg:grid-cols-5",
            compact ? "mt-8 gap-3" : "mt-12 gap-4",
          )}
        >
          {impact.map((stat, index) => {
            const Icon = IMPACT_ICONS[index % IMPACT_ICONS.length];
            return (
              <div
                key={stat.id}
                className={cn(
                  "rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/92 shadow-[0_8px_24px_rgba(54,64,55,0.04)] backdrop-blur-[2px]",
                  compact ? "px-3.5 py-7" : "px-4 py-7",
                )}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <Icon
                    aria-hidden
                    className={cn("mx-auto text-highlight", compact ? "h-[18px] w-[18px]" : "h-5 w-5")}
                    strokeWidth={1.5}
                  />
                  <p
                    className={cn(
                      serif,
                      "leading-none text-primary",
                      compact ? "mt-2 text-[1.75rem] md:text-[1.9rem]" : "mt-3 text-[2rem] md:text-[2.25rem]",
                    )}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={cn(
                      "font-semibold text-highlight",
                      compact
                        ? "mt-2 text-sm leading-snug"
                        : "mt-3 text-[0.7rem] leading-snug font-bold tracking-[0.14em] uppercase",
                    )}
                  >
                    {stat.label}
                  </p>
                </dd>
              </div>
            );
          })}
        </dl>

        {compact ? null : (
          <div className="mt-12 flex flex-col items-center gap-2">
            <Heart aria-hidden className="h-5 w-5 text-highlight" strokeWidth={1.5} />
            <p className={cn(serif, "text-base text-primary italic md:text-lg")}>
              When we grow, we grow together.
            </p>
          </div>
        )}
      </div>
    </Tag>
  );
}
