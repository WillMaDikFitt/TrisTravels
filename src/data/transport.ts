import { media } from "./media";

export type LegacyTransportVehicleId = "sedan" | "suv" | "innova" | "tempo";

/** @deprecated Prefer string vehicle ids from the Studio fleet. Kept for package pricing maps. */
export type TransportVehicleId = LegacyTransportVehicleId;

/**
 * Studio-managed transfer / package vehicle.
 * Seeded from the learn-more transportation catalogue.
 */
export type FleetVehicle = {
  id: string;
  label: string;
  /** Max guests the vehicle can carry */
  maxGuests: number;
  /** Short seats line (e.g. "Up to 6 travellers") — derived from maxGuests when blank */
  seats: string;
  summary: string;
  idealFor: string;
  luggage: string;
  ac: string;
  windows?: string;
  bestFor: string;
  goodToKnow: string;
  examples?: string;
  /** Gallery for learn-more + booking cards */
  images: string[];
  /** @deprecated Prefer images[0] */
  image?: string;
  /** Default transfer price when a listing leaves this vehicle blank */
  defaultPrice?: number;
  /** Used only when defaultPrice is blank and listing uses a base price */
  multiplier?: number;
  /** Offer on experience / enquire day transfers (not only package book) */
  offerOnTransfers?: boolean;
  active?: boolean;
  sortOrder?: number;
};

export type TransportVehicleOption = {
  id: string;
  label: string;
  seats: string;
  price: number;
  summary: string;
  idealFor: string;
  luggage: string;
  image?: string;
  images?: string[];
  maxGuests?: number;
};

export type TransportVehiclePrices = Partial<Record<string, number>>;

const LEGACY_MULTIPLIERS: Record<string, number> = {
  sedan: 1,
  suv: 1.25,
  innova: 1.5,
  tempo: 2,
  tempo10: 1.85,
  tempo12: 2,
  tempo15: 2.25,
  urbania10: 2.2,
  urbania12: 2.45,
};

/**
 * Built-in fleet — same content as learn-more “Transportation Type”.
 * Studio can edit photos / copy; empty Firestore falls back here.
 */
