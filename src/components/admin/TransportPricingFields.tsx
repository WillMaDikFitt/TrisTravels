"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Field, inputClass } from "@/components/admin/ui";
import {
  DEFAULT_FLEET_VEHICLES,
  transferFleetVehicles,
  transportVehicleOptions,
  type FleetVehicle,
  type TransportVehiclePrices,
} from "@/data/transport";
import type { ExperienceCosting, ExperienceVehicleRate } from "@/data/experience-costing";
import { fetchFleetVehicles } from "@/lib/actions/content-read";
import { cn, formatINR } from "@/lib/utils";

export type TransportEditorValue = {
  mode: "none" | "optional" | "required";
  available?: boolean;
  note: string;
  prices: TransportVehiclePrices;
  basePrice?: number;
  /** Empty / undefined = offer all transfer fleet vehicles. */
  offeredVehicleIds?: string[];
};

type Props = {
  variant: "experience" | "journey";
  value: TransportEditorValue;
  onChange: (next: TransportEditorValue) => void;
  /**
   * When set (experience + costing engine), show per-vehicle operational cost & capacity
   * like curated package vehicle rates — instead of guest-facing selling prices.
   */
  costingTransport?: ExperienceCosting["transport"];
  onCostingTransportChange?: (next: ExperienceCosting["transport"]) => void;
};

const MODE_OPTIONS = [
  {
    id: "none" as const,
    title: "Not offered",
    body: "Guests arrange their own way there.",
  },
  {
    id: "optional" as const,
    title: "Optional",
    body: "Guests can choose own transport or TRIS.",
  },
  {
    id: "required" as const,
    title: "Required",
    body: "Booking includes a TRIS vehicle.",
  },
];

function pricesFromFleet(
  fleet: FleetVehicle[],
  prices: TransportVehiclePrices,
  base?: number,
): TransportVehiclePrices {
  const options = transportVehicleOptions(base && base > 0 ? base : 2500, prices, fleet);
  return Object.fromEntries(options.map((o) => [o.id, o.price]));
}

function rateForVehicle(
  transport: ExperienceCosting["transport"],
  vehicleId: string,
  seatsHint?: number,
): ExperienceVehicleRate {
  const mapped = transport.vehicles?.[vehicleId];
  if (mapped) {
    return {
      cost: Math.max(0, Math.round(mapped.cost)),
      capacity: Math.max(1, Math.round(mapped.capacity) || 1),
    };
  }
  return {
    cost: Math.max(0, Math.round(transport.vehicleCost ?? 0)),
    capacity: Math.max(
      1,
      Math.round(transport.vehicleCapacity) || Math.round(seatsHint || 6) || 6,
    ),
  };
}

/**
 * Listing-level transport offer + prices.
 * Vehicle catalogue (names, photos, defaults) is managed under Studio → Vehicles.
 */
