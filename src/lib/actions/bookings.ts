"use server";

import { findExperience, getSettings, listClosures } from "@/lib/data/repo";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  allowMemoryBackend,
  memoryBackendWarning,
  readFirestoreCollection,
  readMemoryBookings,
} from "@/lib/firebase/admin-read";
import { quoteExperience } from "@/lib/pricing";
import { memoryStore, uid } from "@/lib/store";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import { daysUntilDate } from "@/lib/utils";
import { dateIsClosed } from "@/lib/catalog";
import { experienceSlots } from "@/lib/experience-slots";
import { findTransportVehicle, transportVehicleOptions } from "@/data/transport";

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
  adults: number;
  children?: number;
  childAges?: number[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  uid?: string;
  request?: boolean;
  transportation?: boolean;
  transportVehicle?: string;
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false as const, error: "Choose a valid date first" };
  }
  if (!input.customerName.trim() || !input.customerEmail.includes("@")) {
    return { ok: false as const, error: "Name and email are required" };
  }

  const adults = Math.max(1, Math.floor(input.adults));
  const children = Math.max(0, Math.floor(input.children ?? 0));
  const guests = adults + children;
  if (children > 0) {
    const ages = input.childAges ?? [];
    if (ages.length !== children || ages.some((age) => !Number.isFinite(age) || age < 0 || age > 17)) {
      return { ok: false as const, error: "Add an age (0–17) for each child" };
    }
  }

  const experience = await findExperience(input.experienceSlug);
  if (!experience) return { ok: false as const, error: "Experience not found" };
  const slots = experienceSlots(experience);
  const selectedSlot = input.slot || slots[0];
  if (!slots.includes(selectedSlot)) {
    return { ok: false as const, error: "Choose a valid time slot" };
  }

  const minGuests = experience.minGuests ?? 1;
  if (guests < minGuests || guests > experience.maxGuests) {
    return { ok: false as const, error: `Group size must be between ${minGuests} and ${experience.maxGuests}` };
  }

  const settings = await getSettings();
  const closures = await listClosures(input.experienceSlug);
  if (dateIsClosed(input.date, closures, selectedSlot)) {
    return { ok: false as const, error: "This time slot is closed or sold out" };
  }

  const existing = await listBookings();
  const occupied = existing
    .map(expireIfNeeded)
    .filter(
      (b) =>
        b.experienceSlug === input.experienceSlug &&
        b.date === input.date &&
        b.slot === selectedSlot &&
        (b.status === "hold" || b.status === "requested" || b.status === "confirmed"),
    )
    .reduce((sum, b) => sum + b.guests, 0);
  if (occupied + guests > experience.maxGuests) {
    return { ok: false as const, error: "This slot is full" };
  }

  const vehicles = transportVehicleOptions(experience.transportPrice, experience.transportVehicles);
  const vehicle = input.transportation
    ? findTransportVehicle(vehicles, input.transportVehicle) ?? vehicles[0]
    : undefined;
  if (input.transportation && experience.transportAvailable && !vehicle) {
    return { ok: false as const, error: "Choose a vehicle type" };
  }

  const instant = daysUntilDate(input.date) >= settings.minAdvanceDays;
  const quote = quoteExperience(experience, adults, settings, children);
  const transportPrice =
    input.transportation && experience.transportAvailable ? vehicle?.price ?? 0 : 0;
  const now = new Date();
  const expires = new Date(now.getTime() + settings.holdMinutes * 60_000);

  const status: BookingStatus = input.request || !instant ? "requested" : "hold";

  const record: BookingRecord = {
    id: uid("bkg"),
    experienceSlug: experience.slug,
    experienceName: experience.name,
    date: input.date,
    slot: selectedSlot,
    guests,
    adults,
    children,
    childAges: children > 0 ? input.childAges : undefined,
    status,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    uid: input.uid,
    customerTotal: quote.customerTotal + transportPrice,
    transportation:
      input.transportation && vehicle
        ? {
            requested: true,
            vehicle: vehicle.id,
            vehicleLabel: vehicle.label,
            price: transportPrice,
          }
        : undefined,
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
  const rows = await readFirestoreCollection<BookingRecord>("bookings");
  if (rows) {
    return rows.map(expireIfNeeded).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  if (!allowMemoryBackend()) {
    console.error("listBookings:", memoryBackendWarning());
    return [];
  }
  return readMemoryBookings((store) => store.bookings.map(expireIfNeeded));
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
