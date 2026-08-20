import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { memoryStore } from "@/lib/store";

/** On Vercel, in-memory data is per-request and must not masquerade as real persistence. */
export function allowMemoryBackend() {
  return process.env.NODE_ENV !== "production";
}

export function memoryBackendWarning() {
  return "Studio isn’t connected to the live site yet. Ask your developer to finish the server setup and redeploy.";
}

export async function readFirestoreCollection<T>(name: string, limit = 200): Promise<T[] | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection(name).limit(limit).get();
    return snap.docs.map((doc) => doc.data() as T);
  } catch (err) {
    console.error(`Firestore read failed (${name}):`, err);
    return null;
  }
}

export function readMemoryBookings<T>(select: (store: ReturnType<typeof memoryStore>) => T[]) {
  if (!allowMemoryBackend()) return [] as T[];
  return select(memoryStore());
}
