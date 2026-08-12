"use server";

import { isFirebaseAdminConfigured, isFirebaseClientConfigured } from "@/lib/firebase/config";
import { getAdminDb } from "@/lib/firebase/admin";

export async function fetchStudioHealth() {
  const clientConfigured = isFirebaseClientConfigured();
  const adminConfigured = isFirebaseAdminConfigured();
  let adminConnected = false;
  if (adminConfigured) {
    try {
      adminConnected = Boolean(getAdminDb());
    } catch {
      adminConnected = false;
    }
  }
  return { clientConfigured, adminConfigured, adminConnected };
}
