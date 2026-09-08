import { media } from "./media";

/** Known stay style ids — Studio may add more as free-form strings. */
export type StayStyleId = "barefoot" | "signature" | "offbeat" | "luxury" | "flexible" | (string & {});

export type StayStyle = {
  id: string;
  label: string;
  short: string;
  bestFor: string;
  think: string;
  expect: string[];
  learnIntro: string;
  images: string[];
  /** Shown in curated Book now stay picker (barefoot / signature / offbeat by default). */
  offerOnBooking?: boolean;
  active?: boolean;
  sortOrder?: number;
};

/** @deprecated Alias for StayStyle — learn-more meta shape. */
export type StayStyleMeta = StayStyle;

/**
 * Built-in stay catalogue — same content as learn-more “Stay Type”.
 * Seeded into Studio → Stays on first open.
 */
export const DEFAULT_STAY_STYLES: StayStyle[] = [
  {
    id: "barefoot",
    label: "Barefoot Stays",
    short:
      "Comfortable, thoughtfully chosen stays that offer a genuine local experience while keeping your journey easy on the budget.",
    bestFor: "Budget travellers · Families · Explorers",
    think: "I want a good, authentic place to stay without paying for extra frills.",
    expect: [
      "Clean, safe and comfortable stays",
      "Genuine local character",
      "Essential comforts for a relaxed stay",
      "A practical choice for travellers who want to spend more on experiences",
    ],
    learnIntro:
      "Good value, thoughtfully chosen. Comfortable stays with genuine local character, selected for travellers who want a good place to stay while keeping more of their budget for experiences.",
    images: [media.kitchen, media.canopy, media.valueCommunity, media.craft, media.forest],
    offerOnBooking: true,
    active: true,
    sortOrder: 1,
  },
  {
    id: "signature",
    label: "Signature Stays",
    short:
      "Handpicked stays chosen for a memorable feature — heritage, a beautiful view, waterfall nearby, riverside setting or distinctive location.",
    bestFor: "Comfort seekers · Families · Couples",
    think: "I want a more comfortable stay with something special to remember.",
    expect: [
      "A higher level of comfort than our Barefoot stays",
      "Thoughtfully selected accommodation with character",
      "A memorable setting or defining feature",
      "A stay that adds something special to the journey",
    ],
    learnIntro:
      "More comfort. More character. Handpicked stays offering added comfort plus something memorable — boutique setting, heritage home, viewpoint, waterfall, riverside, or distinctive architecture.",
    images: [media.packages, media.aboutPortrait, media.familyWaterfall, media.heroMist, media.water],
    offerOnBooking: true,
    active: true,
    sortOrder: 2,
  },
  {
    id: "offbeat",
    label: "Offbeat Stays",
    short:
      "Thoughtfully chosen stays in quieter, less-busy locations — in a village, on the edge of a town or slightly outside main tourist areas.",
    bestFor: "Slow travellers · Nature lovers · Peace seekers",
    think: "I want to stay somewhere quieter, experience local life more closely, and enjoy a slower pace.",
    expect: [
      "Peaceful surroundings away from busy tourist areas",
      "Clean, safe stays with essential comforts",
      "A simple and authentic local experience",
      "More space and a slower pace",
      "Closer connection to local life and nature",
      "May require a little more travel to reach the main attractions",
    ],
    learnIntro:
      "Stay away from the crowds. Thoughtfully chosen stays in quieter locations with a simple, authentic and immersive local experience.",
    images: [media.forest, media.trail, media.heroMist, media.canopy, media.cliffs],
    offerOnBooking: true,
    active: true,
    sortOrder: 3,
  },
  {
    id: "luxury",
    label: "Luxury Stays",
    short:
      "Upscale accommodations offering top-notch comfort, premium locations, personalized service, fine dining, and modern amenities.",
    bestFor: "Travellers seeking elevated comfort and a polished stay.",
    think: "I want a lavish, relaxing stay with premium amenities.",
    expect: [
      "Premium locations and polished service",
      "Higher comfort and modern amenities",
      "Fine dining options where available",
      "A more elevated, restful travel pace",
    ],
    learnIntro:
      "Luxury Stays are upscale accommodations offering top-notch comfort, premium locations, personalized service, fine dining, and modern amenities.",
    images: [media.packages, media.aboutPortrait, media.rideAlt, media.heroMist, media.water],
    offerOnBooking: false,
    active: true,
    sortOrder: 4,
  },
  {
    id: "flexible",
    label: "I'm open to mixed stays",
    short:
      "You’re open to any type of accommodation based on availability, value, and location — we’ll recommend what fits your style and budget.",
    bestFor: "Travellers happy for us to mix stay types to suit the route and budget.",
    think: "I'm open — recommend what works best for the journey.",
    expect: [
      "Stay mix based on route and availability",
      "Balanced value and comfort",
      "Options confirmed before you travel",
    ],
    learnIntro:
      "You’re open to any type of accommodation based on availability, value, and location. This option allows us to recommend the best available stay that fits your overall travel style and budget.",
    images: [media.kitchen, media.packages, media.forest, media.canopy, media.craft],
    offerOnBooking: false,
    active: true,
    sortOrder: 5,
  },
];