export const DEFAULT_FLEET_VEHICLES: FleetVehicle[] = [
  {
    id: "sedan",
    label: "Sedan",
    maxGuests: 4,
    seats: "Up to 4 travellers",
    idealFor: "Up to 3 adults",
    luggage: "1 large + 1 small suitcase, or up to 3 small bags",
    ac: "Yes",
    bestFor: "Small groups looking for a comfortable and economical vehicle.",
    goodToKnow: "Boot space is limited, so this option may not be suitable for travellers carrying a lot of luggage.",
    examples: "Maruti Suzuki Dzire, Honda City, Hyundai Verna, Maruti Suzuki Ciaz",
    summary:
      "A comfortable option for smaller groups, sedans offer good legroom, air conditioning and a smooth ride on highways and hilly roads.",
    images: [media.ride, media.rideAlt],
    multiplier: 1,
    offerOnTransfers: true,
    active: true,
    sortOrder: 1,
  },
  {
    id: "suv",
    label: "SUV",
    maxGuests: 5,
    seats: "Up to 5 travellers",
    idealFor: "Up to 4 adults for more comfort",
    luggage: "3 large + 2 small bags",
    ac: "Yes",
    bestFor: "Small groups looking for a comfortable and practical vehicle for exploring Meghalaya.",
    goodToKnow: "Luggage capacity may vary depending on the vehicle model and number of passengers.",
    examples: "Mahindra Xylo, Mahindra Bolero, Maruti Suzuki Ertiga or similar",
    summary:
      "A practical option for small groups, SUVs offer a comfortable cabin, good ground clearance and flexibility for Meghalaya’s hilly roads.",
    images: [media.rideAlt, media.cliffs],
    multiplier: 1.25,
    offerOnTransfers: true,
    active: true,
    sortOrder: 2,
  },
  {
    id: "innova",
    label: "Innova",
    maxGuests: 6,
    seats: "Up to 6 travellers",
    idealFor: "Up to 4 adults",
    luggage: "3 large + 2 small bags",
    ac: "Yes",
    bestFor: "Families and small groups looking for extra space and comfort on longer journeys.",
    goodToKnow:
      "Additional luggage space may be available when the rear seats are folded, subject to seating needs.",
    summary:
      "A spacious and comfortable option for families and small groups — generous cabin space and a smooth ride for longer journeys.",
    images: [media.packages, media.familyWaterfall],
    multiplier: 1.5,
    offerOnTransfers: true,
    active: true,
    sortOrder: 3,
  },
  {
    id: "tempo10",
    label: "Tempo traveller",
    maxGuests: 10,
    seats: "Up to 10 travellers",
    idealFor: "Up to 10 adults",
    luggage: "8–10 medium to large bags",
    ac: "Yes",
    bestFor: "Groups looking for a spacious and economical travel option.",
    goodToKnow: "Good overhead and rear luggage storage for family and group tours.",
    summary:
      "A practical and spacious option for small to medium-sized groups, with comfortable seating and air conditioning.",
    images: [media.departures, media.groupTrail],
    multiplier: 1.85,
    offerOnTransfers: false,
    active: true,
    sortOrder: 4,
  },
  {
    id: "tempo12",
    label: "Tempo traveller",
    maxGuests: 12,
    seats: "Up to 12 travellers",
    idealFor: "Up to 12 adults",
    luggage: "9–12 medium to large bags",
    ac: "Yes",
    bestFor: "Groups looking for a spacious and economical option.",
    goodToKnow: "A popular choice for medium to large groups and educational travel.",
    summary:
      "A popular option for medium to large groups — spacious seating, air conditioning, and good luggage storage.",
    images: [media.groupTrail, media.departures],
    multiplier: 2,
    offerOnTransfers: true,
    active: true,
    sortOrder: 5,
  },
  {
    id: "tempo15",
    label: "Tempo traveller",
    maxGuests: 15,
    seats: "Up to 15 travellers",
    idealFor: "Up to 15 adults",
    luggage: "10–15 medium to large bags",
    ac: "Yes",
    bestFor: "Larger groups looking for a practical and economical option.",
    goodToKnow: "Suited for bigger groups with generous luggage storage.",
    summary:
      "A larger Tempo Traveller for bigger groups, with spacious seating, air conditioning, and generous luggage space.",
    images: [media.trail, media.meadowWalk],
    multiplier: 2.25,
    offerOnTransfers: false,
    active: true,
    sortOrder: 6,
  },
  {
    id: "urbania10",
    label: "Urbania",
    maxGuests: 10,
    seats: "Up to 10 travellers",
    idealFor: "Up to 10 adults",
    luggage: "7–10 medium to large bags",
    ac: "Yes",
    windows: "Non-opening",
    bestFor: "Travellers looking for a more comfortable and modern vehicle.",
    goodToKnow: "Windows do not open — climate is managed via air conditioning.",
    summary:
      "A modern and comfortable Force Urbania for smaller groups — spacious seating and a refined travel experience.",
    images: [media.rideAlt, media.packages],
    multiplier: 2.2,
    offerOnTransfers: false,
    active: true,
    sortOrder: 7,
  },
  {
    id: "urbania12",
    label: "Urbania",
    maxGuests: 12,
    seats: "Up to 12 travellers",
    idealFor: "Up to 12 adults",
    luggage: "10–12 medium to large bags",
    ac: "Yes",
    windows: "Non-opening",
    bestFor: "Medium-sized groups looking for a comfortable and modern travel experience.",
    goodToKnow: "Windows do not open — climate is managed via air conditioning.",
    summary:
      "A modern and spacious Force Urbania for medium-sized groups — comfort and luggage space for longer journeys.",
    images: [media.packages, media.departures],
    multiplier: 2.45,
    offerOnTransfers: false,
    active: true,
    sortOrder: 8,
  },
];

