import type {
  ManualBookingStatus,
  ManualPaymentType,
  ManualProductType,
} from "@/lib/types";

export const MANUAL_PRODUCT_TYPES: { id: ManualProductType; label: string }[] = [
  { id: "experience", label: "Experiences" },
  { id: "curated", label: "Curated Journeys" },
  { id: "fixed", label: "Fixed Journeys" },
  { id: "craft", label: "Craft My Journey" },
];

export const MANUAL_PAYMENT_TYPES: { id: ManualPaymentType; label: string; hint: string }[] = [
  { id: "advance", label: "Advance", hint: "Part now, the rest later" },
  { id: "full", label: "Full payment", hint: "The whole amount" },
  { id: "balance", label: "Balance", hint: "What’s left after an earlier advance" },
  { id: "custom", label: "Custom", hint: "Any amount you set" },
];

export type ManualProductOption = { slug: string; name: string; subheading: string };

/** Listings staff can pick from; Craft My Journey has none, so its name is typed in. */
export type ManualProductCatalogue = Record<Exclude<ManualProductType, "craft">, ManualProductOption[]>;

export type ManualBookingInput = {
  productType: ManualProductType;
  productSlug?: string;
  productName: string;
  productSubheading: string;
  travellerName: string;
  travellerEmail: string;
  travellerPhone: string;
  journeyDate: string;
  adults: number;
  children: number;
  totalAmount: number;
  paymentType: ManualPaymentType;
  paymentRequested: number;
  paymentDueDate?: string;
  remarks?: string;
};

export function manualProductLabel(type: ManualProductType) {
  return MANUAL_PRODUCT_TYPES.find((p) => p.id === type)?.label ?? "TRIS";
}

export function manualPaymentLabel(type: ManualPaymentType) {
  return MANUAL_PAYMENT_TYPES.find((p) => p.id === type)?.label ?? "Payment";
}

export const manualStatusLabel: Record<ManualBookingStatus, string> = {
  pending: "Awaiting payment",
  paid: "Paid",
  cancelled: "Cancelled",
};

export function manualStatusTone(status: ManualBookingStatus): "amber" | "green" | "red" {
  if (status === "paid") return "green";
  if (status === "cancelled") return "red";
  return "amber";
}

/**
 * Split the total for one payment link.
 * A balance link settles the booking, so whatever it doesn't collect was paid earlier.
 */
export function manualAmounts(totalAmount: number, paymentType: ManualPaymentType, requested: number) {
  const total = Math.max(0, Math.round(totalAmount || 0));
  if (paymentType === "full") return { paymentRequested: total, alreadyPaid: 0, balanceAmount: 0 };
  const paymentRequested = Math.min(total, Math.max(0, Math.round(requested || 0)));
  if (paymentType === "balance") {
    return { paymentRequested, alreadyPaid: total - paymentRequested, balanceAmount: 0 };
  }
  return { paymentRequested, alreadyPaid: 0, balanceAmount: total - paymentRequested };
}

/** "2026-09-12" → "12 September 2026" */
export function formatManualDate(isoDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
