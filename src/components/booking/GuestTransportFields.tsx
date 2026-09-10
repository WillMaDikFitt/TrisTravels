"use client";

import { Check, Minus, Plus, UsersRound, CarFront } from "lucide-react";
import { FormSelect } from "@/components/ui/Form";
import { CHILD_AGE_SELECT_OPTIONS } from "@/data/child-ages";
import { formatINR, cn } from "@/lib/utils";
import type { TransportVehicleOption } from "@/data/transport";
import type { ExperienceTransportMode } from "@/lib/experience-meta";

type GuestFieldsProps = {
  adults: number;
  children: number;
  childAges: number[];
  maxGuests: number;
  minGuests?: number;
  onAdults: (n: number) => void;
  onChildren: (n: number) => void;
  onChildAge: (index: number, age: number) => void;
  compact?: boolean;
};

function Counter({
  label,
  note,
  value,
  min,
  max,
  onChange,
  compact,
}: {
  label: string;
  note: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest",
        compact ? "gap-2 p-2.5" : "p-4",
      )}
    >
      <div className={cn("flex min-w-0 items-center", compact ? "gap-1.5" : "gap-3")}>
        {!compact && (
          <span className="grid h-10 w-10 place-items-center rounded-full bg-secondary-container text-primary">
            <UsersRound size={17} />
          </span>
        )}
        <div className="min-w-0">
          <p className={cn("font-semibold text-primary", compact ? "text-xs" : "text-sm")}>{label}</p>
          <p
            className={cn(
              "text-on-surface-variant",
              compact ? "mt-0 text-[10px] leading-tight" : "mt-0.5 text-[11px]",
            )}
          >
            {note}
          </p>
        </div>
      </div>
      <div className={cn("flex shrink-0 items-center", compact ? "gap-1.5" : "gap-2.5")}>
        <button
          type="button"
          aria-label={`Remove one ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={cn(
            "grid place-items-center rounded-full border border-outline-variant/50 text-primary transition hover:border-primary hover:bg-secondary-container disabled:cursor-not-allowed disabled:opacity-30",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <Minus size={compact ? 12 : 14} />
        </button>
        <span className={cn("text-center font-bold text-primary", compact ? "w-4 text-xs" : "w-5 text-sm")}>
          {value}
        </span>
        <button
          type="button"
          aria-label={`Add one ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={cn(
            "grid place-items-center rounded-full border border-outline-variant/50 text-primary transition hover:border-primary hover:bg-secondary-container disabled:cursor-not-allowed disabled:opacity-30",
            compact ? "h-7 w-7" : "h-8 w-8",
          )}
        >
          <Plus size={compact ? 12 : 14} />
        </button>
      </div>
    </div>
  );
}

