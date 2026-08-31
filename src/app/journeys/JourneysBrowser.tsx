"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarCheck2,
  HandHeart,
  HeartHandshake,
  MapPinned,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Journey } from "@/data/journeys";
import { JourneyCard } from "@/components/listings/JourneyCard";
import { FilterPills, ListingShell } from "@/components/listings/ListingShell";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";
import { CURATED_ONLINE_BOOK_DAYS } from "@/data/journey-options";
import { FIXED_LISTING_INTRO } from "@/data/fixed-departures";
import { cn } from "@/lib/utils";

const FIXED_WHY_ICONS: Record<string, LucideIcon> = {
  calendar: CalendarCheck2,
  users: Users,
  value: HandHeart,
  local: MapPinned,
  sisterhood: HeartHandshake,
  relax: Sparkles,
};

type JourneyType = "curated" | "small-group";
type DurationFilter = "short" | "mid" | "long";

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

  const isCurated = type === "curated";
  const isFixed = type === "small-group";
  const title = isCurated
    ? "Curated journeys"
    : isFixed
      ? FIXED_LISTING_INTRO.title
      : "Multi-day routes";
  const description = isCurated
    ? undefined
    : isFixed
      ? undefined
      : "Curated packages and fixed departures — filter by style and length.";

  return (
    <>
      <ListingShell
        eyebrow={isFixed ? FIXED_LISTING_INTRO.eyebrow : "Journeys"}
        title={title}
        description={description}
        titleClassName={
          isFixed
            ? "text-4xl leading-[1.08] text-balance md:text-5xl lg:text-[3.25rem]"
            : undefined
        }
        introClassName={isFixed ? "mt-6" : undefined}
        contentClassName={isFixed ? "mt-12 md:mt-14" : undefined}
        intro={
          isCurated ? (
            <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              <p>Shape dates, stays and pace with a planner — filter by style and length.</p>
              <p className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-foreground">
                <span className="font-semibold text-primary">{CURATED_ONLINE_BOOK_DAYS}+ days ahead:</span>{" "}
                Book online
                <span className="mx-2 text-outline">|</span>
                <span className="font-semibold text-primary">Within {CURATED_ONLINE_BOOK_DAYS} days:</span>{" "}
                Enquire or customise
              </p>
            </div>
          ) : isFixed ? (
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start">
              <div className="lg:col-span-5">
                <p className="text-base leading-relaxed text-on-surface-variant md:text-lg md:leading-relaxed">
                  {FIXED_LISTING_INTRO.lead}
                </p>
                <div className="mt-5 space-y-3 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
                  {FIXED_LISTING_INTRO.body.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                <p className="mt-6 font-[family-name:var(--font-playfair)] text-xl italic text-primary md:text-2xl">
                  Just show up with your curiosity —
                  <br />
                  we&apos;ll handle the rest.
                </p>
              </div>

              <div className="border-t border-outline-variant/35 pt-8 lg:col-span-7 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
                <p className="label-caps text-highlight">{FIXED_LISTING_INTRO.whyTitle}</p>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
                  {FIXED_LISTING_INTRO.why.map((item) => {
                    const Icon = FIXED_WHY_ICONS[item.icon] ?? Sparkles;
                    return (
                      <li key={item.title} className="flex gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight/15 text-highlight">
                          <Icon size={18} strokeWidth={1.75} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-[family-name:var(--font-playfair)] text-lg leading-snug text-primary">
                            {item.title}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                            {item.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : null
        }
        sidebar={
          <div className="space-y-5">
            <p className="label-caps text-highlight">Filters</p>
            <div className={cn(isCurated && "lg:space-y-4")}>
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
            </div>
            {(activeStyle || duration) && (
              <button
                type="button"
                className="text-xs text-highlight underline-offset-2 hover:underline"
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
              ? "grid items-stretch gap-6 sm:grid-cols-2"
              : "grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3"
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
        tone="light"
        eyebrow="Neither quite fits?"
        title="Craft my journey"
        body="Send a short brief — dates, guests, and what draws you. We’ll design the route."
        primary={{ href: "/craft-my-journey", label: "Start a brief" }}
        secondary={{ href: "/experiences", label: "Browse days" }}
      />
    </>
  );
}
