import type { TransportVehicleId } from "./transport";

export type StayPreferenceId =
  | "homestay"
  | "hotel"
  | "boutique"
  | "resort"
  | "camping"
  | "barefoot"
  | "signature"
  | "offbeat";

export type PackageVehicleRate = {
  /** Cost for one vehicle for one day */
  costPerDay: number;
  /** Max guests this vehicle can carry (including front seat) */
  capacity: number;
};

export type PackageStayRate = {
  /** Cost for one room for the full journey stay (all nights) */
  roomCost: number;
  /** Cost per extra mattress / person / night */
  extraMattressPerPerson: number;
};

export type CuratedPackagePricing = {
  vehicles?: Partial<Record<TransportVehicleId, PackageVehicleRate>>;
  stays?: Partial<Record<StayPreferenceId, PackageStayRate>>;
  /** Activities & other cost per guest for the whole journey (C) */
  activityCostPerGuest?: number;
  /** TRIS services percent applied to (A+B+C) → D */
  trisServicePercent?: number;
  /** GST percent of D only → E (default 5) */
  gstPercent?: number;
};

export const STAY_PREFERENCE_META: Record<
  StayPreferenceId,
  { label: string; hint: string }
> = {
  homestay: { label: "Barefoot Stays", hint: "Good value, genuine local character" },
  hotel: { label: "Signature Stays", hint: "More comfort, memorable settings" },
  boutique: { label: "Signature Stays", hint: "More comfort, memorable settings" },
  resort: { label: "Signature Stays", hint: "More comfort, memorable settings" },
  camping: { label: "Offbeat Stays", hint: "Quieter locations, slower pace" },
  barefoot: { label: "Barefoot Stays", hint: "Good value, genuine local character" },
  signature: { label: "Signature Stays", hint: "More comfort, memorable settings" },
  offbeat: { label: "Offbeat Stays", hint: "Quieter locations, slower pace" },
};

/** Public stay styles shown in the book flow (maps onto pricing keys). */
export const BOOKING_STAY_STYLE_IDS = ["barefoot", "signature", "offbeat"] as const;
export type BookingStayStyleId = (typeof BOOKING_STAY_STYLE_IDS)[number];

export const BOOKING_STAY_TO_RATE_KEY: Record<BookingStayStyleId, StayPreferenceId> = {
  barefoot: "homestay",
  signature: "boutique",
  offbeat: "camping",
};

export const STAY_PREFERENCE_IDS = Object.keys(STAY_PREFERENCE_META) as StayPreferenceId[];

export const DEFAULT_PACKAGE_VEHICLES: Record<TransportVehicleId, PackageVehicleRate> = {
  sedan: { costPerDay: 3500, capacity: 4 },
  suv: { costPerDay: 4500, capacity: 5 },
  innova: { costPerDay: 5500, capacity: 6 },
  tempo: { costPerDay: 8000, capacity: 12 },
};

export const DEFAULT_PACKAGE_STAYS: Record<StayPreferenceId, PackageStayRate> = {
  homestay: { roomCost: 5000, extraMattressPerPerson: 1600 },
  hotel: { roomCost: 7000, extraMattressPerPerson: 2000 },
  boutique: { roomCost: 9000, extraMattressPerPerson: 2400 },
  resort: { roomCost: 12000, extraMattressPerPerson: 3000 },
  camping: { roomCost: 3000, extraMattressPerPerson: 1000 },
  barefoot: { roomCost: 5000, extraMattressPerPerson: 1600 },
  signature: { roomCost: 9000, extraMattressPerPerson: 2400 },
  offbeat: { roomCost: 3000, extraMattressPerPerson: 1000 },
};

export const DEFAULT_TRIS_SERVICE_PERCENT = 10;
export const DEFAULT_PACKAGE_GST_PERCENT = 5;

export function resolvePackageVehicles(
  override?: CuratedPackagePricing["vehicles"],
): Record<TransportVehicleId, PackageVehicleRate> {
  return {
    sedan: { ...DEFAULT_PACKAGE_VEHICLES.sedan, ...override?.sedan },
    suv: { ...DEFAULT_PACKAGE_VEHICLES.suv, ...override?.suv },
    innova: { ...DEFAULT_PACKAGE_VEHICLES.innova, ...override?.innova },
    tempo: { ...DEFAULT_PACKAGE_VEHICLES.tempo, ...override?.tempo },
  };
}

export function resolvePackageStays(
  override?: CuratedPackagePricing["stays"],
): Record<StayPreferenceId, PackageStayRate> {
  return {
    homestay: { ...DEFAULT_PACKAGE_STAYS.homestay, ...override?.homestay },
    hotel: { ...DEFAULT_PACKAGE_STAYS.hotel, ...override?.hotel },
    boutique: { ...DEFAULT_PACKAGE_STAYS.boutique, ...override?.boutique },
    resort: { ...DEFAULT_PACKAGE_STAYS.resort, ...override?.resort },
    camping: { ...DEFAULT_PACKAGE_STAYS.camping, ...override?.camping },
    barefoot: {
      ...DEFAULT_PACKAGE_STAYS.barefoot,
      ...override?.barefoot,
      ...override?.homestay,
    },
    signature: {
      ...DEFAULT_PACKAGE_STAYS.signature,
      ...override?.signature,
      ...override?.boutique,
    },
    offbeat: {
      ...DEFAULT_PACKAGE_STAYS.offbeat,
      ...override?.offbeat,
      ...override?.camping,
    },
  };
}

/** Suggested rooms for double occupancy (2 guests per room). */
export function suggestedRooms(totalGuests: number) {
  return Math.max(1, Math.ceil(Math.max(1, totalGuests) / 2));
}

/** Extra mattresses needed when guests exceed 2× rooms. */
export function suggestedExtraMattresses(totalGuests: number, rooms: number) {
  return Math.max(0, Math.max(1, totalGuests) - Math.max(1, rooms) * 2);
}

/** Minimum vehicles so guest count fits capacity. */
export function minVehiclesForGuests(totalGuests: number, capacity: number) {
  const cap = Math.max(1, capacity);
  return Math.max(1, Math.ceil(Math.max(1, totalGuests) / cap));
}
