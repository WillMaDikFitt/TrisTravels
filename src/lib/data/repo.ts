import { experiences, getExperience as getStaticExperience } from "@/data/experiences";
import { journeys, getJourney as getStaticJourney } from "@/data/journeys";
import { destinations, getDestination as getStaticDestination } from "@/data/destinations";
import { stories } from "@/data/stories";
import { getAdminDb } from "@/lib/firebase/admin";
import type { ClosureRecord, Experience, Journey, Destination, Story, PlatformSettings } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import { memoryStore } from "@/lib/store";

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
  const remote = await collectionDocs<Experience & { slug?: string }>("experiences");
  if (!remote?.length) return experiences.filter((e) => (e.status ?? "active") !== "hidden" && e.status !== "draft");
  return remote
    .filter((e) => (e.status ?? "active") === "active" || e.status === "seasonal")
    .map((e) => ({ ...e, slug: e.slug ?? (e as { id?: string }).id! }));
}

export async function listAllExperiencesAdmin(): Promise<Experience[]> {
  const remote = await collectionDocs<Experience & { slug?: string }>("experiences");
  if (!remote?.length) return experiences;
  return remote.map((e) => ({ ...e, slug: e.slug ?? (e as { id?: string }).id! }));
}

export async function findExperience(slug: string): Promise<Experience | undefined> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("experiences").doc(slug).get();
    if (doc.exists) return { ...(doc.data() as Experience), slug };
  }
  return getStaticExperience(slug);
}

export async function listJourneys(): Promise<Journey[]> {
  const remote = await collectionDocs<Journey & { slug?: string }>("journeys");
  if (!remote?.length) return journeys;
  return remote.map((j) => ({ ...j, slug: j.slug ?? (j as { id?: string }).id! }));
}

export async function findJourney(slug: string): Promise<Journey | undefined> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("journeys").doc(slug).get();
    if (doc.exists) return { ...(doc.data() as Journey), slug };
  }
  return getStaticJourney(slug);
}

export async function listDestinations(): Promise<Destination[]> {
  const remote = await collectionDocs<Destination & { slug?: string }>("destinations");
  if (!remote?.length) return destinations;
  return remote.map((d) => ({ ...d, slug: d.slug ?? (d as { id?: string }).id! }));
}

export async function findDestination(slug: string): Promise<Destination | undefined> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("destinations").doc(slug).get();
    if (doc.exists) return { ...(doc.data() as Destination), slug };
  }
  return getStaticDestination(slug);
}

export async function listStories(): Promise<Story[]> {
  const remote = await collectionDocs<Story & { slug?: string }>("stories");
  if (!remote?.length) return stories;
  return remote.map((s) => ({ ...s, slug: s.slug ?? (s as { id?: string }).id! }));
}

export async function findStory(slug: string): Promise<Story | undefined> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("stories").doc(slug).get();
    if (doc.exists) return { ...(doc.data() as Story), slug };
  }
  return stories.find((s) => s.slug === slug);
}

export async function getSettings(): Promise<PlatformSettings> {
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection("settings").doc("platform").get();
    if (doc.exists) return { ...DEFAULT_SETTINGS, ...(doc.data() as Partial<PlatformSettings>) };
  }
  return DEFAULT_SETTINGS;
}

export async function listClosures(experienceSlug?: string): Promise<ClosureRecord[]> {
  const db = getAdminDb();
  if (db) {
    const snap = await db.collection("closures").get();
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ClosureRecord);
    return experienceSlug ? all.filter((c) => c.experienceSlug === experienceSlug) : all;
  }
  const all = memoryStore().closures;
  return experienceSlug ? all.filter((c) => c.experienceSlug === experienceSlug) : all;
}
