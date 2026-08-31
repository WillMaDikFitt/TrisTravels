import { media } from "./media";

export type Story = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  category: string;
  date: string;
  image: string;
  body: string[];
  sourceUrl?: string;
};

/** Stories listed on https://www.trismeghalaya.com/your-stories */
export const stories: Story[] = [
  {
    slug: "two-days-in-mawsynram",
    title: "Two Days in Mawsynram — Rain, Rivers & Adventures in the Wettest Place on Earth",
    excerpt:
      "Some journeys leave rain in your hair, river on your skin, and laughter that returns without warning — even weeks later.",
    author: "Rose Christine Kharsyntiew",
    category: "Nature",
    date: "2025-12-05",
    image: media.storyMawsynram,

    sourceUrl:
      "https://www.trismeghalaya.com/your-stories/two-days-in-mawsynram-%E2%80%94-rain%2C-rivers-%26-adventures-in-the-wettest-place-on-earth",
    body: [
      "Some journeys stay with you long after you return — not because of where you went, but because of how they made you feel. Some leave pictures. Others leave rain in your hair, river on your skin, and laughter that returns without warning — even weeks later. Our two-day trip to Mawsynram was exactly that kind.",
      "DAY 1 — SHILLONG ➝ MAWPHLANG ➝ MAWSYNRAM. Early morning, excitement in the air. Around 8 AM we left Pine Air, Shillong, and drove to Mawphlang where we met our guide, Bah Nit, who would lead us into the Sacred Forest.",
      "Walking inside felt like stepping into an unspoken past. Roots twisted like ancient scripts, stones sat like keepers of memory, and every plant held meaning — medicinal, spiritual, or cultural. Nothing could be taken from the forest — not even a fallen leaf — because this wasn’t just land, it was heritage protected for centuries.",
      "With the forest still in our minds, we continued deeper into the hills to Mawsynram. One moment the sun warmed us, the next the sky opened with rain. Mawsynram welcomed us the way it welcomes everyone — with rain.",
      "We trekked towards Krem Puri, one of the longest sandstone caves in the world. Rain grew heavier; we ran, laughed, slipped, and half-jogged to the entrance — soaked head to toe, but too thrilled to care. Inside, the air turned cool and ancient. Light bounced off wet walls. The cave is said to hold prehistoric fish fossils, and old Khasi stories believe fairies once lived here.",
      "By evening we drove to Mawlongbna village, settled into a cozy homestay, and slept with tired bodies and happy hearts.",
      "DAY 2 — MAWLONGBNA: Split Rock, believed formed during the Assam Earthquake of 1897 — stone walls 5–8 ft apart and more than 100 metres tall. Then the favourite part: river trek through another split rock, water around our legs, swimming, climbing, floating to a waterfall that felt like a reward.",
      "After lunch we continued with river trekking and canoeing toward Umkhakoi Dam — thrilling yet calming. We swam to the landing point laughing, scratched, exhausted, and unbelievably happy. Later, a sunset point on the hills: golden, quiet, unhurried.",
      "Mawsynram didn’t just show us places. It gave us moments to feel. Best time: September–November. Ideal duration: 2–3 days. Base stay: Mawlongbna. Fitness: moderate — river trekking + caves. Travel responsibly; respect the community; expect simple village living.",
    ],
  },
  {
    slug: "stories-from-meghalaya",
    title: "Stories from Meghalaya",
    excerpt:
      "A six-day journey through serene landscapes, local legends, and cultural insights — from Nohkalikai to Khasi hospitality.",
    author: "Ranjit Kulkarni",
    category: "Culture",
    date: "2024-11-12",
    image: media.cliffs,
    sourceUrl: "https://www.trismeghalaya.com/your-stories",
    body: [
      "A six-day journey through Meghalaya filled with serene landscapes, local legends, and cultural insights.",
      "From the haunting tale of Nohkalikai Falls to the warmth of Khasi traditions, this travelogue captures stories, encounters, and reflections that made the trip unforgettable.",
      "Meghalaya reveals itself in layers — mist first, then stone, then people. TRIS paced the days so encounters had room to breathe.",
    ],
  },
  {
    slug: "natures-dreamscape",
    title: "A Journey into Nature’s Dreamscape",
    excerpt:
      "Waterfalls of surreal blue, crystal-clear rivers, the Living Root Bridge, and the charm of Shillong — a six-day dream etched in memory.",
    author: "Vinay Yadav",
    category: "Nature",
    date: "2024-08-20",
    image: media.storyVinayYadav,
    sourceUrl: "https://www.trismeghalaya.com/your-stories",
    body: [
      "A soul-stirring journey through Meghalaya — waterfalls of surreal blue, crystal-clear rivers, the magic of the Living Root Bridge, and the charm of Shillong.",
      "From serene landscapes to heartfelt local encounters, this six-day trip became a dreamlike experience etched forever in memory.",
    ],
  },
  {
    slug: "experiencing-meghalaya-together",
    title: "Experiencing Meghalaya Together",
    excerpt:
      "A family getaway through misty hills, cascading waterfalls, living root bridges, and warm Khasi hospitality.",
    author: "Suchismita Ghosh",
    category: "Family",
    date: "2024-06-14",
    image: media.familyWaterfall,
    sourceUrl: "https://www.trismeghalaya.com/your-stories",
    body: [
      "A family getaway to Meghalaya turned into a soulful journey through misty hills, cascading waterfalls, living root bridges, and warm Khasi hospitality.",
      "From Kamakhya Temple to Cherrapunji’s legends, every stop was a memory etched in nature’s canvas — an experience of beauty, serenity, and heartfelt connections.",
    ],
  },
  {
    slug: "six-days-endless-meghalaya-magic",
    title: "Six Days, Endless Meghalaya Magic",
    excerpt:
      "Mawphanlur sunrises, Mawlyngbna adventures, Krem Mawpun caves, and Cherrapunjee’s waterfalls — crafted by TRIS into cozy stays and unforgettable moments.",
    author: "Mridul Gohain",
    category: "Travelogue",
    date: "2024-03-02",
    image: media.peaks,
    sourceUrl: "https://www.trismeghalaya.com/your-stories",
    body: [
      "A heartfelt six-day journey through Meghalaya’s misty hills — Mawphanlur sunrises, Mawlyngbna adventures, Krem Mawpun caves, and Cherrapunjee’s waterfalls.",
      "Crafted flawlessly by TRIS Travels into cozy stays, soulful food, and unforgettable moments. Hospitable, well-arranged, and truly the Scotland of the East.",
    ],
  },
];

export function getStory(slug: string) {
  return stories.find((s) => s.slug === slug);
}
