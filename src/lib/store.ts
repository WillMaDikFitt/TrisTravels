import type { BookingRecord, ClosureRecord, EnquiryRecord } from "@/lib/types";

type MemoryStore = {
  bookings: BookingRecord[];
  enquiries: EnquiryRecord[];
  closures: ClosureRecord[];
  wishlists: Record<string, string[]>;
};

const g = globalThis as typeof globalThis & { __trisStore?: MemoryStore };

if (!g.__trisStore) {
  g.__trisStore = { bookings: [], enquiries: [], closures: [], wishlists: {} };
}

export function memoryStore() {
  return g.__trisStore!;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