/** Legacy 4-id meta for older package day-rate maps. */
export const TRANSPORT_VEHICLE_META = {
  sedan: {
    label: "Sedan",
    seats: "Up to 4 travellers",
    summary: DEFAULT_FLEET_VEHICLES[0].summary,
    idealFor: DEFAULT_FLEET_VEHICLES[0].idealFor,
    luggage: DEFAULT_FLEET_VEHICLES[0].luggage,
  },
  suv: {
    label: "SUV",
    seats: "Up to 5 travellers",
    summary: DEFAULT_FLEET_VEHICLES[1].summary,
    idealFor: DEFAULT_FLEET_VEHICLES[1].idealFor,
    luggage: DEFAULT_FLEET_VEHICLES[1].luggage,
  },
  innova: {
    label: "Innova",
    seats: "Up to 6 travellers",
    summary: DEFAULT_FLEET_VEHICLES[2].summary,
    idealFor: DEFAULT_FLEET_VEHICLES[2].idealFor,
    luggage: DEFAULT_FLEET_VEHICLES[2].luggage,
  },
  tempo: {
    label: "Tempo traveller",
    seats: "Up to 12 travellers",
    summary: DEFAULT_FLEET_VEHICLES[4].summary,
    idealFor: DEFAULT_FLEET_VEHICLES[4].idealFor,
    luggage: DEFAULT_FLEET_VEHICLES[4].luggage,
  },
} as const;

export const TRANSPORT_VEHICLE_IDS = Object.keys(TRANSPORT_VEHICLE_META) as LegacyTransportVehicleId[];

export function vehicleImages(vehicle: Pick<FleetVehicle, "images" | "image">) {
  const gallery = (vehicle.images ?? []).map((u) => u.trim()).filter(Boolean);
  if (gallery.length) return gallery;
  if (vehicle.image?.trim()) return [vehicle.image.trim()];
  return [] as string[];
}

