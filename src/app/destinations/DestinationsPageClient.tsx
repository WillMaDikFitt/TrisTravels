"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  destinations,
  destinationRegions,
  type DestinationRegion,
} from "@/data/destinations";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { DestinationCard } from "@/components/listings/DestinationCard";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";

const filters: Array<"All" | DestinationRegion> = ["All", ...destinationRegions.filter((r) =>
  destinations.some((d) => d.region === r),
)];

export function DestinationsPageClient() {
  const [region, setRegion] = useState<"All" | DestinationRegion>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return destinations.filter((d) => {
      if (region !== "All" && d.region !== region) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [region, query]);

  return (
    <div className="bg-background">
      <PageHero
        src={media.mountains}
        alt="Meghalaya hills and valleys"
        compact
        eyebrow="Destinations"
        title="Handpicked places beyond the guidebook"
        body="Find a region, pick a place, then open experiences or craft a route around it."
        primaryCta={{ href: "#places", label: "Browse places" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Plan a route" }}
      />

      <section
        id="places"
        className="scroll-mt-header border-b border-outline-variant/20 bg-surface"
      >
        <div className="mx-auto max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="label-caps text-primary">Browse</p>
              <h2 className="mt-2 font-display text-2xl text-secondary md:text-3xl">
                {filtered.length} {filtered.length === 1 ? "place" : "places"}
                {region !== "All" ? ` in ${region}` : ""}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
                Filter by hills region or search by name — each card shows distance from Shillong.
              </p>
            </div>

            <label className="relative w-full max-w-sm">
              <span className="sr-only">Search destinations</span>
              <Search
                size={16}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Mawlynnong, Dawki…"
                className="w-full rounded-full border border-outline-variant/35 bg-surface-container-low py-2.5 pr-4 pl-10 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filters.map((f) => {
              const active = region === f;
              const count =
                f === "All"
                  ? destinations.length
                  : destinations.filter((d) => d.region === f).length;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRegion(f)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition",
                    active
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant/40 text-on-surface-variant hover:border-primary/50 hover:text-secondary",
                  )}
                >
                  {f}
                  <span className={cn("ml-1.5 tabular-nums", active ? "opacity-80" : "opacity-60")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        <div className="mx-auto max-w-container-max">
          {filtered.length > 0 ? (
            <StaggerChildren className="grid gap-4 md:gap-5">
              {filtered.map((d) => (
                <StaggerItem key={d.slug}>
                  <DestinationCard destination={d} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-low px-6 py-16 text-center">
              <p className="font-display text-xl text-secondary">No places match</p>
              <p className="mt-2 text-sm text-on-surface-variant">
                Try another region or clear your search.
              </p>
              <button
                type="button"
                className="mt-6 text-sm text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  setRegion("All");
                  setQuery("");
                }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      <FullBleedParallax
        src={media.heroMist}
        alt="Mist over Meghalaya"
        eyebrow="Next step"
        title="Turn a place into a day — or a full journey"
        body="Book short experiences, join a departure, or craft an itinerary around the hills that call you."
        cta={{ href: "/experiences", label: "Browse experiences" }}
        height="md"
        align="center"
      />

      <BreathSection
        size="md"
        eyebrow="Need a route?"
        title="We’ll shape dates, stays, and rides around these places"
        cta={{ href: "/craft-my-journey", label: "Craft My Journey" }}
      />
    </div>
  );
}
