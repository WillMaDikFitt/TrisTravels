"use server";

import { findExperience, getSettings, listClosures } from "@/lib/data/repo";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  allowMemoryBackend,
  memoryBackendWarning,
  readFirestoreCollection,
  readMemoryBookings,
  sanitizeForClient,
} from "@/lib/firebase/admin-read";
import { quoteExperience } from "@/lib/pricing";
import { hasExperienceCosting } from "@/data/experience-costing";
import { memoryStore, uid } from "@/lib/store";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import { daysUntilDate } from "@/lib/utils";
import { dateIsClosed } from "@/lib/catalog";
import { experienceSlotCapacity, experienceSlots } from "@/lib/experience-slots";
import { findTransportVehicle, transportVehicleOptions } from "@/data/transport";
import { experienceTransportMode } from "@/lib/experience-meta";

function expireIfNeeded(row: BookingRecord): BookingRecord {
  if (
    row.status === "hold" &&
    row.expiresAt &&
    new Date(String(row.expiresAt)).getTime() < Date.now()
  ) {
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
  vehicleCount?: number;
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
  const slotCapacity = experienceSlotCapacity(experience);
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
  if (occupied + guests > slotCapacity) {
    const remaining = Math.max(0, slotCapacity - occupied);
    return {
      ok: false as const,
      error:
        remaining > 0
          ? `Only ${remaining} guest${remaining === 1 ? "" : "s"} left in this slot`
          : "This slot is full",
    };
  }

  const transportMode = experienceTransportMode(experience);
  const vehicles = transportVehicleOptions(
    experience.transportPrice,
    experience.transportVehicles,
    settings.fleetVehicles,
  );
  const usingCosting = hasExperienceCosting(experience);
  const wantsTransport = Boolean(input.transportation) && transportMode !== "none";
  const vehicle = wantsTransport && !usingCosting
    ? findTransportVehicle(vehicles, input.transportVehicle) ?? vehicles[0]
    : undefined;
  const vehicleCountInput = Math.max(1, Math.min(10, Math.round(input.vehicleCount ?? 1)));
  if (transportMode === "required" && !wantsTransport) {
    return { ok: false as const, error: "Transport is required for this experience" };
  }
  if (wantsTransport && !usingCosting && !vehicle) {
    return { ok: false as const, error: "Choose a vehicle type" };
  }

  const instant = daysUntilDate(input.date) >= settings.minAdvanceDays;
  const legacyTransportFee =
    wantsTransport && !usingCosting ? (vehicle?.price ?? 0) * vehicleCountInput : 0;
  const quote = quoteExperience(experience, adults, settings, children, {
    trisTransport: wantsTransport,
    transportFee: legacyTransportFee,
    vehicleCount: vehicleCountInput,
  });
  const transportPrice = quote.transportCost;
  const vehicleCount = quote.vehicleCount || (wantsTransport ? vehicleCountInput : 0);
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
    status,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerTotal: quote.customerTotal,
    internal: quote.internal,
    createdAt: now.toISOString(),
  };
  const backendId = experience.backendId?.trim();
  if (backendId) record.backendId = backendId;
  if (children > 0 && input.childAges) record.childAges = input.childAges;
  if (input.uid) record.uid = input.uid;
  if (wantsTransport && (usingCosting || vehicle)) {
    record.transportation = {
      requested: true,
      vehicle: usingCosting ? "tris" : vehicle?.id,
      vehicleLabel: usingCosting ? "TRIS transport" : vehicle?.label,
      vehicleCount: vehicleCount || 1,
      price: transportPrice,
    };
  }
  if (status === "hold") record.expiresAt = expires.toISOString();

  const db = getAdminDb();
  try {
    if (db) {
      await db.collection("bookings").doc(record.id).set(record);
    } else {
      memoryStore().bookings.unshift(record);
    }
  } catch (err) {
    console.error("createBooking write failed:", err);
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Could not save booking",
    };
  }

  try {
    const { notifyStaffNewLead, notifyGuestExperienceBooking } = await import("@/lib/email");
    const { formatINR } = await import("@/lib/utils");
    const guestEmail = record.customerEmail?.trim() || "";
    const canEmailGuest =
      guestEmail.includes("@") && !guestEmail.endsWith("@trismeghalaya.com");

    await notifyStaffNewLead({
      kind: "booking",
      id: record.id,
      name: record.customerName,
      email: record.customerEmail,
      phone: record.customerPhone,
      summary: `${record.experienceName}${record.backendId ? ` [${record.backendId}]` : ""} · ${record.date} · ${record.slot} · ${record.guests} guests · ₹${record.customerTotal}`,
    });
    if (canEmailGuest) {
      await notifyGuestExperienceBooking({
        to: guestEmail,
        name: record.customerName,
        experienceName: record.experienceName,
        refId: record.id,
        date: record.date,
        slot: record.slot,
        guests: record.guests,
        total: formatINR(record.customerTotal),
        status: record.status,
        backendId: record.backendId,
        paid: false,
      });
    }
  } catch (err) {
    console.error("booking notify failed:", err);
  }

  return { ok: true as const, booking: record };
}

