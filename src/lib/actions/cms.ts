"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminAuth } from "@/lib/firebase/admin";
import { memoryStore, uid } from "@/lib/store";
import type { ClosureRecord, EnquiryRecord, PlatformSettings, UserRole } from "@/lib/types";
import { DEFAULT_SETTINGS } from "@/lib/catalog";

const SAVE_UNAVAILABLE = "Saving isn’t available right now";

function isHiddenStudioTraveller(user: { uid?: string; name?: string; email?: string }) {
  const haystack = `${user.uid ?? ""} ${user.name ?? ""} ${user.email ?? ""}`.toLowerCase();
  return haystack.includes("willmadikfit");
}

export async function saveDocument(collection: string, id: string, data: Record<string, unknown>) {
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: SAVE_UNAVAILABLE };
  try {
    await db.collection(collection).doc(id).set({ ...data, slug: id }, { merge: true });
    return { ok: true as const };
  } catch (err) {
    console.error("saveDocument failed:", err);
    return { ok: false as const, error: "Could not save. Ask your developer to check the live site connection." };
  }
}

export async function deleteDocument(collection: string, id: string) {
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: SAVE_UNAVAILABLE };
  try {
    await db.collection(collection).doc(id).delete();
    return { ok: true as const };
  } catch (err) {
    console.error("deleteDocument failed:", err);
    return { ok: false as const, error: "Could not delete. Ask your developer to check the live site connection." };
  }
}

export async function saveSettings(settings: PlatformSettings) {
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: SAVE_UNAVAILABLE, settings: DEFAULT_SETTINGS };
  await db.collection("settings").doc("platform").set(settings, { merge: true });
  return { ok: true as const, settings };
}

export async function saveClosure(input: Omit<ClosureRecord, "id"> & { id?: string }) {
  const record: ClosureRecord = { ...input, id: input.id ?? uid("cls") };
  const db = getAdminDb();
  if (db) {
    await db.collection("closures").doc(record.id).set(record);
  } else {
    const store = memoryStore();
    const i = store.closures.findIndex((c) => c.id === record.id);
    if (i >= 0) store.closures[i] = record;
    else store.closures.push(record);
  }
  return { ok: true, closure: record };
}

export async function deleteClosure(id: string) {
  const db = getAdminDb();
  if (db) await db.collection("closures").doc(id).delete();
  else memoryStore().closures = memoryStore().closures.filter((c) => c.id !== id);
  return { ok: true };
}

export async function listUsersAdmin() {
  const db = getAdminDb();
  if (!db) return { ok: false as const, users: [], error: SAVE_UNAVAILABLE };

  let authUsers: Awaited<ReturnType<NonNullable<ReturnType<typeof getAdminAuth>>["listUsers"]>>["users"] =
    [];
  const auth = getAdminAuth();
  if (auth) {
    try {
      const listed = await auth.listUsers(200);
      authUsers = listed.users;
    } catch (err) {
      console.error("listUsersAdmin auth.listUsers failed:", err);
    }
  }

  let profiles;
  try {
    profiles = await db.collection("users").limit(200).get();
  } catch (err) {
    console.error("listUsersAdmin firestore users read failed:", err);
    return {
      ok: false as const,
      users: [],
      error: "Could not load travellers. The live site may not be fully connected yet — ask your developer to check the server setup.",
    };
  }

  const profileByUid = new Map(profiles.docs.map((doc) => [doc.id, doc.data()]));
  const users = authUsers.map((user) => {
    const profile = profileByUid.get(user.uid) as
      | { name?: string; email?: string; phone?: string; role?: UserRole; createdAt?: string }
      | undefined;
    return {
      uid: user.uid,
      name: profile?.name || user.displayName || "Traveller",
      email: profile?.email || user.email || "",
      phone: profile?.phone,
      role: profile?.role || "traveller",
      createdAt: profile?.createdAt || user.metadata.creationTime || "",
      profileMissing: !profile,
    };
  });

  const authUids = new Set(users.map((user) => user.uid));
  for (const doc of profiles.docs) {
    if (authUids.has(doc.id)) continue;
    const profile = doc.data() as {
      name?: string;
      email?: string;
      phone?: string;
      role?: UserRole;
      createdAt?: string;
      demo?: boolean;
    };
    users.push({
      uid: doc.id,
      name: profile.name || "Traveller",
      email: profile.email || "",
      phone: profile.phone,
      role: profile.role || "traveller",
      createdAt: profile.createdAt || "",
      profileMissing: false,
    });
  }

  users.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return {
    ok: true as const,
    users: users.filter((user) => !isHiddenStudioTraveller(user)),
    authPartial: authUsers.length === 0 && profiles.docs.length > 0,
  };
}

export async function updateUserRole(uid: string, role: "traveller" | "admin" | "staff") {
  const db = getAdminDb();
  if (!db) return { ok: false as const, error: SAVE_UNAVAILABLE };
  await db.collection("users").doc(uid).set({ role }, { merge: true });
  return { ok: true as const };
}

export async function publishGuestStory(
  enquiryId: string,
  opts?: { by?: string; titleOverride?: string },
) {
  const { slugify } = await import("@/lib/slug");
  const db = getAdminDb();

  let enquiry: EnquiryRecord | undefined;
  if (db) {
    const doc = await db.collection("enquiries").doc(enquiryId).get();
    if (!doc.exists) return { ok: false as const, error: "Submission not found" };
    enquiry = doc.data() as EnquiryRecord;
  } else {
    enquiry = memoryStore().enquiries.find((e) => e.id === enquiryId);
    if (!enquiry) return { ok: false as const, error: "Submission not found" };
  }

  if (enquiry.source !== "story") {
    return { ok: false as const, error: "This isn’t a guest story submission" };
  }

  const title =
    opts?.titleOverride?.trim() ||
    (typeof enquiry.payload?.title === "string" && enquiry.payload.title.trim()) ||
    `Story from ${enquiry.name}`;
  const slugBase = slugify(title) || `guest-story-${enquiryId.slice(-6)}`;
  const slug = slugBase;
  const photos = Array.isArray(enquiry.payload?.photos)
    ? enquiry.payload.photos.filter((u): u is string => typeof u === "string")
    : [];
  const place = typeof enquiry.payload?.place === "string" ? enquiry.payload.place : "";
  const body = enquiry.message
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!body.length) body.push(enquiry.message.trim());

  const story = {
    slug,
    title,
    excerpt: enquiry.message.slice(0, 180).trim() + (enquiry.message.length > 180 ? "…" : ""),
    author: enquiry.name,
    category: "Guest",
    date: new Date().toISOString().slice(0, 10),
    image: photos[0] || "",
    body,
    sourceUrl: "",
    publishedFromEnquiryId: enquiryId,
    place,
  };

  if (!db) return { ok: false as const, error: SAVE_UNAVAILABLE };

  await db.collection("stories").doc(slug).set(story, { merge: true });
  const notes = [
    ...(enquiry.notes ?? []),
    {
      at: new Date().toISOString(),
      by: opts?.by,
      text: `Published to journal as /stories/${slug}`,
    },
  ];
  await db.collection("enquiries").doc(enquiryId).update({ status: "closed", notes });

  return { ok: true as const, slug, title };
}
