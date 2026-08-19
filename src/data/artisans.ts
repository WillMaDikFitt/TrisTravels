import { media } from "./media";

/**
 * Artisan's Hub — help travellers source crafts that are hard to find alone.
 * TRIS connects guests with local suppliers when availability and access are the barrier.
 */

export const artisanHub = {
  eyebrow: "Artisan's Hub",
  title: "Hard-to-find crafts, within reach",
  tagline: "We connect you with local suppliers",
  intro: [
    "Finding authentic Meghalaya crafts on your own can be difficult — makers are spread across villages, stock comes and goes, and the right supplier isn’t always easy to reach while you’re travelling.",
    "Artisan’s Hub shows work from our network of local makers and sellers. When something catches your eye — or you need a specific piece — tell us. We check availability and connect you with the supplier.",
    "You deal with the people who make or stock the craft. We open the door when access, timing, or knowing who to ask would otherwise get in the way.",
  ],
  closing: "Browse the work. We’ll help you reach the supplier.",
  rules: [
    { label: "The challenge", detail: "Crafts are hard to source alone" },
    { label: "What we do", detail: "Check availability & connect you" },
    { label: "Who you buy from", detail: "The local maker or supplier" },
  ],
  giftBoxNote:
    "Need a gift set or something specific? Share what you’re looking for — we’ll check with suppliers and get back to you.",
  sourceUrl: "https://www.trismeghalaya.com/category/all-products",
};

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
};

export const craftProducts: CraftProduct[] = [
  {
    slug: "besli-local-flute",
    name: "Besli: Local flute of Meghalaya",
    category: "Musical Instrument",
    image: "https://static.wixstatic.com/media/adf5fb_760ba3c8153c40ffa0189ab541a40d71~mv2.jpeg",
    blurb: "A traditional Meghalaya flute — sound, craft, and place in one piece.",
    makerNote: "Local instrument makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/musical-instrument",
  },
  {
    slug: "fridge-magnet-living-root-bridge",
    name: "Fridge Magnet: Living root bridge (2pc)",
    category: "Souvenirs",
    image: "https://static.wixstatic.com/media/adf5fb_44db46b864c043338112e46285fa7dd4~mv2.png",
    blurb: "A classic Meghalaya memento celebrating the living root bridge.",
    makerNote: "Local souvenir artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "paila",
    name: "Paila",
    category: "Traditional Jewellery",
    image: "https://static.wixstatic.com/media/adf5fb_895bafa35514464a8a6ee19a0d2857e3~mv2.jpeg",
    blurb: "Traditional jewellery from community makers in the Hub network.",
    makerNote: "Jewellery artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/traditional-jewellery",
  },
  {
    slug: "resilience-jute-collection",
    name: "Resilience Jute Collection",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/adf5fb_e652d77da12849789786359ae38b177f~mv2.png",
    blurb: "Everyday jute pieces supporting women-led and community craft initiatives.",
    makerNote: "Women-led jute collectives",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "khasi-heritage-duo-by-tori",
    name: "Khasi Heritage Duo By Tori",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/ea1287_ead2892aec8e4ba5b3f04c87740b3331~mv2.jpg",
    blurb: "A heritage duo celebrating Khasi craftsmanship — curated for mindful travellers.",
    makerNote: "Tori · heritage craft",
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "water-bottle-sling",
    name: "Water Bottle Sling",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/adf5fb_4fee1121dac940129fa36df86edaecb1~mv2.jpeg",
    blurb: "Handy sling for trail days — practical craft for the journey.",
    makerNote: "Local textile makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "hands-free-glasses-holder",
    name: "Hands-Free Glasses Holder",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/adf5fb_4916eaa0be454bb6952e9cdc3855697d~mv2.jpeg",
    blurb: "A small, useful piece from makers in the Hub network.",
    makerNote: "Local craft makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "keychain-bottle-opener",
    name: "Key chain cum bottle opener (2pc)",
    category: "Souvenirs",
    image: "https://static.wixstatic.com/media/adf5fb_2b071d28bdbd4979b3d270ad90db8017~mv2.jpeg",
    blurb: "Practical keepsakes — keychain and bottle opener in one.",
    makerNote: "Local souvenir makers",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "fridge-magnet-nohkalikai",
    name: "Acrylic Fridge Magnet: Nohkalikai falls (2pc)",
    category: "Souvenirs",
    image: "https://static.wixstatic.com/media/adf5fb_22455e9908ee47f8ab6638f96faa229e~mv2.png",
    blurb: "Nohkalikai Falls — a piece of Sohra’s drama for home.",
    makerNote: "Local souvenir artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/best-sellers",
  },
  {
    slug: "sunflower-keychains",
    name: "Sunflower Keychains (2pc)",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/ea1287_835293f37d42407199a99c38d32cf0b5~mv2.jpg",
    blurb: "Bright sunflower keychains — small gifts with a sunny finish.",
    makerNote: "Local craft makers",
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "crochet-flower-coaster-set",
    name: "Crochet Flower Coaster Set with Pot",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/adf5fb_565e63fbcefe4a2981a0b9fb585ce76e~mv2.png",
    blurb: "Handmade crochet set — soft colour and everyday table joy.",
    makerNote: "Crochet artisans",
    bestSeller: true,
    sourceUrl: "https://www.trismeghalaya.com/category/arts-crafts",
  },
  {
    slug: "flower-crochet-charm",
    name: "Flower Crochet Charm (2pc)",
    category: "Arts & Crafts",
    image: "https://static.wixstatic.com/media/adf5fb_4be78f5cd1c54126b9f16d7e5950f7c1~mv2.jpeg",
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

export const craftProcess = [
  {
    step: 1,
    title: "Browse",
    description: "See crafts from makers in our network — pieces that are often hard to find on your own.",
    image: media.craftHands,
  },
  {
    step: 2,
    title: "Request",
    description: "Tell us what you want. We check stock and timing with the right supplier.",
    image: media.craft,
  },
  {
    step: 3,
    title: "Connect",
    description: "We put you in touch with the maker or seller who can fulfil it.",
    image: media.valueCommunity,
  },
  {
    step: 4,
    title: "Receive",
    description: "Arrange purchase and delivery directly with them — local and reliable.",
    image: media.valueGivesBack,
  },
];

export function getCraftProduct(slug: string) {
  return craftProducts.find((p) => p.slug === slug);
}
