export type TransportVehicleId = "sedan" | "suv" | "innova" | "tempo";

export type TransportVehicleOption = {
  id: TransportVehicleId;
  label: string;
  seats: string;
  /** Absolute price for the transfer; falls back from a base rate when not set on the listing. */
  price: number;
  /** Short description shown in booking UI (no price). */
  summary: string;
  idealFor: string;
  luggage: string;
};

export type TransportVehiclePrices = Partial<Record<TransportVehicleId, number>>;

const DEFAULT_MULTIPLIERS: Record<TransportVehicleId, number> = {
  sedan: 1,
  suv: 1.25,
  innova: 1.5,
  tempo: 2,
};

export const TRANSPORT_VEHICLE_META: Record<
  TransportVehicleId,
  { label: string; seats: string; summary: string; idealFor: string; luggage: string }
> = {
  sedan: {
    label: "Sedan",
    seats: "Up to 3 travellers",
    idealFor: "Up to 3 adults",
    luggage: "1 large + 1 small suitcase, or up to 3 small bags",
    summary:
      "A comfortable option for smaller groups, sedans offer good legroom, air conditioning and a smooth ride on highways and hilly roads.",
  },
  suv: {
    label: "SUV",
    seats: "Up to 5 travellers",
    idealFor: "Up to 4 adults for more comfort",
    luggage: "3 large + 2 small bags",
    summary:
      "A practical option for small groups, SUVs offer a comfortable cabin, good ground clearance and flexibility for Meghalaya’s hilly roads.",
  },
  innova: {
    label: "Innova / Crystal",
    seats: "Up to 6 travellers",
    idealFor: "Up to 4 adults",
    luggage: "3 large + 2 small bags",
    summary:
      "A spacious and comfortable option for families and small groups — generous cabin space and a smooth ride for longer journeys.",
  },
  tempo: {
    label: "Tempo traveller",
    seats: "7–12 travellers",
    idealFor: "Up to 12 adults",
    luggage: "9–12 medium to large bags",
    summary:
      "A popular option for medium to large groups — spacious seating, air conditioning, and good luggage storage.",
  },
};

export const TRANSPORT_VEHICLE_IDS = Object.keys(TRANSPORT_VEHICLE_META) as TransportVehicleId[];

/** Build priced vehicle choices from overrides and/or a listing’s base transport price. */
export function transportVehicleOptions(
  basePrice = 2500,
  overrides?: TransportVehiclePrices | null,
): TransportVehicleOption[] {
  const safeBase = Math.max(0, Math.round(basePrice));
  return TRANSPORT_VEHICLE_IDS.map((id) => {
    const override = overrides?.[id];
    const price =
      override != null && Number.isFinite(override) && override >= 0
        ? Math.round(override)
        : Math.round(safeBase * DEFAULT_MULTIPLIERS[id]);
    const meta = TRANSPORT_VEHICLE_META[id];
    return {
      id,
      label: meta.label,
      seats: meta.seats,
      summary: meta.summary,
      idealFor: meta.idealFor,
      luggage: meta.luggage,
      price,
    };
  });
}

export function findTransportVehicle(
  options: TransportVehicleOption[],
  id?: string | null,
): TransportVehicleOption | undefined {
  if (!id) return undefined;
  return options.find((option) => option.id === id);
}

/** Read Studio form fields named transportSedan, transportSuv, etc. */
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

function capitalize(id: TransportVehicleId) {
  return id.charAt(0).toUpperCase() + id.slice(1);
}
