"use server";

import {
  DEMO_BOOKINGS,
  DEMO_CLOSURES,
  DEMO_ENQUIRIES,
  DEMO_USERS,
} from "@/data/studio-demo";
import { getAdminDb } from "@/lib/firebase/admin";
import { memoryStore } from "@/lib/store";

const META_DOC = "studioDemo";

type AdminDb = NonNullable<ReturnType<typeof getAdminDb>>;

async function writeBatchDocs(
  db: AdminDb,
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

export async function seedStudioDemo() {
  try {
    const db = getAdminDb();
    if (db) {
      await writeBatchDocs(db, "bookings", DEMO_BOOKINGS);
      await writeBatchDocs(db, "enquiries", DEMO_ENQUIRIES);
      await writeBatchDocs(db, "closures", DEMO_CLOSURES);
      await writeBatchDocs(db, "users", DEMO_USERS);
      await db.collection("settings").doc(META_DOC).set(
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
      return {
        ok: true as const,
        mode: "firestore" as const,
        counts: {
          bookings: DEMO_BOOKINGS.length,
          enquiries: DEMO_ENQUIRIES.length,
          closures: DEMO_CLOSURES.length,
          users: DEMO_USERS.length,
        },
      };
    }

    const store = memoryStore();
    store.bookings = [
      ...DEMO_BOOKINGS,
      ...store.bookings.filter((row) => !String(row.id).startsWith("demo_")),
    ];
    store.enquiries = [
      ...DEMO_ENQUIRIES,
      ...store.enquiries.filter((row) => !String(row.id).startsWith("demo_")),
    ];
    store.closures = [
      ...DEMO_CLOSURES,
      ...store.closures.filter((row) => !String(row.id).startsWith("demo_")),
    ];
    return {
      ok: true as const,
      mode: "memory" as const,
      counts: {
        bookings: DEMO_BOOKINGS.length,
        enquiries: DEMO_ENQUIRIES.length,
        closures: DEMO_CLOSURES.length,
        users: DEMO_USERS.length,
      },
    };
  } catch (err) {
    console.error("seedStudioDemo failed:", err);
    return { ok: false as const, error: "Could not prepare Studio sample data." };
  }
}

export async function clearStudioDemo() {
  const db = getAdminDb();
  if (db) {
    const collections = ["bookings", "enquiries", "closures", "users"] as const;
    for (const collection of collections) {
      const snap = await db.collection(collection).where("demo", "==", true).get();
      if (snap.empty) {
        const all = await db.collection(collection).get();
        const batch = db.batch();
        all.docs
          .filter((doc) => doc.id.startsWith("demo_"))
          .forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        continue;
      }
      const batch = db.batch();
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
    await db.collection("settings").doc(META_DOC).delete();
    return { ok: true as const, mode: "firestore" as const };
  }

  const store = memoryStore();
  store.bookings = store.bookings.filter((row) => !String(row.id).startsWith("demo_"));
  store.enquiries = store.enquiries.filter((row) => !String(row.id).startsWith("demo_"));
  store.closures = store.closures.filter((row) => !String(row.id).startsWith("demo_"));
  return { ok: true as const, mode: "memory" as const };
}

export async function getStudioDemoStatus() {
  const db = getAdminDb();
  if (db) {
    const meta = await db.collection("settings").doc(META_DOC).get();
    const bookings = await db.collection("bookings").where("demo", "==", true).limit(1).get();
    const seeded =
      meta.exists ||
      !bookings.empty ||
      (await db.collection("bookings").doc(DEMO_BOOKINGS[0].id).get()).exists;
    return {
      ok: true as const,
      seeded,
      seededAt: meta.exists ? String(meta.data()?.seededAt ?? "") : "",
      mode: "firestore" as const,
    };
  }
  const store = memoryStore();
  const seeded = store.bookings.some((row) => String(row.id).startsWith("demo_"));
  return { ok: true as const, seeded, seededAt: "", mode: "memory" as const };
}
