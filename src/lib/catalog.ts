import type { ExperienceCategory } from "@/data/experiences";

export const EXPERIENCE_CATEGORIES: {
  id: ExperienceCategory;
  slug: string;
  blurb: string;
}[] = [
  { id: "Adventure", slug: "adventure", blurb: "Treks, caves, and active days outdoors." },
  { id: "Nature & Wildlife", slug: "nature-wildlife", blurb: "Forests, rivers, and living landscapes." },
  { id: "Culture & Heritage", slug: "culture-heritage", blurb: "Villages, sacred groves, and local life." },
  { id: "Food & Local Life", slug: "food-local-life", blurb: "Kitchens, markets, and shared tables." },
  { id: "Wellness", slug: "wellness", blurb: "Slow days, mist, and quiet recovery." },
  { id: "Creative Experiences", slug: "creative", blurb: "Craft, photography, and making." },
];

export function categoryFromSlug(slug: string): ExperienceCategory | undefined {
  return EXPERIENCE_CATEGORIES.find((c) => c.slug === slug)?.id;
}

export function slugFromCategory(id: ExperienceCategory): string {
  return EXPERIENCE_CATEGORIES.find((c) => c.id === id)?.slug ?? "adventure";
}

export const DEFAULT_SLOTS = ["08:30", "09:00", "10:00"];

export const DEFAULT_SETTINGS = {
  minAdvanceDays: 10,
  holdMinutes: 30,
  serviceFeePercent: 5,
  gstPercent: 18,
};

export function dateIsClosed(
  date: string,
  closures: { dates?: string[]; weekdays?: number[] }[],
) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return closures.some((c) => c.dates?.includes(date) || c.weekdays?.includes(weekday));
}
