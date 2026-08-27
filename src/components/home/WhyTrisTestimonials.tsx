"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { media } from "@/data/media";

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

export function WhyTrisTestimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-testimonial-card]");
    const gap = 24;
    const amount = (card?.offsetWidth ?? 320) + gap;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="home-snap-section relative flex min-h-[100svh] flex-col justify-center bg-surface py-16 md:py-20">
      <div className="mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,5vw,3.75rem)] leading-none text-primary">
            Why TRIS
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:text-base">
            Testimonials from travellers who&apos;ve experienced Meghalaya with us
          </p>
        </div>

        <div className="relative mt-12 md:mt-14">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {TESTIMONIALS.map((item, i) => (
              <article
                key={item.name}
                data-testimonial-card
                className={cn(
                  "flex w-[min(85vw,22rem)] shrink-0 snap-start flex-col rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-7 shadow-[0_10px_32px_rgba(54,64,55,0.07)] sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3rem)/3)]",
                  i % 3 === 1 && "md:rotate-[0.35deg]",
                  i % 3 === 2 && "md:-rotate-[0.3deg]",
                )}
              >
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-playfair)] text-5xl leading-none text-highlight/80 select-none"
                >
                  “
                </span>
                <p className="mt-3 flex-1 font-[family-name:var(--font-playfair)] text-[1.05rem] leading-relaxed text-on-surface italic md:text-[1.1rem]">
                  {item.quote}
                </p>
                <div className="mt-8 flex items-center gap-3">
                  <span className="relative h-11 w-11 overflow-hidden rounded-full bg-secondary-container">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="44px" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-primary">{item.name}</span>
                    <span className="block text-xs text-on-surface-variant">{item.place}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 text-primary transition hover:bg-primary hover:text-on-primary"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next testimonials"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/25 text-primary transition hover:bg-primary hover:text-on-primary"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
