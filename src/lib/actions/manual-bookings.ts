"use server";

import { randomBytes } from "crypto";
import { requireStaff } from "@/lib/admin-auth";
import { listAllExperiencesAdmin, listAllJourneysAdmin } from "@/lib/data/repo";
import {
  MANUAL_PAYMENT_TYPES,
  MANUAL_PRODUCT_TYPES,
  manualAmounts,
  type ManualBookingInput,
  type ManualProductCatalogue,
} from "@/lib/manual-bookings";
import {
  getManualBookingById,
  getManualBookingByToken,
  listManualBookingRecords,
  markManualBookingPaid,
  saveManualBooking,
  updateManualBooking,
} from "@/lib/manual-bookings-store";
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  razorpayConfigured,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";
import { uid } from "@/lib/store";
import type { ManualBookingRecord } from "@/lib/types";

const fail = (error: string) => ({ ok: false as const, error });
const text = (value: unknown, max = 200) => String(value ?? "").trim().slice(0, max);
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

async function productCatalogue(): Promise<ManualProductCatalogue> {
  const [experiences, journeys] = await Promise.all([listAllExperiencesAdmin(), listAllJourneysAdmin()]);
  const option = (item: { slug: string; name: string; tagline: string }) => ({
    slug: item.slug,
    name: item.name,
    subheading: item.tagline,
  });
  return {
    experience: experiences.map(option),
    curated: journeys.filter((j) => j.type === "curated").map(option),
    fixed: journeys.filter((j) => j.type === "small-group").map(option),
  };
}

/* ---------- Studio (staff only) ---------- */

export async function listManualBookingProducts(idToken: string) {
  const gate = await requireStaff(idToken);
  if (!gate.ok) return gate;
  return { ok: true as const, products: await productCatalogue() };
}

export async function listManualBookings(idToken: string) {
  const gate = await requireStaff(idToken);
  if (!gate.ok) return gate;
  try {
    return { ok: true as const, bookings: await listManualBookingRecords() };
  } catch (err) {
    console.error("listManualBookings failed:", err);
    return fail(err instanceof Error ? err.message : "Could not load manual bookings");
  }
}

export async function getManualBookingAdmin(idToken: string, id: string) {
  const gate = await requireStaff(idToken);
  if (!gate.ok) return gate;
  const booking = await getManualBookingById(id);
  if (!booking) return fail("Manual booking not found");
  return { ok: true as const, booking };
}

export async function createManualBooking(idToken: string, input: ManualBookingInput) {
  const gate = await requireStaff(idToken);
  if (!gate.ok) return gate;

  const productType = MANUAL_PRODUCT_TYPES.find((p) => p.id === input.productType)?.id;
  if (!productType) return fail("Choose a product");

  let productName = text(input.productName);
  let productSubheading = text(input.productSubheading, 300);
  let productSlug: string | undefined;
  if (productType !== "craft") {
    // Resolve the listing on the server so the name always matches the catalogue.
    const match = (await productCatalogue())[productType].find((o) => o.slug === input.productSlug);
    if (!match) return fail("Choose which listing this booking is for");
    productName = match.name;
    productSlug = match.slug;
    productSubheading = productSubheading || match.subheading;
  }
  if (!productName) return fail("Add the trip name");

  const travellerName = text(input.travellerName);
  const travellerEmail = text(input.travellerEmail).toLowerCase();
  const travellerPhone = text(input.travellerPhone, 30);
  if (!travellerName) return fail("Add the traveller’s name");
  if (!travellerPhone) return fail("Add the traveller’s phone or WhatsApp number");
  if (travellerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(travellerEmail)) {
    return fail("Check the traveller’s email");
  }

  const journeyDate = text(input.journeyDate, 10);
  if (!isIsoDate(journeyDate)) return fail("Choose the journey date");
  const adults = Math.floor(Number(input.adults));
  if (!(adults >= 1 && adults <= 100)) return fail("Add at least 1 adult");
  const children = Math.floor(Number(input.children) || 0);
  if (children < 0 || children > 100) return fail("Check the number of children");

  const totalAmount = Math.round(Number(input.totalAmount));
  if (!(totalAmount >= 1)) return fail("Add the total booking amount");
  const paymentType = MANUAL_PAYMENT_TYPES.find((p) => p.id === input.paymentType)?.id;
  if (!paymentType) return fail("Choose a payment type");
  if (paymentType !== "full" && Number(input.paymentRequested) > totalAmount) {
    return fail("The payment requested can’t be more than the total");
  }
  const amounts = manualAmounts(totalAmount, paymentType, Number(input.paymentRequested));
  if (amounts.paymentRequested < 1) return fail("Add the amount to collect through this link");

  const paymentDueDate = text(input.paymentDueDate, 10);
  if (paymentDueDate && !isIsoDate(paymentDueDate)) return fail("Check the payment due date");
  const remarks = text(input.remarks, 1000);

  const record: ManualBookingRecord = {
    id: uid("mbk"),
    token: randomBytes(16).toString("hex"),
    productType,
    productName,
    productSubheading,
    travellerName,
    travellerEmail,
    travellerPhone,
    journeyDate,
    adults,
    children,
    totalAmount,
    paymentType,
    ...amounts,
    status: "pending",
    createdAt: new Date().toISOString(),
    createdBy: gate.staff.name || gate.staff.email || undefined,
  };
  if (productSlug) record.productSlug = productSlug;
  if (paymentDueDate) record.paymentDueDate = paymentDueDate;
  if (remarks) record.remarks = remarks;

  try {
    await saveManualBooking(record);
  } catch (err) {
    console.error("createManualBooking failed:", err);
    return fail(err instanceof Error ? err.message : "Could not save the booking");
  }
  return { ok: true as const, booking: record };
}

