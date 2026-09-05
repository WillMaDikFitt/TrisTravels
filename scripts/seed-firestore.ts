/**
 * Sync Firestore catalogue from static seed data (src/data/*).
 *
 * Behaviour (safe for Studio):
 * - Creates missing docs from the current front-end seed.
 * - Fills empty/missing fields on existing docs from seed.
 * - Does NOT overwrite fields already set in Studio/Firestore.
 *
 * Requires FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 * (loaded from .env.local if present).
 *
 *   npm run seed
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
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
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
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

function isEmpty(value: unknown) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

async function syncDoc(
  firestore: Firestore,
  col: string,
  seed: Record<string, unknown> & { slug: string },
) {
  const ref = firestore.collection(col).doc(seed.slug);
  const existing = await ref.get();
  const payload = { ...seed, slug: seed.slug, status: seed.status ?? "active" };

  if (!existing.exists) {
    await ref.set(payload);
    console.log("created", col, seed.slug);
    return;
  }

  const data = existing.data() ?? {};
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (key === "slug" || key === "id") continue;
    if (isEmpty(value)) continue;
    if (isEmpty(data[key])) patch[key] = value;
  }

  if (Object.keys(patch).length) {
    await ref.set(patch, { merge: true });
    console.log("filled", col, seed.slug, `(${Object.keys(patch).length} fields)`);
  } else {
    console.log("ok", col, seed.slug);
  }
}

async function run() {
  loadEnvLocal();
  const firestore = db();

  for (const doc of experiences) {
    await syncDoc(firestore, "experiences", doc as unknown as Record<string, unknown> & { slug: string });
  }
  for (const doc of journeys) {
    await syncDoc(firestore, "journeys", doc as unknown as Record<string, unknown> & { slug: string });
  }
  for (const doc of destinations) {
    await syncDoc(firestore, "destinations", doc as unknown as Record<string, unknown> & { slug: string });
  }
  for (const doc of stories) {
    await syncDoc(firestore, "stories", doc as unknown as Record<string, unknown> & { slug: string });
  }

  const settingsRef = firestore.collection("settings").doc("platform");
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set(DEFAULT_SETTINGS);
    console.log("created settings/platform");
  } else {
    const data = settingsSnap.data() ?? {};
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      if (isEmpty(data[key]) && !isEmpty(value)) patch[key] = value;
    }
    if (Object.keys(patch).length) {
      await settingsRef.set(patch, { merge: true });
      console.log("filled settings/platform");
    } else {
      console.log("ok settings/platform");
    }
  }

  console.log("done — Firestore is synced with front seed; Studio edits were preserved");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
