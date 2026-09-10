import { listings, media } from "./media";

export type DestinationRegion =
  | "East Khasi Hills"
  | "West Khasi Hills"
  | "West Jaintia Hills"
  | "Ri Bhoi";

export type Destination = {
  slug: string;
  name: string;
  region: DestinationRegion;
  tagline: string;
  overview: string;
  highlights: string[];
  interestingFact?: string;
  distances: {
    shillong: string;
    guwahatiAirport: string;
    umroiAirport: string;
  };
  image: string;
  gallery: string[];
  relatedExperienceSlugs?: string[];
  relatedJourneySlugs?: string[];
  sourceUrl: string;
  /** When `hidden` or `draft`, the place is omitted from public pages. */
  status?: "active" | "draft" | "hidden";
  /** Soft-delete tombstone — seed cannot resurrect this slug. */
  removedFromCatalogue?: boolean;
};

/**
 * Destinations mapped from https://www.trismeghalaya.com/destination/*
 * and category pages (East / West Khasi, West Jaintia).
 * Copy for Mawlynnong, Mawsynram, Nongriat, Shnongpdeng scraped Aug 2026;
 * Sohra, Laitlum, Mawphlang filled from live IA + TRIS package/story context.
 */
export const destinations: Destination[] = [
  {
    slug: "mawlynnong",
    name: "Mawlynnong",
    region: "East Khasi Hills",
    tagline: "Asia’s cleanest village — God’s Own Garden.",
    overview:
      "Mawlynnong is recognised for its cleanliness. The village was awarded the title of “Asia’s cleanest village” in 2003 by Discover India. In addition, the village has achieved a 100 percent literacy rate and strong women empowerment. Also known as “God’s Own Garden,” community is the backbone of the village — bamboo dustbins for waste collection, composting as manure, and a culture that frowns on smoking and plastic.",
    highlights: [
      "Asia’s cleanest village (Discover India, 2003)",
      "Church of Epiphany — Welsh missionary church from 1902",
      "Nearby living root bridge of Ficus elastica",
      "Community composting and plastic-conscious village life",
    ],
    interestingFact:
      "A hundred-year-old European church sits in the village — built in 1902 by Welsh Christian missionaries.",
    distances: {
      shillong: "79 km",
      guwahatiAirport: "188 km",
      umroiAirport: "99 km",
    },
    image: listings.destination("mawlynnong"),
    gallery: [media.forest, media.trail, media.heroMist],
    relatedExperienceSlugs: ["mawlynnong-village-stay", "offbeat-living-root-bridge"],
    sourceUrl: "https://www.trismeghalaya.com/destination/mawlynnong",
  },
  {
    slug: "mawsynram",
    name: "Mawsynram",
    region: "East Khasi Hills",
    tagline: "Wettest place on earth — stone, caves, and endless rain.",
    overview:
      "‘Maw’ in Khasi means ‘Stone’. The village is most famous for the gigantic stalagmite formation that resembles a shivling — and for receiving the highest rainfall in India. Of all the spots here, travellers seek Krem Dam (cave with underground waterway & beaches), Krem Puri (longest sandstone cave in the world), Mawlongbna, and Lum Symper.",
    highlights: [
      "Among the wettest places on Earth",
      "Iconic stalagmite rock formation",
      "Krem Dam cave & underground waterway",
      "Krem Puri — longest sandstone cave in the world",
    ],
    interestingFact:
      "In 1985, Mawsynram entered the Guinness Book of World Records for receiving 83 feet of annual rainfall. In 2022 it recorded over 1000 mm in a single day.",
    distances: {
      shillong: "61 km",
      guwahatiAirport: "162 km",
      umroiAirport: "86 km",
    },
    image: listings.destination("mawsynram"),
    gallery: [media.water, media.cliffs, media.heroMist],
    relatedExperienceSlugs: ["mawsynram-river-trek", "krem-puri-cave"],
    sourceUrl: "https://www.trismeghalaya.com/destination/mawsynram",
  },
  {
    slug: "nongriat",
    name: "Nongriat",
    region: "East Khasi Hills",
    tagline: "Home of the Double Decker Living Root Bridge.",
    overview:
      "Nongriat is famous for the living root bridges of the banyan tree. With vast gorges across villages, locals fashioned “living” bridges from tree roots grown along a path over generations. The Double Decker Living Root Bridge is not to be missed. Reaching it means walking roughly 3,000 steps down from Tyrna village — then onward trails lead toward Rainbow Falls and its turquoise pool.",
    highlights: [
      "Double Decker Living Root Bridge",
      "~3,000 steps from Tyrna village",
      "Traditional Khasi Ficus elastica architecture",
      "Trek onward to Rainbow Falls",
    ],
    interestingFact:
      "These bridges can take 10–15 years to grow, get stronger each year, may survive up to 500 years, and can support as many as 50 people at a time.",
    distances: {
      shillong: "65 km",
      guwahatiAirport: "179 km",
      umroiAirport: "91 km",
    },
    image: listings.destination("nongriat"),
    gallery: [media.canopy, media.trail, media.forest],
    relatedExperienceSlugs: ["double-decker-living-root-bridge", "offbeat-living-root-bridge"],
    sourceUrl: "https://www.trismeghalaya.com/destination/nongriat",
  },
  {
    slug: "shnongpdeng",
    name: "Dawki — Shnongpdeng",
    region: "West Jaintia Hills",
    tagline: "Crystal Umngot river on the India–Bangladesh border.",
    overview:
      "Dawki sits on the India–Bangladesh border along the southern ranges of Meghalaya. The pristine Umngot River through Shnongpdeng is a must for boating over water so clear it creates an illusion of floating on glass. Riverside camps, swimming, and fishing are part of the outdoor rhythm. The Dawki Suspension Bridge — built by the British in 1932 — offers panoramic views over the emerald river.",
    highlights: [
      "Crystal-clear Umngot River boating",
      "Dawki Suspension Bridge (1932)",
      "Riverside camping, swimming & fishing",
      "Border landscapes and emerald water",
    ],
    interestingFact:
      "Dawki is a major trading route directly connected to Bangladesh — tourism flourished around the river’s emerald clarity.",
    distances: {
      shillong: "88 km",
      guwahatiAirport: "198 km",
      umroiAirport: "107.4 km",
    },
    image: listings.destination("shnongpdeng"),
    gallery: [media.water, media.peaks, media.familyWaterfall],
    relatedExperienceSlugs: ["umngot-dawki"],
    sourceUrl: "https://www.trismeghalaya.com/destination/shnongpdeng",
  },
  {
    slug: "laitlum",
    name: "Laitlum Canyons",
    region: "East Khasi Hills",
    tagline: "Edge-of-the-world canyons above endless green valleys.",
    overview:
      "Laitlum — “end of the hills” — is a canyon viewpoint east of Shillong where grasslands drop into deep valleys. It often opens TRIS day itineraries: wide skies, quiet ridges, and a slower start before Dawki or living-root trails. Ideal for photography, short walks, and travellers who want space before denser tourist circuits.",
    highlights: [
      "Canyon and valley viewpoints",
      "Open grasslands and ridge walks",
      "Often paired with Dawki / Mawlynnong days",
      "Quiet alternative to busier Sohra lookouts",
    ],
    distances: {
      shillong: "~25 km",
      guwahatiAirport: "~145 km",
      umroiAirport: "~50 km",
    },
    image: listings.destination("laitlum"),
    gallery: [media.peaks, media.mountains, media.heroMist],
    relatedExperienceSlugs: ["offbeat-living-root-bridge"],
    sourceUrl: "https://www.trismeghalaya.com/destinations/categories/east-khasi-hills",
  },
  {
    slug: "sohra",
    name: "Sohra (Cherrapunji)",
    region: "East Khasi Hills",
    tagline: "One of the wettest places on earth — cliffs, falls, and living root bridges.",
    overview:
      "Sohra, earlier known as Cherrapunjee, is one of the wettest places on earth. Due to the wet climatic conditions, the vegetation remains full of greens and blooms throughout the year, favouring rich wild habitats. It is famous for its living bridges from rubber wood. The sky never remains the same — one minute perfect blue, the next golden yellow — giving the whole area a dreamy shade and colour.",
    highlights: [
      "Nohkalikai Falls, Arwah Cave & Khoh Ramhah viewpoint",
      "Dainthlen Falls, Mawsmai cave & Nohkalikai crest",
      "Living root bridges and limestone plateaus",
      "Dynamic monsoon skies year-round",
    ],
    interestingFact:
      "Annual rainfall in Cherrapunjee is 450 inches (37.5 feet), still holding the all-time record for the most rainfall in a calendar year.",
    distances: {
      shillong: "54 km",
      guwahatiAirport: "164 km",
      umroiAirport: "80 km",
    },
    image: listings.destination("sohra"),
    gallery: [media.rain, media.cliffs, media.water],
    relatedExperienceSlugs: ["short-escape-sohra-day"],
    sourceUrl: "https://www.trismeghalaya.com/destination/sohra",
  },
  {
    slug: "mawphlang",
    name: "Mawphlang Sacred Grove",
    region: "West Khasi Hills",
    tagline: "A protected Khasi forest where tradition still holds the trees.",
    overview:
      "Mawphlang’s sacred grove is among Meghalaya’s best-known Law Kyntang — a forest conserved by community custom. Walking here is less about adventure ticking and more about listening: moss, old trees, and stories of why certain places remain untouched. It sits on the West Khasi Hills route that TRIS highlights alongside East Khasi and Jaintia destinations.",
    highlights: [
      "Khasi sacred grove (Law Kyntang)",
      "Community-conserved forest",
      "Quiet interpretive walks",
      "West Khasi Hills cultural landscape",
    ],
    distances: {
      shillong: "~25 km",
      guwahatiAirport: "~145 km",
      umroiAirport: "~45 km",
    },
    image: listings.destination("mawphlang"),
    gallery: [media.canopy, media.heroForest, media.trail],
    relatedExperienceSlugs: ["mawphlang-sacred-forest"],
    sourceUrl: "https://www.trismeghalaya.com/destinations/categories/west-khasi-hills",
  },
];

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}

export function destinationsByRegion(region: DestinationRegion) {
  return destinations.filter((d) => d.region === region);
}

export const destinationRegions: DestinationRegion[] = [
  "East Khasi Hills",
  "West Khasi Hills",
  "West Jaintia Hills",
  "Ri Bhoi",
];
