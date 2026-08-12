/**
 * Seed Firestore from static prototype data.
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * (loaded from web/.env.local if present).
 *
 *   npm run seed
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { experiences } from "../src/data/experiences";
import { journeys } from "../src/data/journeys";
import { destinations } from "../src/data/destinations";
import { stories } from "../src/data/stories";
import { DEFAULT_SETTINGS } from "../src/lib/catalog";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    /* optional */
  }
}

function db() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error("Set FIREBASE_* env vars (or add them to .env.local) before seeding.");
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
  return getFirestore();
}

async function run() {
  loadEnvLocal();
  const firestore = db();
  const writeAll = async (col: string, docs: { slug: string }[]) => {
    for (const doc of docs) {
      await firestore.collection(col).doc(doc.slug).set({ ...doc, status: "active" }, { merge: true });
      console.log("seeded", col, doc.slug);
    }
  };
  await writeAll("experiences", experiences);
  await writeAll("journeys", journeys);
  await writeAll("destinations", destinations);
  await writeAll("stories", stories);
  await firestore.collection("settings").doc("platform").set(DEFAULT_SETTINGS, { merge: true });
  console.log("done");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
