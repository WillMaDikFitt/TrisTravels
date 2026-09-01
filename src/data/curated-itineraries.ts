export type CuratedDayPlan = {
  day: number;
  title: string;
  summary: string;
  activities?: string;
  meals?: string;
  trekDifficulty?: string;
  overnight?: string;
};

export type CuratedJourneyPatch = {
  name: string;
  tagline: string;
  overview: string;
  days: number;
  nights: number;
  route: string;
  stays: string[];
  experienceHighlights: string[];
  highlights: string[];
  notSuitableFor?: string[];
  itinerary: CuratedDayPlan[];
};

export const CURATED_JOURNEY_PATCHES: Record<string, CuratedJourneyPatch> = {
  "short-escape-sohra": {
    name: "Short Escape – Sohra",
    tagline:
      "A short, stunning getaway into Sohra with customizable trekking options to waterfalls, caves, or living root bridges.",
    overview:
      "Short on time? Rise into the highlands for Garden of Caves, Nohkalikai, and a choose-your-adventure day in Sohra before returning to Guwahati.",
    days: 3,
    nights: 2,
    route: "2 Nights in Sohra",
    stays: ["Sohra"],
    experienceHighlights: [
      "Nohkalikai Crest",
      "Double Decker living root bridge",
      "Hidden waterfalls & Sohra caves",
      "Laitlum canyons",
    ],
    highlights: [
      "Scenic highland drive into Sohra with Garden of Caves and Nohkalikai Viewpoint",
      "Choose your Day 2 trail: waterfall circuit, Double Decker trek, or crest & cave combo",
      "Flexible adventure pacing for a short window in Meghalaya",
      "Valley views and Don Bosco Museum on the return to Guwahati",
    ],
    notSuitableFor: ["Nightlife seekers", "Limited mobility"],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Cherrapunjee",
        summary:
          "Scenic drive into the highlands (approx. 5.5 hrs / 172 km) with stops at Garden of Caves and Nohkalikai Viewpoint. Book a morning arrival flight for a comfortable start.",
        activities: "Scenic drive, Garden of Caves, Nohkalikai Viewpoint",
        meals: "Dinner",
        overnight: "Sohra",
      },
      {
        day: 2,
        title: "Cherrapunjee Adventure",
        summary:
          "Pick your trail for the day — Waterfall Trail, Nongriat Double Decker, or Nohkalikai Crest with Arwah Cave — paced to your group's energy.",
        activities:
          "Option 1: Waterfall Trail; Option 2: Nongriat Double Decker; Option 3: Nohkalikai Crest + Arwah Cave",
        meals: "Breakfast, Packed Lunch & Dinner",
        trekDifficulty: "Moderate–Extreme (varies by option)",
        overnight: "Sohra",
      },
      {
        day: 3,
        title: "Cherrapunjee → Guwahati",
        summary:
          "Return via Dympep Valley with a stop at Don Bosco Museum (closed Sundays). Plan onward journeys after 6:00 PM.",
        activities: "Dympep Valley, Don Bosco Museum (Sunday closed)",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "mawphanlur-meadows-escape": {
    name: "Mawphanlur Meadows Escape",
    tagline:
      "Off-grid highland getaway with sacred forest walk and Nongkhnum River Island soft hike.",
    overview:
      "Trade the rush for West Khasi Hills — Umiam and Mawphlang on the way in, a full day at Nongkhnum, and Markham Valley light on the drive home.",
    days: 3,
    nights: 2,
    route: "2 Nights in Mawphanlur",
    stays: ["Mawphanlur"],
    experienceHighlights: [
      "2nd largest river island in Asia",
      "Valleys",
      "Village stay",
      "Sacred forest walk",
    ],
    notSuitableFor: ["Luxury seekers", "Basic stays", "Limited mobility"],
    highlights: [
      "Highland village stay amid Mawphanlur meadows",
      "Walk Mawphlang Sacred Forest on the way in",
      "Hike Nongkhnum River Island with Weinia Falls and a picnic lunch",
      "Easy pacing suited to a short, restorative break",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Mawphanlur",
        summary:
          "Drive into the hills via Umiam Lake and Mawphlang Sacred Forest, then settle into a Mawphanlur village stay.",
        activities: "Umiam Lake, Mawphlang Sacred Forest, Mawphanlur village stay",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Mawphanlur",
      },
      {
        day: 2,
        title: "Mawphanlur → Nongkhnum",
        summary:
          "Day hike to Nongkhnum River Island with Weinia Falls and a picnic before returning to Mawphanlur for the night.",
        activities: "Hike Nongkhnum River Island, Weinia Falls, picnic",
        meals: "Breakfast, Packed Lunch & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Mawphanlur",
      },
      {
        day: 3,
        title: "Mawphanlur → Guwahati",
        summary: "Descend via Markham Valley and continue to Guwahati for departure.",
        activities: "Markham Valley",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "mawsynram-adventures": {
    name: "Mawsynram Adventures",
    tagline:
      "Thrill-packed journey through Mawsynram & Mawlongbna with river trekking, caving, kayaking, and canyon hikes.",
    overview:
      "Two nights in Mawsynram with activities curated by local guides and tailored to weather — kayaking, fossils, cliff canyons, and a natural pool before Guwahati.",
    days: 3,
    nights: 2,
    route: "2 Nights in Mawsynram",
    stays: ["Mawsynram"],
    experienceHighlights: [
      "Wettest place on earth",
      "River trekking & Split Rock",
      "Sacred forest",
      "Village stay",
    ],
    notSuitableFor: ["Non-swimmers", "Rain-averse", "Easy sightseeing"],
    highlights: [
      "Approach via Umiam Lake and Mawphlang Sacred Forest",
      "Full Mawlongbna adventure day with kayaking, fossils, and river treks",
      "Cliff canyon hike and natural pool on the return",
      "Experiences shaped by local guides and daily weather",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Mawsynram",
        summary:
          "Travel into Mawsynram with stops at Umiam Lake and Mawphlang Sacred Forest before settling in for the night.",
        activities: "Umiam Lake, Mawphlang Sacred Forest",
        meals: "Breakfast",
        trekDifficulty: "Easy",
        overnight: "Mawsynram",
      },
      {
        day: 2,
        title: "Mawlongbna Adventure Day",
        summary:
          "A full day of kayaking, fossil exploration, caving or river treks, and a village lunch — intensity matched to conditions.",
        activities: "Kayaking, fossil exploration, caving/river treks, village lunch",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Moderate–Challenging",
        overnight: "Mawsynram",
      },
      {
        day: 3,
        title: "Cliff Canyons, Natural Pool & Return",
        summary:
          "Morning cliff canyon hike and natural pool swim, optional Lum Symper, then drive back to Guwahati.",
        activities: "Cliff canyon hike, natural pool, optional Lum Symper, drive Guwahati",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "sohra-trekkers-delight": {
    name: "Sohra Trekkers Delight",
    tagline:
      "Quick nature escape into Sohra with caves, waterfalls and living root bridges; includes a night in Nongriat homestay or camping; moderate to extreme treks.",
    overview:
      "Five days for serious trail time — Mawmluh Cave heritage, a Nongriat overnight (basic, shared bathrooms), then the 3,000-step climb out toward Shillong and Guwahati.",
    days: 5,
    nights: 4,
    route: "2 Nights in Sohra → 1 Night in Nongriat → 1 Night in Shillong",
    stays: ["Sohra", "Nongriat", "Shillong"],
    experienceHighlights: [
      "Mawmluh caving",
      "Waterfalls",
      "Double Decker living root bridges",
      "Nongriat homestay or camping",
    ],
    notSuitableFor: ["Steep steps", "Basic homestays", "Relaxed sightseeing"],
    highlights: [
      "Five-hour Mawmluh Cave exploration (UNESCO/IUGS heritage)",
      "Overnight in Nongriat after Double Decker and Rainbow Falls",
      "Traditional lunch and river dip on the living-root trail",
      "Ascent via Tyrna's 3,000 steps before Shillong leisure",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Sohra",
        summary:
          "Long scenic transfer (168 km / 6–7 hrs) via Umiam Lake and Mawkdok Dympep Valley into Sohra.",
        activities: "Umiam Lake, Mawkdok Dympep Valley",
        meals: "Dinner",
        overnight: "Sohra",
      },
      {
        day: 2,
        title: "Sohra Local Excursions",
        summary:
          "Dedicated caving day at Mawmluh Cave (UNESCO/IUGS heritage) plus time to explore Sohra.",
        activities: "5-hr caving Mawmluh Cave (UNESCO/IUGS heritage) & explore Sohra",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Intermediate",
        overnight: "Sohra",
      },
      {
        day: 3,
        title: "Sohra / Nohkalikai viewpoint → Nongriat Trek",
        summary:
          "Nohkalikai viewpoint, then trek to Double Decker Living Root Bridge and Rainbow Falls with traditional lunch and a river dip. Overnight is basic (homestay/camping, shared bathrooms).",
        activities:
          "Nohkalikai viewpoint, Double Decker Living Root Bridge, Rainbow Falls, traditional lunch, river dip",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Medium–Extreme",
        overnight: "Nongriat (homestay/camping, basic)",
      },
      {
        day: 4,
        title: "Nongriat → Tyrna → Shillong",
        summary:
          "Trek back via the 3,000 steps to Tyrna, then transfer to Shillong for evening leisure.",
        activities: "Trek back via 3,000 steps, Shillong leisure",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Medium–Extreme",
        overnight: "Shillong",
      },
      {
        day: 5,
        title: "Shillong → Guwahati",
        summary: "Transfer to Guwahati with an optional Umiam Lake stop before departure.",
        activities: "Optional Umiam",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "meghalaya-escape-the-ordinary": {
    name: "Meghalaya: Escape the Ordinary",
    tagline:
      "Offbeat 6-day escape into waterfalls, caves, riverside camping, and village life across Meghalaya.",
    overview:
      "One night in Shillong, two nights riverside camping near Sohra, and two nights at Mawphanlur hilltop — crest trails, Krem Lymput, Umkar root bridge, and ridge hikes before Guwahati.",
    days: 6,
    nights: 5,
    route:
      "1 Night in Shillong → 2 Nights Riverside Camping near Sohra → 2 Nights at Mawphanlur Hilltop",
    stays: ["Shillong", "Riverside Camping near Sohra", "Mawphanlur Hilltop"],
    experienceHighlights: [
      "Nohkalikai Crest",
      "Riverside camping",
      "Village stay",
      "Mawphanlur valleys & offbeat caves",
    ],
    highlights: [
      "Nohkalikai Crest trek into riverside camping near Sohra",
      "Krem Lymput cave hike with lunch back at camp",
      "Umkar Living Root Bridge walk en route to Mawphanlur",
      "Guided Mawthadraishan & Mawlai Syiem ridge hike",
      "Two nights of riverside camping under Sohra skies",
      "Hilltop finish at Mawphanlur before Guwahati",
    ],
    notSuitableFor: ["Camping averse", "Luxury only", "Limited mobility"],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Shillong",
        summary: "Arrive via Umiam Lake and settle at Windermere Resort for a Shillong overnight.",
        activities: "Umiam Lake, Windermere Resort",
        meals: "Dinner",
        overnight: "Shillong",
      },
      {
        day: 2,
        title: "Shillong → Nohkalikai Crest Trek → Riverside Camping",
        summary:
          "Crest trek then pitch at a riverside camp near Sohra. Camping setup is the same for all stay categories; packed lunch is at own expense.",
        activities: "Nohkalikai Crest trek, riverside camp near Sohra",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Moderate–Challenging",
        overnight: "Riverside Camp",
      },
      {
        day: 3,
        title: "Krem Lymput Cave Hike → Camp",
        summary: "Cave trail day with lunch back at camp and a second riverside overnight.",
        activities: "Cave trail, lunch at camp",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Intermediate",
        overnight: "Riverside Camp",
      },
      {
        day: 4,
        title: "Camp → Umkar Root Bridge → Mawphanlur",
        summary:
          "Living root bridge walk at Umkar, then continue to a lakeside retreat in Mawphanlur.",
        activities: "Living root bridge walk, lakeside retreat",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Mawphanlur",
      },
      {
        day: 5,
        title: "Mawthadraishan & Mawlai Syiem Hike",
        summary: "Four-to-five-hour guided trek with packed lunch through highland ridges.",
        activities: "4–5 hr guided trek, packed lunch",
        meals: "Breakfast, Packed Lunch & Dinner",
        trekDifficulty: "Moderate",
        overnight: "Mawphanlur",
      },
      {
        day: 6,
        title: "Mawphanlur → Guwahati",
        summary:
          "Drive to Guwahati for flights after roughly 4:30–5:00 PM.",
        activities: "Transfer to Guwahati",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "the-pine-and-the-river": {
    name: "The Pine & the River",
    tagline:
      "Balanced trail from waterfalls and root bridges to sacred groves and riverside stays with treks and kayaking.",
    overview:
      "Six days linking pine-edged hills and river life: Phe Phe and Krangshuri, Amkoi and kayaking near Dawki, Mawlynnong and root bridges, then Nohkalikai Crest and Mawphlang before Guwahati.",
    days: 6,
    nights: 5,
    route:
      "1 Night in Shillong Outskirt → 2 Nights Village near Dawki → 1 Night in Sohra → 1 Night in Mawphlang/Mylliem",
    stays: ["Shillong Outskirt", "Village near Dawki", "Sohra", "Mawphlang/Mylliem"],
    experienceHighlights: [
      "Amkoi & Phe Phe falls",
      "Nohkalikai crest",
      "Umngot river (Dawki)",
      "Sacred forest",
    ],
    notSuitableFor: ["Camping averse", "Non-swimmers", "Limited mobility"],
    highlights: [
      "Waterfall circuit at Phe Phe and Krangshuri before a riverside village stay",
      "Amkoi trek with boating and kayaking on the Umngot",
      "Mawlynnong and Single Root Bridge en route to Sohra",
      "Nohkalikai Crest, Arwah Cave, and Mawphlang Sacred Forest close",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Shillong Outskirt",
        summary: "About four hours to a Shillong outskirt stay with an Umiam Lake stop.",
        activities: "Umiam Lake",
        meals: "Dinner",
        overnight: "Shillong Outskirt",
      },
      {
        day: 2,
        title: "→ Village near Dawki",
        summary:
          "Roughly four hours toward Dawki with Phe Phe Falls, Krangshuri Falls, and a riverside village overnight.",
        activities: "Phe Phe Falls, Krangshuri Falls, riverside stay",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Village near Dawki",
      },
      {
        day: 3,
        title: "Dawki adventure",
        summary: "Amkoi trek plus riverside boating and kayaking from the village base.",
        activities: "Amkoi trek, riverside boating & kayaking",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Moderate–Challenging",
        overnight: "Village near Dawki",
      },
      {
        day: 4,
        title: "Dawki → Sohra",
        summary:
          "About 2.5 hours via Mawlynnong, Single Root Bridge, and Dympep Valley into Sohra.",
        activities: "Mawlynnong, Single Root Bridge, Dympep Valley",
        meals: "Breakfast & Dinner",
        overnight: "Sohra",
      },
      {
        day: 5,
        title: "Sohra → Mawphlang Sacred Forest",
        summary:
          "Nohkalikai Crest and Arwah Cave, then a Sacred Forest walk and overnight in Mawphlang/Mylliem (~3 hrs).",
        activities: "Nohkalikai Crest, Arwah Cave, Sacred Forest walk",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Mawphlang/Mylliem",
      },
      {
        day: 6,
        title: "→ Guwahati",
        summary: "About four hours to Guwahati with an optional Umiam stop before departure.",
        activities: "Optional Umiam",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "essence-of-meghalaya": {
    name: "Essence of Meghalaya",
    tagline:
      "A relaxed 6-day journey through Meghalaya’s must-see destinations—Shillong, Dawki, Mawlynnong, and Cherrapunjee—designed for comfort and ease.",
    overview:
      "Six days of Meghalaya essentials: two nights in Cherrapunjee, a Mawlynnong homestay, Dawki's Umngot, and Shillong sightseeing before Guwahati.",
    days: 6,
    nights: 5,
    route: "2 Nights in Cherrapunjee → 1 Night in Mawlynnong → 2 Nights in Shillong",
    stays: ["Cherrapunjee", "Mawlynnong", "Shillong"],
    experienceHighlights: [
      "Shillong city",
      "Cleanest village in Asia",
      "Living root bridge",
      "Sohra & Umngot river",
    ],
    notSuitableFor: ["Hard trekkers", "Off-grid only", "Long drives"],
    highlights: [
      "Nohsngithiang, Nohkalikai, and Arwah Cave in Cherrapunjee",
      "Garden of Caves into Mawlynnong and the Single Decker Living Root Bridge",
      "Umngot River at Dawki with optional water activities",
      "Shillong day covering Laitlum, Cathedral, Don Bosco, and Ward's Lake",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Cherrapunjee",
        summary:
          "Transfer of about 5.5 hours into Cherrapunjee with evening leisure on arrival.",
        activities: "Transfer, evening leisure",
        meals: "Dinner",
        overnight: "Cherrapunjee",
      },
      {
        day: 2,
        title: "Waterfalls & Caves",
        summary:
          "Classic Sohra day at Nohsngithiang Falls, Nohkalikai Falls, and Arwah Cave.",
        activities: "Nohsngithiang Falls, Nohkalikai Falls, Arwah Cave",
        meals: "Breakfast & Dinner",
        overnight: "Cherrapunjee",
      },
      {
        day: 3,
        title: "Garden of Caves → Mawlynnong",
        summary:
          "Garden of Caves then on to Mawlynnong (~3 hrs / 80 km) for the Single Decker Living Root Bridge and a village homestay.",
        activities:
          "Garden of Caves, Mawlynnong, Single Decker Living Root Bridge, village homestay",
        meals: "Breakfast & Dinner",
        overnight: "Mawlynnong",
      },
      {
        day: 4,
        title: "Mawlynnong → Shillong",
        summary:
          "Dawki Umngot River with optional water activities at own expense, then transfer to Shillong (~3.5 hrs / 78 km).",
        activities:
          "Dawki Umngot River, optional water activities at own expense, transfer Shillong",
        meals: "Breakfast & Dinner",
        overnight: "Shillong",
      },
      {
        day: 5,
        title: "Shillong Sightseeing",
        summary:
          "Laitlum, Cathedral, Don Bosco (closed Sundays), Ward's Lake, plus market and café time.",
        activities:
          "Laitlum, Cathedral, Don Bosco (Sun closed), Ward's Lake, market & café",
        meals: "Breakfast & Dinner",
        overnight: "Shillong",
      },
      {
        day: 6,
        title: "→ Guwahati Airport",
        summary:
          "About 3.5 hours to Guwahati Airport with optional Umiam or Kamakhya stops.",
        activities: "Optional Umiam / Kamakhya",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "wild-monsoon-trail": {
    name: "Wild Monsoon Trail",
    tagline:
      "Offbeat monsoon adventure through sacred forests, root bridges, waterfalls, caves, and misty highlands.",
    overview:
      "Follow the monsoon pulse from Shillong through Mawlongbna adventures, Sohra's caves and choice trails, and a basic Mawphanlur overnight before Guwahati.",
    days: 7,
    nights: 6,
    route:
      "1 Night in Shillong → 2 Nights in Mawlongbna → 2 Nights in Sohra → 1 Night in Mawphanlur",
    stays: ["Shillong", "Mawlongbna", "Sohra", "Mawphanlur"],
    experienceHighlights: [
      "Hidden waterfalls",
      "River trekking",
      "Mawphanlur & sacred forests",
      "Living root bridges & caves",
    ],
    notSuitableFor: ["Rain-averse", "Basic stays", "Dry season only"],
    highlights: [
      "Mawphlang Sacred Forest with traditional lunch into Mawlongbna",
      "Full river-trekking day with Split Rock and Umkhakoi kayaking",
      "Garden of Caves, living root bridge hike, and Nohkalikai viewpoint",
      "Choose Easy Lyngksiar trails or a Moderate–Extreme hidden-waterfall trek",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Shillong",
        summary:
          "120 km / 4 hrs into Shillong with Umiam or Kamakhya if you arrive early, then evening leisure. Optional traditional dance on request (extra).",
        activities: "Umiam or Kamakhya if early, evening leisure",
        meals: "Dinner",
        overnight: "Shillong",
      },
      {
        day: 2,
        title: "Shillong → Sacred Forest → Mawlongbna",
        summary:
          "Mawphlang Sacred Forest walk, traditional lunch, and a scenic drive (90 km / 3.5 hrs) to Mawlongbna.",
        activities: "Mawphlang Sacred Forest, traditional lunch, scenic drive",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Easy forest walk",
        overnight: "Mawlongbna",
      },
      {
        day: 3,
        title: "Mawlongbna Full-Day",
        summary:
          "River trekking, Split Rock, and kayaking at Umkhakoi for a full adventure day.",
        activities: "River trekking, Split Rock, kayaking Umkhakoi",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Moderate",
        overnight: "Mawlongbna",
      },
      {
        day: 4,
        title: "Mawlongbna → Garden of Caves → Sohra",
        summary:
          "Garden of Caves, a short living root bridge hike, and Nohkalikai viewpoint (80 km / 3.5 hrs) into Sohra.",
        activities: "Garden of Caves, short living root bridge hike, Nohkalikai viewpoint",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Sohra",
      },
      {
        day: 5,
        title: "Sohra Choice of Trails",
        summary:
          "Option A: Lyngksiar, Kynrem & a lesser-known root bridge (Easy). Option B: Hidden waterfalls trek (Moderate–Extreme).",
        activities:
          "Option A: Lyngksiar, Kynrem & lesser-known root bridge; Option B: Hidden waterfalls trek",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy or Moderate–Extreme (by option)",
        overnight: "Sohra",
      },
      {
        day: 6,
        title: "Sohra → Arwah Cave → Mawphanlur",
        summary:
          "Arwah Cave and Mawlangkhar Ranges with ponds (130 km / 5 hrs). Overnight is basic (homestay/cottage).",
        activities: "Arwah Cave, Mawlangkhar Ranges, ponds",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Mawphanlur (homestay/cottage, basic)",
      },
      {
        day: 7,
        title: "Mawphanlur → Guwahati",
        summary: "128 km / 5 hrs to Guwahati for departure.",
        activities: "Transfer to Guwahati",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "kaziranga-to-khasi-hills": {
    name: "Kaziranga to Khasi Hills Escape",
    tagline:
      "Blend Kaziranga safaris with Meghalaya’s canyons, caves, waterfalls, and sacred forests at a gentle pace.",
    overview:
      "Nine days bridging Assam and Meghalaya: Kaziranga safaris, Shillong and Mawphlang, Dawki and Mawlynnong, Sohra choice trails, then Ri-Bhoi before Guwahati.",
    days: 9,
    nights: 8,
    route:
      "2 Nights Kaziranga → 2 Nights Shillong → 1 Night Dawki → 2 Nights Sohra → 1 Night Ri-Bhoi",
    stays: ["Kaziranga", "Shillong", "Dawki", "Sohra", "Ri-Bhoi"],
    experienceHighlights: [
      "Kaziranga safari",
      "Sacred forest",
      "Living root bridges",
      "Umngot river (Dawki)",
    ],
    notSuitableFor: ["Limited mobility", "Meghalaya-only", "Early mornings"],
    highlights: [
      "Elephant and jeep safaris plus Orchid & Biodiversity Park in Kaziranga",
      "Mawphlang Sacred Forest with traditional lunch and Don Bosco",
      "Laitlum, Phe Phe, Krang Shuri, and Umngot into Dawki",
      "Choose Easy Sohra sightseeing or a full-day Double Decker trek",
    ],
    itinerary: [
      {
        day: 1,
        title: "Guwahati → Kaziranga",
        summary:
          "220 km / 5 hrs transfer to Kaziranga with an optional evening walk on arrival.",
        activities: "Transfer, optional evening walk",
        meals: "Dinner",
        overnight: "Kaziranga",
      },
      {
        day: 2,
        title: "Kaziranga Safaris & Orchid Park",
        summary:
          "Elephant safari, jeep safari, and a visit to the Orchid & Biodiversity Park.",
        activities: "Elephant safari, jeep safari, Orchid & Biodiversity Park",
        meals: "Breakfast & Dinner",
        overnight: "Kaziranga",
      },
      {
        day: 3,
        title: "Kaziranga → Shillong",
        summary:
          "Long transfer (290 km / 7 hrs) via Umiam Lake into Shillong; optional dance in the evening.",
        activities: "Via Umiam Lake, optional dance",
        meals: "Breakfast & Dinner",
        overnight: "Shillong",
      },
      {
        day: 4,
        title: "Sacred Forest & Don Bosco",
        summary:
          "Mawphlang Sacred Forest, traditional lunch, Don Bosco Museum, and market time.",
        activities: "Mawphlang, traditional lunch, museum, market",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Easy",
        overnight: "Shillong",
      },
      {
        day: 5,
        title: "Shillong → Dawki",
        summary:
          "97 km / 4 hrs excluding stops — Laitlum, Phe Phe Falls, Krang Shuri, and Umngot into Dawki.",
        activities: "Laitlum, Phe Phe Falls, Krang Shuri, Umngot",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Dawki",
      },
      {
        day: 6,
        title: "Dawki → Mawlynnong → Sohra",
        summary:
          "Boating or kayaking, then Mawlynnong and Living Root Bridge (95 km / 3.5 hrs) into Sohra.",
        activities: "Boating/kayaking, Mawlynnong & Living Root Bridge",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Sohra",
      },
      {
        day: 7,
        title: "Sohra Choice",
        summary:
          "Option 1: caves, falls, and market (Easy). Option 2: full-day Double Decker trek (Medium–Extreme).",
        activities:
          "Option 1: caves/falls/market; Option 2: full-day Double Decker trek",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy or Medium–Extreme (by option)",
        overnight: "Sohra",
      },
      {
        day: 8,
        title: "Sohra → Garden of Caves → Ri-Bhoi",
        summary:
          "Garden of Caves then on to a Ri-Bhoi resort overnight (110 km / 4 hrs).",
        activities: "Garden of Caves, resort",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Ri-Bhoi",
      },
      {
        day: 9,
        title: "Ri-Bhoi → Guwahati",
        summary: "120 km / 4 hrs to Guwahati airport or rail for departure.",
        activities: "Airport/rail transfer",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "family-sojourn": {
    name: "Family Sojourn",
    tagline:
      "A gentle-paced Meghalaya journey designed for families and seniors with caves, waterfalls, villages, and river activities.",
    overview:
      "Nine soft-paced days built for families: Guwahati cruise, Shillong and sacred forest, Dawki river time, Mawlynnong's short root-bridge hike, easy Sohra sightseeing, and a Ri-Bhoi bonfire close.",
    days: 9,
    nights: 8,
    route:
      "1 Night Guwahati → 2 Nights Shillong → 2 Nights Dawki → 2 Nights Sohra → 1 Night Ri-Bhoi",
    stays: ["Guwahati", "Shillong", "Dawki", "Sohra", "Ri-Bhoi"],
    experienceHighlights: [
      "Brahmaputra sunset cruise",
      "Sacred forests & caves",
      "Umngot river (Dawki)",
      "Living root bridges",
    ],
    highlights: [
      "Brahmaputra sunset cruise on arrival in Guwahati",
      "Family-friendly sacred forest, Don Bosco, and Shillong leisure",
      "Dawki river day with optional zip, cliff, or snorkel add-ons",
      "Short Living Root Bridge hike and easy Sohra caves & viewpoints",
      "Soft pacing designed for children and multi-generation groups",
      "Ri-Bhoi overnight with a closing bonfire",
      "Optional adventure add-ons only where families choose them",
    ],
    notSuitableFor: ["Extreme trekkers", "Nightlife seekers"],
    itinerary: [
      {
        day: 1,
        title: "Guwahati Arrival",
        summary: "Settle in Guwahati with a sunset cruise on the Brahmaputra.",
        activities: "Sunset cruise Brahmaputra",
        meals: "Dinner",
        overnight: "Guwahati",
      },
      {
        day: 2,
        title: "Guwahati → Shillong",
        summary:
          "100 km / 3 hrs via Umiam and Ward's Lake; optional Mei-Ramew and dance in the evening.",
        activities: "Umiam, Ward's Lake, optional Mei-Ramew & dance",
        meals: "Breakfast & Dinner",
        overnight: "Shillong",
      },
      {
        day: 3,
        title: "Mawphlang → Shillong",
        summary:
          "Short hop (25–30 km) for Sacred Forest, traditional lunch, and Don Bosco Museum.",
        activities: "Sacred Forest, traditional lunch, Don Bosco",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Easy",
        overnight: "Shillong",
      },
      {
        day: 4,
        title: "Shillong → Dawki",
        summary:
          "150 km / 5.5 hrs via Laitlum, Krangshuri, and Umngot into Dawki.",
        activities: "Laitlum, Krangshuri, Umngot",
        meals: "Breakfast & Dinner",
        overnight: "Dawki",
      },
      {
        day: 5,
        title: "Dawki Rest / River",
        summary:
          "River day with boating or kayaking; optional zip, cliff, or snorkel activities.",
        activities: "Boating/kayaking, optional zip/cliff/snorkel",
        meals: "Breakfast, Lunch & Dinner",
        overnight: "Dawki",
      },
      {
        day: 6,
        title: "Dawki → Mawlynnong → Sohra",
        summary:
          "Cleanest village visit and a short Living Root Bridge hike (15–20 min), then on to Sohra (85 km / 3.5 hrs).",
        activities: "Cleanest village, Living Root Bridge 15–20 min hike",
        meals: "Breakfast & Dinner",
        overnight: "Sohra",
      },
      {
        day: 7,
        title: "Sohra Sightseeing",
        summary:
          "Arwah or Mawsmai Cave, Nohkalikai Viewpoint, and Thangkarang Park — easy family pacing.",
        activities: "Arwah or Mawsmai Cave, Nohkalikai, Thangkarang Park",
        meals: "Breakfast & Dinner",
        overnight: "Sohra",
      },
      {
        day: 8,
        title: "Sohra → Ri-Bhoi",
        summary:
          "Garden of Caves then a Ri-Bhoi resort overnight with bonfire and storytelling (110 km / 4 hrs).",
        activities: "Garden of Caves, resort, bonfire/storytelling",
        meals: "Breakfast & Dinner",
        overnight: "Ri-Bhoi",
      },
      {
        day: 9,
        title: "Ri-Bhoi → Guwahati",
        summary: "120 km / 4 hrs to Guwahati Airport for departure.",
        activities: "Airport transfer",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },

  "soul-trails": {
    name: "Soul Trails",
    tagline:
      "A 13-day immersive adventure across Meghalaya’s hidden gems with homestays, treks, sacred forests, caves, and river adventures.",
    overview:
      "The full Soul Trails arc: Guwahati to Mawphanlur, Shnongpdeng adventures, Pynursla immersion, Sohra, two nights in Nongriat, and Shillong before Guwahati — built for travellers who want the long, lived-in journey.",
    days: 14,
    nights: 13,
    route:
      "1 Night Guwahati → 2 Nights Mawphanlur → 2 Nights Shnongpdeng → 2 Nights Pynursla → 2 Nights Sohra → 2 Nights Nongriat → 2 Nights Shillong",
    stays: [
      "Guwahati",
      "Mawphanlur",
      "Shnongpdeng",
      "Pynursla",
      "Sohra",
      "Nongriat",
      "Shillong",
    ],
    experienceHighlights: [
      "Offbeat living root bridge",
      "Whistling village",
      "River trekking & offbeat caves",
      "Waterfalls & canyons",
    ],
    highlights: [
      "West Khasi Hills ridges and community days in Mawphanlur",
      "Full Shnongpdeng river adventure with cultural evening",
      "Pynursla immersion — hidden root bridges and a cooking session",
      "Two nights in Nongriat after Double Decker, Rainbow Falls, and the 3,000-step ascent",
      "Sohra waterfalls, caves, and highland viewpoints",
      "Shillong close with space to rest before Guwahati",
      "Deep trail time across fourteen days — not a rushed circuit",
      "Community stays and guides woven through every chapter",
    ],
    notSuitableFor: ["Short breaks", "Limited mobility", "Luxury only"],
    itinerary: [
      {
        day: 1,
        title: "Arrival Guwahati",
        summary: "Airport pickup and evening leisure by the Brahmaputra.",
        activities: "Airport pickup, evening leisure Brahmaputra",
        meals: "Dinner",
        overnight: "Guwahati",
      },
      {
        day: 2,
        title: "Guwahati → Mawphanlur",
        summary:
          "128 km / 5 hrs into West Khasi Hills via Mawthadraishan valleys and ponds, with easy village walks.",
        activities: "West Khasi Hills, Mawthadraishan valleys, ponds",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy village walks",
        overnight: "Mawphanlur",
      },
      {
        day: 3,
        title: "Mawphanlur Full-Day",
        summary: "Ridge hikes, community time, and Khasi meals around Mawphanlur.",
        activities: "Ridge hikes, community, Khasi meals",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Mawphanlur",
      },
      {
        day: 4,
        title: "Mawphanlur → Jowai → Shnongpdeng",
        summary:
          "160 km / 6 hrs via Krang Suri and Phe Phe Falls to a riverside overnight in Shnongpdeng.",
        activities: "Krang Suri, Phe Phe, riverside",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Shnongpdeng",
      },
      {
        day: 5,
        title: "Shnongpdeng Adventure",
        summary:
          "Kayaking, snorkeling, cliff-jumping, picnic, and a cultural evening by the river.",
        activities: "Kayaking, snorkeling, cliff-jumping, picnic, cultural evening",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Easy–Moderate",
        overnight: "Shnongpdeng",
      },
      {
        day: 6,
        title: "Shnongpdeng → Pynursla",
        summary:
          "70 km / 3 hrs through valley, waterfalls, and a forest trek into Pynursla.",
        activities: "Valley, waterfalls, forest trek",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Moderate",
        overnight: "Pynursla",
      },
      {
        day: 7,
        title: "Pynursla Immersion",
        summary: "Hidden root bridges hike and a cooking session deep in Pynursla.",
        activities: "Hidden root bridges hike, cooking session",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Moderate–Extreme",
        overnight: "Pynursla",
      },
      {
        day: 8,
        title: "Pynursla → Sohra",
        summary:
          "60 km / 2.5 hrs to Sohra via Garden of Caves and Nohkalikai viewpoint.",
        activities: "Garden of Caves, Nohkalikai viewpoint",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy",
        overnight: "Sohra",
      },
      {
        day: 9,
        title: "Sohra Exploration",
        summary:
          "Choose a hidden waterfall trek or a cultural walk and caving day in Sohra.",
        activities: "Hidden waterfall trek OR cultural walk & caving",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Easy–Extreme",
        overnight: "Sohra",
      },
      {
        day: 10,
        title: "Sohra → Nongriat Trek",
        summary:
          "Trek to Double Decker and Rainbow Falls with lunch and a river dip; overnight in Nongriat.",
        activities: "Double Decker, Rainbow Falls, lunch, river dip",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Moderate–Extreme",
        overnight: "Nongriat",
      },
      {
        day: 11,
        title: "Nongriat Full-Day",
        summary: "Hidden pools and cultural exchange with a second Nongriat overnight.",
        activities: "Hidden pools, cultural exchange",
        meals: "Breakfast, Lunch & Dinner",
        trekDifficulty: "Moderate–Extreme",
        overnight: "Nongriat",
      },
      {
        day: 12,
        title: "Nongriat → Tyrna → Shillong",
        summary:
          "Extreme 3,000-step ascent to Tyrna, then Shillong leisure for the evening.",
        activities: "3,000-step ascent, Shillong leisure",
        meals: "Breakfast & Dinner",
        trekDifficulty: "Extreme",
        overnight: "Shillong",
      },
      {
        day: 13,
        title: "Shillong Local",
        summary:
          "Ward's Lake, Don Bosco, cafés, shopping, and an optional cultural show.",
        activities: "Ward's Lake, Don Bosco, cafés, shopping, optional cultural show",
        meals: "Breakfast & Dinner",
        overnight: "Shillong",
      },
      {
        day: 14,
        title: "Shillong → Guwahati",
        summary:
          "100 km / 4 hrs to Guwahati with optional Umiam before the airport.",
        activities: "Optional Umiam, airport",
        meals: "Breakfast",
        overnight: "Departure",
      },
    ],
  },
};
