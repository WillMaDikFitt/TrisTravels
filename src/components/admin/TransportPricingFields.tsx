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
import { fetchFleetVehicles } from "@/lib/actions/content-read";
import { cn, formatINR } from "@/lib/utils";

export type TransportEditorValue = {
  mode: "none" | "optional" | "required";
  available?: boolean;
  note: string;
  prices: TransportVehiclePrices;
  basePrice?: number;
};

type Props = {
  variant: "experience" | "journey";
  value: TransportEditorValue;
  onChange: (next: TransportEditorValue) => void;
  /** When operational costing owns transport price, hide per-vehicle transfer rates. */
  hideVehiclePrices?: boolean;
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

/**
 * Listing-level transport offer + prices.
 * Vehicle catalogue (names, photos, defaults) is managed under Studio → Vehicles.
 */
export function TransportPricingFields({ variant, value, onChange, hideVehiclePrices }: Props) {
  const [fleet, setFleet] = useState<FleetVehicle[]>(DEFAULT_FLEET_VEHICLES);
  const offered = variant === "experience" ? value.mode !== "none" : value.available !== false;
  const display = useMemo(
    () => pricesFromFleet(fleet, value.prices, value.basePrice),
    [fleet, value.prices, value.basePrice],
  );
  const [fillFrom, setFillFrom] = useState(String(value.basePrice || display.sedan || 2500));

  useEffect(() => {
    fetchFleetVehicles()
      .then((rows) => {
        if (rows?.length) setFleet(transferFleetVehicles(rows));
      })
      .catch(() => undefined);
  }, []);

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-[#26352b]">Transportation</h2>
          <p className="mt-1 text-sm text-[#4a5a50]">
            {hideVehiclePrices
              ? "Choose whether TRIS transport is required or optional. Vehicle cost & capacity live under Operational costing."
              : variant === "experience"
                ? "Decide if TRIS provides a vehicle, then set prices for this listing."
                : "Prices shown on the journey enquire form when guests request a transfer."}
          </p>
        </div>
        {!hideVehiclePrices ? (
          <Link
            href="/admin/fleet"
            className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#364037] hover:border-[#8fa183]"
          >
            Manage vehicles & photos
          </Link>
        ) : null}
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

          {hideVehiclePrices ? (
            <p className="rounded-2xl border border-dashed border-[#c5cbb8] bg-[#faf8f3] px-4 py-3 text-sm text-[#4a5a50]">
              Vehicle cost and capacity for this booking engine are set in Operational costing above.
            </p>
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
                {fleet.map((vehicle) => {
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
          )}
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
  variant: "experience" | "journey";
  fleet?: FleetVehicle[];
}): TransportEditorValue {
  const mode =
    input.variant === "experience"
      ? ((input.transportMode as TransportEditorValue["mode"]) ??
        (input.transportAvailable ? "optional" : "none"))
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
  };
}
