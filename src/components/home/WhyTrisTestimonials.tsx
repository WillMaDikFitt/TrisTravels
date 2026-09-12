"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { media } from "@/data/media";
import type { Testimonial } from "@/data/testimonials";

const OWNER_QUOTE = {
  lines: [
    "Travel is personal.",
    "And the best journeys stay with you long after you return home",
  ],
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
    const gap = 16;
    const amount = (card?.offsetWidth ?? 280) + gap;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="home-snap-section relative h-[100svh] max-h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-primary-container">
        <Image
          src={media.whyTrisBg}
          alt=""
          fill
          className="scale-[1.12] object-cover object-[center_22%]"
          sizes="100vw"
          quality={90}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary-container/42" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(54,64,55,0.35) 0%, rgba(54,64,55,0.2) 45%, rgba(54,64,55,0.55) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-container-max flex-col items-center justify-center gap-5 px-margin-mobile py-6 md:gap-7 md:px-margin-desktop md:py-8">
        <div className="w-full shrink-0 text-center">
          <div className="ink-rule mx-auto bg-surface-container-lowest/40" />
          <p className="label-caps mt-2 text-surface-container-lowest/70">Travellers</p>
          <h2 className="mt-1.5 font-[family-name:var(--font-playfair)] text-[clamp(1.9rem,3.6vw,2.85rem)] leading-tight text-surface-container-lowest">
            Why TRIS
          </h2>
          <blockquote className="mx-auto mt-3 max-w-2xl font-[family-name:var(--font-playfair)] text-[clamp(1rem,1.9vw,1.45rem)] leading-snug text-surface-container-lowest/92 italic">
            {OWNER_QUOTE.lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </blockquote>
          <Link
            href="/journeys"
            className="group mt-4 inline-flex items-center gap-2.5 rounded-lg bg-surface-container-lowest px-6 py-3 text-xs font-bold tracking-[0.16em] text-primary uppercase shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-surface-container-lowest/92 hover:shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          >
            Explore our journeys
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>

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
