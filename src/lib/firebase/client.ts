"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  getAuth,
  initializeAuth,
  GoogleAuthProvider,
  type Auth,
  type PopupRedirectResolver,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { isFirebaseClientConfigured } from "./config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function resolveAuthDomain(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const host = window.location.hostname;
  if (!host || host === "localhost" || host.endsWith(".localhost")) return fallback;
  // First-party auth helper via next.config rewrite of /__/auth/*
  return host;
}

function requireClientConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  const fallbackAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  if (!apiKey || !fallbackAuthDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain: resolveAuthDomain(fallbackAuthDomain),
    projectId,
    appId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  };
}

export function getFirebaseApp() {
  // Auth must init in the browser so authDomain can match the live hostname.
  if (typeof window === "undefined") return null;
  if (!isFirebaseClientConfigured()) return null;
  if (!app) {
    const config = requireClientConfig();
    if (!config) return null;
    app =
      getApps()[0] ??
      initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });
  }
  return app;
}

export function getClientAuth() {
  if (auth) return auth;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  try {
    auth = initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence,
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    // Already initialized in this runtime (HMR / duplicate import).
    auth = getAuth(firebaseApp);
  }
  return auth;
}

export function getClientDb() {
  if (db) return db;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  db = getFirestore(firebaseApp);
  return db;
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

/** Always pass this into popup/redirect helpers so production never hits auth/argument-error. */
export function getAuthResolver(): PopupRedirectResolver {
  return browserPopupRedirectResolver;
}
