import type { ExperienceCategory } from "@/data/experiences";

export const EXPERIENCE_CATEGORIES: {
  id: ExperienceCategory;
  slug: string;
  blurb: string;
}[] = [
  { id: "Adventure", slug: "adventure", blurb: "Treks, caves, and active days outdoors." },
  { id: "Nature", slug: "nature", blurb: "Forests, rivers, and living landscapes." },
  { id: "Wildlife", slug: "wildlife", blurb: "Sanctuaries, birds, and wild country." },
  { id: "Culture & Heritage", slug: "culture-heritage", blurb: "Villages, sacred groves, and local life." },
  { id: "Food & Local Life", slug: "food-local-life", blurb: "Kitchens, markets, and shared tables." },
  { id: "Wellness", slug: "wellness", blurb: "Slow days, mist, and quiet recovery." },
  { id: "Creative Experiences", slug: "creative", blurb: "Craft, photography, and making." },
];

export function categoryFromSlug(slug: string): ExperienceCategory | undefined {
  if (slug === "nature-wildlife") return "Nature";
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
  discountCodes: [] as {
    id: string;
    code: string;
    percent: number;
    active: boolean;
    note?: string;
  }[],
  impact: [
    {
      id: "partners",
      value: "100+",
      label: "Local Partners Empowered",
      description: "Local hosts, guides, drivers, and experience providers driving meaningful change.",
    },
    {
      id: "travellers",
      value: "200+",
      label: "Travellers Connected",
      description: "People who chose to travel deeper and connect with Meghalaya beyond the usual.",
    },
    {
      id: "stays",
      value: "50+",
      label: "Authentic Stays & Experiences Supported",
      description: "Homestays and local experiences that keep hospitality rooted in the community.",
    },
    {
      id: "guides",
      value: "20+",
      label: "Local Guides Onboarded",
      description: "Trained and supported local guides sharing stories, culture and hidden places.",
    },
    {
      id: "artisans",
      value: "10+",
      label: "Artisans Supported",
      description: "Local artisans and craftspeople whose skills and traditions are kept alive through travel.",
    },
  ],
};

export function dateIsClosed(
  date: string,
  closures: { dates?: string[]; weekdays?: number[]; slots?: string[] }[],
  slot?: string,
) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  return closures.some((closure) => {
    const appliesToDate =
      closure.dates?.includes(date) || closure.weekdays?.includes(weekday);
    if (!appliesToDate) return false;
    if (!closure.slots?.length) return true;
    return slot ? closure.slots.includes(slot) : false;
  });
}
