import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { isFirebaseAdminConfigured } from "./config";

function initAdmin() {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    }
    return getApps()[0] ?? null;
  } catch (err) {
    console.error("Firebase admin init failed:", err);
    return null;
  }
}

export function getAdminAuth() {
  if (!initAdmin()) return null;
  return getAuth();
}

export function getAdminDb() {
  if (!initAdmin()) return null;
  const db = getFirestore();
  try {
    // Optional fields on bookings/enquiries often omit keys as `undefined`.
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // settings() throws if already called on this app instance — safe to ignore.
  }
  return db;
}
