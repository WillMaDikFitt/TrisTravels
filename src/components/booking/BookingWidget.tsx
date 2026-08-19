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
import { fetchClosuresForExperience } from "@/lib/actions/content-read";
import { dateIsClosed } from "@/lib/catalog";
import type { ClosureRecord } from "@/lib/types";
import { experienceSlots } from "@/lib/experience-slots";
import { transportVehicleOptions } from "@/data/transport";
import { adultRate, childRate } from "@/lib/pricing";
import { GuestCompositionFields, TransportVehicleFields } from "@/components/booking/GuestTransportFields";

type Props = {
  experience: Experience;
  compact?: boolean;
};

export function BookingWidget({ experience, compact }: Props) {
  const router = useRouter();
  const earliest = daysFromNow(1);
  const defaultDate = daysFromNow(BOOKING_NOTICE_DAYS);
  const slots = experienceSlots(experience);
  const minGuests = experience.minGuests ?? 1;
  const vehicles = useMemo(
    () => transportVehicleOptions(experience.transportPrice, experience.transportVehicles),
    [experience.transportPrice, experience.transportVehicles],
  );
  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState(slots[0]);
  const [adults, setAdults] = useState(Math.max(minGuests, 2));
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [transportation, setTransportation] = useState(false);
  const [vehicleId, setVehicleId] = useState<string>(vehicles[0]?.id ?? "sedan");
  const [closures, setClosures] = useState<ClosureRecord[]>([]);

  useEffect(() => {
    fetchClosuresForExperience(experience.slug).then(setClosures).catch(() => setClosures([]));
  }, [experience.slug]);

  const guests = adults + children;
  const availableSlots = slots.filter((time) => !dateIsClosed(date, closures, time));
  const selectedSlotClosed = dateIsClosed(date, closures, slot);
  const fullyClosed = availableSlots.length === 0;
  const instant = isInstantBookingDate(date);
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];
  const transportFee = transportation ? selectedVehicle?.price ?? 0 : 0;
  const guestSubtotal = adultRate(experience) * adults + childRate(experience) * children;
  const total = guestSubtotal + transportFee;

  const syncChildren = (next: number) => {
    const capped = Math.min(next, Math.max(0, experience.maxGuests - adults));
    setChildren(capped);
    setChildAges((prev) => Array.from({ length: capped }, (_, i) => prev[i] ?? 8));
  };

  const syncAdults = (next: number) => {
    const capped = Math.min(Math.max(1, next), experience.maxGuests);
    const nextChildren = Math.min(children, Math.max(0, experience.maxGuests - capped));
    setAdults(capped);
    if (nextChildren !== children) syncChildren(nextChildren);
  };

  const startBooking = () => {
    if (selectedSlotClosed) return;
    if (guests < minGuests || guests > experience.maxGuests) return;
    if (children > 0 && childAges.length !== children) return;
    const params = new URLSearchParams({
      date,
      slot,
      adults: String(adults),
      children: String(children),
      request: instant ? "0" : "1",
    });
    if (children > 0) params.set("childAges", childAges.join(","));
    if (transportation) {
      params.set("transport", "1");
      params.set("vehicle", vehicleId);
    }
    router.push(`/experiences/${experience.slug}/book?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest shadow-[0_16px_40px_rgba(42,46,31,0.08)]",
        compact
          ? "p-4"
          : "z-20 flex max-h-[calc(100svh-var(--header-offset)-1.5rem)] flex-col",
      )}
    >
      <div className={cn(compact ? "" : "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-2")}>
        <p className="label-caps text-accent">From</p>
        <p className="mt-1 font-display text-2xl leading-tight text-primary">
          {formatINR(adultRate(experience))}
          <span className="text-sm font-normal text-on-surface-variant"> / adult</span>
        </p>
        <p className="mt-1 text-xs text-on-surface-variant">
          Children {formatINR(childRate(experience))} each · max {experience.maxGuests} guests
        </p>

        <div className="mt-4 space-y-3">
          <FormInput
            label="Date"
            name="widget-date"
            type="date"
            min={earliest}
            value={date}
            onChange={setDate}
            required
          />
          <p
            className={cn(
              "text-[11px] leading-snug",
              selectedSlotClosed || !instant ? "text-accent" : "text-on-surface-variant",
            )}
          >
            {fullyClosed
              ? "All slots are closed or sold out on this date."
              : selectedSlotClosed
                ? "This slot is unavailable. Choose another time."
                : instant
                  ? `${BOOKING_NOTICE_DAYS}+ days ahead — book online now.`
                  : `Within ${BOOKING_NOTICE_DAYS} days — we’ll confirm availability first.`}
          </p>

          <div>
            <p className="text-[13px] font-semibold text-primary">Start time</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {slots.map((time) => {
                const unavailable = dateIsClosed(date, closures, time);
                return (
                  <button
                    key={time}
                    type="button"
                    disabled={unavailable}
                    onClick={() => setSlot(time)}
                    className={cn(
                      "rounded-xl border px-2.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-35",
                      slot === time
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant/40 bg-surface-container-lowest text-primary hover:border-primary/40",
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>

          <GuestCompositionFields
            compact
            adults={adults}
            children={children}
            childAges={childAges}
            maxGuests={experience.maxGuests}
            minGuests={minGuests}
            onAdults={syncAdults}
            onChildren={syncChildren}
            onChildAge={(index, age) =>
              setChildAges((prev) => prev.map((value, i) => (i === index ? age : value)))
            }
          />

          {experience.transportAvailable && (
            <TransportVehicleFields
              compact
              options={vehicles}
              enabled={transportation}
              vehicleId={vehicleId}
              note={experience.transportNote}
              onEnabled={setTransportation}
              onVehicle={setVehicleId}
            />
          )}
        </div>

        <div className="mt-4 space-y-1.5 border-t border-outline-variant/25 pt-3 text-sm">
          {adults > 0 && (
            <div className="flex justify-between text-on-surface-variant">
              <span>
                Adults × {adults}
              </span>
              <span>{formatINR(adultRate(experience) * adults)}</span>
            </div>
          )}
          {children > 0 && (
            <div className="flex justify-between text-on-surface-variant">
              <span>
                Children × {children}
              </span>
              <span>{formatINR(childRate(experience) * children)}</span>
            </div>
          )}
          {transportation && selectedVehicle ? (
            <div className="flex justify-between text-on-surface-variant">
              <span>{selectedVehicle.label}</span>
              <span>{formatINR(selectedVehicle.price)}</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-outline-variant/20 pt-2 font-semibold text-primary">
            <span>{instant ? "Total" : "Estimated total"}</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "bg-surface-container-lowest",
          compact ? "mt-3 pt-3" : "shrink-0 border-t border-outline-variant/20 px-4 pt-3 pb-4",
        )}
      >
        <Button onClick={startBooking} className="w-full" size="md" disabled={selectedSlotClosed || fullyClosed}>
          {instant ? "Continue to book" : "Request to book"}
        </Button>
        <p className="mt-2 text-center text-[11px] text-on-surface-variant">
          {instant ? "Secure hold · confirmation by email" : "We’ll confirm within 24 hours"}
        </p>
      </div>
    </div>
  );
}
