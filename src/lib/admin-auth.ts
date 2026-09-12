import "server-only";

import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { allowMemoryBackend } from "@/lib/firebase/admin-read";

function configuredAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Server-side check that the caller is TRIS staff.
 * Studio pages send the signed-in user's Firebase ID token; the role rule mirrors AuthProvider.
 */
export async function requireStaff(idToken: string | null | undefined) {
  const auth = getAdminAuth();
  const db = getAdminDb();
  if (!auth || !db) {
    // Local development without Firebase keys runs on the in-memory store.
    if (allowMemoryBackend()) return { ok: true as const, staff: { uid: "local-dev", email: "", name: "" } };
    return { ok: false as const, error: "Studio isn’t connected to the server yet." };
  }
  if (!idToken) return { ok: false as const, error: "Sign in to Studio again." };

  try {
    const decoded = await auth.verifyIdToken(idToken);
    const email = (decoded.email ?? "").toLowerCase();
    const profile = (await db.collection("users").doc(decoded.uid).get()).data();
    const role = profile?.role;
    const allowed =
      (email !== "" && configuredAdminEmails().includes(email)) || role === "admin" || role === "staff";
    if (!allowed) return { ok: false as const, error: "Only TRIS staff can do this." };
    return {
      ok: true as const,
      staff: { uid: decoded.uid, email, name: String(profile?.name ?? "") },
    };
  } catch {
    return { ok: false as const, error: "Your Studio session expired. Sign in again." };
  }
}
