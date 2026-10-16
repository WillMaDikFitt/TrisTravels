import { slugify } from "@/lib/slug";

export type CraftCategory =
  | "Arts & Crafts"
  | "Traditional Jewellery"
  | "Musical Instrument"
  | "Souvenirs"
  | "Best Sellers";

export type CraftProduct = {
  slug: string;
  name: string;
  category: CraftCategory;
  image: string;
  blurb: string;
  makerNote?: string;
  bestSeller?: boolean;
  sourceUrl: string;
  /** Unticked in Studio → Crafts to hide the card without deleting it. */
  active?: boolean;
  sortOrder?: number;
};

/** Seeded with the catalogue that used to be hard-coded on /artisans (Studio → Crafts). */
/** No built-in crafts — everything is added in Studio → Crafts. */
export const DEFAULT_CRAFT_PRODUCTS: CraftProduct[] = [];

export const craftCategories: CraftCategory[] = [
  "Arts & Crafts",
  "Traditional Jewellery",
  "Musical Instrument",
  "Souvenirs",
];

export type Artisan = {
  slug: string;
  name: string;
  craft: string;
  location: string;
  region: string;
  image: string;
  portrait: string;
  story: string;
  culturalNote: string;
  whereToBuy: string;
  category: string;
};

export const artisans: Artisan[] = [];

export function blankCraftProduct(index = 0): CraftProduct {
  return {
    slug: "",
    name: "",
    category: "Arts & Crafts",
    image: "",
    blurb: "",
    makerNote: "",
    bestSeller: false,
    sourceUrl: "",
    active: true,
    sortOrder: index + 1,
  };
}

/**
 * Cleans Studio rows: drops nameless ones, fills missing slugs from the name
 * (kept unique, since the contact form links crafts by slug) and sorts.
 */
