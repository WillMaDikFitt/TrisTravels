"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { memoryStore, uid } from "@/lib/store";
import type { EnquiryRecord, EnquirySource } from "@/lib/types";

export async function submitEnquiry(input: {
  source: EnquirySource;
  name: string;
  email: string;
  phone?: string;
  message: string;
  payload?: Record<string, string | number | string[]>;
  uid?: string;
}) {
  try {
    if (!input.name.trim() || !input.message.trim()) {
      return { ok: false as const, error: "Name and message are required" };
    }
    if (!input.email.includes("@") && !input.phone?.trim()) {
      return { ok: false as const, error: "Add an email or phone so we can reply" };
    }

    const record: EnquiryRecord = {
      id: uid("enq"),
      source: input.source,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone,
      message: input.message.trim(),
      payload: input.payload,
      status: "new",
      createdAt: new Date().toISOString(),
      uid: input.uid,
    };

    const db = getAdminDb();
    if (db) {
      await db.collection("enquiries").doc(record.id).set(record);
    } else {
      memoryStore().enquiries.unshift(record);
    }
    return { ok: true as const, id: record.id };
  } catch {
    return { ok: false as const, error: "Could not send just now. Try again." };
  }
}

export async function listEnquiries(): Promise<EnquiryRecord[]> {
  const db = getAdminDb();
  if (db) {
    const snap = await db.collection("enquiries").limit(200).get();
    return snap.docs
      .map((d) => d.data() as EnquiryRecord)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return memoryStore().enquiries;
}

export async function listEnquiriesForUser(email: string): Promise<EnquiryRecord[]> {
  const all = await listEnquiries();
  return all.filter((e) => e.email.toLowerCase() === email.toLowerCase());
}

export async function updateEnquiryStatus(id: string, status: EnquiryRecord["status"]) {
  const db = getAdminDb();
  if (db) {
    await db.collection("enquiries").doc(id).update({ status });
    return { ok: true as const };
  }
  const row = memoryStore().enquiries.find((e) => e.id === id);
  if (row) row.status = status;
  return { ok: true as const };
}

export async function addEnquiryNote(id: string, text: string, by?: string) {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false as const, error: "Write a note first" };
  const note = { at: new Date().toISOString(), by, text: trimmed };
  const db = getAdminDb();
  if (db) {
    const ref = db.collection("enquiries").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { ok: false as const, error: "Enquiry not found" };
    const data = doc.data() as EnquiryRecord;
    const notes = [...(data.notes ?? []), note];
    await ref.update({ notes });
    return { ok: true as const, notes };
  }
  const row = memoryStore().enquiries.find((e) => e.id === id);
  if (!row) return { ok: false as const, error: "Enquiry not found" };
  row.notes = [...(row.notes ?? []), note];
  return { ok: true as const, notes: row.notes };
}
