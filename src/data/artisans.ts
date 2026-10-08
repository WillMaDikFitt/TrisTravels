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
export const DEFAULT_CRAFT_PRODUCTS: CraftProduct[] = [
  {
    slug: "besli-local-flute",
    name: "Besli: Local flute of Meghalaya",
    category: "Musical Instrument",
    image: "",
    blurb:
      "A traditional Meghalaya flute — sound, craft, and place in one piece.",
    makerNote: "Local instrument makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/musical-instrument",
  },
  {
    slug: "fridge-magnet-living-root-bridge",
    name: "Fridge Magnet: Living root bridge (2pc)",
    category: "Souvenirs",
    image: "",
    blurb: "A classic Meghalaya memento celebrating the living root bridge.",
    makerNote: "Local souvenir artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "paila",
    name: "Paila",
    category: "Traditional Jewellery",
    image: "",
    blurb: "Traditional jewellery from community makers in the Hub network.",
    makerNote: "Jewellery artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/traditional-jewellery",
  },
  {
    slug: "resilience-jute-collection",
    name: "Resilience Jute Collection",
    category: "Arts & Crafts",
    image: "",
    blurb:
      "Everyday jute pieces supporting women-led and community craft initiatives.",
    makerNote: "Women-led jute collectives",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "khasi-heritage-duo-by-tori",
    name: "Khasi Heritage Duo By Tori",
    category: "Arts & Crafts",
    image: "",
    blurb:
      "A heritage duo celebrating Khasi craftsmanship — curated for mindful travellers.",
    makerNote: "Tori · heritage craft",
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "water-bottle-sling",
    name: "Water Bottle Sling",
    category: "Arts & Crafts",
    image: "",
    blurb: "Handy sling for trail days — practical craft for the journey.",
    makerNote: "Local textile makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "hands-free-glasses-holder",
    name: "Hands-Free Glasses Holder",
    category: "Arts & Crafts",
    image: "",
    blurb: "A small, useful piece from makers in the Hub network.",
    makerNote: "Local craft makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "keychain-bottle-opener",
    name: "Key chain cum bottle opener (2pc)",
    category: "Souvenirs",
    image: "",
    blurb: "Practical keepsakes — keychain and bottle opener in one.",
    makerNote: "Local souvenir makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "fridge-magnet-nohkalikai",
    name: "Acrylic Fridge Magnet: Nohkalikai falls (2pc)",
    category: "Souvenirs",
    image: "",
    blurb: "Nohkalikai Falls — a piece of Sohra’s drama for home.",
    makerNote: "Local souvenir artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "sunflower-keychains",
    name: "Sunflower Keychains (2pc)",
    category: "Arts & Crafts",
    image: "",
    blurb: "Bright sunflower keychains — small gifts with a sunny finish.",
    makerNote: "Local craft makers",
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "crochet-flower-coaster-set",
    name: "Crochet Flower Coaster Set with Pot",
    category: "Arts & Crafts",
    image: "",
    blurb: "Handmade crochet set — soft colour and everyday table joy.",
    makerNote: "Crochet artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "flower-crochet-charm",
    name: "Flower Crochet Charm (2pc)",
    category: "Arts & Crafts",
    image: "",
    blurb: "Pair of crochet flower charms — light keepsakes from local makers.",
    makerNote: "Crochet artisans",
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
];

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

const DEFAULT_JOURNEY =
  "Rooted in tradition and shaped by years of practice, this work keeps local skills alive. Today the makers continue to create pieces that carry the stories, skills and cultural identity of Meghalaya.";

const defaultStories: Record<string, string> = {
  "local-instrument-makers":
    "Keeping Meghalaya’s musical heritage alive by crafting traditional bamboo flutes — the sounds and stories of the hills, made by hand.",
  "jewellery-artisans":
    "Traditional jewellery shaped by community makers, carrying motifs and techniques passed down through generations.",
  "women-led-jute-collectives":
    "Women-led collectives turning jute into everyday pieces — each one supports community livelihoods across the region.",
  "crochet-artisans":
    "Patient, handmade crochet work in soft colour — coasters, charms and small pieces made stitch by stitch.",
};

/** Seed makers: the default crafts grouped by their "Maker note", with TRIS as the contact. */
export const DEFAULT_CRAFT_MAKERS: CraftMaker[] = (() => {
  const groups = new Map<string, CraftMaker>();
  for (const p of DEFAULT_CRAFT_PRODUCTS) {
    const name = p.makerNote?.trim() || p.name;
    const slug = slugify(name) || p.slug;
    const existing = groups.get(slug);
    if (existing) {
      existing.craftSlugs.push(p.slug);
      continue;
    }
    const story = defaultStories[slug] ?? p.blurb;
    groups.set(slug, {
      slug,
      name,
      category: p.category,
      location: "Meghalaya",
      story,
      about: `${story} Every piece is made by hand, carrying knowledge and techniques passed down within the community.`,
      journey: DEFAULT_JOURNEY,
      find: "",
      portrait: "",
      gallery: [],
      whatsapp: "+91 70052 41197",
      phone: "+91 70052 41197",
      instagram: "@trisexperiences",
      email: "trissimai03@gmail.com",
      craftSlugs: [p.slug],
      active: true,
      sortOrder: groups.size + 1,
    });
  }
  return [...groups.values()];
})();

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
  makersNote: string;
  connectorTitle: string;
  connectorBody: string;
  /** The three small notes beside the connector line (icons are fixed). */
  connectorNotes: { title: string; detail: string }[];
  /** "What makes their work special?" points on profiles (icons are fixed). */
  specialPoints: string[];
  connectCaption: string;
};

export const DEFAULT_CRAFTS_PAGE: CraftsPageCopy = {
  heroImage: "",
  heroTitle: "Meet Meghalaya’s Makers",
  heroSubtitle:
    "Discover the hands, stories and traditions behind what is made here.",
  heroBody:
    "Explore a curated circle of local makers and sellers, discover their work, and connect with them directly during your stay in Meghalaya. Take home something meaningful, made by the people who make this place special.",
  heroScript:
    "Local people.\nReal stories.\nA piece of Meghalaya\nfor your journey",
  makersTitle: "Our Makers",
  makersSubtitle: "People, stories and creations from across Meghalaya.",
  makersNote:
    "Every maker featured here has been personally identified through our local network. We focus on people whose work, story or connection to Meghalaya is meaningful to us.",
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
    makersNote: pick("makersNote"),
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
  };
}

export function getCraftProduct(
  slug: string,
  products: CraftProduct[] = DEFAULT_CRAFT_PRODUCTS,
) {
  return products.find((p) => p.slug === slug);
}