export const STAY_STYLES = DEFAULT_STAY_STYLES;
export const STAY_STYLE_IDS = DEFAULT_STAY_STYLES.map((s) => s.id);

/** Stay styles used in curated online booking when Studio flags are missing. */
export const BOOKING_STAY_STYLE_IDS = ["barefoot", "signature", "offbeat"] as const;

export function stayImages(style: Pick<StayStyle, "images">) {
  return (style.images ?? []).map((u) => u.trim()).filter(Boolean);
}

export function mergeStayStyles(custom?: StayStyle[] | null): StayStyle[] {
  if (!custom?.length) {
    return DEFAULT_STAY_STYLES.map((s) => ({ ...s, images: [...s.images], expect: [...s.expect] }));
  }
  return custom
    .map((row, index) => {
      const images = stayImages(row);
      const expect = Array.isArray(row.expect)
        ? row.expect.map((line) => String(line).trim()).filter(Boolean)
        : [];
      return {
        id: String(row.id || "").trim() || `stay-${index + 1}`,
        label: String(row.label || "").trim() || "Stay style",
        short: String(row.short || "").trim(),
        bestFor: String(row.bestFor || "").trim(),
        think: String(row.think || "").trim(),
        expect,
        learnIntro: String(row.learnIntro || "").trim(),
        images,
        offerOnBooking: row.offerOnBooking === true,
        active: row.active !== false,
        sortOrder: row.sortOrder ?? index + 1,
      } satisfies StayStyle;
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Merge Studio edits with the full learn-more catalogue when rows are missing. */
export function hydrateStayStylesFromDefaults(custom?: StayStyle[] | null): StayStyle[] {
  const current = mergeStayStyles(custom);
  const byId = new Map(current.map((s) => [s.id, s]));
  const merged = DEFAULT_STAY_STYLES.map((seed) => {
    const existing = byId.get(seed.id);
    if (!existing) return { ...seed, images: [...seed.images], expect: [...seed.expect] };
    const images = stayImages(existing).length ? stayImages(existing) : [...seed.images];
    const expect = existing.expect.length ? existing.expect : [...seed.expect];
    return {
      ...seed,
      ...existing,
      images,
      expect,
      offerOnBooking:
        existing.offerOnBooking ??
        (BOOKING_STAY_STYLE_IDS as readonly string[]).includes(seed.id),
    };
  });
  for (const row of current) {
    if (!DEFAULT_STAY_STYLES.some((d) => d.id === row.id)) merged.push(row);
  }
  return mergeStayStyles(merged);
}

export function activeStayStyles(custom?: StayStyle[] | null): StayStyle[] {
  return mergeStayStyles(custom).filter((s) => s.active !== false);
}

export function stayStyleList(custom?: StayStyle[] | null): StayStyle[] {
  return activeStayStyles(custom?.length ? custom : DEFAULT_STAY_STYLES);
}

export function bookingStayStyles(custom?: StayStyle[] | null): StayStyle[] {
  const list = stayStyleList(custom);
  const flagged = list.filter((s) => s.offerOnBooking);
  if (flagged.length) return flagged;
  return list.filter((s) => (BOOKING_STAY_STYLE_IDS as readonly string[]).includes(s.id));
}

export function stayStyleMeta(id: string, custom?: StayStyle[] | null): StayStyle {
  const list = stayStyleList(custom);
  const normalized = normalizeStayStyleId(id);
  return list.find((s) => s.id === normalized || s.id === id) ?? list[0] ?? DEFAULT_STAY_STYLES[0];
}

export function normalizeStayStyleId(id: string): StayStyleId {
  if (id === "barefoot" || id === "homestay" || id === "camping") return "barefoot";
  if (id === "signature" || id === "hotel" || id === "boutique" || id === "resort") return "signature";
  if (id === "offbeat") return "offbeat";
  if (id === "luxury") return "luxury";
  if (id === "flexible") return "flexible";
  return id || "barefoot";
}

export function slugifyStayId(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || `stay-${Date.now().toString(36)}`
  );
}

export const STAY_IMAGE_NOTE =
  "Please note: The images shown are for reference and to give you an idea of the stay style and experience. The exact accommodation may vary depending on availability for your travel dates. We will confirm and share the final stay details with you before your journey begins.";
