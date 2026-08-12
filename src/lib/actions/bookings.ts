"use server";

import { findExperience, getSettings, listClosures } from "@/lib/data/repo";
import { getAdminDb } from "@/lib/firebase/admin";
import { quoteExperience } from "@/lib/pricing";
import { memoryStore, uid } from "@/lib/store";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import { daysUntilDate } from "@/lib/utils";
import { DEFAULT_SLOTS, dateIsClosed } from "@/lib/catalog";

function expireIfNeeded(row: BookingRecord): BookingRecord {
  if (row.status === "hold" && row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) {
    return { ...row, status: "expired" };
  }
  return row;
}

export async function createBooking(input: {
  experienceSlug: string;
  date: string;
  slot: string;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  uid?: string;
  request?: boolean;
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false as const, error: "Choose a valid date first" };
  }
  if (!input.customerName.trim() || !input.customerEmail.includes("@")) {
    return { ok: false as const, error: "Name and email are required" };
  }

  const experience = await findExperience(input.experienceSlug);
  if (!experience) return { ok: false as const, error: "Experience not found" };

  const settings = await getSettings();
  const closures = await listClosures(input.experienceSlug);
  if (dateIsClosed(input.date, closures)) {
    return { ok: false as const, error: "This date is closed or sold out" };
  }

  const existing = await listBookings();
  const occupied = existing
    .map(expireIfNeeded)
    .filter(
      (b) =>
        b.experienceSlug === input.experienceSlug &&
        b.date === input.date &&
        b.slot === (input.slot || DEFAULT_SLOTS[0]) &&
        (b.status === "hold" || b.status === "requested" || b.status === "confirmed"),
    )
    .reduce((sum, b) => sum + b.guests, 0);
  if (occupied + input.guests > experience.maxGuests) {
    return { ok: false as const, error: "This slot is full" };
  }

  const instant = daysUntilDate(input.date) >= settings.minAdvanceDays;
  const quote = quoteExperience(experience, input.guests, settings);
  const now = new Date();
  const expires = new Date(now.getTime() + settings.holdMinutes * 60_000);

  const status: BookingStatus = input.request || !instant ? "requested" : "hold";

  const record: BookingRecord = {
    id: uid("bkg"),
    experienceSlug: experience.slug,
    experienceName: experience.name,
    date: input.date,
    slot: input.slot || DEFAULT_SLOTS[0],
    guests: input.guests,
    adults: input.guests,
    children: 0,
    status,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    uid: input.uid,
    customerTotal: quote.customerTotal,
    internal: quote.internal,
    createdAt: now.toISOString(),
    expiresAt: status === "hold" ? expires.toISOString() : undefined,
  };

  const db = getAdminDb();
  if (db) {
    await db.collection("bookings").doc(record.id).set(record);
  } else {
    memoryStore().bookings.unshift(record);
  }

  return { ok: true as const, booking: record };
}

export async function confirmPayment(bookingId: string) {
  const db = getAdminDb();
  if (db) {
    await db.collection("bookings").doc(bookingId).update({ status: "confirmed" });
    const doc = await db.collection("bookings").doc(bookingId).get();
    return { ok: true, booking: doc.data() as BookingRecord };
  }
  const row = memoryStore().bookings.find((b) => b.id === bookingId);
  if (row) row.status = "confirmed";
  return { ok: true, booking: row };
}

export async function listBookings(): Promise<BookingRecord[]> {
  const db = getAdminDb();
  if (db) {
    const snap = await db.collection("bookings").limit(200).get();
    return snap.docs
      .map((d) => expireIfNeeded(d.data() as BookingRecord))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return memoryStore().bookings.map(expireIfNeeded);
}

export async function listBookingsForEmail(email: string): Promise<BookingRecord[]> {
  const all = await listBookings();
  return all.filter((b) => b.customerEmail.toLowerCase() === email.toLowerCase());
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const db = getAdminDb();
  if (db) {
    await db.collection("bookings").doc(id).update({ status });
    return { ok: true as const };
  }
  const row = memoryStore().bookings.find((b) => b.id === id);
  if (row) row.status = status;
  return { ok: true as const };
}

export async function addBookingNote(id: string, text: string, by?: string) {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false as const, error: "Write a note first" };
  const note = { at: new Date().toISOString(), by, text: trimmed };
  const db = getAdminDb();
  if (db) {
    const ref = db.collection("bookings").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { ok: false as const, error: "Booking not found" };
    const data = doc.data() as BookingRecord;
    const notes = [...(data.notes ?? []), note];
    await ref.update({ notes });
    return { ok: true as const, notes };
  }
  const row = memoryStore().bookings.find((b) => b.id === id);
  if (!row) return { ok: false as const, error: "Booking not found" };
  row.notes = [...(row.notes ?? []), note];
  return { ok: true as const, notes: row.notes };
}

export async function setBookingPaymentRef(id: string, paymentRef: string) {
  const db = getAdminDb();
  if (db) {
    await db.collection("bookings").doc(id).update({ paymentRef: paymentRef.trim() || null });
    return { ok: true as const };
  }
  const row = memoryStore().bookings.find((b) => b.id === id);
  if (row) row.paymentRef = paymentRef.trim() || undefined;
  return { ok: true as const };
}

export async function confirmBooking(id: string, opts?: { paymentRef?: string; by?: string }) {
  const db = getAdminDb();
  const patch: Record<string, unknown> = { status: "confirmed" as BookingStatus };
  if (opts?.paymentRef?.trim()) patch.paymentRef = opts.paymentRef.trim();

  if (db) {
    const ref = db.collection("bookings").doc(id);
    const doc = await ref.get();
    if (!doc.exists) return { ok: false as const, error: "Booking not found" };
    const data = doc.data() as BookingRecord;
    const notes = [...(data.notes ?? [])];
    if (opts?.by || opts?.paymentRef) {
      notes.push({
        at: new Date().toISOString(),
        by: opts?.by,
        text: opts?.paymentRef?.trim()
          ? `Confirmed · payment ref ${opts.paymentRef.trim()}`
          : "Confirmed",
      });
      patch.notes = notes;
    }
    await ref.update(patch);
    return { ok: true as const };
  }
  const row = memoryStore().bookings.find((b) => b.id === id);
  if (!row) return { ok: false as const, error: "Booking not found" };
  row.status = "confirmed";
  if (opts?.paymentRef?.trim()) row.paymentRef = opts.paymentRef.trim();
  row.notes = [
    ...(row.notes ?? []),
    {
      at: new Date().toISOString(),
      by: opts?.by,
      text: opts?.paymentRef?.trim()
        ? `Confirmed · payment ref ${opts.paymentRef.trim()}`
        : "Confirmed",
    },
  ];
  return { ok: true as const };
}
