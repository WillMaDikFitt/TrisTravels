"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  formatINR,
  daysFromNow,
  cn,
  isInstantBookingDate,
  BOOKING_NOTICE_DAYS,
} from "@/lib/utils";
import type { Experience } from "@/data/experiences";
import { Calendar, Users, Car } from "lucide-react";

type Props = {
  experience: Experience;
  compact?: boolean;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-outline-variant/35 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

export function BookingWidget({ experience, compact }: Props) {
  const router = useRouter();
  const earliest = daysFromNow(1);
  const defaultDate = daysFromNow(BOOKING_NOTICE_DAYS);
  const [date, setDate] = useState(defaultDate);
  const [guests, setGuests] = useState(2);
  const [ride, setRide] = useState(false);

  const rideFee = 1800;
  const instant = isInstantBookingDate(date);
  const total = useMemo(() => {
    return experience.priceFrom * guests + (ride ? rideFee : 0);
  }, [experience.priceFrom, guests, ride]);

  const startBooking = () => {
    const params = new URLSearchParams({
      date,
      guests: String(guests),
      ride: ride ? "1" : "0",
      request: instant ? "0" : "1",
    });
    router.push(`/experiences/${experience.slug}/book?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-ambient",
        compact
          ? "p-4"
          : "sticky top-[calc(var(--header-offset)+0.5rem)] z-20 flex max-h-[calc(100svh-var(--header-offset)-1rem)] flex-col overflow-hidden p-4",
      )}
    >
      <div className={cn(!compact && "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5")}>
        <p className="text-xs text-on-surface-variant">From</p>
        <p className="font-display text-2xl leading-tight text-primary">
          {formatINR(experience.priceFrom)}
          <span className="text-sm font-normal text-on-surface-variant"> / person</span>
        </p>

        <label className="mt-3 block text-sm font-medium text-secondary">
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" /> Date
          </span>
          <input
            type="date"
            min={earliest}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </label>
        <p
          className={cn(
            "mt-1.5 text-[10px] leading-snug",
            instant ? "text-on-surface-variant" : "text-primary",
          )}
        >
          {instant
            ? `${BOOKING_NOTICE_DAYS}+ days ahead — book online.`
            : `Within ${BOOKING_NOTICE_DAYS} days — request booking (we confirm availability).`}
        </p>

        <label className="mt-2.5 block text-sm font-medium text-secondary">
          <span className="flex items-center gap-2">
            <Users size={14} className="text-primary" /> Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={inputClass}
          >
            {Array.from({ length: experience.maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-lg border border-outline-variant/30 bg-surface-container-low p-2.5 transition hover:border-primary/40">
          <input
            type="checkbox"
            checked={ride}
            onChange={(e) => setRide(e.target.checked)}
            className="mt-0.5 accent-[var(--primary)]"
          />
          <span>
            <span className="flex items-center gap-1.5 text-sm font-medium text-secondary">
              <Car size={14} className="text-primary" /> Trusted Local Ride
            </span>
            <span className="mt-0.5 block text-[10px] text-on-surface-variant">
              Optional · +{formatINR(rideFee)}
            </span>
          </span>
        </label>

        <div className="mt-3 space-y-1 border-t border-outline-variant/20 pt-2.5 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>
              {formatINR(experience.priceFrom)} × {guests}
            </span>
            <span>{formatINR(experience.priceFrom * guests)}</span>
          </div>
          {ride && (
            <div className="flex justify-between text-on-surface-variant">
              <span>Local ride</span>
              <span>{formatINR(rideFee)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-primary">
            <span>{instant ? "Total payable" : "Estimated total"}</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "bg-surface-container-lowest pt-3",
          !compact && "shrink-0 border-t border-outline-variant/20",
        )}
      >
        <Button onClick={startBooking} className="w-full" size="md">
          {instant ? "Check Availability" : "Request Booking"}
        </Button>
        <p className="mt-1.5 text-center text-[10px] text-on-surface-variant">
          {instant ? "Razorpay · demo mode" : "We’ll confirm within 24 hours · demo"}
        </p>
      </div>
    </div>
  );
}
