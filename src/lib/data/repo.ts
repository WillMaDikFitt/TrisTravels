import { experiences, getExperience as getStaticExperience } from "@/data/experiences";
import { journeys, getJourney as getStaticJourney } from "@/data/journeys";
import { destinations, getDestination as getStaticDestination } from "@/data/destinations";
import { stories, type Story } from "@/data/stories";
import { getAdminDb } from "@/lib/firebase/admin";
import type { ClosureRecord, Experience, Journey, Destination, PlatformSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import { memoryStore } from "@/lib/store";

function docSlug(item: { slug?: string; id?: string }) {
  return item.slug ?? item.id ?? "";
}

function isEmptyOverlay(value: unknown) {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

/** Firestore Timestamps / Dates → ISO strings so RSC payloads stay serializable. */
function sanitizeOverlay(value: unknown): unknown {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    try {
      return (value as { toDate: () => Date }).toDate().toISOString();
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(value)) return value.map(sanitizeOverlay);
  if (!isPlainObject(value)) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) out[key] = sanitizeOverlay(nested);
  return out;
}

/** Merge seed catalogue with Firestore overrides; ignore empty remote fields. */
function mergeRecord<T extends object>(base: T | undefined, remote: Partial<T>, slug: string): T {
  const out = { ...(base ?? {}), slug } as T & { slug: string };
  for (const [key, value] of Object.entries(remote)) {
    if (key === "slug" || key === "id") continue;
    if (isEmptyOverlay(value)) continue;
    const clean = sanitizeOverlay(value);
    if (isEmptyOverlay(clean)) continue;
    (out as Record<string, unknown>)[key] = clean;
  }
  return out as T;
}

function isPublicJourney(j: Journey) {
  const status = j.status ?? "active";
  if (status === "draft" || status === "hidden") return false;
  if (!j.slug || !j.name?.trim()) return false;
  if (j.type !== "curated" && j.type !== "small-group") return false;
  if (typeof j.image !== "string" || !j.image.trim()) return false;
  return true;
}

function mergeCatalog<T extends { slug: string }>(
  staticItems: T[],
  remote: ({ slug?: string; id?: string } & Partial<T>)[] | null,
): T[] {
  const map = new Map(staticItems.map((item) => [item.slug, item]));
  if (!remote?.length) return staticItems;
  for (const item of remote) {
    const slug = docSlug(item);
    if (!slug) continue;
    map.set(slug, mergeRecord(map.get(slug), item, slug));
  }
  return Array.from(map.values());
}

async function collectionDocs<T>(name: string): Promise<T[] | null> {
  const db = getAdminDb();
  if (!db) return null;
  try {
    const snap = await db.collection(name).get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
  } catch (err) {
    console.error(`Firestore read failed (${name}):`, err);
    return null;
  }
}

export async function listExperiences(): Promise<Experience[]> {
  const remote = await collectionDocs<Experience & { slug?: string; id?: string }>("experiences");
  const merged = mergeCatalog(experiences, remote);
  return merged.filter((e) => (e.status ?? "active") === "active" || e.status === "seasonal");
}

export async function listAllExperiencesAdmin(): Promise<Experience[]> {
  const remote = await collectionDocs<Experience & { slug?: string; id?: string }>("experiences");
  return mergeCatalog(experiences, remote);
}

export async function findExperience(slug: string): Promise<Experience | undefined> {
  const staticFallback = getStaticExperience(slug);
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("experiences").doc(slug).get();
      if (doc.exists) {
        const merged = mergeRecord(staticFallback, doc.data() as Experience, slug);
        if (staticFallback && !merged.name?.trim()) return staticFallback;
        return merged;
      }
    } catch (err) {
      console.error(`Firestore read failed (experiences/${slug}):`, err);
    }
  }
  return staticFallback;
}

export async function listJourneys(): Promise<Journey[]> {
  const remote = await collectionDocs<Journey & { slug?: string; id?: string }>("journeys");
  return mergeCatalog(journeys, remote).filter(isPublicJourney);
}

export async function listAllJourneysAdmin(): Promise<Journey[]> {
  const remote = await collectionDocs<Journey & { slug?: string; id?: string }>("journeys");
  return mergeCatalog(journeys, remote);
}

export async function findJourney(slug: string): Promise<Journey | undefined> {
  const staticFallback = getStaticJourney(slug);
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("journeys").doc(slug).get();
      if (doc.exists) {
        const merged = mergeRecord(staticFallback, doc.data() as Journey, slug);
        if (staticFallback && !merged.name?.trim()) return staticFallback;
        return merged;
      }
    } catch (err) {
      console.error(`Firestore read failed (journeys/${slug}):`, err);
    }
  }
  return staticFallback;
}

export async function listDestinations(): Promise<Destination[]> {
  const remote = await collectionDocs<Destination & { slug?: string; id?: string }>("destinations");
  return mergeCatalog(destinations, remote);
}

export async function findDestination(slug: string): Promise<Destination | undefined> {
  const staticFallback = getStaticDestination(slug);
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("destinations").doc(slug).get();
      if (doc.exists) {
        return mergeRecord(staticFallback, doc.data() as Destination, slug);
      }
    } catch (err) {
      console.error(`Firestore read failed (destinations/${slug}):`, err);
    }
  }
  return staticFallback;
}

export async function listStories(): Promise<Story[]> {
  const remote = await collectionDocs<Story & { slug?: string; id?: string }>("stories");
  return mergeCatalog(stories, remote);
}

export async function findStory(slug: string): Promise<Story | undefined> {
  const staticFallback = stories.find((s) => s.slug === slug);
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("stories").doc(slug).get();
      if (doc.exists) {
        return mergeRecord(staticFallback, doc.data() as Story, slug);
      }
    } catch (err) {
      console.error(`Firestore read failed (stories/${slug}):`, err);
    }
  }
  return staticFallback;
}

export async function getSettings(): Promise<PlatformSettings> {
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("settings").doc("platform").get();
      if (doc.exists) return { ...DEFAULT_SETTINGS, ...(doc.data() as Partial<PlatformSettings>) };
    } catch (err) {
      console.error("Firestore read failed (settings/platform):", err);
    }
  }
  return DEFAULT_SETTINGS;
}

export async function listClosures(experienceSlug?: string): Promise<ClosureRecord[]> {
  const db = getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("closures").get();
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClosureRecord);
      return experienceSlug ? all.filter((c) => c.experienceSlug === experienceSlug) : all;
    } catch (err) {
      console.error("Firestore read failed (closures):", err);
    }
  }
  const all = memoryStore().closures;
  return experienceSlug ? all.filter((c) => c.experienceSlug === experienceSlug) : all;
}
