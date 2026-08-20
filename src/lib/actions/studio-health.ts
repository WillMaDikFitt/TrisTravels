"use server";

import { isFirebaseAdminConfigured, isFirebaseClientConfigured } from "@/lib/firebase/config";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export async function fetchStudioHealth() {
  const clientConfigured = isFirebaseClientConfigured();
  const adminConfigured = isFirebaseAdminConfigured();
  let adminConnected = false;
  let adminError = "";

  if (!adminConfigured) {
    adminError =
      "Studio can’t load live travellers, bookings, or reports yet. Ask your developer to finish connecting the live site, then redeploy.";
  } else {
    try {
      const db = getAdminDb();
      if (!db) {
        adminError =
          "The live site connection didn’t start correctly. Ask your developer to check the server setup and redeploy.";
      } else {
        await db.collection("bookings").limit(1).get();
        adminConnected = true;
        const auth = getAdminAuth();
        if (auth) {
          try {
            await auth.listUsers(1);
          } catch (err) {
            console.error("Firebase Auth admin check failed:", err);
            adminError =
              "Some signed-up travellers may not appear in Studio yet. Ask your developer to check account access on the live site.";
          }
        }
      }
    } catch (err) {
      adminError =
        "Studio can’t reach the live site records right now. Ask your developer to check the server connection.";
      console.error("Studio health check failed:", err);
    }
  }

  return { clientConfigured, adminConfigured, adminConnected, adminError };
}
