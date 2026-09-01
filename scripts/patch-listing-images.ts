/**
 * Push listing cover paths from static seed data into Firestore.
 *   npx tsx scripts/patch-listing-images.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { craftProducts } from "../src/data/artisans";
import { destinations } from "../src/data/destinations";
import { experiences } from "../src/data/experiences";
import { journeys } from "../src/data/journeys";
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

async function patchCollection(
  db: Firestore,
  col: string,
  docs: { slug: string; image: string }[],
) {
  for (const doc of docs) {
    if (!doc.slug?.trim()) {
      console.warn(`skip ${col}: missing slug`);
      continue;
    }
    const before = await db.collection(col).doc(doc.slug).get();
    const prev = before.exists ? (before.data() as { image?: string }).image : undefined;
    await db.collection(col).doc(doc.slug).set({ slug: doc.slug, image: doc.image }, { merge: true });
    console.log(`${col}/${doc.slug}\n  was: ${prev ?? "(missing)"}\n  now: ${doc.image}`);
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
  await patchCollection(db, "experiences", experiences);
  await patchCollection(db, "journeys", journeys);
  await patchCollection(db, "destinations", destinations);
  await patchCollection(db, "stories", stories);
  console.log("craft products are static seed only (no Firestore collection)");
  console.log("done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
