"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  destinationRegions,
  type Destination,
  type DestinationRegion,
} from "@/data/destinations";
import { CtaBand } from "@/components/ui/CtaBand";
import { DestinationCard } from "@/components/listings/DestinationCard";
import { FilterPills, ListingShell } from "@/components/listings/ListingShell";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";

export function DestinationsPageClient({ items }: { items: Destination[] }) {
  const [region, setRegion] = useState<DestinationRegion | null>(null);
  const [query, setQuery] = useState("");

  const filters = destinationRegions.filter((r) => items.some((d) => d.region === r));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((d) => {
      if (region && d.region !== region) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.tagline.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.highlights.some((h) => h.toLowerCase().includes(q))
      );
    });
  }, [items, region, query]);

  return (
    <>
      <ListingShell
        eyebrow="Destinations"
        title="Places beyond the guidebook"
        description="Find a region, pick a place, then open experiences or craft a route around it."
        sidebar={
          <div className="space-y-6">
            <p className="label-caps text-accent">Filters</p>
            <label className="block">
              <span className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">Search</span>
              <span className="relative mt-3 block">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-on-surface-variant"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Mawlynnong, Dawki…"
                  className="w-full rounded-full border border-outline-variant/35 bg-surface-container-low py-2 pr-3 pl-9 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </span>
            </label>
            <FilterPills
              label="Region"
              value={region}
              onChange={(id) => setRegion(id as DestinationRegion | null)}
              options={[
                { id: "all", label: "All" },
                ...filters.map((r) => ({ id: r, label: r })),
              ]}
            />
            {(region || query) && (
              <button
                type="button"
                className="text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => {
                  setRegion(null);
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        }
      >
        {filtered.length > 0 ? (
          <StaggerChildren
            key={`${region ?? "all"}-${query.trim().toLowerCase()}`}
            mode="mount"
            className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((d) => (
              <StaggerItem key={d.slug} className="h-full">
                <DestinationCard destination={d} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        ) : (
          <div className="mt-6 rounded-2xl border border-outline-variant/25 bg-surface-container-low px-6 py-16 text-center">
            <p className="font-display text-xl text-secondary">No places match</p>
            <p className="mt-2 text-sm text-on-surface-variant">Try another region or clear your search.</p>
          </div>
        )}
      </ListingShell>
      <CtaBand
        eyebrow="Next step"
        title="Turn a place into a trip"
        body="Book a day nearby, join a departure, or send a brief and we’ll shape the week around these hills."
        primary={{ href: "/experiences", label: "Browse experiences" }}
        secondary={{ href: "/craft-my-journey", label: "Craft my journey" }}
      />
    </>
  );
}
