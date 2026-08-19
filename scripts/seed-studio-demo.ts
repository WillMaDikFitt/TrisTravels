import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  DEMO_BOOKINGS,
  DEMO_CLOSURES,
  DEMO_ENQUIRIES,
  DEMO_USERS,
} from "../src/data/studio-demo";

function loadEnvLocal() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
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
    if (!(key in process.env)) process.env[key] = value;
  }
}

async function writeBatch(
  db: FirebaseFirestore.Firestore,
  collection: string,
  rows: Array<{ id?: string; uid?: string }>,
) {
  const batch = db.batch();
  for (const row of rows) {
    const id = row.id || row.uid;
    if (!id) throw new Error(`Missing document id for ${collection}`);
    batch.set(db.collection(collection).doc(id), { ...row, demo: true }, { merge: true });
  }
  await batch.commit();
}

async function main() {
  loadEnvLocal();
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
  await writeBatch(db, "bookings", DEMO_BOOKINGS);
  await writeBatch(db, "enquiries", DEMO_ENQUIRIES);
  await writeBatch(db, "closures", DEMO_CLOSURES);
  await writeBatch(db, "users", DEMO_USERS);
  await db.collection("settings").doc("studioDemo").set(
    {
      seededAt: new Date().toISOString(),
      counts: {
        bookings: DEMO_BOOKINGS.length,
        enquiries: DEMO_ENQUIRIES.length,
        closures: DEMO_CLOSURES.length,
        users: DEMO_USERS.length,
      },
    },
    { merge: true },
  );
  console.log(
    JSON.stringify(
      {
        ok: true,
        counts: {
          bookings: DEMO_BOOKINGS.length,
          enquiries: DEMO_ENQUIRIES.length,
          closures: DEMO_CLOSURES.length,
          users: DEMO_USERS.length,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
