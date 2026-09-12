import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { allowMemoryBackend, memoryBackendWarning, sanitizeForClient } from "@/lib/firebase/admin-read";
import { notifyStaffNewLead } from "@/lib/email";
import { memoryStore } from "@/lib/store";
import type { ManualBookingRecord } from "@/lib/types";
import { formatINR } from "@/lib/utils";

const COLLECTION = "manualBookings";
const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

function toRecord(id: string, data: unknown) {
  return sanitizeForClient({ ...(data as Record<string, unknown>), id }) as ManualBookingRecord;
}

/** In-memory rows are for local development only; production must use Firestore. */
function memoryRows() {
  if (!allowMemoryBackend()) throw new Error(memoryBackendWarning());
  return memoryStore().manualBookings;
}

async function findOne(field: "token" | "razorpayOrderId", value: string) {
  const db = getAdminDb();
  if (db) {
    const snap = await db.collection(COLLECTION).where(field, "==", value).limit(1).get();
    const doc = snap.docs[0];
    return doc ? toRecord(doc.id, doc.data()) : null;
  }
  return memoryRows().find((row) => row[field] === value) ?? null;
}

export async function listManualBookingRecords() {
  const db = getAdminDb();
  const rows = db
    ? (await db.collection(COLLECTION).limit(500).get()).docs.map((doc) => toRecord(doc.id, doc.data()))
    : [...memoryRows()];
  return rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function getManualBookingById(id: string) {
  if (!id) return null;
  const db = getAdminDb();
  if (db) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    return doc.exists ? toRecord(doc.id, doc.data()) : null;
  }
  return memoryRows().find((row) => row.id === id) ?? null;
}

export async function getManualBookingByToken(token: string) {
  if (!TOKEN_PATTERN.test(token)) return null;
  return findOne("token", token);
}

export async function getManualBookingByOrderId(orderId: string) {
  if (!orderId) return null;
  return findOne("razorpayOrderId", orderId);
}

export async function saveManualBooking(record: ManualBookingRecord) {
  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTION).doc(record.id).set(record);
    return;
  }
  memoryRows().unshift(record);
}

export async function updateManualBooking(id: string, patch: Partial<ManualBookingRecord>) {
  const db = getAdminDb();
  if (db) {
    await db.collection(COLLECTION).doc(id).update(patch);
    return;
  }
  const row = memoryRows().find((r) => r.id === id);
  if (row) Object.assign(row, patch);
}

/**
 * Flip a link to paid exactly once. The checkout callback and the Razorpay webhook both call
 * this, so the change runs in a transaction and only the first caller emails staff.
 */
export async function markManualBookingPaid(
  record: ManualBookingRecord,
  payment: { orderId: string; paymentId?: string },
) {
  const patch: Partial<ManualBookingRecord> = {
    status: "paid",
    razorpayOrderId: payment.orderId,
    paidAt: new Date().toISOString(),
  };
  if (payment.paymentId) patch.razorpayPaymentId = payment.paymentId;

  let flipped = false;
  const db = getAdminDb();
  if (db) {
    const ref = db.collection(COLLECTION).doc(record.id);
    flipped = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data()?.status === "paid") return false;
      tx.update(ref, patch);
      return true;
    });
  } else {
    const row = memoryRows().find((r) => r.id === record.id);
    if (row && row.status !== "paid") {
      Object.assign(row, patch);
      flipped = true;
    }
  }

  if (flipped) {
    try {
      await notifyStaffNewLead({
        kind: "booking",
        id: record.id,
        name: record.travellerName,
        email: record.travellerEmail,
        phone: record.travellerPhone,
        summary: `PAID (manual) · ${record.productName} · ${record.journeyDate} · ${formatINR(record.paymentRequested)} of ${formatINR(record.totalAmount)}${payment.paymentId ? ` · ${payment.paymentId}` : ""}`,
      });
    } catch (err) {
      console.error("manual booking paid notify failed:", err);
    }
  }

  return { ...record, ...patch } as ManualBookingRecord;
}
