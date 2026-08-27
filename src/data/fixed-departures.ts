export type FixedDayPlan = {
  day: number;
  title: string;
  summary: string;
  activities?: string;
  meals?: string;
  trekDifficulty?: string;
  overnight?: string;
};

export type FixedDeparturePatch = {
  idCode: string; // e.g. "FD:01"
  name: string;
  tagline: string;
  overview: string; // "Why this journey" body
  whyTitle: string; // e.g. "Why This Journey?"
  days: number;
  nights: number;
  priceFrom: number;
  startingPoint: string;
  groupSize: string;
  season: string;
  style: string[];
  route?: string;
  tourHighlights: string[];
  itinerary: FixedDayPlan[];
  inclusions: string[];
  exclusions: string[];
  departureSeats: { date: string; seats: number; held: number; booked: number; note?: string }[];
  nextDeparture: string;
  ctaRegister: string;
  ctaCustomise: string;
};

export const FIXED_DEPARTURE_PATCHES: Record<string, FixedDeparturePatch> = {
  "womens-soulful-escape": {
    idCode: "FD:01",
    name: "Wild & Free: Soulful Escape for Women in Meghalaya",
    tagline: "Where Sisterhood Meets the Spirit of the Hills",
    whyTitle: "Why This Journey?",
    overview:
      "This isn't just a tour — it's a space to breathe, to belong, and to break free. Designed exclusively for women, this immersive escape brings together solo female travelers to share stories, explore safely, and reconnect with themselves in the heart of Meghalaya's untouched nature and warm communities.\n\nIn a world where women often travel last — this journey is about putting yourself first. Whether you're looking to try cliff jumping for the first time, hike through living root bridges, or sit by a bonfire under the stars — you'll do it all, surrounded by laughter, support, and unforgettable memories. With lady guides, curated homestays, and a local circle of safety, you're never truly alone.\n\nLet this be the trip you said yes to yourself.",
    days: 7,
    nights: 6,
    priceFrom: 38299,
    startingPoint: "Guwahati",
    groupSize: "4–10 max",
    season: "Multiple dates · Oct–Dec",
    style: ["Women-only", "Small group", "Sisterhood"],
    route:
      "Guwahati → Shillong → Laitlum → Phe Phe → Krangshuri → Dawki → Mawlynnong → Mawsynram → Shillong → Guwahati",
    tourHighlights: [
      "Travel in a small, like-minded women-only group",
      "Local guide at key locations",
      "Authentic safe selective cottage, guest house & homestays in remote villages, beside rivers and forests",
      "Easy to moderate hikes to waterfalls & root bridges",
      "Bonfire nights & starry skies by the riverside",
      "Soulful experiences in nature & hidden canyons",
      "Kayaking, ziplining, cliff jumping & river fun",
      "Market visits and local shopping sprees",
    ],
    itinerary: [
      {
        day: 1,
        title: "Welcome to the Hills",
        summary:
          "Arrive at Guwahati Airport – transfer to Shillong (approx. 120 km / 4 hrs). Meet your all-women tribe and travel together to Shillong. Check-in, unwind, and enjoy a warm welcome dinner.",
        activities: "Airport pickup, transfer to Shillong, welcome dinner",
        meals: "Dinner",
        overnight: "Shillong",
      },
      {
        day: 2,
        title: "Waterfalls & Canyons",
        summary:
          "Shillong – Laitlum Canyons – Phe Phe Falls – Krangshuri – Dawki (approx. 100 km / 5 hrs). Hike to stunning viewpoints, majestic waterfalls, and explore crystal-blue waters.",
        activities: "Laitlum Canyons, Phe Phe Falls, Krangshuri, Dawki",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Village homestay by the Dawki riverside",
      },
      {
        day: 3,
        title: "Water Adventure Day!",
        summary:
          "A full day of water activities for the bold and curious! Kayaking, boating, cliff jumping, ziplining — all surrounded by serene mountain landscapes. Enjoy a peaceful bonfire under the stars. Confidence-boosting, fun & free!",
        activities: "Kayaking, boating, cliff jumping, ziplining, bonfire",
        meals: "Breakfast, Lunch & Dinner",
        overnight: "Homestay or camping by the river",
      },
      {
        day: 4,
        title: "Root Bridges & Village Charm",
        summary:
          "Dawki – Mawlynnong – Mawsynram (approx. 100 km / 4.5 hrs). Walk through the cleanest village in Asia, then trek to two iconic living root bridges.",
        activities: "Mawlynnong village walk, living root bridges",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Cottage, village near Mawsynram",
      },
      {
        day: 5,
        title: "Lady Explorer's Adventure Day",
        summary:
          "Split rocks, cave trails, jungle streams, or river trekking — adventure tailor-made for your comfort and thrill level. Your local woman guide leads the way.",
        activities: "Split rock, cave trails, jungle streams, or river trekking",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Moderate",
        overnight: "Cottage, village near Mawsynram",
      },
      {
        day: 6,
        title: "Natural Pools & Farewell Market Fun",
        summary:
          "Mawsynram – Cliff Canyon Hike – Shillong (approx. 90 km / 4 hrs). Begin your day with a hike to canyons and a refreshing dip in a secret natural pool. Later, return to Shillong for shopping and shared stories over a meal.",
        activities: "Cliff canyon hike, natural pool, Shillong markets",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Easy",
        overnight: "Shillong",
      },
      {
        day: 7,
        title: "Until We Meet Again",
        summary:
          "Shillong – Guwahati Airport (approx. 120 km / 4 hrs). Depart with laughter, friendship, and a spirit full of wild memories.",
        activities: "Transfer to Guwahati Airport",
        meals: "Breakfast",
      },
    ],
    inclusions: [
      "Accommodation as per itinerary",
      "Daily breakfast, 3 lunch & 6 dinner (details as specified in the itinerary)",
      "Experiences as mentioned in the itinerary",
      "Activities — Dawki: boating, kayaking, zip lining, cliff jumping & bonfire",
      "Activities — Mawsynram: split rock, river trekking or caving, kayaking, entry fees to reservoir",
      "Guided tours and local expert support (where applicable as mentioned in the itinerary)",
      "Private transportation for the group with professional driver for 8 days as per itinerary",
      "Driver's food, accommodation, and service charges",
      "Toll taxes, parking fees, fuel charges",
      "One time common pickup and drop from the airport (Guwahati/Shillong as applicable)",
      "All inner-line permits (if required)",
      "Emergency assistance and on-ground support",
      "Applicable GST",
    ],
    exclusions: [
      "Entry fees which is directly payable on the spot and minimal",
      "Visa, passport, or vaccination charges",
      "Travel insurance, medical expenses, or emergency evacuations",
      "Laundry, tips, or personal expenses",
      "Any services not mentioned in the itinerary",
      "Additional expenses due to force majeure, natural events, political unrest, or unexpected disruptions",
    ],
    departureSeats: [
      { date: "2026-10-18", seats: 10, held: 0, booked: 0 },
      { date: "2026-11-15", seats: 10, held: 0, booked: 0 },
      { date: "2026-12-13", seats: 10, held: 0, booked: 0 },
    ],
    nextDeparture: "18 Oct 2026 · seats limited",
    ctaRegister: "Register Now to secure your place",
    ctaCustomise: "Still have questions or want to customize your journey?",
  },

  "blossoms-and-beyond": {
    idCode: "FD:02",
    name: "Blossoms & Beyond",
    tagline: "Cherry Blossoms, Waterfalls & Wilderness",
    whyTitle: "Why This Journey?",
    overview:
      "Step into a journey where nature sings — through blooming cherry blossoms, sacred groves, cascading waterfalls, and the rhythmic beats of Meghalaya's famous music festival. Blossoms & Beyond is a curated experience blending seasonal beauty with cultural celebration and offbeat adventure. From city charm to canyon trails and forest hikes, this tour is designed for those who crave visual splendor and immersive travel.",
    days: 8,
    nights: 7,
    priceFrom: 38999,
    startingPoint: "Guwahati",
    groupSize: "4–10 max",
    season: "Cherry blossom season · November",
    style: ["Festival", "Small group", "Nature"],
    route:
      "Guwahati → Shillong → Mawphlang → Laitlum → Cherrapunjee → Arwah Cave → Mawlynnong → Dawki → Krang Shuri → Phe Phe → Shillong → Guwahati",
    tourHighlights: [
      "Cherry blossom season in Meghalaya",
      "Sacred forest guided walk",
      "Cherry Blossom Music Festival",
      "Nohkalikai Crest guided trek",
      "Fossil cave & living root bridge",
      "Dawki river kayaking",
      "Offbeat hike to Phe Phe Falls",
      "Bonfire & riverside stay",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Guwahati – Drive to Shillong",
        summary:
          "Arrive in Guwahati and drive through scenic hills to Shillong — the \"Scotland of the East\" (100 km | approx. 3.5 hrs). Settle in and unwind, or take a casual stroll through the buzzing local markets or nearby cafés.",
        activities: "Scenic drive to Shillong, optional market/café stroll",
        meals: "Dinner",
        overnight: "Shillong",
      },
      {
        day: 2,
        title: "Sacred Forest Walk & Cherry Blossom Music Festival",
        summary:
          "Start with a visit to the Don Bosco Museum, then experience a guided walk in the Sacred Forest of Mawphlang, a place of ancient legends and biodiversity. In the evening, head to the Cherry Blossom Festival – a unique blend of music, lights, and floral magic. Festival ticket cost is additional and subject to availability.",
        activities: "Don Bosco Museum, Mawphlang Sacred Forest, Cherry Blossom Music Festival",
        meals: "Breakfast, Traditional Khasi Lunch",
        trekDifficulty: "Easy (Sacred Grove Trail approx. 2 hours)",
        overnight: "Shillong",
      },
      {
        day: 3,
        title: "Canyons & Cherry Blossoms",
        summary:
          "Enjoy a morning drive to the stunning Laitlum Canyons (50 km round trip), perfect for panoramic views and quiet contemplation. Return to Shillong to wander around Ward's Lake, Polo Grounds, or Shillong Golf Course, where cherry blossoms bloom in full glory.",
        activities: "Laitlum Canyons, Ward's Lake / Polo Grounds / Shillong Golf Course",
        meals: "Breakfast",
        overnight: "Shillong",
      },
      {
        day: 4,
        title: "Shillong – Cherrapunjee",
        summary:
          "Head south to Cherrapunjee (55 km | approx. 2 hrs), home to the planet's heaviest rains and surreal landscapes. Today explore Garden of Caves and Nohkalikai viewpoint. The evening is free to rest or explore locally before tomorrow's exciting trek.",
        activities: "Garden of Caves, Nohkalikai viewpoint",
        meals: "Breakfast & Dinner",
        overnight: "Cherrapunjee",
      },
      {
        day: 5,
        title: "Guided Trek to Nohkalikai Crest",
        summary:
          "Venture on a guided trek to the crest of Nohkalikai Falls, far above the usual viewpoints. The trail winds through pine ridges, natural pool, waterfall and sweeping plateaus — a challenging but immensely rewarding adventure.",
        activities: "Guided Nohkalikai Crest trek",
        meals: "Breakfast, Packed Lunch & Dinner",
        trekDifficulty: "Medium to Extreme (4–5 hrs round trip)",
        overnight: "Cherrapunjee",
      },
      {
        day: 6,
        title: "Cherrapunjee – Arwah Cave – Mawlynnong – Dawki",
        summary:
          "Visit Arwah Cave, filled with fossil impressions and limestone formations, then continue to Mawlynnong – Asia's cleanest village (90 km | approx. 3.5 hrs drive time). Walk to the Living Root Bridge before heading to Dawki, where riverside calm awaits.",
        activities: "Arwah Cave, Mawlynnong, Living Root Bridge, Dawki riverside",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy cave exploration",
        overnight: "Riverside stay in Dawki with bonfire",
      },
      {
        day: 7,
        title: "Dawki – Krang Shuri – Phe Phe Falls Hike",
        summary:
          "Begin your day with boating or kayaking on the crystal-clear Umngot River, then drive towards Amlarem and marvel at the turquoise cascades of Krang Shuri Falls (90 km | 4 hrs drive). Finish with a guided hike to the lesser-known but majestic Phe Phe Falls, before returning to Shillong.",
        activities: "Umngot River boating/kayaking, Krang Shuri Falls, Phe Phe Falls hike",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Moderate (Phe Phe Hike 1.5 hrs approx)",
        overnight: "Shillong",
      },
      {
        day: 8,
        title: "Shillong – Guwahati Departure",
        summary:
          "After breakfast, check out and head to Guwahati for your onward journey (109 km | 3.5 hrs) — taking with you vivid memories of blossoms, bonfires, and breathless views.",
        activities: "Transfer to Guwahati",
        meals: "Breakfast",
      },
    ],
    inclusions: [
      "Accommodation as per itinerary",
      "Daily breakfast, 2 lunch & 5 dinner (details as specified in the itinerary)",
      "Activities — entry fees for Sacred Forest",
      "Activities — Dawki: boating & kayaking",
      "Experiences as mentioned in the itinerary",
      "Guided tours and local expert support (where applicable as mentioned in the itinerary)",
      "Private transportation for the group with professional driver for 8 days as per itinerary",
      "Driver's food, accommodation, and service charges",
      "Toll taxes, parking fees, fuel charges",
      "Pickup and drop from the airport (Guwahati/Shillong as applicable)",
      "Transport for daily sightseeing and local travel as per the itinerary",
      "All inner-line permits (if required)",
      "Emergency assistance and on-ground support",
      "Applicable GST",
    ],
    exclusions: [
      "Entry fees which is directly payable on the spot and minimal, unless mentioned in the inclusion",
      "Entry pass to Music Festival",
      "Visa, passport, or vaccination charges",
      "Travel insurance, medical expenses, or emergency evacuations",
      "Laundry, tips, or personal expenses",
      "Any services not mentioned in the itinerary",
      "Additional expenses due to force majeure, natural events, political unrest, or unexpected disruptions",
    ],
    departureSeats: [{ date: "2026-11-13", seats: 10, held: 0, booked: 0 }],
    nextDeparture: "13 Nov 2026 · seats limited",
    ctaRegister: "Register Now to secure your place",
    ctaCustomise: "Still have questions or want to customize your journey?",
  },
};

