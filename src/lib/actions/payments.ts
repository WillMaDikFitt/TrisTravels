"use server";

import { getAdminDb } from "@/lib/firebase/admin";
import { applyDiscountPercent, resolveDiscountCode } from "@/lib/discounts";
import {
  notifyGuestAdvancePaid,
  notifyGuestBalanceDue,
  notifyGuestFullyPaid,
  notifyStaffNewLead,
} from "@/lib/email";
import { formatINR } from "@/lib/utils";
import type { EnquiryRecord } from "@/lib/types";
import { memoryStore } from "@/lib/store";
import { getJourney } from "@/data/journeys";

export async function checkDiscountCode(code: string) {
  const match = await resolveDiscountCode(code);
  if (!match) return { ok: false as const, error: "Invalid or inactive code" };
  return {
    ok: true as const,
    code: match.code,
    percent: match.percent,
    note: match.note ?? "",
  };
}

export async function previewDiscountedTotal(total: number, code: string) {
  const match = await resolveDiscountCode(code);
  if (!match) return { ok: false as const, error: "Invalid or inactive code" };
  const { discounted, saved } = applyDiscountPercent(total, match.percent);
  return {
    ok: true as const,
    percent: match.percent,
    code: match.code,
    total: discounted,
    saved,
    advanceAmount: Math.round(discounted * 0.5),
    balanceAmount: discounted - Math.round(discounted * 0.5),
  };
}

function balanceDueIso(preferredFrom: string, daysBefore = 20) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredFrom)) return "";
  const d = new Date(`${preferredFrom}T12:00:00`);
  d.setDate(d.getDate() - daysBefore);
  return d.toISOString().slice(0, 10);
}

export async function recordAdvancePaidAndNotify(input: {
  enquiryId: string;
  paymentId?: string;
  orderId?: string;
}) {
  const db = getAdminDb();
  let record: EnquiryRecord | undefined;
  if (db) {
    const doc = await db.collection("enquiries").doc(input.enquiryId).get();
    if (doc.exists) record = doc.data() as EnquiryRecord;
  } else {
    record = memoryStore().enquiries.find((e) => e.id === input.enquiryId);
  }
  if (!record) return { ok: false as const, error: "Enquiry not found" };

  const payload = { ...(record.payload ?? {}) } as Record<string, string | number | string[]>;
  const preferredFrom = String(payload.preferredFrom || "");
  const balanceDueDate = balanceDueIso(preferredFrom);
  payload.paymentStatus = "advance-paid";
  if (input.paymentId) payload.razorpayPaymentId = input.paymentId;
  if (input.orderId) payload.razorpayOrderId = input.orderId;
  if (balanceDueDate) payload.balanceDueDate = balanceDueDate;
  payload.balanceReminderSent = "0";

  const next: EnquiryRecord = {
    ...record,
    status: "in-progress",
    payload,
  };

  if (db) {
    await db.collection("enquiries").doc(record.id).set(next);
  } else if (record) {
    Object.assign(record, next);
  }

  const journeyName = String(payload.journeyName || "TRIS journey");
  const journey = getJourney(String(payload.journeySlug || ""));
  const itineraryHtml = journey?.itinerary?.length
    ? `<h3 style="margin:16px 0 8px">Journey plan</h3><ol>${journey.itinerary
        .map(
          (day) =>
            `<li style="margin:0 0 8px"><strong>Day ${day.day}: ${day.title}</strong><br/>${day.summary}</li>`,
        )
        .join("")}</ol>`
    : undefined;

  const advance = Number(payload.advanceAmount) || 0;
  const balance = Number(payload.balanceAmount) || 0;
  const total = Number(payload.estimatedTotal) || advance + balance;

  if (record.email?.includes("@")) {
    await notifyGuestAdvancePaid({
      to: record.email,
      name: record.name,
      journeyName,
      refId: record.id,
      advanceAmount: formatINR(advance),
      balanceAmount: formatINR(balance),
      totalAmount: formatINR(total),
      preferredFrom: preferredFrom || undefined,
      preferredTo: String(payload.preferredTo || "") || undefined,
      balanceDueDate: balanceDueDate || undefined,
      itineraryHtml,
    });
  }

  await notifyStaffNewLead({
    kind: "enquiry",
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    summary: `ADVANCE PAID · ${journeyName} · ${formatINR(advance)} of ${formatINR(total)}`,
  });

  return { ok: true as const };
}

export async function markEnquiryFullyPaid(enquiryId: string) {
  const db = getAdminDb();
  let record: EnquiryRecord | undefined;
  if (db) {
    const doc = await db.collection("enquiries").doc(enquiryId).get();
    if (doc.exists) record = doc.data() as EnquiryRecord;
  } else {
    record = memoryStore().enquiries.find((e) => e.id === enquiryId);
  }
  if (!record) return { ok: false as const, error: "Not found" };

  const payload = { ...(record.payload ?? {}) } as Record<string, string | number | string[]>;
  payload.paymentStatus = "fully-paid";
  const next: EnquiryRecord = { ...record, status: "closed", payload };

  if (db) {
    await db.collection("enquiries").doc(enquiryId).set(next);
  } else {
    Object.assign(record, next);
  }

  if (record.email?.includes("@")) {
    await notifyGuestFullyPaid({
      to: record.email,
      name: record.name,
      journeyName: String(payload.journeyName || "TRIS journey"),
      refId: record.id,
    });
  }

  return { ok: true as const };
}

/** Called by cron — send balance reminders for advance-paid bookings. */
export async function runBalanceReminders() {
  const db = getAdminDb();
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);

  let rows: EnquiryRecord[] = [];
  if (db) {
    const snap = await db.collection("enquiries").get();
    rows = snap.docs.map((d) => d.data() as EnquiryRecord);
  } else {
    rows = memoryStore().enquiries;
  }

  let sent = 0;
  for (const row of rows) {
    const payload = row.payload ?? {};
    if (payload.paymentStatus !== "advance-paid") continue;
    if (payload.balanceReminderSent === "1") continue;
    const due = String(payload.balanceDueDate || "");
    if (!due || due > todayIso) continue;
    if (!row.email?.includes("@")) continue;

    await notifyGuestBalanceDue({
      to: row.email,
      name: row.name,
      journeyName: String(payload.journeyName || "TRIS journey"),
      refId: row.id,
      balanceAmount: formatINR(Number(payload.balanceAmount) || 0),
      balanceDueDate: due,
      paymentLink: String(payload.paymentLink || "") || undefined,
    });

    const nextPayload = { ...payload, balanceReminderSent: "1" };
    if (db) {
      await db.collection("enquiries").doc(row.id).update({ payload: nextPayload });
    } else {
      row.payload = nextPayload;
    }
    sent += 1;
  }

  return { ok: true as const, sent };
}
