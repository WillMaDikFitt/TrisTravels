import type { TransportVehicleId } from "./transport";
import { media } from "./media";

/** Curated booking window: online book when start date is ≥ this many days away. */
export const CURATED_ONLINE_BOOK_DAYS = 25;

/** Balance due this many days before travel start. */
export const CURATED_BALANCE_DUE_DAYS = 20;

export function daysUntilDate(isoDate: string) {
  const target = new Date(`${isoDate}T12:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function canBookCuratedOnline(startDate: string) {
  if (!startDate) return false;
  return daysUntilDate(startDate) >= CURATED_ONLINE_BOOK_DAYS;
}

/** End date from start + journey length (nights). */
export function journeyEndDate(startIso: string, nights: number) {
  if (!startIso) return "";
  const d = new Date(`${startIso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.max(0, nights));
  return d.toISOString().slice(0, 10);
}

export type PackageTransportId =
  | "sedan"
  | "suv"
  | "innova"
  | "tempo10"
  | "tempo12"
  | "tempo15"
  | "urbania10"
  | "urbania12";

export type PackageTransportMeta = {
  id: PackageTransportId;
  label: string;
  maxGuests: number;
  idealFor: string;
  luggage: string;
  ac: string;
  windows?: string;
  bestFor: string;
  goodToKnow: string;
  examples?: string;
  summary: string;
  images: string[];
};

export const PACKAGE_TRANSPORT: PackageTransportMeta[] = [
  {
    id: "sedan",
    label: "Sedan",
    maxGuests: 4,
    idealFor: "Up to 3 adults",
    luggage: "1 large + 1 small suitcase, or up to 3 small bags",
    ac: "Yes",
    bestFor: "Small groups looking for a comfortable and economical vehicle.",
    goodToKnow: "Boot space is limited, so this option may not be suitable for travellers carrying a lot of luggage.",
    examples: "Maruti Suzuki Dzire, Honda City, Hyundai Verna, Maruti Suzuki Ciaz",
    summary:
      "A comfortable option for smaller groups, sedans offer good legroom, air conditioning and a smooth ride on highways and hilly roads.",
    images: [media.ride, media.rideAlt, media.cliffs, media.trail, media.forest],
  },
  {
    id: "suv",
    label: "SUV",
    maxGuests: 5,
    idealFor: "Up to 4 adults for more comfort",
    luggage: "3 large + 2 small bags",
    ac: "Yes",
    bestFor: "Small groups looking for a comfortable and practical vehicle for exploring Meghalaya.",
    goodToKnow: "Luggage capacity may vary depending on the vehicle model and number of passengers.",
    examples: "Mahindra Xylo, Mahindra Bolero, Maruti Suzuki Ertiga or similar",
    summary:
      "A practical option for small groups, SUVs offer a comfortable cabin, good ground clearance and flexibility for Meghalaya’s hilly roads.",
    images: [media.rideAlt, media.ride, media.cliffs, media.trail, media.forest],
  },
  {
    id: "innova",
    label: "Innova",
    maxGuests: 6,
    idealFor: "Up to 4 adults",
    luggage: "3 large + 2 small bags",
    ac: "Yes",
    bestFor: "Families and small groups looking for extra space and comfort on longer journeys.",
    goodToKnow:
      "Additional luggage space may be available when the rear seats are folded, subject to seating needs.",
    summary:
      "A spacious and comfortable option for families and small groups — generous cabin space and a smooth ride for longer journeys.",
    images: [media.packages, media.ride, media.rideAlt, media.familyWaterfall, media.cliffs],
  },
  {
    id: "tempo10",
    label: "Tempo traveller",
    maxGuests: 10,
    idealFor: "Up to 10 adults",
    luggage: "8–10 medium to large bags",
    ac: "Yes",
    bestFor: "Groups looking for a spacious and economical travel option.",
    goodToKnow: "Good overhead and rear luggage storage for family and group tours.",
    summary:
      "A practical and spacious option for small to medium-sized groups, with comfortable seating and air conditioning.",
    images: [media.departures, media.trail, media.packages, media.ride, media.forest],
  },
  {
    id: "tempo12",
    label: "Tempo traveller",
    maxGuests: 12,
    idealFor: "Up to 12 adults",
    luggage: "9–12 medium to large bags",
    ac: "Yes",
    bestFor: "Groups looking for a spacious and economical option.",
    goodToKnow: "A popular choice for medium to large groups and educational travel.",
    summary:
      "A popular option for medium to large groups — spacious seating, air conditioning, and good luggage storage.",
    images: [media.departures, media.packages, media.trail, media.forest, media.ride],
  },
  {
    id: "tempo15",
    label: "Tempo traveller",
    maxGuests: 15,
    idealFor: "Up to 15 adults",
    luggage: "10–15 medium to large bags",
    ac: "Yes",
    bestFor: "Larger groups looking for a practical and economical option.",
    goodToKnow: "Suited for bigger groups with generous luggage storage.",
    summary:
      "A larger Tempo Traveller for bigger groups, with spacious seating, air conditioning, and generous luggage space.",
    images: [media.trail, media.departures, media.packages, media.forest, media.ride],
  },
  {
    id: "urbania10",
    label: "Urbania",
    maxGuests: 10,
    idealFor: "Up to 10 adults",
    luggage: "7–10 medium to large bags",
    ac: "Yes",
    windows: "Non-opening",
    bestFor: "Travellers looking for a more comfortable and modern vehicle.",
    goodToKnow: "Windows do not open — climate is managed via air conditioning.",
    summary:
      "A modern and comfortable Force Urbania for smaller groups — spacious seating and a refined travel experience.",
    images: [media.packages, media.rideAlt, media.trail, media.ride, media.familyWaterfall],
  },
  {
    id: "urbania12",
    label: "Urbania",
    maxGuests: 12,
    idealFor: "Up to 12 adults",
    luggage: "10–12 medium to large bags",
    ac: "Yes",
    windows: "Non-opening",
    bestFor: "Medium-sized groups looking for a comfortable and modern travel experience.",
    goodToKnow: "Windows do not open — climate is managed via air conditioning.",
    summary:
      "A modern and spacious Force Urbania for medium-sized groups — comfort and luggage space for longer journeys.",
    images: [media.packages, media.departures, media.ride, media.familyWaterfall, media.trail],
  },
];

export const PACKAGE_TRANSPORT_IDS = PACKAGE_TRANSPORT.map((t) => t.id);

export function packageTransportMeta(id: string) {
  return PACKAGE_TRANSPORT.find((t) => t.id === id) ?? PACKAGE_TRANSPORT[0];
}

/** Map legacy transport ids used in older package pricing. */
export function normalizePackageTransportId(id: string): PackageTransportId {
  if (id === "tempo") return "tempo12";
  if ((PACKAGE_TRANSPORT_IDS as string[]).includes(id)) return id as PackageTransportId;
  return "sedan";
}

/** Bridge to older TransportVehicleId for pricing maps that still use 4 keys. */
export function toLegacyTransportId(id: PackageTransportId): TransportVehicleId {
  if (id === "sedan" || id === "suv" || id === "innova") return id;
  return "tempo";
}

export type StayStyleId = "barefoot" | "signature" | "offbeat" | "luxury" | "flexible";

export type StayStyleMeta = {
  id: StayStyleId;
  label: string;
  short: string;
  bestFor: string;
  think: string;
  expect: string[];
  learnIntro: string;
  images: string[];
};

export const STAY_STYLES: StayStyleMeta[] = [
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
  },
  {
    id: "flexible",
    label: "I’m Flexible",
    short:
      "You’re open to any type of accommodation based on availability, value, and location — we’ll recommend what fits your style and budget.",
    bestFor: "Travellers happy for us to mix stay types to suit the route and budget.",
    think: "I’m open — recommend what works best for the journey.",
    expect: [
      "Stay mix based on route and availability",
      "Balanced value and comfort",
      "Options confirmed before you travel",
    ],
    learnIntro:
      "You’re open to any type of accommodation based on availability, value, and location. This option allows us to recommend the best available stay that fits your overall travel style and budget.",
    images: [media.kitchen, media.packages, media.forest, media.canopy, media.craft],
  },
];

export const STAY_STYLE_IDS = STAY_STYLES.map((s) => s.id);

/** Stay styles used in curated online booking (priced catalogue). */
export const BOOKING_STAY_STYLE_IDS = ["barefoot", "signature", "offbeat"] as const;

export function stayStyleMeta(id: string) {
  return STAY_STYLES.find((s) => s.id === id) ?? STAY_STYLES[0];
}

/** Map legacy stay preference ids onto stay styles. */
export function normalizeStayStyleId(id: string): StayStyleId {
  if (id === "barefoot" || id === "homestay" || id === "camping") return "barefoot";
  if (id === "signature" || id === "hotel" || id === "boutique" || id === "resort") return "signature";
  if (id === "offbeat") return "offbeat";
  if (id === "luxury") return "luxury";
  if (id === "flexible") return "flexible";
  return "barefoot";
}

export const STAY_IMAGE_NOTE =
  "Please note: The images shown are for reference and to give you an idea of the stay style and experience. The exact accommodation may vary depending on availability for your travel dates. We will confirm and share the final stay details with you before your journey begins.";