export async function confirmPayment(
  bookingId: string,
  opts?: { paymentId?: string; orderId?: string },
) {
  const paymentRef = opts?.paymentId?.trim() || undefined;
  const db = getAdminDb();
  let booking: BookingRecord | undefined;

  if (db) {
    const patch: Record<string, unknown> = {
      status: "confirmed" as BookingStatus,
      expiresAt: null,
    };
    if (paymentRef) patch.paymentRef = paymentRef;
    if (opts?.orderId?.trim()) patch.razorpayOrderId = opts.orderId.trim();
    await db.collection("bookings").doc(bookingId).update(patch);
    const doc = await db.collection("bookings").doc(bookingId).get();
    booking = doc.data() as BookingRecord | undefined;
  } else {
    const row = memoryStore().bookings.find((b) => b.id === bookingId);
    if (row) {
      row.status = "confirmed";
      row.expiresAt = undefined;
      if (paymentRef) row.paymentRef = paymentRef;
      if (opts?.orderId?.trim()) row.razorpayOrderId = opts.orderId.trim();
      booking = row;
    }
  }

  if (!booking) return { ok: false as const, error: "Booking not found" };

  try {
    const { notifyGuestExperienceBooking, notifyStaffNewLead } = await import("@/lib/email");
    const { formatINR } = await import("@/lib/utils");
    const guestEmail = booking.customerEmail?.trim() || "";
    const canEmailGuest =
      guestEmail.includes("@") && !guestEmail.endsWith("@trismeghalaya.com");

    if (canEmailGuest) {
      await notifyGuestExperienceBooking({
        to: guestEmail,
        name: booking.customerName,
        experienceName: booking.experienceName,
        refId: booking.id,
        date: booking.date,
        slot: booking.slot,
        guests: booking.guests,
        total: formatINR(booking.customerTotal),
        status: "confirmed",
        backendId: booking.backendId,
        paid: true,
      });
    }
    await notifyStaffNewLead({
      kind: "booking",
      id: booking.id,
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
      summary: `PAID · ${booking.experienceName} · ${booking.date} · ${formatINR(booking.customerTotal)}${paymentRef ? ` · ${paymentRef}` : ""}`,
    });
  } catch (err) {
    console.error("confirmPayment notify failed:", err);
  }

  return { ok: true as const, booking };
}

export async function listBookings(): Promise<BookingRecord[]> {
  try {
    const rows = await readFirestoreCollection<BookingRecord>("bookings");
    if (rows) {
      return rows
        .map(expireIfNeeded)
        .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    }
    if (!allowMemoryBackend()) {
      console.error("listBookings:", memoryBackendWarning());
      return [];
    }
    return readMemoryBookings((store) => store.bookings.map(expireIfNeeded));
  } catch (err) {
    console.error("listBookings failed:", err);
    return [];
  }
}

export async function listBookingsForEmail(email: string): Promise<BookingRecord[]> {
  const target = email.trim().toLowerCase();
  if (!target) return [];
  try {
    const db = getAdminDb();
    if (db) {
      const exact = await db.collection("bookings").where("customerEmail", "==", email.trim()).limit(20).get();
      const fromExact = exact.docs
        .map((doc) => {
          const raw = sanitizeForClient({ id: doc.id, ...doc.data() }) as BookingRecord;
          return expireIfNeeded(raw);
        })
        .filter((b) => b.customerEmail?.toLowerCase() === target);
      if (fromExact.length) {
        return fromExact
          .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
          .slice(0, 8);
      }
    }
    const all = await listBookings();
    return all
      .filter((b) => b.customerEmail.toLowerCase() === target)
      .slice(0, 8);
  } catch (err) {
    console.error("listBookingsForEmail failed:", err);
    return [];
  }
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
