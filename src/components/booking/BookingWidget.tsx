"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/Form";
import {
  formatINR,
  daysFromNow,
  cn,
  isInstantBookingDate,
  BOOKING_NOTICE_DAYS,
} from "@/lib/utils";
import type { Experience } from "@/data/experiences";
import { fetchClosuresForExperience, fetchFleetVehicles } from "@/lib/actions/content-read";
import { dateIsClosed } from "@/lib/catalog";
import type { ClosureRecord } from "@/lib/types";
import {
  experienceSlotCapacity,
  experienceSlots,
  formatExperienceSlotLabel,
  isWholeDayExperience,
} from "@/lib/experience-slots";
import { transportVehicleOptions, type FleetVehicle } from "@/data/transport";
import { adultRate, childRate, hasExperienceCosting, quoteExperience } from "@/lib/pricing";
import { isValidChildAge } from "@/data/child-ages";
import {
  GuestCompositionFields,
  GettingThereFields,
  type TransportChoice,
} from "@/components/booking/GuestTransportFields";
import { experienceTransportMode } from "@/lib/experience-meta";

type Props = {
  experience: Experience;
  compact?: boolean;
};

export function BookingWidget({ experience }: Props) {
  const router = useRouter();
  const earliest = daysFromNow(1);
  const slots = experienceSlots(experience);
  const wholeDay = isWholeDayExperience(experience);
  const slotCapacity = experienceSlotCapacity(experience);
  const partyCap = Math.min(experience.maxGuests, slotCapacity);
  const minGuests = experience.minGuests ?? 1;
  const usingCosting = hasExperienceCosting(experience);
  const [fleet, setFleet] = useState<FleetVehicle[] | null>(null);
  const vehicles = useMemo(
    () =>
      transportVehicleOptions(
        experience.transportPrice,
        experience.transportVehicles,
        fleet,
        experience.offeredVehicleIds,
      ),
    [experience.transportPrice, experience.transportVehicles, experience.offeredVehicleIds, fleet],
  );
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(wholeDay ? slots[0] ?? "" : "");
  const [adults, setAdults] = useState(Math.max(minGuests, 1));
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const transportMode = experienceTransportMode(experience);
  const [transportChoice, setTransportChoice] = useState<TransportChoice>(
    transportMode === "required" ? "tris" : null,
  );
  const [vehicleId, setVehicleId] = useState("");
  const [vehicleCount, setVehicleCount] = useState(1);
  const [closures, setClosures] = useState<ClosureRecord[]>([]);

  useEffect(() => {
    fetchClosuresForExperience(experience.slug).then(setClosures).catch(() => setClosures([]));
  }, [experience.slug]);
  useEffect(() => {
    fetchFleetVehicles()
      .then(setFleet)
      .catch(() => setFleet(null));
  }, []);

  useEffect(() => {
    if (wholeDay && slots[0]) setSlot(slots[0]);
  }, [wholeDay, slots[0]]);

  const guests = adults + children;
  const availableSlots = slots.filter((time) => date && !dateIsClosed(date, closures, time));
  const selectedSlotClosed = Boolean(date && slot && dateIsClosed(date, closures, slot));
  const fullyClosed = Boolean(date) && availableSlots.length === 0;
  const instant = date ? isInstantBookingDate(date) : false;
  const transportation =
    transportMode === "required" || (transportMode === "optional" && transportChoice === "tris");
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const legacyTransportFee =
    !usingCosting && transportation && selectedVehicle
      ? selectedVehicle.price * vehicleCount
      : 0;
  const quote = quoteExperience(experience, adults, undefined, children, {
    trisTransport: transportation,
    transportFee: legacyTransportFee,
    vehicleCount,
  });
  const gross = quote.customerTotal;

  const syncChildren = (next: number) => {
    const capped = Math.min(next, Math.max(0, partyCap - adults));
    setChildren(capped);
    setChildAges((prev) => Array.from({ length: capped }, (_, i) => prev[i] ?? 8));
  };

  const syncAdults = (next: number) => {
    const capped = Math.min(Math.max(1, next), partyCap);
    const nextChildren = Math.min(children, Math.max(0, partyCap - capped));
    setAdults(capped);
    if (nextChildren !== children) syncChildren(nextChildren);
  };

  const transportReady =
    transportMode === "none"
      ? true
      : transportMode === "required"
        ? Boolean(vehicleId)
        : transportChoice === "own" || (transportChoice === "tris" && Boolean(vehicleId));

  const canContinue =
    Boolean(date) &&
    Boolean(slot) &&
    !selectedSlotClosed &&
    !fullyClosed &&
    guests >= minGuests &&
    guests <= partyCap &&
    (children === 0 ||
      (childAges.length === children && childAges.every(isValidChildAge))) &&
    transportReady;

  const startBooking = () => {
    if (!canContinue) return;
    const params = new URLSearchParams({
      date,
      slot,
      adults: String(adults),
      children: String(children),
      request: instant ? "0" : "1",
    });
    if (children > 0) params.set("childAges", childAges.join(","));
    if (transportMode === "optional") {
      if (transportChoice === "tris" && (usingCosting || vehicleId)) {
        params.set("transport", "1");
        if (!usingCosting && vehicleId) {
          params.set("vehicle", vehicleId);
          params.set("vehicles", String(vehicleCount));
        }
      } else if (transportChoice === "own") {
        params.set("transport", "0");
      }
    } else if (transportMode === "required") {
      params.set("transport", "1");
      if (!usingCosting && vehicleId) {
        params.set("vehicle", vehicleId);
        params.set("vehicles", String(vehicleCount));
      }
    }
    router.push(`/experiences/${experience.slug}/book?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "flex max-h-[calc(100dvh-var(--header-offset)-1.25rem)] flex-col overflow-hidden rounded-[1.35rem] border border-outline-variant/30 bg-surface-container-lowest shadow-[0_16px_40px_rgba(42,46,31,0.08)]",
        "p-3.5 md:p-4",
      )}
    >
      <div className="shrink-0">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="label-caps text-accent">From</p>
            <p className="mt-0.5 font-display text-xl leading-none text-primary md:text-[1.35rem]">
              {formatINR(experience.priceFrom || adultRate(experience))}
              <span className="text-[12px] font-normal text-on-surface-variant">
                {usingCosting ? " / person" : " / adult"}
              </span>
            </p>
          </div>
          <p className="max-w-[9.5rem] text-right text-[10px] leading-snug text-on-surface-variant">
            {usingCosting
              ? `Maximum Guest ${partyCap} Pax at a time`
              : `Child ${formatINR(childRate(experience))} · max ${partyCap}`}
          </p>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pr-0.5">
        <FormInput
          label="Date"
          name="widget-date"
          type="date"
          min={earliest}
          value={date}
          onChange={(v) => {
            setDate(v);
            setSlot(wholeDay ? slots[0] ?? "" : "");
          }}
          required
        />
        <p
          className={cn(
            "text-[10px] leading-snug",
            !date
              ? "text-on-surface-variant"
              : selectedSlotClosed || !instant
                ? "text-accent"
                : "text-on-surface-variant",
          )}
        >
          {!date
            ? `Book online ${BOOKING_NOTICE_DAYS}+ days ahead, or enquire for closer dates.`
            : fullyClosed
              ? wholeDay
                ? "This date is closed."
                : "All slots closed on this date."
              : selectedSlotClosed
                ? "This slot is unavailable."
                : instant
                  ? `${BOOKING_NOTICE_DAYS}+ days ahead — book online.`
                  : `Within ${BOOKING_NOTICE_DAYS} days — enquire availability.`}
        </p>

        <div>
          <p className="text-xs font-semibold text-primary">{wholeDay ? "Schedule" : "Start time"}</p>
          {wholeDay ? (
            <p
              className={cn(
                "mt-1.5 rounded-lg border px-3 py-2 text-sm font-semibold",
                !date || selectedSlotClosed
                  ? "border-outline-variant/30 text-on-surface-variant"
                  : "border-primary bg-primary text-on-primary",
              )}
            >
              {formatExperienceSlotLabel(slots[0] ?? "all-day", experience)}
            </p>
          ) : (
            <div className="mt-1.5 grid grid-cols-4 gap-1.5">
              {slots.map((time, index) => {
                const unavailable = !date || dateIsClosed(date, closures, time);
                return (
                  <button
                    key={`${time}-${index}`}
                    type="button"
                    disabled={unavailable}
                    onClick={() => setSlot(time)}
                    className={cn(
                      "rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-35",
                      slot === time
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/40 bg-surface-container-lowest text-primary hover:border-primary/40",
                    )}
                  >
                    {formatExperienceSlotLabel(time, experience)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <GuestCompositionFields
          compact
          adults={adults}
          children={children}
          childAges={childAges}
          maxGuests={partyCap}
          minGuests={minGuests}
          onAdults={syncAdults}
          onChildren={syncChildren}
          onChildAge={(index, age) =>
            setChildAges((prev) => prev.map((value, i) => (i === index ? age : value)))
          }
        />

        {transportMode !== "none" && (
          <GettingThereFields
            compact
            mode={transportMode}
            options={vehicles}
            choice={transportChoice}
            vehicleId={vehicleId}
            vehicleCount={vehicleCount}
            note={experience.transportNote}
            hidePrices={usingCosting}
            onChoice={(next) => {
              setTransportChoice(next);
              if (next !== "tris") setVehicleId("");
            }}
            onVehicle={setVehicleId}
            onVehicleCount={usingCosting ? undefined : setVehicleCount}
          />
        )}
      </div>

      <div className="mt-3 shrink-0 border-t border-outline-variant/25 bg-surface-container-lowest pt-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">Total (incl. GST)</span>
          <span className="font-sans text-[1.05rem] font-semibold tracking-tight text-primary">
            {formatINR(gross)}
          </span>
        </div>
      </div>

      <div className="shrink-0 pt-2.5">
        <Button onClick={startBooking} className="w-full" size="md" disabled={!canContinue}>
          {instant ? "Continue to book" : "Enquire availability"}
        </Button>
        <p className="mt-1.5 text-center text-[10px] text-on-surface-variant">
          {instant
            ? "Secure hold · email confirmation"
            : `Within ${BOOKING_NOTICE_DAYS} days — we’ll confirm availability`}
        </p>
      </div>
    </div>
  );
}
