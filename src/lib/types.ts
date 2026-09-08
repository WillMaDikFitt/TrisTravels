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
  /** Ops / backend catalogue ID copied from the experience at booking time. */
  backendId?: string;
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
    vehicleCount?: number;
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
    /** Full operational breakdown when the costing engine was used. */
    costing?: import("@/data/experience-costing").ExperienceCostingQuote;
  };
  notes?: StaffNote[];
  paymentRef?: string;
  razorpayOrderId?: string;
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

export type ImpactStat = {
  id: string;
  value: string;
  label: string;
  description: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  /** Percent off total guest price (0–100). */
  percent: number;
  active: boolean;
  note?: string;
};

export type PlatformSettings = {
  minAdvanceDays: number;
  holdMinutes: number;
  serviceFeePercent: number;
  gstPercent: number;
  impact: ImpactStat[];
  /** Optional promo codes editable in admin. */
  discountCodes?: DiscountCode[];
  /** Transfer fleet for experiences / journey enquire (Studio → Vehicles). */
  fleetVehicles?: import("@/data/transport").FleetVehicle[];
  /** Stay styles for learn-more / book flows (Studio → Stays). */
  stayStyles?: import("@/data/stay-styles").StayStyle[];
  /** Shared FAQs linked from every experience page (Studio → FAQs). */
  experienceFaqs?: import("@/data/shared-faqs").SharedFaqItem[];
  /** Shared FAQs linked from every curated journey page (Studio → FAQs). */
  curatedJourneyFaqs?: import("@/data/shared-faqs").SharedFaqItem[];
};

export type JourneyDepartureSeat = {
  date: string;
  seats: number;
  held: number;
  booked: number;
  note?: string;
};

export type { Experience, Journey, Destination, Story };