export const FIXED_LISTING_INTRO = {
  eyebrow: "Fixed departures",
  title: "Some Journeys Are Better Shared",
  lead:
    "Whether you're chasing clouds in the Khasi Hills, dancing at a local festival, or hiking to ancient living root bridges — some experiences are just richer when shared.",
  body: [
    "Our fixed departure tours are more than just set schedule. They're thoughtfully crafted group experiences — some made especially for women, others for seasonal festivals or themed adventures.",
    "You'll join a small group of like-hearted travelers, discover Meghalaya through local stories, and enjoy the comfort of a well-planned itinerary — all without the stress of planning it yourself.",
  ],
  closing: "Just show up with your curiosity — we'll handle the rest.",
  whyTitle: "Why You'll Love Fixed Departures",
  why: [
    { title: "Just Show Up", body: "Dates, stays, and plans? Already sorted", icon: "calendar" },
    {
      title: "Solo, Not Alone",
      body: "Travel independently with the comfort of a group",
      icon: "users",
    },
    {
      title: "More Value",
      body: "Share costs, not experiences. Quality stays & activities, no cutbacks",
      icon: "value",
    },
    { title: "Go Local", body: "Rooted in culture, led by locals, made for connection", icon: "local" },
    {
      title: "Built-in Sisterhood",
      body: "Especially in our ladies-only groups — find your tribe",
      icon: "sisterhood",
    },
    {
      title: "Zero Planning Stress",
      body: "We handle the details. You just travel",
      icon: "relax",
    },
  ],
};
