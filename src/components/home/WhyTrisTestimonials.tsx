"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { media } from "@/data/media";

const OWNER_QUOTE = {
  lead: "Travel is personal.",
  support: "And the best journeys stay with you long after you return home.",
};

const TESTIMONIALS = [
  {
    quote:
      "TRIS showed us a side of Meghalaya we never knew existed. Everything was so well planned yet felt so personal.",
    name: "Rahul Mehta",
    place: "Bangalore",
    image: media.portrait,
  },
  {
    quote:
      "The warmth of the people, the stunning landscapes and the attention to detail – unforgettable from start to finish.",
    name: "Neha Iyer",
    place: "Chennai",
    image: media.aboutPortrait,
  },
  {
    quote:
      "Traveling with TRIS felt like traveling with friends who truly care about the places and communities.",
    name: "Arjun Das",
    place: "Kolkata",
    image: media.valueCommunity,
  },
  {
    quote:
      "Wholesome service from planning to the end of the trip. Recommend TRIS to anyone new to the North East.",
    name: "Dr. Suresh Kumar",
    place: "Chennai",
    image: media.familyWaterfall,
  },
  {
    quote:
      "It felt less like a tour and more like being welcomed home — the hosts, the meals, the quiet trails.",
    name: "Priya Nair",
    place: "Kochi",
    image: media.kitchen,
  },
  {
    quote:
      "Every day had space to breathe. Thoughtful pacing, local guides, and moments we still talk about.",
    name: "Ananya Bose",
    place: "Mumbai",
    image: media.heroMist,
  },
] as const;

const textGlow = "[text-shadow:0_1px_12px_rgba(255,255,255,0.9),0_0_28px_rgba(255,255,255,0.65)]";

export function WhyTrisTestimonials() {
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

        <div className="w-full shrink-0">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-5 [&::-webkit-scrollbar]:hidden"
          >
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                data-testimonial-card
                className="flex w-[min(78vw,18.5rem)] shrink-0 snap-start flex-col rounded-2xl border border-white/70 bg-white/92 p-5 shadow-[0_12px_32px_rgba(54,64,55,0.1)] backdrop-blur-sm sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
              >
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-playfair)] text-3xl leading-none text-primary/40"
                >
                  &ldquo;
                </span>
                <p className="mt-1 line-clamp-4 flex-1 font-[family-name:var(--font-playfair)] text-[0.95rem] leading-relaxed text-primary/90 italic">
                  {item.quote}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className="relative h-9 w-9 overflow-hidden rounded-full bg-secondary-container ring-1 ring-primary/10">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="36px" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-primary">{item.name}</span>
                    <span className="block text-xs text-on-surface-variant">{item.place}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous testimonials"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-white/85 text-primary shadow-sm backdrop-blur-sm transition hover:border-primary/50 hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next testimonials"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-white/85 text-primary shadow-sm backdrop-blur-sm transition hover:border-primary/50 hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="w-full shrink-0 text-center">
          <div className="mx-auto max-w-xl rounded-3xl bg-white/78 px-6 py-5 shadow-[0_8px_32px_rgba(54,64,55,0.08)] ring-1 ring-white/60 backdrop-blur-md">
            <Leaf
              aria-hidden
              size={16}
              strokeWidth={1.5}
              className="mx-auto text-primary/70"
            />
            <p className="mt-3 font-[family-name:var(--font-playfair)] text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-primary">
              {OWNER_QUOTE.lead}
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-primary/80 md:text-[15px]">
              {OWNER_QUOTE.support}
            </p>
            <Link
              href="/journeys"
              className={cn(
                "group mt-4 inline-flex items-center gap-2 border-b border-primary/55 pb-1",
                "text-[11px] font-bold tracking-[0.16em] text-primary uppercase transition",
                "hover:border-primary",
              )}
            >
              Explore our journeys
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
