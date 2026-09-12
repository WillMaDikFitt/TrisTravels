import { media } from "./media";

/** Traveller quote in the homepage "Why TRIS" carousel (Studio → Testimonials). */
export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  place: string;
  /** Avatar photo; initials are shown when blank. */
  image: string;
  active?: boolean;
  sortOrder?: number;
};

/** Seeded with the copy that used to be hard-coded in the homepage section. */
export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-rahul",
    quote:
      "TRIS showed us a side of Meghalaya we never knew existed. Everything was so well planned yet felt so personal.",
    name: "Rahul Mehta",
    place: "Bangalore",
    image: media.portrait,
    active: true,
    sortOrder: 1,
  },
  {
    id: "t-neha",
    quote:
      "The warmth of the people, the stunning landscapes and the attention to detail – unforgettable from start to finish.",
    name: "Neha Iyer",
    place: "Chennai",
    image: media.aboutPortrait,
    active: true,
    sortOrder: 2,
  },
  {
    id: "t-arjun",
    quote:
      "Traveling with TRIS felt like traveling with friends who truly care about the places and communities.",
    name: "Arjun Das",
    place: "Kolkata",
    image: media.valueCommunity,
    active: true,
    sortOrder: 3,
  },
  {
    id: "t-suresh",
    quote:
      "Wholesome service from planning to the end of the trip. Recommend TRIS to anyone new to the North East.",
    name: "Dr. Suresh Kumar",
    place: "Chennai",
    image: media.familyWaterfall,
    active: true,
    sortOrder: 4,
  },
  {
    id: "t-priya",
    quote:
      "It felt less like a tour and more like being welcomed home — the hosts, the meals, the quiet trails.",
    name: "Priya Nair",
    place: "Kochi",
    image: media.kitchen,
    active: true,
    sortOrder: 5,
  },
  {
    id: "t-ananya",
    quote:
      "Every day had space to breathe. Thoughtful pacing, local guides, and moments we still talk about.",
    name: "Ananya Bose",
    place: "Mumbai",
    image: media.heroMist,
    active: true,
    sortOrder: 6,
  },
];

export function blankTestimonial(index = 0): Testimonial {
  return {
    id: `t-${Date.now().toString(36)}-${index}`,
    quote: "",
    name: "",
    place: "",
    image: "",
    active: true,
    sortOrder: index + 1,
  };
}

export function normalizeTestimonials(
  rows: Testimonial[] | null | undefined,
  fallback: Testimonial[],
): Testimonial[] {
  if (!rows?.length) return fallback.map((item) => ({ ...item }));
  return rows
    .map((row, index) => ({
      id: String(row.id || `t-${index}`),
      quote: String(row.quote || "").trim(),
      name: String(row.name || "").trim(),
      place: String(row.place || "").trim(),
      image: String(row.image || "").trim(),
      active: row.active !== false,
      sortOrder: Number.isFinite(row.sortOrder) ? Number(row.sortOrder) : index + 1,
    }))
    .filter((row) => row.quote && row.name)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function activeTestimonials(
  rows: Testimonial[] | null | undefined,
  fallback: Testimonial[],
): Testimonial[] {
  return normalizeTestimonials(rows, fallback).filter((row) => row.active !== false);
}
