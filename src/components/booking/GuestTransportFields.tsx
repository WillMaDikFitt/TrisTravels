"use client";

import { Check, Minus, Plus, UsersRound, CarFront } from "lucide-react";
import { FormInput } from "@/components/ui/Form";
import { cn } from "@/lib/utils";
import type { TransportVehicleOption } from "@/data/transport";

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
          note={compact ? "0–17" : "17 years and under"}
          value={children}
          min={0}
          max={remainingForKids}
          onChange={onChildren}
        />
      </div>

      {children > 0 && (
        <div className={cn("grid gap-3", compact ? "grid-cols-2" : "sm:grid-cols-2")}>
          {Array.from({ length: children }, (_, index) => (
            <FormInput
              key={index}
              label={`Child ${index + 1} age`}
              name={`child-age-${index}`}
              type="number"
              min={0}
              max={17}
              required
              value={String(childAges[index] ?? "")}
              onChange={(v) => onChildAge(index, Number(v))}
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
                  <p className="text-xs font-semibold">{option.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-on-surface-variant">
                    {option.seats}
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
                  <p className="text-sm font-semibold">{option.label}</p>
                  <p className="mt-0.5 text-xs text-on-surface-variant">{option.seats}</p>
                  <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                    {option.summary}
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
