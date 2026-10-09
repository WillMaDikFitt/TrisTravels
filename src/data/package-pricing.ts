import {
  activeFleetVehicles,
  DEFAULT_FLEET_VEHICLES,
  type FleetVehicle,
  type TransportVehicleId,
} from "./transport";

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
  /** Cost of one extra mattress for the whole journey (all nights together) */
  extraMattressPerPerson: number;
};

export type PackageOperationalCost = {
  id: string;
  name: string;
  /** Cost of one unit for the whole journey */
  cost: number;
  /** Guests one unit covers; 0 = one for the whole group */
  capacity: number;
};

/** How many of an operational cost a group needs, and what they cost together. */
export function operationalCostLine(item: PackageOperationalCost, guests: number) {
  const capacity = Math.max(0, Math.round(item.capacity) || 0);
  const units = capacity > 0 ? Math.ceil(Math.max(1, guests) / capacity) : 1;
  const unitCost = Math.max(0, Math.round(item.cost) || 0);
  return { ...item, capacity, units, unitCost, total: units * unitCost };
}

export type CuratedPackagePricing = {
  /**
   * Day rate per vehicle, keyed by fleet vehicle id (Studio → Vehicles).
   * The legacy keys sedan / suv / innova / tempo still apply to any vehicle
   * that has no rate of its own.
   */
  vehicles?: Partial<Record<string, PackageVehicleRate>>;
  /** Room rate per stay style id (Studio → Stays). Legacy keys cover styles without one. */
  stays?: Partial<Record<string, PackageStayRate>>;
  /**
   * C — operational costs for the whole journey (guides, activities, permits…).
   * Each line is bought once per `capacity` guests (ceil(guests ÷ capacity));
   * capacity 0 / missing = one for the whole group.
   */
  operationalCosts?: PackageOperationalCost[];
  /**
   * Earlier C — one fixed total. Used only when `operationalCosts` is empty;
   * the editor turns it into the first line.
   */
  operationalCostTotal?: number | null;
  /**
   * Legacy C — per-guest activity cost × guests. Only used while
   * `operationalCostTotal` hasn't been entered for this journey.
   */
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
  homestay: {
    label: "Barefoot Stays",
    hint: "Good value, genuine local character",
  },
  hotel: { label: "Signature Stays", hint: "More comfort, memorable settings" },
  boutique: {
    label: "Signature Stays",
    hint: "More comfort, memorable settings",
  },
  resort: {
    label: "Signature Stays",
    hint: "More comfort, memorable settings",
  },
  camping: { label: "Offbeat Stays", hint: "Quieter locations, slower pace" },
  barefoot: {
    label: "Barefoot Stays",
    hint: "Good value, genuine local character",
  },
  signature: {
    label: "Signature Stays",
    hint: "More comfort, memorable settings",
  },
  offbeat: { label: "Offbeat Stays", hint: "Quieter locations, slower pace" },
};

/** Public stay styles shown in the book flow (maps onto pricing keys). */
export const BOOKING_STAY_STYLE_IDS = [
  "barefoot",
  "signature",
  "offbeat",
] as const;
export type BookingStayStyleId = (typeof BOOKING_STAY_STYLE_IDS)[number];

export const BOOKING_STAY_TO_RATE_KEY: Record<
  BookingStayStyleId,
  StayPreferenceId
> = {
  barefoot: "homestay",
  signature: "boutique",
  offbeat: "camping",
};

export const STAY_PREFERENCE_IDS = Object.keys(
  STAY_PREFERENCE_META,
) as StayPreferenceId[];

export const DEFAULT_PACKAGE_VEHICLES: Record<
  TransportVehicleId,
  PackageVehicleRate
> = {
  sedan: { costPerDay: 3500, capacity: 4 },
  suv: { costPerDay: 4500, capacity: 5 },
  innova: { costPerDay: 5500, capacity: 6 },
  tempo: { costPerDay: 8000, capacity: 12 },
};

