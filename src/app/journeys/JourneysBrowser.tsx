"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Journey } from "@/data/journeys";
import { JourneyCard } from "@/components/listings/JourneyCard";
import { FilterPills, ListingShell } from "@/components/listings/ListingShell";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";

type JourneyType = "curated" | "small-group";
type DurationFilter = "short" | "mid" | "long";

/** Style tags that mean the same thing across journey records. */
const STYLE_ALIASES: Record<string, string> = {
  "family-friendly": "Family",
  family: "Family",
  "gentle pace": "Relaxed",
  slow: "Relaxed",
  balanced: "Relaxed",
  comfort: "Relaxed",
  roots: "Root bridges",
  trek: "Trekking",
};

function styleTagsOf(journey: Journey) {
  const raw = Array.isArray(journey.style) ? journey.style : [];
  const normalised = raw.map((tag) => STYLE_ALIASES[tag.trim().toLowerCase()] ?? tag.trim());
  return Array.from(new Set(normalised.filter(Boolean)));
}

function durationOf(days: number): DurationFilter {
  if (days <= 3) return "short";
  if (days <= 6) return "mid";
  return "long";
}

export function JourneysBrowser({ journeys }: { journeys: Journey[] }) {
  const search = useSearchParams();
  const typeParam = search.get("type");
  const type: JourneyType | null =
    typeParam === "curated" || typeParam === "small-group" ? typeParam : null;
  const [style, setStyle] = useState<string | null>(null);
  const [duration, setDuration] = useState<DurationFilter | null>(null);

  useEffect(() => {
    setStyle(null);
    setDuration(null);
  }, [type]);

  const inType = useMemo(
    () => journeys.filter((journey) => !type || journey.type === type),
    [journeys, type],
  );

  const styleOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const journey of inType) {
      for (const tag of styleTagsOf(journey)) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [inType]);

  const activeStyle = style && styleOptions.includes(style) ? style : null;

  const filtered = useMemo(() => {
    return inType.filter((journey) => {
      if (activeStyle && !styleTagsOf(journey).includes(activeStyle)) return false;
      if (duration && durationOf(journey.days) !== duration) return false;
      return true;
    });
  }, [inType, activeStyle, duration]);

  const title =
    type === "curated" ? "Curated journeys" : type === "small-group" ? "Fixed journeys" : "Multi-day routes";
  const description =
    type === "curated"
      ? "Shape dates, stays, and pace with a planner — filter by style and length."
      : type === "small-group"
        ? "Join a set departure — filter by style and length."
        : "Curated packages and fixed departures — filter by style and length.";
  const typeLabel = type === "curated" ? " · Curated" : type === "small-group" ? " · Fixed" : "";
  const styleLabel = activeStyle ? ` · ${activeStyle}` : "";

  return (
    <>
      <ListingShell
        eyebrow="Journeys"
        title={title}
        description={description}
        countLabel={`${filtered.length} ${filtered.length === 1 ? "journey" : "journeys"}${typeLabel}${styleLabel}`}
        sidebar={
          <div className="space-y-6">
            <p className="label-caps text-accent">Filters</p>
            {styleOptions.length > 0 && (
              <FilterPills
                label="Style"
                value={activeStyle}
                onChange={setStyle}
                options={[
                  { id: "all", label: "All" },
                  ...styleOptions.map((tag) => ({ id: tag, label: tag })),
                ]}
              />
            )}
            <FilterPills
              label="Duration"
              value={duration}
              onChange={(id) => setDuration(id as DurationFilter | null)}
              options={[
                { id: "all", label: "All" },
                { id: "short", label: "1–3 days" },
                { id: "mid", label: "4–6 days" },
                { id: "long", label: "7+ days" },
              ]}
            />
            {(activeStyle || duration) && (
              <button
                type="button"
                className="text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => {
                  setStyle(null);
                  setDuration(null);
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        }
      >
        <StaggerChildren
          key={`${type ?? "all"}-${activeStyle ?? "all"}-${duration ?? "all"}`}
          mode="mount"
          className={
            type === "curated"
              ? "mt-6 grid items-stretch gap-6 sm:grid-cols-2"
              : "mt-6 grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
          }
        >
          {filtered.map((journey) => (
            <StaggerItem key={journey.slug}>
              <JourneyCard journey={journey} variant="tile" />
            </StaggerItem>
          ))}
        </StaggerChildren>
        {!filtered.length && (
          <p className="py-16 text-center text-on-surface-variant">No journeys match these filters.</p>
        )}
      </ListingShell>
      <CtaBand
        eyebrow="Neither quite fits?"
        title="Craft my journey"
        body="Send a short brief — dates, guests, and what draws you. We’ll design the route."
        primary={{ href: "/craft-my-journey", label: "Start a brief" }}
        secondary={{ href: "/experiences", label: "Browse days" }}
      />
    </>
  );
}
