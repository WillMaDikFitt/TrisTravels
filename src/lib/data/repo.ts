import { experiences, getExperience as getStaticExperience } from "@/data/experiences";
import { journeys, getJourney as getStaticJourney } from "@/data/journeys";
import { destinations, getDestination as getStaticDestination } from "@/data/destinations";
import { stories, type Story } from "@/data/stories";
import { getAdminDb } from "@/lib/firebase/admin";
import type { ClosureRecord, Experience, Journey, Destination, PlatformSettings } from "@/lib/types";
import { sortExperiences } from "@/lib/experience-meta";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import { hydrateFleetFromDefaults } from "@/data/transport";
import { hydrateStayStylesFromDefaults } from "@/data/stay-styles";
import { memoryStore } from "@/lib/store";
import { normalizeExperience } from "@/lib/normalize-listing";

function docSlug(item: { slug?: string; id?: string }) {
  return item.slug ?? item.id ?? "";
}

/**
 * Values that mean “this key was not provided by Firestore”.
 * Empty strings and empty arrays from Studio MUST win over seed (clears stick).
 */
function isMissingRemoteValue(value: unknown) {
  return value === undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

function containsStockMedia(value: unknown): boolean {
  if (typeof value === "string") {
    return value.includes("images.unsplash.com") || value.includes("static.wixstatic.com");
  }
  if (Array.isArray(value)) return value.some(containsStockMedia);
  if (isPlainObject(value)) return Object.values(value).some(containsStockMedia);
  return false;
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

/**
 * Firestore wins over seed — including explicit empty strings / empty arrays.
 * Seed only fills keys that are missing on the remote doc (undefined).
 */
function mergeRecord<T extends object>(base: T | undefined, remote: Partial<T>, slug: string): T {
  const out = { ...(base ?? {}), slug } as T & { slug: string };
  for (const [key, value] of Object.entries(remote)) {
    if (key === "slug" || key === "id") continue;
    if (isMissingRemoteValue(value)) continue;
    // null = explicit clear
    if (value === null) {
      const baseVal = (base as Record<string, unknown> | undefined)?.[key];
      (out as Record<string, unknown>)[key] = Array.isArray(baseVal) ? [] : "";
      continue;
    }
    // Booleans (incl. false) and removed flags must always apply.
    if (typeof value === "boolean") {
      (out as Record<string, unknown>)[key] = value;
      continue;
    }
    // Ignore old Unsplash / Wix placeholders if we already have a real seed image.
    if (base && ["image", "gallery", "guideQuote"].includes(key) && containsStockMedia(value)) continue;
    const clean = sanitizeOverlay(value);
    if (isMissingRemoteValue(clean)) continue;
    (out as Record<string, unknown>)[key] = clean;
  }
  return out as T;
}

function isCatalogueRemoved(item: { removedFromCatalogue?: boolean }) {
  return item.removedFromCatalogue === true;
}

function isPublicJourney(j: Journey) {
  if (isCatalogueRemoved(j)) return false;
  const status = j.status ?? "active";
  if (status === "draft" || status === "hidden") return false;
  if (!j.slug || !j.name?.trim()) return false;
  if (j.type !== "curated" && j.type !== "small-group") return false;
  if (typeof j.image !== "string" || !j.image.trim()) return false;
  return true;
}

function isPublicExperience(e: Experience) {
  if (isCatalogueRemoved(e)) return false;
  const status = e.status ?? "active";
  return status === "active" || status === "seasonal";
}

function isPublicListing(item: { status?: string; removedFromCatalogue?: boolean }) {
  if (isCatalogueRemoved(item)) return false;
  const status = item.status ?? "active";
  return status !== "draft" && status !== "hidden";
}

/**
 * Firestore-first catalogue.
 * - Remote docs are authoritative (Studio edits win).
 * - Seed docs appear only when that slug is not in Firestore yet (or Firebase is offline).
 */
function mergeCatalog<T extends { slug: string }>(
  staticItems: T[],
  remote: ({ slug?: string; id?: string } & Partial<T>)[] | null,
): T[] {
  if (!remote?.length) return staticItems;
  const staticMap = new Map(staticItems.map((item) => [item.slug, item]));
  const map = new Map<string, T>();

  for (const item of remote) {
    const slug = docSlug(item);
    if (!slug) continue;
    map.set(slug, mergeRecord(staticMap.get(slug), item, slug));
  }

  for (const item of staticItems) {
    if (!map.has(item.slug)) map.set(item.slug, item);
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
  const merged = sortExperiences(mergeCatalog(experiences, remote));
  return merged.filter(isPublicExperience).map((item) => normalizeExperience(item, item.slug));
}

export async function listAllExperiencesAdmin(): Promise<Experience[]> {
  const remote = await collectionDocs<Experience & { slug?: string; id?: string }>("experiences");
  return sortExperiences(mergeCatalog(experiences, remote)).filter((item) => !isCatalogueRemoved(item));
}

async function loadExperience(slug: string): Promise<Experience | undefined> {
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

export async function findExperience(slug: string): Promise<Experience | undefined> {
  const item = await loadExperience(slug);
  if (!item || !isPublicExperience(item)) return undefined;
  return normalizeExperience(item, slug);
}

export async function findExperienceAdmin(slug: string): Promise<Experience | undefined> {
  const item = await loadExperience(slug);
  return item ? normalizeExperience(item, slug) : undefined;
}

export async function listJourneys(): Promise<Journey[]> {
  const remote = await collectionDocs<Journey & { slug?: string; id?: string }>("journeys");
  return mergeCatalog(journeys, remote).filter(isPublicJourney);
}

export async function listAllJourneysAdmin(): Promise<Journey[]> {
  const remote = await collectionDocs<Journey & { slug?: string; id?: string }>("journeys");
  return mergeCatalog(journeys, remote).filter((item) => !isCatalogueRemoved(item));
}

async function loadJourney(slug: string): Promise<Journey | undefined> {
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

export async function findJourney(slug: string): Promise<Journey | undefined> {
  const item = await loadJourney(slug);
  return item && isPublicJourney(item) ? item : undefined;
}

export async function findJourneyAdmin(slug: string): Promise<Journey | undefined> {
  return loadJourney(slug);
}

export async function listDestinations(): Promise<Destination[]> {
  const remote = await collectionDocs<Destination & { slug?: string; id?: string }>("destinations");
  return mergeCatalog(destinations, remote).filter(isPublicListing);
}

export async function listAllDestinationsAdmin(): Promise<Destination[]> {
  const remote = await collectionDocs<Destination & { slug?: string; id?: string }>("destinations");
  return mergeCatalog(destinations, remote).filter((item) => !isCatalogueRemoved(item));
}

async function loadDestination(slug: string): Promise<Destination | undefined> {
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

export async function findDestination(slug: string): Promise<Destination | undefined> {
  const item = await loadDestination(slug);
  return item && isPublicListing(item) ? item : undefined;
}

export async function findDestinationAdmin(slug: string): Promise<Destination | undefined> {
  return loadDestination(slug);
}

export async function listStories(): Promise<Story[]> {
  const remote = await collectionDocs<Story & { slug?: string; id?: string }>("stories");
  return mergeCatalog(stories, remote).filter(isPublicListing);
}

export async function listAllStoriesAdmin(): Promise<Story[]> {
  const remote = await collectionDocs<Story & { slug?: string; id?: string }>("stories");
  return mergeCatalog(stories, remote).filter((item) => !isCatalogueRemoved(item));
}

async function loadStory(slug: string): Promise<Story | undefined> {
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

export async function findStory(slug: string): Promise<Story | undefined> {
  const item = await loadStory(slug);
  return item && isPublicListing(item) ? item : undefined;
}

export async function findStoryAdmin(slug: string): Promise<Story | undefined> {
  return loadStory(slug);
}

export async function getSettings(): Promise<PlatformSettings> {
  const db = getAdminDb();
  if (db) {
    try {
      const doc = await db.collection("settings").doc("platform").get();
      if (doc.exists) {
        const data = doc.data() as Partial<PlatformSettings>;
        return {
          ...DEFAULT_SETTINGS,
          ...data,
          impact: data.impact?.length ? data.impact : DEFAULT_SETTINGS.impact,
          discountCodes: data.discountCodes ?? DEFAULT_SETTINGS.discountCodes,
          fleetVehicles: data.fleetVehicles?.length
            ? hydrateFleetFromDefaults(data.fleetVehicles)
            : DEFAULT_SETTINGS.fleetVehicles,
          stayStyles: data.stayStyles?.length
            ? hydrateStayStylesFromDefaults(data.stayStyles)
            : DEFAULT_SETTINGS.stayStyles,
          experienceFaqs: data.experienceFaqs?.length
            ? data.experienceFaqs
            : DEFAULT_SETTINGS.experienceFaqs,
          curatedJourneyFaqs: data.curatedJourneyFaqs?.length
            ? data.curatedJourneyFaqs
            : DEFAULT_SETTINGS.curatedJourneyFaqs,
        };
      }
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