export const DEFAULT_PACKAGE_STAYS: Record<StayPreferenceId, PackageStayRate> =
  {
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

/** Day-rate multipliers used for fleet vehicles a journey hasn't priced yet. */
export const PACKAGE_VEHICLE_RATE_SCALE: Record<string, number> = {
  sedan: 1,
  suv: 1,
  innova: 1,
  tempo10: 0.92,
  tempo12: 1,
  tempo15: 1.12,
  urbania10: 1.18,
  urbania12: 1.32,
};

/** Which of the four legacy rate keys stands in for a fleet vehicle. */
export function legacyRateKeyFor(vehicleId: string): TransportVehicleId {
  if (vehicleId === "sedan" || vehicleId === "suv" || vehicleId === "innova")
    return vehicleId;
  return "tempo";
}

/** A vehicle's own rate when Studio set one, else the legacy rate scaled for its size. */
export function packageVehicleRate(
  vehicle: Pick<FleetVehicle, "id" | "maxGuests">,
  override?: CuratedPackagePricing["vehicles"],
): PackageVehicleRate {
  const own = override?.[vehicle.id];
  if (own) {
    return {
      costPerDay: Math.max(0, Math.round(own.costPerDay)),
      capacity: Math.max(1, Math.round(own.capacity) || 1),
    };
  }
  const legacyKey = legacyRateKeyFor(vehicle.id);
  const base = {
    ...DEFAULT_PACKAGE_VEHICLES[legacyKey],
    ...override?.[legacyKey],
  };
  return {
    costPerDay: Math.max(
      0,
      Math.round(
        base.costPerDay * (PACKAGE_VEHICLE_RATE_SCALE[vehicle.id] ?? 1),
      ),
    ),
    capacity: Math.max(1, Math.round(vehicle.maxGuests || base.capacity) || 1),
  };
}

/** Rates for every active fleet vehicle, filling gaps from the legacy rates. */
export function resolveFleetPackageRates(
  fleet?: FleetVehicle[] | null,
  override?: CuratedPackagePricing["vehicles"],
): { vehicle: FleetVehicle; rate: PackageVehicleRate }[] {
  const list = fleet?.length
    ? activeFleetVehicles(fleet)
    : DEFAULT_FLEET_VEHICLES;
  return list.map((vehicle) => ({
    vehicle,
    rate: packageVehicleRate(vehicle, override),
  }));
}

/**
 * Curated journeys keep one vehicle price list — "A · Transport" (cost per day).
 * The Enquire form shows each vehicle at cost per day × journey days, the same
 * transport figure Book now uses for one vehicle.
 */
export function curatedEnquiryVehiclePrices(
  days: number,
  fleet?: FleetVehicle[] | null,
  override?: CuratedPackagePricing["vehicles"],
): Record<string, number> {
  const tripDays = Math.max(1, Math.round(days) || 1);
  return Object.fromEntries(
    resolveFleetPackageRates(fleet, override).map(({ vehicle, rate }) => [
      vehicle.id,
      Math.round(rate.costPerDay * tripDays),
    ]),
  );
}

/** Which legacy rate key stands in for a stay style that has no rate of its own. */
export function legacyStayRateKeyFor(stayId: string): StayPreferenceId {
  if (stayId in DEFAULT_PACKAGE_STAYS) return stayId as StayPreferenceId;
  if (stayId === "luxury") return "resort";
  if (stayId === "flexible") return "homestay";
  return "homestay";
}

/** A stay style's own room rate when Studio set one, else the legacy rate it maps to. */
export function packageStayRate(
  stayId: string,
  override?: CuratedPackagePricing["stays"],
): PackageStayRate {
  const own = override?.[stayId];
  if (own) {
    return {
      roomCost: Math.max(0, Math.round(own.roomCost)),
      extraMattressPerPerson: Math.max(
        0,
        Math.round(own.extraMattressPerPerson),
      ),
    };
  }
  const legacyKey = legacyStayRateKeyFor(stayId);
  const base = {
    ...DEFAULT_PACKAGE_STAYS[legacyKey],
    ...override?.[legacyKey],
  };
  return {
    roomCost: Math.max(0, Math.round(base.roomCost)),
    extraMattressPerPerson: Math.max(
      0,
      Math.round(base.extraMattressPerPerson),
    ),
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