export function TransportPricingFields({
  variant,
  value,
  onChange,
  costingTransport,
  onCostingTransportChange,
}: Props) {
  const [fleet, setFleet] = useState<FleetVehicle[]>(DEFAULT_FLEET_VEHICLES);
  const offered = variant === "experience" ? value.mode !== "none" : value.available !== false;
  const useCostingRates = Boolean(costingTransport && onCostingTransportChange);
  const display = useMemo(
    () => pricesFromFleet(fleet, value.prices, value.basePrice),
    [fleet, value.prices, value.basePrice],
  );
  const [fillFrom, setFillFrom] = useState(String(value.basePrice || display.sedan || 2500));
  const [fillCost, setFillCost] = useState(String(costingTransport?.vehicleCost || 0));

  useEffect(() => {
    fetchFleetVehicles()
      .then((rows) => {
        if (rows?.length) setFleet(transferFleetVehicles(rows));
      })
      .catch(() => undefined);
  }, []);

  const visibleFleet = useMemo(() => {
    if (!value.offeredVehicleIds?.length) return fleet;
    const allow = new Set(value.offeredVehicleIds);
    const filtered = fleet.filter((v) => allow.has(v.id));
    return filtered.length ? filtered : fleet;
  }, [fleet, value.offeredVehicleIds]);

  const setPrice = (id: string, raw: string) => {
    const amount = Number(raw);
    const nextPrices = { ...value.prices };
    if (!raw.trim() || !Number.isFinite(amount) || amount < 0) {
      delete nextPrices[id];
    } else {
      nextPrices[id] = Math.round(amount);
    }
    const firstId = fleet[0]?.id;
    const baseCandidate = (firstId && nextPrices[firstId]) || value.basePrice;
    onChange({
      ...value,
      prices: nextPrices,
      basePrice: baseCandidate && baseCandidate > 0 ? baseCandidate : value.basePrice,
    });
  };

  const applyFillAll = () => {
    const base = Math.max(0, Math.round(Number(fillFrom) || 0));
    if (!base) return;
    const filled = pricesFromFleet(fleet, {}, base);
    onChange({
      ...value,
      basePrice: base,
      prices: { ...filled },
    });
  };

  const setCostingRate = (id: string, patch: Partial<ExperienceVehicleRate>) => {
    if (!costingTransport || !onCostingTransportChange) return;
    const current = rateForVehicle(costingTransport, id);
    const nextVehicles = {
      ...(costingTransport.vehicles ?? {}),
      [id]: {
        cost: patch.cost != null ? Math.max(0, Math.round(patch.cost)) : current.cost,
        capacity:
          patch.capacity != null
            ? Math.max(1, Math.round(patch.capacity) || 1)
            : current.capacity,
      },
    };
    const first = nextVehicles[visibleFleet[0]?.id ?? id] ?? nextVehicles[id];
    onCostingTransportChange({
      ...costingTransport,
      vehicles: nextVehicles,
      vehicleCost: first?.cost ?? costingTransport.vehicleCost,
      vehicleCapacity: first?.capacity ?? costingTransport.vehicleCapacity,
    });
  };

  const applyCostingFillAll = () => {
    if (!costingTransport || !onCostingTransportChange) return;
    const cost = Math.max(0, Math.round(Number(fillCost) || 0));
    const nextVehicles: Record<string, ExperienceVehicleRate> = {
      ...(costingTransport.vehicles ?? {}),
    };
    for (const vehicle of visibleFleet) {
      const prev = rateForVehicle(costingTransport, vehicle.id, vehicle.maxGuests);
      nextVehicles[vehicle.id] = { cost, capacity: prev.capacity };
    }
    onCostingTransportChange({
      ...costingTransport,
      vehicleCost: cost,
      vehicleCapacity: costingTransport.vehicleCapacity,
      vehicles: nextVehicles,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-[#26352b]">Transportation</h2>
          <p className="mt-1 text-sm text-[#4a5a50]">
            {useCostingRates
              ? "Mode, which cars guests can pick, and each vehicle’s operational cost & capacity (feeds the costing engine)."
              : variant === "experience"
                ? "Decide if TRIS provides a vehicle, then set prices for this listing."
                : "Prices shown on the journey enquire form when guests request a transfer."}
          </p>
        </div>
        <Link
          href="/admin/fleet"
          className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#364037] hover:border-[#8fa183]"
        >
          Manage vehicles & photos
        </Link>
      </div>

      {variant === "experience" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {MODE_OPTIONS.map((option) => {
            const active = value.mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onChange({
                    ...value,
                    mode: option.id,
                    available: option.id !== "none",
                  })
                }
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-[#364037] bg-[#364037] text-[#f8f6f1]"
                    : "border-[#c5cbb8] bg-[#faf8f3] text-[#26352b] hover:border-[#8fa183]",
                )}
              >
                <p className="text-sm font-semibold">{option.title}</p>
                <p className={cn("mt-1.5 text-xs leading-relaxed", active ? "text-[#d8e2cf]" : "text-[#4a5a50]")}>
                  {option.body}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#c5cbb8] bg-[#faf8f3] p-4">
          <input
            type="checkbox"
            className="mt-1"
            checked={value.available !== false}
            onChange={(e) =>
              onChange({
                ...value,
                available: e.target.checked,
                mode: e.target.checked ? (value.mode === "none" ? "optional" : value.mode) : "none",
              })
            }
          />
          <span>
            <span className="block text-sm font-semibold text-[#26352b]">Offer TRIS transport on enquire</span>
            <span className="mt-1 block text-xs text-[#4a5a50]">
              When on, guests can request a vehicle and see the prices below.
            </span>
          </span>
        </label>
      )}

      {offered ? (
        <>
          <Field label="Note for guests" hint="Pickup area, shared vs private, etc.">
            <input
              value={value.note}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
              placeholder="e.g. Shared pickup from Shillong · private on request"
              className={inputClass}
            />
          </Field>

          <div className="rounded-2xl border border-[#c5cbb8] bg-[#faf8f3] p-4">
            <p className="text-sm font-semibold text-[#26352b]">Vehicles shown to guests</p>
            <p className="mt-0.5 text-xs text-[#4a5a50]">
              Tick which fleet vehicles appear on this listing. Leave all ticked to offer the full transfer fleet.
              Photos are managed under Studio → Vehicles.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {fleet.map((vehicle) => {
                const selected =
                  !value.offeredVehicleIds?.length || value.offeredVehicleIds.includes(vehicle.id);
                return (
                  <label
                    key={vehicle.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
                      selected
                        ? "border-[#364037] bg-white text-[#26352b]"
                        : "border-[#d5dbc8] bg-[#f3f5ef] text-[#4a5a50]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const allIds = fleet.map((v) => v.id);
                        const current = value.offeredVehicleIds?.length
                          ? [...value.offeredVehicleIds]
                          : [...allIds];
                        const next = current.includes(vehicle.id)
                          ? current.filter((id) => id !== vehicle.id)
                          : [...current, vehicle.id];
                        onChange({
                          ...value,
                          offeredVehicleIds:
                            next.length === 0 || next.length === allIds.length ? undefined : next,
                        });
                      }}
                    />
                    <span className="min-w-0">
                      <span className="block font-medium">{vehicle.label}</span>
                      <span className="block text-xs text-[#4a5a50]">
                        {vehicle.seats || `Max ${vehicle.maxGuests}`}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {useCostingRates && costingTransport ? (
            <>
              <div className="rounded-2xl border border-[#c5cbb8] bg-[#f6f8f1] p-4">
                <p className="text-sm font-medium text-[#26352b]">Set the same operational cost for all</p>
                <p className="mt-0.5 text-xs text-[#4a5a50]">
                  Then adjust each vehicle card. Capacity stays per vehicle.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="flex h-11 items-stretch overflow-hidden rounded-xl border border-[#c5cbb8] bg-white">
                    <span className="grid place-items-center border-r border-[#c5cbb8] bg-[#faf8f3] px-3 text-sm font-semibold text-[#4a5a50]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={fillCost}
                      onChange={(e) => setFillCost(e.target.value)}
                      className="w-28 border-0 bg-transparent px-3 text-sm text-[#26352b] outline-none"
                      aria-label="Operational cost in rupees"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyCostingFillAll}
                    className="h-11 rounded-full bg-[#364037] px-4 text-sm font-semibold text-[#f8f6f1]"
                  >
                    Apply cost to all
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#26352b]">
                  Vehicle rates (₹ / vehicle) & capacity
                </h3>
                <p className="mt-0.5 text-xs text-[#4a5a50]">
                  Like curated journeys — guests pick a type; vehicles = ceil(guests ÷ capacity) unless they
                  choose more. Cost is operational (margin + GST applied by the engine).
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {visibleFleet.map((vehicle) => {
                    const rate = rateForVehicle(costingTransport, vehicle.id, vehicle.maxGuests);
                    const photo = vehicle.images?.[0] || vehicle.image;
                    return (
                      <div key={vehicle.id} className="space-y-2 rounded-2xl border border-[#c5cbb8] bg-white p-4">
                        <div className="flex gap-3">
                          <div className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#eef1e6]">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photo} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="grid h-full place-items-center text-[10px] font-semibold tracking-wide text-[#8a9a8c] uppercase">
                                No photo
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#26352b]">{vehicle.label}</p>
                            <p className="mt-0.5 text-xs text-[#4a5a50]">
                              {vehicle.seats || `Max ${vehicle.maxGuests}`}
                            </p>
                            <p className="mt-1 text-xs font-medium text-[#5a6b5c]">
                              {formatINR(rate.cost)} · {rate.capacity} guests
                            </p>
                          </div>
                        </div>
                        <Field label="Cost / vehicle (₹)">
                          <input
                            type="number"
                            min={0}
                            value={rate.cost}
                            onChange={(e) =>
                              setCostingRate(vehicle.id, {
                                cost: Math.max(0, Math.round(Number(e.target.value) || 0)),
                              })
                            }
                            className={inputClass}
                          />
                        </Field>
                        <Field label="Capacity (guests)">
                          <input
                            type="number"
                            min={1}
                            value={rate.capacity}
                            onChange={(e) =>
                              setCostingRate(vehicle.id, {
                                capacity: Math.max(1, Math.round(Number(e.target.value) || 1)),
                              })
                            }
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-[#c5cbb8] bg-[#f6f8f1] p-4">
                <p className="text-sm font-medium text-[#26352b]">Set the same starting price for all</p>
                <p className="mt-0.5 text-xs text-[#4a5a50]">Then adjust each vehicle card if needed.</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="flex h-11 items-stretch overflow-hidden rounded-xl border border-[#c5cbb8] bg-white">
                    <span className="grid place-items-center border-r border-[#c5cbb8] bg-[#faf8f3] px-3 text-sm font-semibold text-[#4a5a50]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={fillFrom}
                      onChange={(e) => setFillFrom(e.target.value)}
                      className="w-28 border-0 bg-transparent px-3 text-sm text-[#26352b] outline-none"
                      aria-label="Starting price in rupees"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyFillAll}
                    className="h-11 rounded-full bg-[#364037] px-4 text-sm font-semibold text-[#f8f6f1]"
                  >
                    Apply to all
                  </button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {visibleFleet.map((vehicle) => {
                  const amount = value.prices[vehicle.id] ?? display[vehicle.id] ?? 0;
                  const photo = vehicle.images?.[0] || vehicle.image;
                  return (
                    <div key={vehicle.id} className="rounded-2xl border border-[#c5cbb8] bg-white p-4">
                      <div className="flex gap-3">
                        <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#eef1e6]">
                          {photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={photo} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid h-full place-items-center text-[10px] font-semibold tracking-wide text-[#8a9a8c] uppercase">
                              No photo
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#26352b]">{vehicle.label}</p>
                          <p className="mt-0.5 text-xs text-[#4a5a50]">
                            {vehicle.seats || `Max ${vehicle.maxGuests}`}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[#5a6b5c]">{formatINR(amount)}</p>
                        </div>
                      </div>
                      <label className="mt-3 block text-xs font-medium tracking-wide text-[#4a5a50] uppercase">
                        Price for this listing (₹)
                        <input
                          type="number"
                          min={0}
                          value={value.prices[vehicle.id] ?? amount}
                          onChange={(e) => setPrice(vehicle.id, e.target.value)}
                          className={cn(inputClass, "mt-1.5")}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!fleet.length ? (
            <p className="rounded-xl border border-dashed border-[#c5cbb8] px-4 py-4 text-sm text-[#4a5a50]">
              No active vehicles.{" "}
              <Link href="/admin/fleet" className="font-semibold text-[#364037] underline">
                Add vehicles in Studio
              </Link>
              .
            </p>
          ) : null}
        </>
      ) : (
        <p className="rounded-2xl border border-dashed border-[#c5cbb8] px-4 py-5 text-sm text-[#4a5a50]">
          Transport is off for this listing. Guests won’t be asked about a TRIS vehicle.
        </p>
      )}
    </div>
  );
}

export function transportEditorFromListing(input: {
  transportMode?: string | null;
  transportAvailable?: boolean;
  transportPrice?: number;
  transportNote?: string;
  transportVehicles?: TransportVehiclePrices;
  offeredVehicleIds?: string[];
  variant: "experience" | "journey";
  fleet?: FleetVehicle[];
}): TransportEditorValue {
  const mode =
    input.variant === "experience"
      ? ((input.transportMode as TransportEditorValue["mode"]) ??
        (input.transportAvailable === false ? "none" : "optional"))
      : input.transportAvailable === false
        ? "none"
        : "optional";
  const base = input.transportPrice && input.transportPrice > 0 ? input.transportPrice : 2500;
  const fleet = input.fleet?.length ? input.fleet : DEFAULT_FLEET_VEHICLES;
  const prices = pricesFromFleet(fleet, input.transportVehicles ?? {}, base);
  return {
    mode,
    available: input.variant === "journey" ? input.transportAvailable !== false : mode !== "none",
    note: input.transportNote ?? "",
    basePrice: base,
    prices,
    offeredVehicleIds: input.offeredVehicleIds?.length ? [...input.offeredVehicleIds] : undefined,
  };
}

export function transportFieldsFromEditor(value: TransportEditorValue) {
  const prices: TransportVehiclePrices = {};
  for (const [id, amount] of Object.entries(value.prices)) {
    if (amount != null && Number.isFinite(amount) && amount >= 0) {
      prices[id] = Math.round(amount);
    }
  }
  const first = Object.values(prices).find((n) => n != null && n > 0);
  const basePrice = value.basePrice ?? first;

  return {
    transportMode: value.mode,
    transportAvailable: value.mode !== "none" && value.available !== false,
    transportPrice: basePrice && basePrice > 0 ? basePrice : undefined,
    transportNote: value.note.trim(),
    transportVehicles: Object.keys(prices).length ? prices : undefined,
    offeredVehicleIds: value.offeredVehicleIds?.length ? [...value.offeredVehicleIds] : undefined,
  };
}