export async function cancelManualBooking(idToken: string, id: string) {
  const gate = await requireStaff(idToken);
  if (!gate.ok) return gate;
  const booking = await getManualBookingById(id);
  if (!booking) return fail("Manual booking not found");
  if (booking.status !== "pending") return fail("Only unpaid links can be cancelled");
  await updateManualBooking(id, { status: "cancelled" });
  return { ok: true as const };
}

/* ---------- Client payment page (secured by the link code) ---------- */

export async function startManualBookingPayment(token: string) {
  const booking = await getManualBookingByToken(String(token ?? ""));
  if (!booking) return fail("This payment link isn’t valid.");
  if (booking.status === "paid") return fail("This booking is already paid.");
  if (booking.status === "cancelled") return fail("This payment link is no longer active. Please contact TRIS.");
  if (!razorpayConfigured()) return fail("Online payment isn’t available right now. Please contact TRIS.");

  try {
    let orderId = booking.razorpayOrderId;
    // One order per link, so the checkout callback and the webhook match the same payment.
    // The amount comes from the saved booking, never from the browser.
    if (!orderId) {
      const order = await createRazorpayOrder({
        amountInr: booking.paymentRequested,
        receipt: booking.id,
        notes: { manualBookingId: booking.id },
      });
      orderId = order.orderId;
      await updateManualBooking(booking.id, { razorpayOrderId: orderId });
    }
    return {
      ok: true as const,
      orderId,
      amount: booking.paymentRequested * 100,
      currency: "INR",
      keyId: getRazorpayKeyId(),
      description: booking.productName,
      prefill: {
        name: booking.travellerName,
        email: booking.travellerEmail || undefined,
        contact: booking.travellerPhone,
      },
    };
  } catch (err) {
    console.error("startManualBookingPayment failed:", err);
    return fail("Could not start the payment. Please try again.");
  }
}

export async function verifyManualBookingPayment(
  token: string,
  response: { orderId: string; paymentId: string; signature: string },
) {
  const booking = await getManualBookingByToken(String(token ?? ""));
  if (!booking) return fail("This payment link isn’t valid.");
  if (booking.status === "paid") return { ok: true as const };

  const orderId = text(response?.orderId, 100);
  const paymentId = text(response?.paymentId, 100);
  const signature = text(response?.signature, 200);
  if (!orderId || orderId !== booking.razorpayOrderId) {
    return fail("This payment doesn’t match the booking. Please contact TRIS.");
  }
  if (!verifyRazorpayPaymentSignature({ orderId, paymentId, signature })) {
    return fail("We couldn’t verify the payment. If money left your account, contact TRIS with your payment ID.");
  }
  await markManualBookingPaid(booking, { orderId, paymentId });
  return { ok: true as const };
}
