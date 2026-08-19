export type TransportVehicleId = "sedan" | "suv" | "innova" | "tempo";

export type TransportVehicleOption = {
  id: TransportVehicleId;
  label: string;
  seats: string;
  /** Absolute price for the transfer; falls back from a base rate when not set on the listing. */
  price: number;
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
  { label: string; seats: string }
> = {
  sedan: { label: "Sedan", seats: "Up to 3 travellers" },
  suv: { label: "SUV", seats: "Up to 5 travellers" },
  innova: { label: "Innova / Crystal", seats: "Up to 6 travellers" },
  tempo: { label: "Tempo traveller", seats: "7–12 travellers" },
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
    return {
      id,
      ...TRANSPORT_VEHICLE_META[id],
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
