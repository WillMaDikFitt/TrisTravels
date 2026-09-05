"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getClientAuth, getClientDb, getGoogleProvider } from "@/lib/firebase/client";
import { isFirebaseClientConfigured } from "@/lib/firebase/config";
import type { UserProfile, UserRole } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleWishlist: (slug: string) => Promise<void>;
  updateAccount: (data: { name: string; phone?: string }) => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function configuredAdminEmails() {
  return (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isTransientDbError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes("closing/hidden") || msg.includes("Failed to execute 'transaction'");
}

function authErrorMessage(err: unknown, fallback: string) {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
  switch (code) {
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow popups for this site, or try again — we’ll use a full-page sign-in.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was closed before it finished. Please try again.";
    case "auth/unauthorized-domain":
      return "This website domain isn’t authorized for Google sign-in yet. In Firebase Console → Authentication → Settings → Authorized domains, add your live domain (e.g. trismeghalaya.com and www.trismeghalaya.com).";
    case "auth/operation-not-allowed":
      return "Google sign-in isn’t enabled yet. In Firebase Console → Authentication → Sign-in method, enable Google.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method. Try email login, or use the same method you used before.";
    case "auth/network-request-failed":
      return "Network error during Google sign-in. Check your connection and try again.";
    default:
      return err instanceof Error && err.message ? err.message : fallback;
  }
}

function shouldFallbackToRedirect(err: unknown) {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
  return (
    code === "auth/popup-blocked" ||
    code === "auth/cancelled-popup-request" ||
    code === "auth/operation-not-supported-in-this-environment"
  );
}

async function ensureProfile(user: User): Promise<UserProfile> {
  const db = getClientDb();
  const fallback: UserProfile = {
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? "Traveller",
    role: "traveller",
    wishlist: [],
    createdAt: new Date().toISOString(),
  };
  if (!db) return fallback;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const adminEmails = configuredAdminEmails();
  const isConfiguredAdmin = adminEmails.includes((user.email ?? "").toLowerCase());
  if (snap.exists()) {
    const profile = snap.data() as UserProfile;
    if (isConfiguredAdmin && profile.role !== "admin") {
      const promoted = { ...profile, role: "admin" as const };
      await setDoc(ref, { role: "admin" }, { merge: true });
      return promoted;
    }
    return profile;
  }
  const role: UserRole = isConfiguredAdmin ? "admin" : "traveller";
  const profile = { ...fallback, role };
  await setDoc(ref, profile);
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseClientConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    getRedirectResult(auth)
      .then(async (result) => {
        if (cancelled || !result?.user) return;
        try {
          setProfile(await ensureProfile(result.user));
        } catch {
          /* onAuthStateChanged will also hydrate profile */
        }
      })
      .catch((err) => {
        console.error("Google redirect sign-in failed:", err);
      });

    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next);
      try {
        if (next) setProfile(await ensureProfile(next));
        else setProfile(null);
      } catch {
        if (next) {
          setProfile({
            uid: next.uid,
            email: next.email ?? "",
            name: next.displayName ?? "Traveller",
            role: "traveller",
            wishlist: [],
            createdAt: new Date().toISOString(),
          });
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured,
      isAdmin: profile?.role === "admin" || profile?.role === "staff",
      async signIn(email, password) {
        const auth = getClientAuth();
        if (!auth) throw new Error("Accounts aren’t available right now");
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
          throw new Error(authErrorMessage(err, "Could not sign in"));
        }
      },
      async signUp(name, email, password) {
        const auth = getClientAuth();
        if (!auth) throw new Error("Accounts aren’t available right now");
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });
          await ensureProfile({ ...cred.user, displayName: name } as User);
        } catch (err) {
          throw new Error(authErrorMessage(err, "Could not create account"));
        }
      },
      async signInGoogle() {
        const auth = getClientAuth();
        if (!auth) throw new Error("Accounts aren’t available right now");

        const preferRedirect =
          typeof window !== "undefined" &&
          (window.matchMedia("(max-width: 768px)").matches ||
            /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

        try {
          if (preferRedirect) {
            await signInWithRedirect(auth, getGoogleProvider());
            return;
          }
          await signInWithPopup(auth, getGoogleProvider());
        } catch (err) {
          if (shouldFallbackToRedirect(err)) {
            await signInWithRedirect(auth, getGoogleProvider());
            return;
          }
          throw new Error(authErrorMessage(err, "Could not sign in with Google"));
        }
      },
      async logout() {
        const auth = getClientAuth();
        if (auth) await signOut(auth);
      },
      async toggleWishlist(slug) {
        if (!user || !profile) throw new Error("Please log in");
        const next = profile.wishlist.includes(slug)
          ? profile.wishlist.filter((s) => s !== slug)
          : [...profile.wishlist, slug];
        const updated = { ...profile, wishlist: next };
        setProfile(updated);
        const db = getClientDb();
        if (db) {
          try {
            await setDoc(doc(db, "users", user.uid), { wishlist: next }, { merge: true });
          } catch (err) {
            if (!isTransientDbError(err)) throw err;
          }
        }
      },
      async updateAccount(data) {
        if (!user || !profile) throw new Error("Please log in");
        const auth = getClientAuth();
        if (auth?.currentUser && data.name) {
          await updateProfile(auth.currentUser, { displayName: data.name });
        }
        const updated = { ...profile, name: data.name, phone: data.phone };
        setProfile(updated);
        const db = getClientDb();
        if (db) {
          try {
            await setDoc(
              doc(db, "users", user.uid),
              { name: data.name, phone: data.phone },
              { merge: true },
            );
          } catch (err) {
            if (!isTransientDbError(err)) throw err;
          }
        }
      },
    }),
    [user, profile, loading, configured],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
