"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { media } from "@/data/media";
import type { Testimonial } from "@/data/testimonials";

const OWNER_QUOTE = {
  lead: "Travel is personal.",
  support: "And the best journeys stay with you long after you return home.",
};

/** Keep in sync with images.remotePatterns in next.config.ts. */
const OPTIMIZED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "lh3.googleusercontent.com",
  "static.wixstatic.com",
  "res.cloudinary.com",
];

/**
 * Studio lets staff paste any image link; next/image rejects hosts outside the config,
 * so those avatars load as-is instead of breaking the homepage.
 */
function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return OPTIMIZED_IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((part) => part && !part.endsWith("."))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Testimonials are managed in Studio → Testimonials. */
export function WhyTrisTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-testimonial-card]");
    const gap = 20;
    const amount = (card?.offsetWidth ?? 280) + gap;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="home-snap-section relative h-[100svh] max-h-[100svh] w-full overflow-hidden">
      {/* Soft off-white + visible faded landscape (not a heavy cream wash) */}
      <div className="absolute inset-0 bg-[#f7f5f1]">
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: [
              "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
            ].join(", "),
            maskImage: [
              "linear-gradient(to right, transparent 0%, #000 12%, #000 88%, transparent 100%)",
              "linear-gradient(to bottom, transparent 0%, #000 10%, #000 90%, transparent 100%)",
            ].join(", "),
            WebkitMaskComposite: "source-in",
            maskComposite: "intersect",
          }}
        >
          <Image
            src={media.whyTrisBg}
            alt=""
            fill
            className="object-cover object-center opacity-[0.52]"
            sizes="100vw"
            quality={90}
            priority={false}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-container-max flex-col items-center justify-center gap-4 px-margin-mobile py-5 md:gap-5 md:px-margin-desktop md:py-7">
        <header className="w-full shrink-0 text-center">
          <p className={cn("label-caps text-primary/80", textGlow)}>Travellers</p>
          <h2
            className={cn(
              "mt-2 font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3rem)] leading-tight text-primary",
              textGlow,
            )}
          >
            Why TRIS
          </h2>
          <p
            className={cn(
              "mx-auto mt-2 max-w-lg text-sm leading-relaxed text-primary/80 md:text-[15px]",
              textGlow,
            )}
          >
            Notes from travellers who&apos;ve experienced Meghalaya with us
          </p>
        </header>

        {testimonials.length ? (
          <div className="w-full shrink-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-surface-container-lowest/55 uppercase">
                From our travellers
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollByCard(-1)}
                  aria-label="Previous testimonials"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-container-lowest/30 text-surface-container-lowest transition hover:border-surface-container-lowest hover:bg-surface-container-lowest/10"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByCard(1)}
                  aria-label="Next testimonials"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-container-lowest/30 text-surface-container-lowest transition hover:border-surface-container-lowest hover:bg-surface-container-lowest/10"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((item, i) => (
                <article
                  key={item.id}
                  data-testimonial-card
                  className={cn(
                    "flex w-[min(76vw,17.5rem)] shrink-0 snap-start flex-col rounded-xl border border-outline-variant/20 bg-surface-container-lowest/95 p-3.5 shadow-[0_8px_22px_rgba(54,64,55,0.14)] backdrop-blur-[2px] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]",
                    i % 3 === 1 && "md:rotate-[0.25deg]",
                    i % 3 === 2 && "md:-rotate-[0.2deg]",
                  )}
                >
                  <p className="line-clamp-3 flex-1 font-[family-name:var(--font-playfair)] text-[0.88rem] leading-relaxed text-on-surface italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary-container text-[10px] font-semibold text-primary">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="32px"
                          unoptimized={!canOptimize(item.image)}
                        />
                      ) : (
                        initials(item.name)
                      )}
                    </span>
                    <span>
                      <span className="block text-xs font-semibold text-primary">{item.name}</span>
                      {item.place ? (
                        <span className="block text-[10px] text-on-surface-variant">{item.place}</span>
                      ) : null}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
