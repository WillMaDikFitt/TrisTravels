import { media } from "./media";

export type Journey = {
  slug: string;
  name: string;
  type: "curated" | "small-group";
  tagline: string;
  days: number;
  nights: number;
  priceFrom: number;
  /** Prices on trismeghalaya.com are based on a group of 4 unless noted */
  priceNote?: string;
  image: string;
  style: string[];
  season: string;
  overview: string;
  highlights: string[];
  itinerary: { day: number; title: string; summary: string }[];
  route?: string;
  stays: string[];
  inclusions: string[];
  nextDeparture?: string;
  groupSize?: string;
  sourceUrl: string;
};

const packageInclusions = [
  "Activities & sightseeing",
  "Guide at key locations",
  "Breakfast, dinner & selected lunches",
  "Professional driver, toll fees & fuel",
  "Seamless transport",
  "Hand-picked homestays, hotels & cosy cottages",
];

const fixedInclusions = [
  "Entry fees & guide at key locations",
  "Transport & local driver",
  "Breakfast, dinner & accommodation",
];

/** Listing data sourced from https://www.trismeghalaya.com/ (customizable packages + fixed departures). */
export const journeys: Journey[] = [
  {
    slug: "short-escape-sohra",
    name: "Short Escape – Sohra",
    type: "curated",
    tagline:
      "A short, stunning getaway into Sohra with customizable trekking options to waterfalls, caves, or living root bridges.",
    days: 3,
    nights: 2,
    priceFrom: 12600,
    priceNote: "per person, based on a group of 4",
    image: media.heroMist,
    style: ["Nature", "Trek", "Sohra"],
    season: "October to April",
    overview:
      "Short on time? This customizable package takes the guesswork out of planning a Sohra escape — choose your preferred dates, transport, stay preference, and add-ons. We handle the rest.",
    highlights: [
      "Trek to Nohkalikai Crest / Double Decker living root bridge",
      "Hidden waterfalls, Sohra’s caves & Laitlum canyons",
      "Flexible stays and vehicle options",
      "Local insights on routes most travellers miss",
    ],
    itinerary: [
      { day: 1, title: "Into Sohra", summary: "Arrive and settle; viewpoints and cliff light." },
      {
        day: 2,
        title: "Choose your trail",
        summary: "Waterfalls, caves, or living root bridges — paced to your group.",
      },
      { day: 3, title: "Laitlum & out", summary: "Canyon views before transfer out." },
    ],
    stays: ["Hand-picked homestays, hotels & cosy cottages"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "mawphanlur-meadows-escape",
    name: "Mawphanlur Meadows Escape",
    type: "curated",
    tagline:
      "Off-grid highland getaway with sacred forest walk and Nongkhnum River Island soft hike.",
    days: 3,
    nights: 2,
    priceFrom: 11100,
    priceNote: "per person, based on a group of 4",
    image: media.peaks,
    style: ["Highlands", "Village", "Slow"],
    season: "August to April",
    overview:
      "An off-grid highland getaway shaped around meadows, valleys, and a soft hike to Asia’s second-largest river island — with a village stay at the heart of it.",
    highlights: [
      "2nd largest river island in Asia (Nongkhnum)",
      "Valleys & village stay",
      "Sacred forest walk",
      "Quiet highland pacing",
    ],
    itinerary: [
      { day: 1, title: "Highlands arrival", summary: "Transfer into Mawphanlur country." },
      { day: 2, title: "Island & meadows", summary: "Nongkhnum soft hike and valley time." },
      { day: 3, title: "Return", summary: "Breakfast and transfer out." },
    ],
    stays: ["Village stay", "Hand-picked cottages"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "mawsynram-adventures",
    name: "Mawsynram Adventures",
    type: "curated",
    tagline:
      "Thrill-packed journey through Mawsynram & Mawlongbna with river trekking, caving, kayaking, and canyon hikes.",
    days: 3,
    nights: 2,
    priceFrom: 14000,
    priceNote: "per person, based on a group of 4",
    image: media.rain,
    style: ["Adventure", "River", "Caves"],
    season: "July to April",
    overview:
      "The wettest place on earth — river trekking, Split Rock, sacred forest, and a village stay in Mawlongbna. Built for travellers who want water, rock, and weather as part of the story.",
    highlights: [
      "Wettest place on earth",
      "River trekking & Split Rock",
      "Sacred forest & village stay",
      "Caving, kayaking & canyon hikes",
    ],
    itinerary: [
      { day: 1, title: "Toward the rains", summary: "Sacred forest and transfer into Mawsynram." },
      {
        day: 2,
        title: "Water & rock",
        summary: "River trek, Split Rock, and waterfall country around Mawlongbna.",
      },
      { day: 3, title: "Caves & out", summary: "Optional caving before return." },
    ],
    stays: ["Village homestay (Mawlongbna area)"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "sohra-trekkers-delight",
    name: "Sohra Trekkers Delight",
    type: "curated",
    tagline:
      "Quick nature escape into Sohra with caves, waterfalls and living root bridges — including a night in Nongriat homestay or camping.",
    days: 5,
    nights: 4,
    priceFrom: 25990,
    priceNote: "per person, based on a group of 4",
    image: media.heroRoots,
    style: ["Trek", "Roots", "Adventure"],
    season: "Mid October to March",
    overview:
      "A nature escape into Sohra with caves, waterfalls, and living root bridges. Includes a night in a Nongriat homestay or camping, with moderate to extreme trek options.",
    highlights: [
      "Caving in Mawmluh",
      "Waterfalls of Sohra",
      "Trek to the Double Decker living root bridges",
      "Nongriat homestay or camping night",
    ],
    itinerary: [
      { day: 1, title: "Sohra arrival", summary: "Settle in; cliff and waterfall orientation." },
      { day: 2, title: "Caves & falls", summary: "Mawmluh caving and waterfall time." },
      {
        day: 3,
        title: "Into Nongriat",
        summary: "Descend toward living root bridges; overnight in village or camp.",
      },
      { day: 4, title: "Root bridges", summary: "Double Decker and forest trails." },
      { day: 5, title: "Ascent & out", summary: "Climb out and transfer." },
    ],
    stays: ["Sohra stay", "Nongriat homestay or camping"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "meghalaya-escape-the-ordinary",
    name: "Meghalaya: Escape the Ordinary",
    type: "curated",
    tagline:
      "Offbeat 6-day escape into waterfalls, camps, riverside camping, and village life across Meghalaya.",
    days: 6,
    nights: 5,
    priceFrom: 22100,
    priceNote: "per person, based on a group of 4",
    image: media.familyWaterfall,
    style: ["Offbeat", "Camping", "Village"],
    season: "Mid-October to March",
    overview:
      "An offbeat six-day escape across Meghalaya — Nohkalikai Crest, riverside camping, village stays, Mawphanlur valleys, offbeat caves, clear rivers and waterfalls.",
    highlights: [
      "Trek to Nohkalikai Crest",
      "Riverside camping & village stay",
      "Hiking in the valleys of Mawphanlur",
      "Offbeat caves, clear rivers & waterfalls",
    ],
    itinerary: [
      { day: 1, title: "Arrive", summary: "Land and settle into the hills." },
      { day: 2, title: "Crests & cliffs", summary: "Nohkalikai Crest and Sohra light." },
      { day: 3, title: "Riverside camp", summary: "Camp by clear water." },
      { day: 4, title: "Village life", summary: "Host time and local food." },
      { day: 5, title: "Mawphanlur valleys", summary: "Highland hiking and caves." },
      { day: 6, title: "Departure", summary: "Transfer out." },
    ],
    stays: ["Homestays", "Riverside camping", "Cottages"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "the-pine-and-the-river",
    name: "The Pine & the River",
    type: "curated",
    tagline:
      "Balanced trail from waterfalls and root bridges to sacred groves and riverside stays with treks and kayaking.",
    days: 6,
    nights: 5,
    priceFrom: 22300,
    priceNote: "per person, based on a group of 4",
    image: media.river,
    style: ["Balanced", "Sacred groves", "Kayak"],
    season: "Mid-October to March",
    overview:
      "A balanced trail from waterfalls and root bridges to sacred groves and riverside stays — Amkoi, Nohkalikai Crest, Phephe Falls, village stay, camping, Umngot (Dawki), and sacred forest.",
    highlights: [
      "Trek to Amkoi, Nohkalikai Crest & Phephe Falls",
      "Village stay & camping",
      "Umngot river (Dawki)",
      "Waterfalls and sacred forest",
    ],
    itinerary: [
      { day: 1, title: "Arrival", summary: "Orient and rest." },
      { day: 2, title: "Falls day", summary: "Phephe and canyon country." },
      { day: 3, title: "Crest & roots", summary: "Nohkalikai Crest and forest trails." },
      { day: 4, title: "Sacred grove", summary: "Quiet forest walk with local hosts." },
      { day: 5, title: "Dawki", summary: "Umngot river time and kayaking options." },
      { day: 6, title: "Out", summary: "Transfer and farewell." },
    ],
    stays: ["Village stay", "Camping", "Riverside lodges"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "essence-of-meghalaya",
    name: "Essence of Meghalaya",
    type: "curated",
    tagline:
      "A relaxed 6-day journey through Meghalaya’s must-sees — Shillong, Dawki, Mawlynnong, and Cherrapunjee — designed for comfort and ease.",
    days: 6,
    nights: 5,
    priceFrom: 22250,
    priceNote: "per person, based on a group of 4",
    image: media.packages,
    style: ["Classic", "Comfort", "Family-friendly"],
    season: "January to December",
    overview:
      "A relaxed six-day journey through Meghalaya’s must-see destinations — Shillong city, Asia’s cleanest village, living root bridges, Sohra, and the Umngot river — designed for comfort and ease.",
    highlights: [
      "Shillong city",
      "Mawlynnong — cleanest village in Asia",
      "Living root bridge",
      "Sohra & Umngot river (Dawki)",
    ],
    itinerary: [
      { day: 1, title: "Shillong", summary: "Arrive and ease into the capital." },
      { day: 2, title: "Sohra", summary: "Cliffs, caves, and waterfall country." },
      { day: 3, title: "Root bridges", summary: "Living root bridge day at a gentle pace." },
      { day: 4, title: "Mawlynnong", summary: "Village stay in Asia’s cleanest village." },
      { day: 5, title: "Dawki", summary: "Umngot river and border views." },
      { day: 6, title: "Departure", summary: "Return via Shillong." },
    ],
    stays: ["Hotels & cosy cottages", "Village stays"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "wild-monsoon-trail",
    name: "Wild Monsoon Trail",
    type: "curated",
    tagline:
      "Offbeat monsoon adventure through sacred forests, root bridges, waterfalls, caves, and misty highlands.",
    days: 7,
    nights: 6,
    priceFrom: 30150,
    priceNote: "per person, based on a group of 4",
    image: media.forest,
    style: ["Monsoon", "Offbeat", "Adventure"],
    season: "Mid-May to September",
    overview:
      "An offbeat monsoon adventure — hiking hidden waterfalls, river trekking, Mawphanlur, sacred forests, living root bridges, and caves when Meghalaya is at its most dramatic.",
    highlights: [
      "Hiking hidden waterfalls",
      "River trekking",
      "Mawphanlur & sacred forests",
      "Living root bridges and caves",
    ],
    itinerary: [
      { day: 1, title: "Arrive in rain country", summary: "Settle in as weather sets the mood." },
      { day: 2, title: "Sacred forests", summary: "Grove walks with local interpretation." },
      { day: 3, title: "Hidden falls", summary: "Trail days for monsoon waterfalls." },
      { day: 4, title: "River trek", summary: "Water-level adventure with guides." },
      { day: 5, title: "Root bridges", summary: "Living architecture in the mist." },
      { day: 6, title: "Highlands", summary: "Mawphanlur and caves." },
      { day: 7, title: "Out", summary: "Transfer and close." },
    ],
    stays: ["Homestays", "Highland cottages"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "kaziranga-to-khasi-hills",
    name: "Kaziranga to Khasi Hills Escape",
    type: "curated",
    tagline:
      "Blend Kaziranga safaris with Meghalaya’s canyons, caves, waterfalls, and sacred forests at a gentle pace.",
    days: 9,
    nights: 8,
    priceFrom: 49350,
    priceNote: "per person, based on a group of 4",
    image: media.mountains,
    style: ["Safari", "Culture", "Nature"],
    season: "Mid-October to March",
    overview:
      "Blend Kaziranga safaris with Meghalaya’s canyons, caves, waterfalls, and sacred forests — plus Umngot (Dawki) and local Khasi cuisine — at a gentle pace.",
    highlights: [
      "Kaziranga safari",
      "Sacred forest",
      "Living root bridges",
      "Umngot river (Dawki) & local Khasi cuisine",
    ],
    itinerary: [
      { day: 1, title: "Arrive Assam", summary: "Settle near Kaziranga." },
      { day: 2, title: "Safari", summary: "Morning and evening wildlife drives." },
      { day: 3, title: "Toward the hills", summary: "Transfer into Meghalaya." },
      { day: 4, title: "Sacred forest", summary: "Quiet grove walk." },
      { day: 5, title: "Root bridges", summary: "Living architecture day." },
      { day: 6, title: "Caves & falls", summary: "Sohra circuit at an easy pace." },
      { day: 7, title: "Dawki", summary: "Umngot river time." },
      { day: 8, title: "Village & food", summary: "Khasi cuisine and host time." },
      { day: 9, title: "Departure", summary: "Transfer out." },
    ],
    stays: ["Safari lodge", "Homestays", "Hill cottages"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "family-sojourn",
    name: "Family Sojourn",
    type: "curated",
    tagline:
      "A gentle-paced Meghalaya journey designed for families and seniors — caves, waterfalls, villages, and river activities.",
    days: 9,
    nights: 8,
    priceFrom: 38730,
    priceNote: "per person, based on a group of 4",
    image: media.familyWaterfall,
    style: ["Family", "Gentle pace", "Seniors"],
    season: "October to April",
    overview:
      "A gentle-paced Meghalaya journey designed for families and seniors — Brahmaputra sunset cruise, sacred forests, caves, waterfalls, valleys, Umngot (Dawki), and living root bridges.",
    highlights: [
      "Brahmaputra River sunset cruise",
      "Sacred forests, caves & waterfalls",
      "Valleys and Umngot river (Dawki)",
      "Living root bridges at a comfortable pace",
    ],
    itinerary: [
      { day: 1, title: "Guwahati", summary: "Arrive; Brahmaputra sunset cruise." },
      { day: 2, title: "Into the hills", summary: "Transfer to Shillong / Sohra region." },
      { day: 3, title: "Easy nature", summary: "Viewpoints and short walks." },
      { day: 4, title: "Sacred forest", summary: "Gentle grove interpretation." },
      { day: 5, title: "Caves & falls", summary: "Accessible chambers and waterfalls." },
      { day: 6, title: "Root bridges", summary: "Living roots with support and pacing." },
      { day: 7, title: "Dawki", summary: "Umngot river day." },
      { day: 8, title: "Village day", summary: "Host kitchen and rest." },
      { day: 9, title: "Departure", summary: "Transfer to airport." },
    ],
    stays: ["Comfort-forward hotels & cottages", "Selected homestays"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "soul-trails",
    name: "Soul Trails",
    type: "curated",
    tagline:
      "A 13-day immersive adventure across Meghalaya’s hidden gems — homestays, treks, sacred forests, caves, and river adventures.",
    days: 13,
    nights: 12,
    priceFrom: 68250,
    priceNote: "per person, based on a group of 4",
    image: media.heroForest,
    style: ["Immersive", "Offbeat", "Culture"],
    season: "Mid October to March",
    overview:
      "A 13-day immersive adventure across Meghalaya’s hidden gems — offbeat living root bridges, whistling village, river trekking, offbeat caves, waterfalls, canyons, culture and tradition.",
    highlights: [
      "Offbeat living root bridge trails",
      "Whistling village",
      "River trekking & offbeat caves",
      "Waterfalls, canyons, culture & tradition",
    ],
    itinerary: [
      { day: 1, title: "Arrive", summary: "Settle into Meghalaya time." },
      { day: 2, title: "City & hills", summary: "Shillong orientation." },
      { day: 3, title: "Sacred forests", summary: "Grove walks and folklore." },
      { day: 4, title: "Whistling village", summary: "Community encounter." },
      { day: 5, title: "Canyons", summary: "Laitlum and open views." },
      { day: 6, title: "Offbeat roots I", summary: "Quieter living root bridge country." },
      { day: 7, title: "Offbeat roots II", summary: "Deeper forest trails." },
      { day: 8, title: "River trek", summary: "Water-level adventure day." },
      { day: 9, title: "Caves", summary: "Offbeat cave exploration." },
      { day: 10, title: "Waterfalls", summary: "Hidden falls and rest." },
      { day: 11, title: "Village immersion", summary: "Homestay and local food." },
      { day: 12, title: "Culture day", summary: "Craft, music, or host kitchen." },
      { day: 13, title: "Departure", summary: "Transfer out." },
    ],
    stays: ["Homestays", "Village guesthouses", "Selected cottages"],
    inclusions: packageInclusions,
    sourceUrl: "https://www.trismeghalaya.com/customizable-packages",
  },
  {
    slug: "womens-soulful-escape",
    name: "Women's Soulful Escape",
    type: "small-group",
    tagline:
      "A ladies-only small-group journey — travel with safety, support, and your tribe across Meghalaya’s soulful route.",
    days: 7,
    nights: 6,
    priceFrom: 38299,
    image: media.departures,
    style: ["Women-only", "Small group", "Culture"],
    season: "Multiple dates",
    overview:
      "Some journeys are better shared. Just show up with your curiosity — we’ll handle the rest. Built-in sisterhood, local hosts, and a route from Guwahati through Shillong, Laitlum, Phe Phe, Krangshuri, Dawki, Mawlynnong, Mawsynram, and back.",
    highlights: [
      "Ladies-only small group (4–10)",
      "Dates, stays & plans already sorted",
      "Rooted in culture, led by locals",
      "Share costs, not experiences — upgrades on request",
    ],
    itinerary: [
      { day: 1, title: "Guwahati → Shillong", summary: "Arrive and settle with the group." },
      { day: 2, title: "Laitlum & Phe Phe", summary: "Canyons and waterfall country." },
      { day: 3, title: "Krangshuri", summary: "Blue waters and slow sightseeing." },
      { day: 4, title: "Dawki", summary: "Umngot river and border views." },
      { day: 5, title: "Mawlynnong", summary: "Village stay in Asia’s cleanest village." },
      { day: 6, title: "Mawsynram", summary: "Wettest-place atmosphere and local hosts." },
      { day: 7, title: "Shillong → Guwahati", summary: "Return and farewell." },
    ],
    route:
      "Guwahati → Shillong → Laitlum → Phe Phe → Krangshuri → Dawki → Mawlynnong → Mawsynram → Shillong → Guwahati",
    stays: ["Shared quality stays", "Village accommodations"],
    inclusions: fixedInclusions,
    nextDeparture: "Multiple dates — seats limited",
    groupSize: "4–10 persons",
    sourceUrl: "https://www.trismeghalaya.com/fixed-departures",
  },
  {
    slug: "offbeat-living-root-bridge",
    name: "Offbeat Living Root Bridge",
    type: "small-group",
    tagline:
      "For travellers who go beyond tourist paths — to feel the place, not just visit it. Up to six living bridges. One forest.",
    days: 2,
    nights: 1,
    priceFrom: 6990,
    image: media.heroRoots,
    style: ["Roots", "Small group", "Offbeat"],
    season: "Weekly Mondays · 12 Jan 2026 — 6 Apr 2026",
    overview:
      "Root Trails is designed for travellers who want Meghalaya beyond the postcard route. Stay in a village, walk quiet forest paths, and visit living root bridges most travellers never reach. Groups stay small — 4 to 10 — so experiences stay personal, safe, and open to connection. Day 1 is easy and scenic (Laitlum, Krangshuri, Dawki, Mawlynnong overnight). Day 2 is the offbeat Rangthylliang–Mawkyrnot root bridge trail.",
    highlights: [
      "Laitlum Canyons, Krangshuri Falls & Dawki",
      "Overnight village homestay at Mawlynnong (double-sharing)",
      "Moderate trek (3–4 hrs) — up to 6 offbeat living root bridges",
      "Guided village walk + heritage house visit",
      "Pack-your-own-lunch village style",
      "Direct community-supporting experience",
    ],
    itinerary: [
      {
        day: 1,
        title: "Scenic & slow",
        summary:
          "Sightseeing at Laitlum Canyons, Krangshuri Falls, Dawki — overnight village stay at Mawlynnong.",
      },
      {
        day: 2,
        title: "Root bridge trail",
        summary:
          "Offbeat Rangthylliang–Mawkyrnot trail — up to six living bridges; return via Pynursla to Shillong.",
      },
    ],
    route: "Shillong → Laitlum → Krangshuri → Dawki → Mawlynnong → Pynursla → Shillong",
    stays: ["Village homestay at Mawlynnong (double-sharing; upgrades on request)"],
    inclusions: fixedInclusions,
    nextDeparture: "Every Monday · register with no upfront payment",
    groupSize: "4–10 persons",
    sourceUrl:
      "https://www.trismeghalaya.com/fixed-departures/rooted-trails%3A-the-offbeat-living-root-bridge-experience",
  },
];

export function getJourney(slug: string) {
  return journeys.find((j) => j.slug === slug);
}
