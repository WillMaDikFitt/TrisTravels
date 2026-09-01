/**
 * Convert Pics/ sources into optimized listing JPEGs under public/images/listings/.
 * Skips category + protected story covers (user-provided earlier).
 *
 *   npx tsx scripts/ingest-pics.ts
 */
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const PICS = join(ROOT, "Pics");
const OUT = join(ROOT, "public", "images", "listings");

/** slug → filename inside Pics/ (named files first; curated picks for the rest). */
const MAP = {
  experiences: {
    "offbeat-living-root-bridge": "By Raksan(3).jpg",
    "double-decker-living-root-bridge": "IMG_6227.JPG",
    "mawsynram-river-trek": "20250928_102452.jpeg",
    "mawphlang-sacred-forest": "Experience Culture.png",
    "umngot-dawki": "WhatsApp Image 2025-08-20 at 17.41.36.jpeg",
    "short-escape-sohra-day": "SAVE_20250128_215236.jpeg",
    "krem-puri-cave": "Caving",
    "mawlynnong-village-stay": "Village stay.jpg",
  },
  journeys: {
    "short-escape-sohra": "By Raksan(1).jpg",
    "mawphanlur-meadows-escape": "Kyllang rock.png",
    "mawsynram-adventures": "20250928_102134.jpeg",
    "sohra-trekkers-delight": "IMG_1412.JPG",
    "meghalaya-escape-the-ordinary": "IMG_9384.jpeg",
    "the-pine-and-the-river": "WhatsApp Image 2025-09-29 at 22.52.23.jpeg",
    "essence-of-meghalaya": "4096px-Panoramic_Thadlaskein.jpg",
    "wild-monsoon-trail": "IMG_3607.heif",
    "kaziranga-to-khasi-hills": "DSC_5820.jpeg",
    "family-sojourn": "IMG_20260103_114852.jpeg",
    "soul-trails": "bamboo hut",
    "womens-soulful-escape": "Tishu Khongsit(6).jpg",
    "blossoms-and-beyond": "20250930_123044.jpeg",
    "offbeat-living-root-bridge": "By Raksan(5).jpg",
  },
  destinations: {
    mawlynnong: "Village life.png",
    mawsynram: "20250930_145821.jpeg",
    nongriat: "By Raksan(8).jpg",
    shnongpdeng: "WhatsApp Image 2025-08-20 at 17.41.37.jpeg",
    laitlum: "IMG_1779.JPG",
    sohra: "IMG_9722_SnapseedCopy.jpeg",
    mawphlang: "IMG-20250917-WA0108.jpeg",
  },
  stories: {
    "stories-from-meghalaya": "Tishu Khongsit(2).jpg",
    "experiencing-meghalaya-together": "IMG_20260103_114404.jpeg",
    "six-days-endless-meghalaya-magic": "DJI_0827.jpeg",
  },
  artisans: {
    "besli-local-flute": "Tishu Khongsit(4).jpg",
    "fridge-magnet-living-root-bridge": "By Raksan(2).jpg",
    paila: "Local food.png",
    "resilience-jute-collection": "Tishu Khongsit(5).jpg",
    "khasi-heritage-duo-by-tori": "Copy of Clay pottery.png",
    "water-bottle-sling": "By Raksan(4).jpg",
    "hands-free-glasses-holder": "Tishu Khongsit(1).jpg",
    "keychain-bottle-opener": "Raksan.JPG",
    "fridge-magnet-nohkalikai": "SAVE_20250128_220707.jpeg",
    "sunflower-keychains": "Tishu Khongsit(3).jpg",
    "crochet-flower-coaster-set": "Copy of IMG-20260328-WA0009.jpg",
    "flower-crochet-charm": "Tishu Khongsit.jpg",
  },
} as const;

async function loadBuffer(filename: string): Promise<Buffer> {
  const path = join(PICS, filename);
  const ext = filename.includes(".") ? filename.split(".").pop()?.toLowerCase() ?? "" : "";
  const raw = readFileSync(path);

  const tryHeic = async () => {
    const convert = (await import("heic-convert")).default;
    const out = await convert({ buffer: raw, format: "JPEG", quality: 0.92 });
    return Buffer.from(out);
  };

  if (ext === "heic" || ext === "heif" || !ext) {
    try {
      return await tryHeic();
    } catch {
      if (!ext) throw new Error(`Could not decode ${filename}`);
    }
  }

  try {
    await sharp(raw).rotate().metadata();
    return raw;
  } catch {
    return tryHeic();
  }
}

async function writeListing(kind: string, slug: string, filename: string) {
  const destDir = join(OUT, kind);
  mkdirSync(destDir, { recursive: true });
  const dest = join(destDir, `${slug}.jpg`);
  const buf = await loadBuffer(filename);
  await sharp(buf)
    .rotate()
    .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(dest);
  const meta = await sharp(dest).metadata();
  console.log(`${kind}/${slug}.jpg ← ${filename} (${meta.width}x${meta.height})`);
}

async function run() {
  for (const [kind, entries] of Object.entries(MAP)) {
    for (const [slug, file] of Object.entries(entries)) {
      const src = join(PICS, file);
      if (!existsSync(src)) {
        throw new Error(`Missing source: ${src}`);
      }
      await writeListing(kind, slug, file);
    }
  }
  console.log("done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
