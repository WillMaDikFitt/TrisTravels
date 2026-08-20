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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

/** Firestore Timestamps / Dates → ISO strings so server actions and RSC stay serializable. */
export function sanitizeForClient(value: unknown): unknown {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  // Firestore Timestamp-like plain objects after some transports
  if (
    isPlainObject(value) &&
    typeof (value as { seconds?: unknown }).seconds === "number" &&
    typeof (value as { nanoseconds?: unknown }).nanoseconds === "number" &&
    Object.keys(value).every((key) => key === "seconds" || key === "nanoseconds" || key === "type")
  ) {
    try {
      return new Date((value as { seconds: number }).seconds * 1000).toISOString();
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(value)) return value.map(sanitizeForClient);
  if (!isPlainObject(value)) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    out[key] = sanitizeForClient(nested);
  }
  return out;
}

export function asIsoString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  const clean = sanitizeForClient(value);
  return typeof clean === "string" ? clean : fallback;
}

export async function readFirestoreCollection<T>(name: string, limit = 200): Promise<T[] | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection(name).limit(limit).get();
    return snap.docs.map((doc) => {
      const raw = sanitizeForClient({ id: doc.id, ...doc.data() }) as Record<string, unknown>;
      if (typeof raw.createdAt !== "string") raw.createdAt = asIsoString(raw.createdAt, "");
      if (typeof raw.expiresAt !== "string" && raw.expiresAt != null) {
        raw.expiresAt = asIsoString(raw.expiresAt);
      }
      return raw as T;
    });
  } catch (err) {
    console.error(`Live site read failed (${name}):`, err);
    return null;
  }
}

export function readMemoryBookings<T>(select: (store: ReturnType<typeof memoryStore>) => T[]) {
  if (!allowMemoryBackend()) return [] as T[];
  return select(memoryStore());
}
