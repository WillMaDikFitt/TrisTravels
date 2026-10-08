import { media } from "./media";

/** One part of the About page story (Studio → Our story). */
export type StoryMoment = {
  id: string;
  /** Photo beside the text. */
  image: string;
  /** Describes the photo for screen readers and search engines. */
  alt: string;
  /** Larger italic opening line. Optional. */
  lead: string;
  /** The paragraph under the lead. */
  body: string;
  active?: boolean;
  sortOrder?: number;
};

/** Seeded with the copy that used to be hard-coded on the About page. */
export const DEFAULT_STORY_MOMENTS: StoryMoment[] = [
  {
    id: "story-mairang",
    image: media.kitchen,
    alt: "Hospitality by the fire in Meghalaya",
    lead: "Born in Mairang, Mei-ieid embodied true Khasi hospitality — generous, hard-working, and unconditionally caring.",
    body: "She never spoke the language of business, but she understood the importance of hospitality — welcoming every guest with an open heart and genuine care.",
    active: true,
    sortOrder: 1,
  },
  {
    id: "story-homestay",
    image: media.craft,
    alt: "Shared meals and local hospitality",
    lead: "",
    body: "TRIS is more than a name. It is a promise to carry her spirit forward — through every homestay, every meal, every guide, and every journey we craft for you.",
    active: true,
    sortOrder: 2,
  },
  {
    id: "story-immersive",
    image: media.heroRoots,
    alt: "Travellers on a living root bridge trail",
    lead: "At TRIS Travels, we create immersive journeys that go beyond sightseeing.",
    body: "While conventional tours can rush you through places, we believe in slowing travel down so you can connect more deeply with the people, culture, and landscapes of Meghalaya.",
    active: true,
    sortOrder: 3,
  },
];

export function blankStoryMoment(index = 0): StoryMoment {
  return {
    id: `story-${Date.now().toString(36)}-${index}`,
    image: "",
    alt: "",
    lead: "",
    body: "",
    active: true,
    sortOrder: index + 1,
  };
}

export function normalizeStoryMoments(
  rows: StoryMoment[] | null | undefined,
  fallback: StoryMoment[],
): StoryMoment[] {
  if (!rows?.length) return fallback.map((row) => ({ ...row }));
  return rows
    .map((row, index) => ({
      id: String(row.id || `story-${index}`),
      image: String(row.image || "").trim(),
      alt: String(row.alt || "").trim(),
      lead: String(row.lead || "").trim(),
      body: String(row.body || "").trim(),
      active: row.active !== false,
      sortOrder: Number.isFinite(row.sortOrder)
        ? Number(row.sortOrder)
        : index + 1,
    }))
    .filter((row) => row.body || row.lead)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function activeStoryMoments(
  rows: StoryMoment[] | null | undefined,
  fallback: StoryMoment[],
): StoryMoment[] {
  return normalizeStoryMoments(rows, fallback).filter(
    (row) => row.active !== false,
  );
}