export function mergeFleetVehicles(custom?: FleetVehicle[] | null): FleetVehicle[] {
  if (!custom?.length) return DEFAULT_FLEET_VEHICLES.map((v) => ({ ...v, images: [...v.images] }));
  return custom
    .map((row, index) => {
      const images = vehicleImages(row);
      const maxGuests =
        row.maxGuests != null && Number.isFinite(row.maxGuests) && row.maxGuests > 0
          ? Math.round(row.maxGuests)
          : 4;
      return {
        id: String(row.id || "").trim() || `vehicle-${index + 1}`,
        label: String(row.label || "").trim() || "Vehicle",
        maxGuests,
        seats: String(row.seats || "").trim() || `Up to ${maxGuests} travellers`,
        summary: String(row.summary || "").trim(),
        idealFor: String(row.idealFor || "").trim(),
        luggage: String(row.luggage || "").trim(),
        ac: String(row.ac || "").trim() || "Yes",
        windows: row.windows?.trim() || undefined,
        bestFor: String(row.bestFor || "").trim(),
        goodToKnow: String(row.goodToKnow || "").trim(),
        examples: row.examples?.trim() || undefined,
        images,
        image: images[0],
        defaultPrice:
          row.defaultPrice != null && Number.isFinite(row.defaultPrice) && row.defaultPrice >= 0
            ? Math.round(row.defaultPrice)
            : undefined,
        multiplier:
          row.multiplier != null && Number.isFinite(row.multiplier) && row.multiplier > 0
            ? row.multiplier
            : undefined,
        offerOnTransfers: row.offerOnTransfers !== false,
        active: row.active !== false,
        sortOrder: row.sortOrder ?? index + 1,
      } satisfies FleetVehicle;
    })
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

/**
 * If Studio still has the short 4-car list (no learn-more catalogue),
 * merge in missing package vehicles from defaults while keeping edits.
 */
export function hydrateFleetFromDefaults(custom?: FleetVehicle[] | null): FleetVehicle[] {
  const current = mergeFleetVehicles(custom);
  const byId = new Map(current.map((v) => [v.id, v]));
  const merged = DEFAULT_FLEET_VEHICLES.map((seed) => {
    const existing = byId.get(seed.id);
    if (!existing) return { ...seed, images: [...seed.images] };
    const images = vehicleImages(existing).length ? vehicleImages(existing) : [...seed.images];
    return {
      ...seed,
      ...existing,
      images,
      image: images[0],
      maxGuests: existing.maxGuests || seed.maxGuests,
      ac: existing.ac || seed.ac,
      bestFor: existing.bestFor || seed.bestFor,
      goodToKnow: existing.goodToKnow || seed.goodToKnow,
      examples: existing.examples || seed.examples,
      windows: existing.windows || seed.windows,
    };
  });
  for (const row of current) {
    if (!DEFAULT_FLEET_VEHICLES.some((d) => d.id === row.id)) merged.push(row);
  }
  return mergeFleetVehicles(merged);
}

export function activeFleetVehicles(custom?: FleetVehicle[] | null): FleetVehicle[] {
  return mergeFleetVehicles(custom).filter((v) => v.active !== false);
}

export function transferFleetVehicles(custom?: FleetVehicle[] | null): FleetVehicle[] {
  return activeFleetVehicles(custom).filter((v) => v.offerOnTransfers !== false);
}

function priceForVehicle(vehicle: FleetVehicle, basePrice: number, override?: number) {
  if (override != null && Number.isFinite(override) && override >= 0) return Math.round(override);
  if (vehicle.defaultPrice != null && vehicle.defaultPrice >= 0) return Math.round(vehicle.defaultPrice);
  const multiplier = vehicle.multiplier ?? LEGACY_MULTIPLIERS[vehicle.id] ?? 1;
  return Math.round(Math.max(0, basePrice) * multiplier);
}

/** Build priced vehicle choices for day transfers / enquire. */
export function transportVehicleOptions(
  basePrice = 2500,
  overrides?: TransportVehiclePrices | null,
  fleet?: FleetVehicle[] | null,
  allowedIds?: string[] | null,
): TransportVehicleOption[] {
  const safeBase = Math.max(0, Math.round(basePrice));
  let list = fleet?.length ? transferFleetVehicles(fleet) : transferFleetVehicles(DEFAULT_FLEET_VEHICLES);
  if (allowedIds?.length) {
    const allow = new Set(allowedIds.map((id) => (id === "tempo" ? "tempo12" : id)));
    list = list.filter((vehicle) => allow.has(vehicle.id));
  }
  // Map legacy "tempo" override onto tempo12
  const prices = { ...overrides };
  if (prices.tempo != null && prices.tempo12 == null) prices.tempo12 = prices.tempo;

  return list.map((vehicle) => {
    const images = vehicleImages(vehicle);
    return {
      id: vehicle.id,
      label: vehicle.label,
      seats: vehicle.seats,
      summary: vehicle.summary,
      idealFor: vehicle.idealFor,
      luggage: vehicle.luggage,
      image: images[0],
      images,
      maxGuests: vehicle.maxGuests,
      price: priceForVehicle(vehicle, safeBase, prices?.[vehicle.id]),
    };
  });
}

export function findTransportVehicle(
  options: TransportVehicleOption[],
  id?: string | null,
): TransportVehicleOption | undefined {
  if (!id) return undefined;
  const normalized = id === "tempo" ? "tempo12" : id;
  return options.find((option) => option.id === normalized) ?? options.find((option) => option.id === id);
}

export function slugifyVehicleId(label: string) {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || `vehicle-${Date.now().toString(36)}`
  );
}

/** Read Studio form fields named transportSedan, transportSuv, etc. (legacy). */
export function readTransportVehiclePrices(fd: FormData): TransportVehiclePrices | undefined {
  const prices: TransportVehiclePrices = {};
  let any = false;
  for (const id of TRANSPORT_VEHICLE_IDS) {
    const raw = String(fd.get(`transport${capitalize(id)}`) ?? "").trim();
    if (!raw) continue;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) continue;
    prices[id] = Math.round(value);
    any = true;
  }
  return any ? prices : undefined;
}

function capitalize(id: string) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}
