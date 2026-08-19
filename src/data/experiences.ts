import { media } from "./media";
import type { TransportVehiclePrices } from "./transport";

export type ExperienceCategory =
  | "Adventure"
  | "Nature & Wildlife"
  | "Culture & Heritage"
  | "Food & Local Life"
  | "Wellness"
  | "Creative Experiences";

export type Difficulty = "Easy" | "Moderate" | "Challenging";

export type ExperienceStatus = "draft" | "active" | "hidden" | "seasonal" | "soldOut";

export type ExperienceSlotConfig = {
  mode: "fixed" | "interval";
  times?: string[];
  start?: string;
  end?: string;
  intervalMinutes?: number;
  /** Optional rest windows. Slot times that fall inside [start, end) are skipped. */
  breaks?: { start: string; end: string }[];
};

export type Experience = {
  slug: string;
  name: string;
  tagline: string;
  category: ExperienceCategory;
  tags: string[];
  location: string;
  region: string;
  duration: string;
  durationHours: number;
  difficulty: Difficulty;
  suitableFor: string[];
  bestSeason: string;
  priceFrom: number;
  priceAdult?: number;
  priceChild?: number;
  minGuests?: number;
  maxGuests: number;
  /** Legacy explicit time slots; retained for existing Firestore records. */
  slots?: string[];
  slotConfig?: ExperienceSlotConfig;
  transportAvailable?: boolean;
  transportPrice?: number;
  transportNote?: string;
  /** Optional per-vehicle transfer prices. Missing ids fall back to transportPrice multipliers. */
  transportVehicles?: TransportVehiclePrices;
  status?: ExperienceStatus;
  staffRules?: {
    minGuests: number;
    maxGuests: number;
    staffType: string;
    quantity: number;
    costPerStaff: number;
  }[];
  seo?: { title?: string; description?: string };
  image: string;
  gallery: string[];
  communityLed?: boolean;
  sustainabilityFocus?: boolean;
  overview: string;
  trisStory: string;
  highlights: string[];
  included: string[];
  whatToBring: string[];
  meetingPoint: string;
  itinerary: { time: string; title: string; description: string }[];
  faqs: { q: string; a: string }[];
  reviews: { name: string; place: string; rating: number; quote: string }[];
  guideQuote?: { name: string; role: string; quote: string; avatar: string };
  sourceUrl?: string;
};

/**
 * Day / short immersions drawn from TRIS Meghalaya live offerings
 * (packages, fixed departures, destinations & guest stories on trismeghalaya.com).
 */