export function GuestCompositionFields({
  adults,
  children,
  childAges,
  maxGuests,
  minGuests = 1,
  onAdults,
  onChildren,
  onChildAge,
  compact,
}: GuestFieldsProps) {
  const remainingForKids = Math.max(0, maxGuests - adults);

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <div className={cn("grid gap-2.5", compact ? "grid-cols-2" : "gap-3 sm:grid-cols-2")}>
        <Counter
          compact={compact}
          label="Adults"
          note={compact ? "18+" : "18 years and above"}
          value={adults}
          min={Math.max(1, minGuests - children)}
          max={Math.max(1, maxGuests - children)}
          onChange={onAdults}
        />
        <Counter
          compact={compact}
          label="Children"
          note={compact ? "Under 1–9" : "Ages under 1 (−1) to 9 years"}
          value={children}
          min={0}
          max={remainingForKids}
          onChange={onChildren}
        />
      </div>

      {children > 0 && (
        <div className={cn("grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
          {Array.from({ length: children }, (_, index) => (
            <FormSelect
              key={index}
              label={`Child ${index + 1} age`}
              name={`child-age-${index}`}
              required
              options={[
                { value: "", label: "Select age" },
                ...CHILD_AGE_SELECT_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ]}
              value={Number.isFinite(childAges[index]) ? String(childAges[index]) : ""}
              onChange={(v) => onChildAge(index, v === "" ? NaN : Number(v))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type TransportFieldsProps = {
  options: TransportVehicleOption[];
  enabled: boolean;
  vehicleId: string;
  vehicleCount?: number;
  note?: string;
  onEnabled: (v: boolean) => void;
  onVehicle: (id: string) => void;
  onVehicleCount?: (n: number) => void;
  compact?: boolean;
};

export function TransportVehicleFields({
  options,
  enabled,
  vehicleId,
  vehicleCount = 1,
  note,
  onEnabled,
  onVehicle,
  onVehicleCount,
  compact,
}: TransportFieldsProps) {
  return (
    <div className={cn("space-y-2", !compact && "space-y-3")}>
      <label
        className={cn(
          "flex cursor-pointer items-center rounded-2xl border text-sm text-secondary transition",
          enabled
            ? "border-primary/40 bg-secondary-container/55"
            : "border-outline-variant/30 bg-surface-container-lowest hover:border-primary/30",
          compact ? "gap-2 px-3 py-2.5" : "gap-4 p-4",
        )}
      >
        {!compact && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary">
            <CarFront size={18} />
          </span>
        )}
        <input type="checkbox" checked={enabled} onChange={(e) => onEnabled(e.target.checked)} className="sr-only" />
        <span className="min-w-0 flex-1">
          <span className="font-medium">Add transportation</span>
          <span className="mt-0.5 block text-xs text-on-surface-variant">
            Choose a vehicle type for your group
            {note ? ` · ${note}` : ""}
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition",
            enabled ? "bg-primary" : "bg-outline-variant/70",
          )}
        >
          <span
            className={cn(
              "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
              enabled ? "left-6" : "left-1",
            )}
          />
        </span>
      </label>

      {enabled &&
        (compact ? (
          <div className="grid grid-cols-2 gap-2">
            {options.map((option) => {
              const active = option.id === vehicleId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onVehicle(option.id)}
                  className={cn(
                    "rounded-xl border px-2.5 py-2 text-left transition",
                    active
                      ? "border-primary bg-secondary-container/60 text-primary"
                      : "border-outline-variant/40 bg-surface-container-lowest hover:border-primary/40",
                  )}
                >
                  {option.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={option.image}
                      alt=""
                      className="mb-1.5 h-12 w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <p className="text-xs font-semibold">{option.label}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-on-surface-variant">
                    {option.idealFor}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-on-surface-variant/85">
                    {option.summary}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[9px] leading-snug text-on-surface-variant/70">
                    Luggage · {option.luggage}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((option) => {
              const active = option.id === vehicleId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onVehicle(option.id)}
                  className={cn(
                    "relative rounded-2xl border p-4 text-left transition",
                    active
                      ? "border-primary bg-secondary-container/55 text-primary shadow-[inset_0_0_0_1px_rgba(74,90,40,0.16)]"
                      : "border-outline-variant/35 bg-surface-container-lowest text-on-surface hover:-translate-y-0.5 hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-4 right-4 grid h-5 w-5 place-items-center rounded-full border",
                      active
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/70 text-transparent",
                    )}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {option.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={option.image}
                      alt=""
                      className="mb-3 h-28 w-full rounded-xl object-cover"
                    />
                  ) : null}
                  <p className="pr-8 text-sm font-semibold">{option.label}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{option.idealFor}</p>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    {option.summary}
                  </p>
                  <p className="mt-2 text-xs text-on-surface-variant">
                    <span className="font-semibold text-primary">Luggage</span>
                    <span className="mt-0.5 block">{option.luggage}</span>
                  </p>
                </button>
              );
            })}
          </div>
        ))}

      {enabled && onVehicleCount ? (
        <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3">
          <span className="text-sm font-medium text-primary">Number of vehicles</span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Fewer vehicles"
              disabled={vehicleCount <= 1}
              onClick={() => onVehicleCount(vehicleCount - 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-outline-variant/50 text-primary disabled:opacity-30"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm font-bold text-primary">{vehicleCount}</span>
            <button
              type="button"
              aria-label="More vehicles"
              disabled={vehicleCount >= 10}
              onClick={() => onVehicleCount(vehicleCount + 1)}
              className="grid h-8 w-8 place-items-center rounded-full border border-outline-variant/50 text-primary disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export type TransportChoice = "own" | "tris" | null;

type GettingThereFieldsProps = {
  mode: ExperienceTransportMode;
  options: TransportVehicleOption[];
  choice: TransportChoice;
  vehicleId: string;
  vehicleCount?: number;
  note?: string;
  onChoice: (choice: TransportChoice) => void;
  onVehicle: (id: string) => void;
  onVehicleCount?: (n: number) => void;
  compact?: boolean;
  /** Operational costing: Book TRIS / own only — no vehicle type or count picker. */
  costingTransport?: boolean;
  /** Hide per-vehicle prices (e.g. when costing engine owns the total). */
  hidePrices?: boolean;
};

function VehicleGrid({
  options,
  vehicleId,
  onVehicle,
  compact,
  hidePrices,
}: {
  options: TransportVehicleOption[];
  vehicleId: string;
  onVehicle: (id: string) => void;
  compact?: boolean;
  hidePrices?: boolean;
}) {
  return compact ? (
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => {
        const active = option.id === vehicleId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onVehicle(option.id)}
            className={cn(
              "rounded-xl border px-2.5 py-2 text-left transition",
              active
                ? "border-primary bg-secondary-container/60 text-primary"
                : "border-outline-variant/40 bg-surface-container-lowest hover:border-primary/40",
            )}
          >
            {option.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.image} alt="" className="mb-1.5 h-12 w-full rounded-lg object-cover" />
            ) : null}
            <p className="text-xs font-semibold">{option.label}</p>
            <p className="mt-0.5 text-[10px] leading-snug text-on-surface-variant">{option.idealFor}</p>
            {!hidePrices ? (
              <p className="mt-1 text-[10px] font-medium text-primary">{formatINR(option.price)}</p>
            ) : null}
          </button>
        );
      })}
    </div>
  ) : (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const active = option.id === vehicleId;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onVehicle(option.id)}
            className={cn(
              "relative rounded-2xl border p-4 text-left transition",
              active
                ? "border-primary bg-secondary-container/55 text-primary shadow-[inset_0_0_0_1px_rgba(74,90,40,0.16)]"
                : "border-outline-variant/35 bg-surface-container-lowest text-on-surface hover:-translate-y-0.5 hover:border-primary/40",
            )}
          >
            <span
              className={cn(
                "absolute top-4 right-4 z-10 grid h-5 w-5 place-items-center rounded-full border",
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant/70 text-transparent",
              )}
            >
              <Check size={11} strokeWidth={3} />
            </span>
            {option.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={option.image} alt="" className="mb-3 h-28 w-full rounded-xl object-cover" />
            ) : null}
            <p className="pr-8 text-sm font-semibold">{option.label}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{option.idealFor}</p>
            {!hidePrices ? (
              <p className="mt-3 text-lg font-semibold text-primary">{formatINR(option.price)}</p>
            ) : (
              <p className="mt-3 text-xs font-medium text-on-surface-variant">Included in total</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function GettingThereFields({
  mode,
  options,
  choice,
  vehicleId,
  vehicleCount = 1,
  note,
  onChoice,
  onVehicle,
  onVehicleCount,
  compact,
  costingTransport,
  hidePrices,
}: GettingThereFieldsProps) {
  const lowestPrice = options.length ? Math.min(...options.map((o) => o.price)) : 0;

  if (mode === "none") return null;

  if (costingTransport) {
    if (mode === "required") {
      return (
        <div className={cn("space-y-3", compact && "space-y-2")}>
          <div
            className={cn(
              "rounded-2xl border border-primary/30 bg-secondary-container/40 text-primary",
              compact ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-sm",
            )}
          >
            <p className="font-semibold">TRIS transport is included</p>
            <p className={cn("mt-1 text-on-surface-variant", compact ? "text-[10px]" : "text-xs")}>
              Choose a vehicle type for your group.
              {note ? ` ${note}` : ""}
            </p>
          </div>
          <VehicleGrid
            options={options}
            vehicleId={vehicleId}
            onVehicle={onVehicle}
            compact={compact}
            hidePrices
          />
        </div>
      );
    }

    return (
      <div className={cn("space-y-3", compact && "space-y-2")}>
        <p className={cn("font-medium text-primary", compact ? "text-xs" : "text-sm")}>
          How would you like to travel?
        </p>
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
          {[
            {
              id: "own" as const,
              title: "I'll arrange my own transport",
              body: "No transport charge added",
            },
            {
              id: "tris" as const,
              title: "Book TRIS transport",
              body: "Vehicles arranged for your group · included in total",
            },
          ].map((item) => {
            const active = choice === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChoice(item.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  active
                    ? "border-primary bg-secondary-container/55 text-primary"
                    : "border-outline-variant/35 bg-surface-container-lowest hover:border-primary/40",
                )}
              >
                <span className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                      active ? "border-primary bg-primary" : "border-outline-variant/70",
                    )}
                  >
                    {active ? <span className="h-1.5 w-1.5 rounded-full bg-on-primary" /> : null}
                  </span>
                  <span>
                    <span className={cn("block font-semibold", compact ? "text-xs" : "text-sm")}>
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-on-surface-variant",
                        compact ? "text-[10px]" : "text-xs",
                      )}
                    >
                      {item.body}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {choice === "tris" ? (
          <VehicleGrid
            options={options}
            vehicleId={vehicleId}
            onVehicle={onVehicle}
            compact={compact}
            hidePrices
          />
        ) : null}
        {note ? (
          <p className={cn("text-on-surface-variant", compact ? "text-[10px]" : "text-xs")}>{note}</p>
        ) : null}
      </div>
    );
  }

  if (mode === "required") {
    return (
      <div className={cn("space-y-3", compact && "space-y-2")}>
        <p className={cn("text-on-surface-variant", compact ? "text-[11px]" : "text-sm")}>
          Transportation is required for this experience.
          {note ? ` ${note}` : ""}
        </p>
        <p className={cn("font-medium text-primary", compact ? "text-xs" : "text-sm")}>
          Select your transport
        </p>
        <VehicleGrid
          options={options}
          vehicleId={vehicleId}
          onVehicle={onVehicle}
          compact={compact}
          hidePrices={hidePrices}
        />
        {onVehicleCount ? (
          <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3">
            <span className="text-sm font-medium text-primary">Number of vehicles</span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Fewer vehicles"
                disabled={vehicleCount <= 1}
                onClick={() => onVehicleCount(vehicleCount - 1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-outline-variant/50 text-primary disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-primary">{vehicleCount}</span>
              <button
                type="button"
                aria-label="More vehicles"
                disabled={vehicleCount >= 10}
                onClick={() => onVehicleCount(vehicleCount + 1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-outline-variant/50 text-primary disabled:opacity-30"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <p className={cn("font-medium text-primary", compact ? "text-xs" : "text-sm")}>
        How would you like to travel?
      </p>
      <div className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
        {[
          {
            id: "own" as const,
            title: "I'll arrange my own transport",
            body: "No transport charge added",
          },
          {
            id: "tris" as const,
            title: "Book TRIS transport",
            body: hidePrices
              ? "Choose a vehicle below · included in total"
              : lowestPrice
                ? `From ${formatINR(lowestPrice)}`
                : "Choose a vehicle below",
          },
        ].map((item) => {
          const active = choice === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChoice(item.id)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition",
                active
                  ? "border-primary bg-secondary-container/55 text-primary"
                  : "border-outline-variant/35 bg-surface-container-lowest hover:border-primary/40",
              )}
            >
              <span className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                    active ? "border-primary bg-primary" : "border-outline-variant/70",
                  )}
                >
                  {active ? <span className="h-1.5 w-1.5 rounded-full bg-on-primary" /> : null}
                </span>
                <span>
                  <span className={cn("block font-semibold", compact ? "text-xs" : "text-sm")}>{item.title}</span>
                  <span className={cn("mt-0.5 block text-on-surface-variant", compact ? "text-[10px]" : "text-xs")}>
                    {item.body}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {choice === "tris" ? (
        <>
          <VehicleGrid
            options={options}
            vehicleId={vehicleId}
            onVehicle={onVehicle}
            compact={compact}
            hidePrices={hidePrices}
          />
          {onVehicleCount ? (
            <div className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3">
              <span className="text-sm font-medium text-primary">Number of vehicles</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  aria-label="Fewer vehicles"
                  disabled={vehicleCount <= 1}
                  onClick={() => onVehicleCount(vehicleCount - 1)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-outline-variant/50 text-primary disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-primary">{vehicleCount}</span>
                <button
                  type="button"
                  aria-label="More vehicles"
                  disabled={vehicleCount >= 10}
                  onClick={() => onVehicleCount(vehicleCount + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-outline-variant/50 text-primary disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {note ? (
        <p className={cn("text-on-surface-variant", compact ? "text-[10px]" : "text-xs")}>{note}</p>
      ) : null}
    </div>
  );
}
