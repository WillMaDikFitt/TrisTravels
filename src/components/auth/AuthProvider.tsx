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
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getClientAuth, getClientDb, googleProvider } from "@/lib/firebase/client";
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
  const role: UserRole = isConfiguredAdmin
    ? "admin"
    : "traveller";
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
    return onAuthStateChanged(auth, async (next) => {
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
        await signInWithEmailAndPassword(auth, email, password);
      },
      async signUp(name, email, password) {
        const auth = getClientAuth();
        if (!auth) throw new Error("Accounts aren’t available right now");
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await ensureProfile({ ...cred.user, displayName: name } as User);
      },
      async signInGoogle() {
        const auth = getClientAuth();
        if (!auth) throw new Error("Accounts aren’t available right now");
        await signInWithPopup(auth, googleProvider);
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
        if (db) await setDoc(doc(db, "users", user.uid), { wishlist: next }, { merge: true });
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
        if (db) await setDoc(doc(db, "users", user.uid), { name: data.name, phone: data.phone }, { merge: true });
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