export function normalizeCraftProducts(
  rows: CraftProduct[] | null | undefined,
  fallback: CraftProduct[],
): CraftProduct[] {
  if (!rows?.length) return fallback.map((item) => ({ ...item }));
  const used = new Set<string>();
  return rows
    .map((row, index) => ({
      slug: String(row.slug || "").trim(),
      name: String(row.name || "").trim(),
      category: craftCategories.includes(row.category)
        ? row.category
        : craftCategories[0],
      image: String(row.image || "").trim(),
      blurb: String(row.blurb || "").trim(),
      makerNote: String(row.makerNote || "").trim(),
      bestSeller: row.bestSeller === true,
      sourceUrl: String(row.sourceUrl || "").trim(),
      active: row.active !== false,
      sortOrder: Number.isFinite(row.sortOrder)
        ? Number(row.sortOrder)
        : index + 1,
    }))
    .filter((row) => row.name)
    .map((row) => {
      const base = slugify(row.slug || row.name) || "craft";
      let slug = base;
      for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
      used.add(slug);
      return { ...row, slug };
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/** Published crafts — what guests see on /artisans. */
export function activeCraftProducts(
  rows: CraftProduct[] | null | undefined,
  fallback: CraftProduct[],
): CraftProduct[] {
  return normalizeCraftProducts(rows, fallback).filter(
    (row) => row.active !== false,
  );
}

/** Filter chips on /artisans — the maker-facing names for each craft category. */
export const makerCategoryLabels: Record<CraftCategory, string> = {
  "Arts & Crafts": "Handmade crafts",
  "Traditional Jewellery": "Jewellery",
  "Musical Instrument": "Musical instruments",
  Souvenirs: "Gifts & keepsakes",
  "Best Sellers": "Gifts & keepsakes",
};

/** A maker profile on /artisans and /artisans/[slug] (Studio → Makers). */
export type CraftMaker = {
  slug: string;
  name: string;
  category: CraftCategory;
  location: string;
  /** Short intro under the name (list card + profile header). */
  story: string;
  about: string;
  journey: string;
  find: string;
  /** Main photo — falls back to the first linked craft's photo. */
  portrait: string;
  /** Extra profile photos (any number) — shown in the collage and the photo viewer. */
  gallery: string[];
  whatsapp: string;
  phone: string;
  instagram: string;
  email: string;
  /** Crafts (by slug) shown as this maker's pieces. */
  craftSlugs: string[];
  active?: boolean;
  sortOrder?: number;
};

/** A maker with its published crafts and a photo — what the public pages render. */
export type ResolvedCraftMaker = CraftMaker & {
  image: string;
  crafts: CraftProduct[];
};

/** No built-in makers — everything is added in Studio → Crafts → Makers. */
export const DEFAULT_CRAFT_MAKERS: CraftMaker[] = [];

export function blankCraftMaker(index = 0): CraftMaker {
  return {
    slug: "",
    name: "",
    category: "Arts & Crafts",
    location: "Meghalaya",
    story: "",
    about: "",
    journey: "",
    find: "",
    portrait: "",
    gallery: [],
    whatsapp: "",
    phone: "",
    instagram: "",
    email: "",
    craftSlugs: [],
    active: true,
    sortOrder: index + 1,
  };
}

const text = (v: unknown) => String(v ?? "").trim();
const textList = (v: unknown) =>
  Array.isArray(v) ? v.map(text).filter(Boolean) : [];

/** Cleans Studio maker rows: drops nameless ones, keeps slugs unique, sorts. */
export function normalizeCraftMakers(
  rows: CraftMaker[] | null | undefined,
  fallback: CraftMaker[],
): CraftMaker[] {
  if (!rows?.length)
    return fallback.map((m) => ({
      ...m,
      gallery: [...m.gallery],
      craftSlugs: [...m.craftSlugs],
    }));
  const used = new Set<string>();
  return rows
    .map((row, index) => ({
      slug: text(row.slug),
      name: text(row.name),
      category: craftCategories.includes(row.category)
        ? row.category
        : craftCategories[0],
      location: text(row.location),
      story: text(row.story),
      about: text(row.about),
      journey: text(row.journey),
      find: text(row.find),
      portrait: text(row.portrait),
      gallery: textList(row.gallery),
      whatsapp: text(row.whatsapp),
      phone: text(row.phone),
      instagram: text(row.instagram),
      email: text(row.email),
      craftSlugs: textList(row.craftSlugs),
      active: row.active !== false,
      sortOrder: Number.isFinite(row.sortOrder)
        ? Number(row.sortOrder)
        : index + 1,
    }))
    .filter((row) => row.name)
    .map((row) => {
      const base = slugify(row.slug || row.name) || "maker";
      let slug = base;
      for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
      used.add(slug);
      return { ...row, slug };
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * Published makers joined with their published crafts. `image` is the portrait, or
 * the first linked craft photo — empty when neither has been uploaded yet.
 */
export function resolveCraftMakers(
  makers: CraftMaker[] | null | undefined,
  products: CraftProduct[],
): ResolvedCraftMaker[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return normalizeCraftMakers(makers, DEFAULT_CRAFT_MAKERS)
    .filter((m) => m.active !== false)
    .map((m) => {
      const crafts = m.craftSlugs
        .map((s) => bySlug.get(s))
        .filter((p): p is CraftProduct => !!p);
      return {
        ...m,
        crafts,
        image: m.portrait || crafts.find((c) => c.image)?.image || "",
        find:
          m.find ||
          (crafts.length
            ? `Explore handcrafted pieces including ${crafts.map((c) => c.name).join(", ")}. Each one is thoughtfully made with traditional techniques and everyday use in mind.`
            : ""),
      };
    });
}

/** Editable text and hero image for the makers pages (Studio → Makers → Page text). */
export type CraftsPageCopy = {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBody: string;
  /** Handwritten lines on the hero, one per line. */
  heroScript: string;
  makersTitle: string;
  makersSubtitle: string;
  connectorTitle: string;
  connectorBody: string;
  /** The three small notes beside the connector line (icons are fixed). */
  connectorNotes: { title: string; detail: string }[];
  /** "What makes their work special?" points on profiles (icons are fixed). */
  specialPoints: string[];
  connectCaption: string;
  /** Shown instead of the makers pages while Studio → Crafts → "Coming soon" is on. */
  comingSoonTitle: string;
  comingSoonBody: string;
};

export const DEFAULT_CRAFTS_PAGE: CraftsPageCopy = {
  heroImage: "/images/tris.jpeg",
  heroTitle: "Treasures from the Hills",
  heroSubtitle:
    "Discover authentic local products, rooted in Meghalaya’s people, culture and landscapes.",
  heroBody:
    "From handwoven textiles and bamboo crafts to wild honey, Lakadong turmeric and unique handmade creations — meet the people behind them, hear their stories and take a piece of the hills with you.",
  heroScript:
    "Local people.\nReal stories.\nA piece of Meghalaya\nfor your journey",
  makersTitle: "Our Makers",
  makersSubtitle: "People, stories and creations from across Meghalaya.",
  connectorTitle: "TRIS is the connector, not the seller.",
  connectorBody:
    "We introduce you to local makers and help you discover their work. Availability, pricing, payment and delivery arrangements are handled directly with the maker.",
  connectorNotes: [
    {
      title: "Hotel delivery available",
      detail: "(within Shillong, on request)",
    },
    { title: "Advance order recommended", detail: "(for custom pieces)" },
    { title: "Payment and arrangements", detail: "directly with the maker" },
  ],
  specialPoints: [
    "Authentic and traditionally made",
    "Made with natural, locally sourced materials",
    "Supports local artisans and communities",
    "Thoughtful, meaningful and long-lasting",
  ],
  connectCaption:
    "Chat, place an order, or discuss custom pieces directly with the maker.",
  comingSoonTitle: "Something exciting is on its way",
  comingSoonBody:
    "We’re putting the finishing touches on a new home for Meghalaya’s makers — the people, stories and crafts behind what is made here. Check back soon.",
};

/** Fills blanks in stored page text from the defaults. */
export function normalizeCraftsPage(
  row: Partial<CraftsPageCopy> | null | undefined,
): CraftsPageCopy {
  const d = DEFAULT_CRAFTS_PAGE;
  const pick = (k: keyof CraftsPageCopy) => text(row?.[k]) || (d[k] as string);
  return {
    heroImage: pick("heroImage"),
    heroTitle: pick("heroTitle"),
    heroSubtitle: pick("heroSubtitle"),
    heroBody: pick("heroBody"),
    heroScript: pick("heroScript"),
    makersTitle: pick("makersTitle"),
    makersSubtitle: pick("makersSubtitle"),
    connectorTitle: pick("connectorTitle"),
    connectorBody: pick("connectorBody"),
    connectorNotes: d.connectorNotes.map((n, i) => ({
      title: text(row?.connectorNotes?.[i]?.title) || n.title,
      detail: text(row?.connectorNotes?.[i]?.detail) || n.detail,
    })),
    specialPoints: d.specialPoints.map(
      (p, i) => text(row?.specialPoints?.[i]) || p,
    ),
    connectCaption: pick("connectCaption"),
    comingSoonTitle: pick("comingSoonTitle"),
    comingSoonBody: pick("comingSoonBody"),
  };
}

export function getCraftProduct(
  slug: string,
  products: CraftProduct[] = DEFAULT_CRAFT_PRODUCTS,
) {
  return products.find((p) => p.slug === slug);
}
