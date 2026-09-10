/** Safe defaults so Studio editors don't crash on sparse Firestore docs. */

import type { Experience } from "@/data/experiences";
import { normalizeExperienceCosting } from "@/data/experience-costing";
import type { Journey } from "@/data/journeys";
import type { Destination } from "@/data/destinations";
import type { Story } from "@/data/stories";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Recover title/description from sparse or legacy Studio rows. */
function normalizeExperienceItinerary(value: unknown): Experience["itinerary"] {
  return asArray<Record<string, unknown>>(value).map((raw) => {
    let title = asString(raw.title);
    let description = asString(raw.description) || asString(raw.summary);
    // Old “Time — Title — description” saves sometimes left description empty
    // and stuffed the body into title.
    if (!description && title.includes("—")) {
      const [head, ...rest] = title.split("—").map((part) => part.trim());
      title = head || title;
      description = rest.join(" — ").trim();
    }
    return {
      title,
      description,
      ...(asString(raw.time) ? { time: asString(raw.time) } : {}),
    };
  });
}

export function normalizeExperience(raw: Partial<Experience> | null | undefined, slug = ""): Experience {
  const row = (raw ?? {}) as Partial<Experience>;
  return {
    slug: asString(row.slug, slug),
    name: asString(row.name),
    tagline: asString(row.tagline),
    category: (row.category as Experience["category"]) || "Adventure",
    tags: asArray<string>(row.tags),
    location: asString(row.location),
    region: asString(row.region, "East Khasi Hills"),
    duration: asString(row.duration, "1 day"),
    durationHours: asNumber(row.durationHours, 8),
    difficulty: (row.difficulty as Experience["difficulty"]) || "Moderate",
    suitableFor: asArray<string>(row.suitableFor),
    bestSeason: asString(row.bestSeason, "Oct–Apr"),
    priceFrom: asNumber(row.priceFrom, 0),
    priceAdult: row.priceAdult != null ? asNumber(row.priceAdult, 0) : undefined,
    priceChild: row.priceChild != null ? asNumber(row.priceChild, 0) : undefined,
    costing: normalizeExperienceCosting(row.costing),
    maxGuests: asNumber(row.maxGuests, 10),
    minGuests: asNumber(row.minGuests, 1),
    slots: asArray<string>(row.slots),
    slotConfig: row.slotConfig ?? { mode: "fixed", times: ["08:30", "09:00", "10:00"] },
    transportMode: row.transportMode,
    transportAvailable: row.transportAvailable,
    transportPrice: row.transportPrice,
    transportNote: row.transportNote,
    transportVehicles: row.transportVehicles,
    offeredVehicleIds: asArray<string>(row.offeredVehicleIds),
    status: (row.status as Experience["status"]) || "draft",
    removedFromCatalogue: row.removedFromCatalogue === true,
    backendId: asString(row.backendId) || undefined,
    image: asString(row.image),
    gallery: asArray<string>(row.gallery),
    overview: asString(row.overview),
    trisStory: asString(row.trisStory),
    highlights: asArray<string>(row.highlights),
    included: asArray<string>(row.included),
    excluded: asArray<string>(row.excluded),
    whatToBring: asArray<string>(row.whatToBring),
    meetingPoint: asString(row.meetingPoint),
    itinerary: normalizeExperienceItinerary(row.itinerary),
    faqs: asArray(row.faqs),
    reviews: asArray(row.reviews),
    sortOrder: row.sortOrder,
    seo: row.seo,
    sourceUrl: row.sourceUrl,
  };
}

export function normalizeJourney(raw: Partial<Journey> | null | undefined, slug = ""): Journey {
  const row = (raw ?? {}) as Partial<Journey>;
  return {
    ...(row as Journey),
    slug: asString(row.slug, slug),
    name: asString(row.name),
    type: row.type === "small-group" ? "small-group" : "curated",
    tagline: asString(row.tagline),
    days: asNumber(row.days, 3),
    nights: asNumber(row.nights, 2),
    priceFrom: asNumber(row.priceFrom, 0),
    image: asString(row.image),
    gallery: asArray<string>(row.gallery),
    style: asArray(row.style),
    season: asString(row.season),
    overview: asString(row.overview),
    highlights: asArray<string>(row.highlights),
    experienceHighlights: asArray<string>(row.experienceHighlights),
    notSuitableFor: asArray<string>(row.notSuitableFor),
    itinerary: asArray(row.itinerary),
    stays: asArray<string>(row.stays),
    inclusions: asArray<string>(row.inclusions),
    exclusions: asArray<string>(row.exclusions),
    departures: asArray<string>(row.departures),
    departureSeats: asArray(row.departureSeats),
    offeredVehicleIds: asArray<string>(row.offeredVehicleIds),
    offeredStayStyleIds: asArray<string>(row.offeredStayStyleIds),
    status: (row.status as Journey["status"]) || "draft",
    removedFromCatalogue: row.removedFromCatalogue === true,
    backendId: asString(row.backendId) || undefined,
    sourceUrl: asString(row.sourceUrl),
  };
}

export function normalizeDestination(raw: Partial<Destination> | null | undefined, slug = ""): Destination {
  const row = (raw ?? {}) as Partial<Destination>;
  return {
    slug: asString(row.slug, slug),
    name: asString(row.name),
    region: (row.region as Destination["region"]) || "East Khasi Hills",
    tagline: asString(row.tagline),
    overview: asString(row.overview),
    highlights: asArray<string>(row.highlights),
    interestingFact: row.interestingFact,
    distances: row.distances ?? { shillong: "", guwahatiAirport: "", umroiAirport: "" },
    image: asString(row.image),
    gallery: asArray<string>(row.gallery),
    relatedExperienceSlugs: asArray<string>(row.relatedExperienceSlugs),
    relatedJourneySlugs: asArray<string>(row.relatedJourneySlugs),
    sourceUrl: asString(row.sourceUrl),
    status: row.status,
  };
}

export function normalizeStory(raw: Partial<Story> | null | undefined, slug = ""): Story {
  const row = (raw ?? {}) as Partial<Story>;
  return {
    slug: asString(row.slug, slug),
    title: asString(row.title),
    excerpt: asString(row.excerpt),
    author: asString(row.author),
    category: asString(row.category, "Guest"),
    date: asString(row.date),
    image: asString(row.image),
    body: asArray<string>(row.body),
    sourceUrl: row.sourceUrl,
    status: row.status,
  };
}
