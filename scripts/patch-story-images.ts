/**
 * Push curated story cover paths from src/data/stories.ts into Firestore.
 *   npx tsx scripts/patch-story-images.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { stories } from "../src/data/stories";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function run() {
  loadEnvLocal();
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Missing FIREBASE_* in .env.local");
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  const db = getFirestore();
  for (const story of stories) {
    const before = await db.collection("stories").doc(story.slug).get();
    const prev = before.exists ? (before.data() as { image?: string }).image : undefined;
    await db.collection("stories").doc(story.slug).set(
      { slug: story.slug, image: story.image },
      { merge: true },
    );
    console.log(`${story.slug}\n  was: ${prev ?? "(missing)"}\n  now: ${story.image}`);
  }
  console.log("done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