export const experiences: Experience[] = [
  {
    slug: "offbeat-living-root-bridge",
    name: "Offbeat Living Root Bridge Trail",
    tagline: "Up to six living bridges most travellers never reach — quiet paths, village stay energy.",
    category: "Adventure",
    tags: ["Community-Led", "Trek", "Fixed Departure"],
    location: "Rangthylliang–Mawkyrnot",
    region: "East Khasi Hills",
    duration: "2 days / 1 night",
    durationHours: 16,
    difficulty: "Moderate",
    suitableFor: ["Active travellers", "Solo travellers", "Small groups"],
    bestSeason: "Weekly Mondays · Jan–Apr",
    priceFrom: 6990,
    maxGuests: 10,
    slotConfig: {
      mode: "fixed",
      times: ["08:30", "09:00", "10:00"],
      breaks: [{ start: "12:00", end: "13:00" }],
    },
    transportAvailable: true,
    transportPrice: 2500,
    transportNote: "Shared pickup from Shillong",
    image: media.heroRoots,
    gallery: [media.local.bridgeTrail, media.local.forestLight, media.local.villagePath, media.local.raksan02],
    communityLed: true,
    overview:
      "Root Trails is designed for travellers who want Meghalaya beyond the postcard route. Stay in a village, walk quiet forest paths, and visit living root bridges most travellers never reach. Groups remain small — 4 to 10 — so experiences stay personal, safe, and open to connection.",
    trisStory:
      "Day 1 is easy, scenic and slow — Laitlum Canyons, Krangshuri Falls, Dawki, overnight in Mawlynnong. Day 2 is immersive — the offbeat Rangthylliang–Mawkyrnot trail. Six bridges. One forest. This journey is not about ticking off a destination — it’s about understanding it.",
    highlights: [
      "Laitlum Canyons, Krangshuri Falls & Dawki",
      "Overnight village homestay at Mawlynnong",
      "Moderate trek (3–4 hours) — up to 6 offbeat living root bridges",
      "Guided village walk + heritage house visit",
      "Pack-your-own-lunch village style",
    ],
    included: [
      "Entry fees & guide at key locations",
      "Shared transport & local driver",
      "Breakfast, dinner & accommodation",
    ],
    whatToBring: [
      "Sturdy walking shoes with grip",
      "Rain jacket",
      "Refillable water bottle",
      "Cash for village lunch shopping",
    ],
    meetingPoint: "Shillong (shared departure)",
    itinerary: [
      {
        time: "Day 1",
        title: "Scenic & slow",
        description:
          "Laitlum Canyons, Krangshuri Falls, Dawki — overnight village stay at Mawlynnong on double-sharing.",
      },
      {
        time: "Day 2",
        title: "Root bridge trail",
        description:
          "Offbeat Rangthylliang–Mawkyrnot trail; return via Pynursla to Shillong.",
      },
    ],
    faqs: [
      {
        q: "Do I pay upfront to register?",
        a: "Register your spot with no upfront payment required. Once you register, the TRIS team contacts you with trip details and payment info to confirm your seat.",
      },
      {
        q: "How fit do I need to be?",
        a: "Moderate fitness. Expect a 3–4 hour forest trek. The group stays small so pacing stays personal.",
      },
    ],
    reviews: [
      {
        name: "Dr. Suresh Kumar",
        place: "Chennai",
        rating: 5,
        quote:
          "Wholesome service from planning to the end of the trip — itinerary based on day-to-day climate, constantly in contact. Recommend TRIS to anyone new to the North East.",
      },
    ],
    sourceUrl:
      "https://www.trismeghalaya.com/fixed-departures/rooted-trails%3A-the-offbeat-living-root-bridge-experience",
  },
  {
    slug: "double-decker-living-root-bridge",
    name: "Double Decker Living Root Bridge",
    tagline: "Descend to Nongriat’s famous living architecture — grown across generations.",
    category: "Adventure",
    tags: ["Trek", "Heritage", "Nature"],
    location: "Nongriat",
    region: "Sohra",
    duration: "Full day",
    durationHours: 8,
    difficulty: "Challenging",
    suitableFor: ["Active travellers", "Photography lovers"],
    bestSeason: "October – April",
    priceFrom: 4200,
    maxGuests: 8,
    slotConfig: {
      mode: "interval",
      start: "07:00",
      end: "11:00",
      intervalMinutes: 60,
      breaks: [{ start: "09:00", end: "09:30" }],
    },
    image: media.heroRoots,
    gallery: [media.local.livingBridge, media.local.waterfallPool, media.local.ridgeLight],
    communityLed: true,
    overview:
      "Nongriat is famous for living root bridges of the banyan (Ficus elastica). The Double Decker is not to be missed — traditional Khasi architecture woven from one generation to the next until the bridge is complete.",
    trisStory:
      "These bridges can take 10–15 years to grow and get stronger every year. They can survive up to 500 years and support as many as 50 people at a time. To reach the Double Decker you walk roughly 3,000 steps down from Tyrna — and the same back up. Ahead lies the Rainbow Falls trail for those who want more.",
    highlights: [
      "Guided trek to the Double Decker living root bridge",
      "Cultural context from local hosts",
      "Optional Rainbow Falls extension",
      "Small groups for a respectful pace",
    ],
    included: ["Community guide", "Trail support", "First-aid basics"],
    whatToBring: [
      "Sturdy shoes with grip",
      "Rain jacket",
      "Water & light snacks",
      "Trekking poles (optional)",
    ],
    meetingPoint: "Tyrna village trailhead, Sohra",
    itinerary: [
      {
        time: "08:30",
        title: "Gather at Tyrna",
        description: "Meet your guide, safety brief, begin the descent.",
      },
      {
        time: "11:00",
        title: "Double Decker",
        description: "Time at the living root bridge with cultural context.",
      },
      {
        time: "13:00",
        title: "Optional Rainbow Falls",
        description: "For groups wanting the turquoise pool and boulder trail.",
      },
      {
        time: "15:30",
        title: "Ascent",
        description: "Climb back to Tyrna at a paced group rhythm.",
      },
    ],
    faqs: [
      {
        q: "How hard is the trek?",
        a: "Challenging for unfit walkers — thousands of stone steps down and up. Moderate fitness is enough if you take it slow.",
      },
    ],
    reviews: [],
    sourceUrl: "https://www.trismeghalaya.com/destination/nongriat",
  },
  {
    slug: "mawsynram-river-trek",
    name: "Mawsynram River Trek & Split Rock",
    tagline: "Rain, rivers, and canyon magic in the wettest place on earth.",
    category: "Adventure",
    tags: ["River", "Adventure", "Community-Led"],
    location: "Mawlongbna / Mawsynram",
    region: "East Khasi Hills",
    duration: "Full day",
    durationHours: 7,
    difficulty: "Moderate",
    suitableFor: ["Adventure seekers", "Friends groups"],
    bestSeason: "September – November (ideal) · July – April package season",
    priceFrom: 5500,
    maxGuests: 10,
    slotConfig: {
      mode: "interval",
      start: "08:00",
      end: "16:00",
      intervalMinutes: 60,
      breaks: [{ start: "12:00", end: "13:00" }],
    },
    transportAvailable: true,
    transportPrice: 1800,
    transportNote: "Optional private transfer",
    image: media.rain,
    gallery: [media.local.riverStones, media.local.cliffView, media.local.trailMist],
    communityLed: true,
    overview:
      "A day shaped by Split Rock — believed formed in the 1897 Assam earthquake — and a river trek through narrow stone walls to a waterfall reward. Immersive, grounding, and unhurried.",
    trisStory:
      "From TRIS guest stories: hike through forest into the river inside the split rock, swim, climb, float, and follow the water. After lunch, continue with river trekking and canoeing toward Umkhakoi Dam. Safety briefings, local guides, and village-pace hospitality.",
    highlights: [
      "Split Rock canyon walk",
      "River trek to waterfall (≈2.5 hrs)",
      "Optional canoeing toward Umkhakoi Dam",
      "Local lunch after the trail",
    ],
    included: ["Local adventure guide", "Safety briefing", "Trail coordination"],
    whatToBring: [
      "Quick-dry clothes + spare set",
      "Good-grip trekking shoes",
      "Waterproof phone pouch",
      "Energy bars, ORS & water",
    ],
    meetingPoint: "Mawlongbna village (shared on confirmation)",
    itinerary: [
      {
        time: "09:00",
        title: "Split Rock",
        description: "Easy hike between towering stone walls.",
      },
      {
        time: "10:30",
        title: "River trek",
        description: "Through the second split rock to the waterfall.",
      },
      {
        time: "13:00",
        title: "Local lunch",
        description: "Simple, warm, nourishing — tastes better after adventure.",
      },
      {
        time: "14:00",
        title: "River & canoe",
        description: "Optional continuation toward Umkhakoi Dam.",
      },
    ],
    faqs: [
      {
        q: "Do I need to be a strong swimmer?",
        a: "Guides brief safety and point out potholes. Non-swimmers have enjoyed the day when following instructions — always confirm comfort level when booking.",
      },
    ],
    reviews: [],
    sourceUrl:
      "https://www.trismeghalaya.com/your-stories/two-days-in-mawsynram-%E2%80%94-rain%2C-rivers-%26-adventures-in-the-wettest-place-on-earth",
  },
  {
    slug: "mawphlang-sacred-forest",
    name: "Mawphlang Sacred Forest Walk",
    tagline: "Where stories live quietly — heritage protected for centuries.",
    category: "Culture & Heritage",
    tags: ["Culture", "Nature", "Slow"],
    location: "Mawphlang",
    region: "East Khasi Hills",
    duration: "Half day",
    durationHours: 3,
    difficulty: "Easy",
    suitableFor: ["All ages", "Slow travellers", "Culture seekers"],
    bestSeason: "Year-round",
    priceFrom: 2600,
    maxGuests: 12,
    image: media.forest,
    gallery: [media.local.forestLight, media.local.detail01, media.local.raksan05],
    sustainabilityFocus: true,
    overview:
      "Walking inside Mawphlang’s sacred forest feels like stepping into an unspoken past. Roots twist like ancient scripts; nothing may be taken — not even a fallen leaf — because this isn’t just land, it is heritage.",
    trisStory:
      "Local guides share stories the way elders do — calm, steady, like passing wisdom instead of information. Every plant holds meaning: medicinal, spiritual, or cultural. We visit as guests, not consumers of a spectacle.",
    highlights: [
      "Guided sacred grove walk",
      "Cultural & ecological interpretation",
      "Quiet reflection time",
      "Nearby craft / herbal purchases optional",
    ],
    included: ["Local guide", "Interpretation"],
    whatToBring: ["Modest clothing", "Quiet shoes", "Respect for no-take forest rules"],
    meetingPoint: "Mawphlang Sacred Grove entrance",
    itinerary: [
      {
        time: "09:30",
        title: "Grove entry",
        description: "Orientation on customs and forest protocols.",
      },
      {
        time: "10:00",
        title: "Walk & stories",
        description: "Interpretive walk through the protected forest.",
      },
    ],
    faqs: [],
    reviews: [],
    sourceUrl: "https://www.trismeghalaya.com/your-stories",
  },
  {
    slug: "umngot-dawki",
    name: "Umngot River · Dawki",
    tagline: "Crystal-clear waters, border views, and boat time with local crews.",
    category: "Nature & Wildlife",
    tags: ["Water", "Family Friendly", "Sustainability Focus"],
    location: "Dawki",
    region: "Jaintia Hills",
    duration: "Half day",
    durationHours: 4,
    difficulty: "Easy",
    suitableFor: ["Families", "Couples", "First-time visitors"],
    bestSeason: "November – March",
    priceFrom: 2800,
    maxGuests: 10,
    image: media.river,
    gallery: [media.local.waterfallPool, media.local.landscapePanorama, media.local.groupTrail],
    sustainabilityFocus: true,
    overview:
      "A calm river day on the Umngot at Dawki — clear water, cliff light, and time to simply float with local boatmen who know this river’s moods.",
    trisStory:
      "Dawki appears across TRIS packages and fixed departures for a reason: the Umngot is one of Meghalaya’s defining encounters. We keep bookings paced and community-linked so river livelihoods stay viable without overcrowding the banks.",
    highlights: [
      "Boat time on glass-clear Umngot",
      "Border viewpoint",
      "Local boatman stories",
      "Easy add-on to multi-day packages",
    ],
    included: ["Boat & local crew", "Life jackets", "Coordination"],
    whatToBring: ["Sun protection", "Dry bag for phones", "Swimwear (optional)"],
    meetingPoint: "Dawki riverside jetty",
    itinerary: [
      {
        time: "09:00",
        title: "Arrive & brief",
        description: "Meet your boatman and safety orientation.",
      },
      {
        time: "09:30",
        title: "On the water",
        description: "Navigate quiet stretches of the Umngot.",
      },
    ],
    faqs: [
      {
        q: "Is swimming allowed?",
        a: "Only in designated calm spots and when your boatman confirms conditions are safe.",
      },
    ],
    reviews: [],
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "short-escape-sohra-day",
    name: "Sohra Cliffs, Caves & Falls",
    tagline: "A customizable Sohra day — Nohkalikai Crest, caves, and waterfall country.",
    category: "Nature & Wildlife",
    tags: ["Sohra", "Viewpoints", "Caves"],
    location: "Sohra (Cherrapunjee)",
    region: "Sohra",
    duration: "Full day",
    durationHours: 8,
    difficulty: "Easy",
    suitableFor: ["Families", "First-time visitors", "Photographers"],
    bestSeason: "October to April",
    priceFrom: 4500,
    maxGuests: 10,
    image: media.heroMist,
    gallery: [media.local.cliffView, media.local.meadowWalk, media.local.valleyGreen],
    overview:
      "Drawn from TRIS’s Short Escape – Sohra package: a stunning getaway into Sohra with options spanning waterfalls, caves, Laitlum canyons, and living root bridge approaches.",
    trisStory:
      "Short on time? TRIS builds days around the most loved routes — and you shape the details. Local insights, clear booking, and stays that fit your style when you extend into a multi-day package.",
    highlights: [
      "Nohkalikai Crest / waterfall viewpoints",
      "Sohra caves (e.g. Mawsmai / Mawmluh options)",
      "Laitlum canyon light",
      "Flexible pacing with local driver & guide",
    ],
    included: [
      "Professional driver & fuel coordination",
      "Guide at key locations",
      "Sightseeing entries as planned",
    ],
    whatToBring: ["Layered clothing for mist", "Comfortable shoes", "Rain jacket"],
    meetingPoint: "Shillong or Sohra (shared on confirmation)",
    itinerary: [
      {
        time: "08:00",
        title: "Depart",
        description: "Transfer into Sohra escarpment country.",
      },
      {
        time: "10:00",
        title: "Viewpoints & falls",
        description: "Cliff light and waterfall stops.",
      },
      {
        time: "13:00",
        title: "Caves or crest",
        description: "Choose caves or Nohkalikai Crest based on weather and interest.",
      },
    ],
    faqs: [],
    reviews: [],
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "krem-puri-cave",
    name: "Krem Puri Cave Exploration",
    tagline: "One of the world’s longest sandstone caves — cool air, silence, and deep time.",
    category: "Adventure",
    tags: ["Caves", "Geology", "Adventure"],
    location: "Mawsynram",
    region: "East Khasi Hills",
    duration: "Half day",
    durationHours: 4,
    difficulty: "Moderate",
    suitableFor: ["Adventure seekers", "Geology lovers"],
    bestSeason: "September – November",
    priceFrom: 3200,
    maxGuests: 8,
    image: media.trail,
    gallery: [media.local.bridgeTrail, media.local.detail03, media.local.campfire],
    overview:
      "Trek toward Krem Puri — one of the longest sandstone caves in the world, stretching over 24 kilometres. Inside, cool ancient air, wet walls, and silence that feels far from the noise outside.",
    trisStory:
      "The cave is said to hold prehistoric fish fossils; Khasi stories even speak of fairies once living here. Two routes exist — fossil zone and underground pool — a full day if you want both. Local guides often bring photography enthusiasm along with safety.",
    highlights: [
      "Guided sandstone cave exploration",
      "Fossil-zone route option",
      "Dramatic valley views after exit",
      "Pairs beautifully with Mawlongbna river days",
    ],
    included: ["Local cave guide", "Coordination"],
    whatToBring: ["Closed shoes with grip", "Light jacket", "Headlamp (optional backup)"],
    meetingPoint: "Mawsynram area (shared on confirmation)",
    itinerary: [
      {
        time: "10:00",
        title: "Trek to entrance",
        description: "Weather can turn quickly — rain is part of the story.",
      },
      {
        time: "10:45",
        title: "Inside Krem Puri",
        description: "≈2 hours in the fossil zone (or longer for both routes).",
      },
    ],
    faqs: [],
    reviews: [],
    sourceUrl: "https://www.trismeghalaya.com/destination/mawsynram",
  },
  {
    slug: "mawlynnong-village-stay",
    name: "Mawlynnong Village Immersion",
    tagline: "Asia’s cleanest village — overnight hosts, heritage walks, and quiet evenings.",
    category: "Food & Local Life",
    tags: ["Village", "Community-Led", "Family Friendly"],
    location: "Mawlynnong",
    region: "East Khasi Hills",
    duration: "Overnight",
    durationHours: 20,
    difficulty: "Easy",
    suitableFor: ["Families", "Couples", "Culture seekers"],
    bestSeason: "Year-round",
    priceFrom: 4800,
    maxGuests: 8,
    image: media.valueCommunity,
    gallery: [media.local.homestay, media.local.marketDay, media.local.tishu02, media.local.portraitWarm],
    communityLed: true,
    overview:
      "Featured across TRIS fixed departures and classic packages — Mawlynnong overnight stays put you with local hosts in Asia’s cleanest village, with guided village walks and heritage house visits.",
    trisStory:
      "On Root Trails, guests pack their own lunch village-style and share double-sharing homestays. Stay upgrades are available on request. Every booking supports community partners who make TRIS journeys possible.",
    highlights: [
      "Overnight village homestay",
      "Guided village walk",
      "Heritage house visit",
      "Optional living root bridge day-trips nearby",
    ],
    included: ["Homestay (double-sharing base)", "Local host orientation", "Village walk"],
    whatToBring: ["Respectful clothing", "Cash for crafts & snacks", "Mosquito protection"],
    meetingPoint: "Mawlynnong village (transfer options available)",
    itinerary: [
      {
        time: "Afternoon",
        title: "Arrive & settle",
        description: "Meet hosts; village orientation.",
      },
      {
        time: "Evening",
        title: "Heritage walk",
        description: "Quiet lanes, living root bridge viewpoints nearby.",
      },
      {
        time: "Morning",
        title: "Breakfast & onward",
        description: "Continue to Pynursla / Shillong or a root bridge trail.",
      },
    ],
    faqs: [],
    reviews: [],
    sourceUrl: "https://www.trismeghalaya.com/fixed-departures",
  },
];

export function getExperience(slug: string) {
  return experiences.find((e) => e.slug === slug);
}

export const experienceFilters = {
  locations: ["Sohra", "East Khasi Hills", "Jaintia Hills", "Ri-Bhoi"],
  durations: ["Half Day", "Full Day", "Multi-Day"],
  difficulties: ["Easy", "Moderate", "Challenging"] as Difficulty[],
  spirits: [
    { id: "slow", label: "Slow Paced", icon: "snail" },
    { id: "thrill", label: "Thrill Seeking", icon: "climb" },
    { id: "family", label: "Family Friendly", icon: "family" },
  ],
};
