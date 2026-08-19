import type { Experience } from "@/data/experiences";
import type { Journey } from "@/data/journeys";
import type { Destination } from "@/data/destinations";
import type { Story } from "@/data/stories";

export type UserRole = "traveller" | "admin" | "staff";

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  wishlist: string[];
  createdAt: string;
};

export type StaffNote = {
  at: string;
  by?: string;
  text: string;
};

export type BookingStatus = "hold" | "requested" | "confirmed" | "expired" | "cancelled";

export type BookingRecord = {
  id: string;
  experienceSlug: string;
  experienceName: string;
  date: string;
  slot: string;
  guests: number;
  adults: number;
  children: number;
  childAges?: number[];
  transportation?: {
    requested: boolean;
    vehicle?: string;
    vehicleLabel?: string;
    price: number;
  };
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  uid?: string;
  customerTotal: number;
  internal?: {
    base: number;
    staffCost: number;
    serviceFee: number;
    gst: number;
  };
  notes?: StaffNote[];
  paymentRef?: string;
  createdAt: string;
  expiresAt?: string;
};

export type EnquirySource = "craft-my-journey" | "journey" | "contact" | "partner" | "story";

export type EnquiryRecord = {
  id: string;
  source: EnquirySource;
  name: string;
  email: string;
  phone?: string;
  message: string;
  payload?: Record<string, string | number | string[]>;
  status: "new" | "in-progress" | "closed";
  notes?: StaffNote[];
  createdAt: string;
  uid?: string;
};

export type ClosureRecord = {
  id: string;
  experienceSlug: string;
  dates?: string[];
  weekdays?: number[];
  /** Empty or omitted blocks the full day; otherwise only these experience slots are blocked. */
  slots?: string[];
  reason: string;
  soldOut?: boolean;
};

export type PlatformSettings = {
  minAdvanceDays: number;
  holdMinutes: number;
  serviceFeePercent: number;
  gstPercent: number;
};

export type JourneyDepartureSeat = {
  date: string;
  seats: number;
  held: number;
  booked: number;
  note?: string;
};

export type { Experience, Journey, Destination, Story };
