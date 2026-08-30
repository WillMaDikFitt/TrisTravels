import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatINR(amount: number) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  const hasFraction = !Number.isInteger(n);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: hasFraction ? 2 : 0,
    minimumFractionDigits: hasFraction ? 2 : 0,
  }).format(n);
}

export function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Calendar days from today (local) until YYYY-MM-DD. */
export function daysUntilDate(isoDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${isoDate}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Instant online booking requires 10+ days’ notice; closer dates are request-only. */
export const BOOKING_NOTICE_DAYS = 5;

export function isInstantBookingDate(isoDate: string) {
  return daysUntilDate(isoDate) >= BOOKING_NOTICE_DAYS;
}
