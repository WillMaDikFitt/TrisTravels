"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Calendar, Clock, Users } from "lucide-react";
import { fetchClosuresForExperience } from "@/lib/actions/content-read";
import { dateIsClosed, DEFAULT_SLOTS } from "@/lib/catalog";
import type { ClosureRecord } from "@/lib/types";

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
  const slots = experience.slots?.length ? experience.slots : DEFAULT_SLOTS;
  const minGuests = experience.minGuests ?? 1;
  const [date, setDate] = useState(defaultDate);
  const [slot, setSlot] = useState(slots[0]);
  const [guests, setGuests] = useState(Math.max(minGuests, 2));
  const [closures, setClosures] = useState<ClosureRecord[]>([]);

  useEffect(() => {
    fetchClosuresForExperience(experience.slug).then(setClosures).catch(() => setClosures([]));
  }, [experience.slug]);

  const closed = dateIsClosed(date, closures);
  const instant = isInstantBookingDate(date);
  const total = useMemo(() => experience.priceFrom * guests, [experience.priceFrom, guests]);

  const startBooking = () => {
    if (closed) return;
    const params = new URLSearchParams({
      date,
      slot,
      guests: String(guests),
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
            closed ? "text-primary" : instant ? "text-on-surface-variant" : "text-primary",
          )}
        >
          {closed
            ? "This date is closed or sold out. Choose another."
            : instant
              ? `${BOOKING_NOTICE_DAYS}+ days ahead — book online.`
              : `Within ${BOOKING_NOTICE_DAYS} days — request booking (we confirm availability).`}
        </p>

        <label className="mt-2.5 block text-sm font-medium text-secondary">
          <span className="flex items-center gap-2">
            <Clock size={14} className="text-primary" /> Slot
          </span>
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className={inputClass}>
            {slots.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-2.5 block text-sm font-medium text-secondary">
          <span className="flex items-center gap-2">
            <Users size={14} className="text-primary" /> Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={inputClass}
          >
            {Array.from({ length: experience.maxGuests - minGuests + 1 }, (_, i) => i + minGuests).map(
              (n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ),
            )}
          </select>
        </label>

        <div className="mt-3 space-y-1 border-t border-outline-variant/20 pt-2.5 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>
              {formatINR(experience.priceFrom)} × {guests}
            </span>
            <span>{formatINR(experience.priceFrom * guests)}</span>
          </div>
          <div className="flex justify-between font-semibold text-primary">
            <span>{instant ? "Total payable" : "Estimated total"}</span>
            <span>{formatINR(total)}</span>
          </div>
        </div>
      </div>

      <div className={cn("bg-surface-container-lowest pt-3", !compact && "shrink-0 border-t border-outline-variant/20")}>
        <Button onClick={startBooking} className="w-full" size="md" disabled={closed}>
          {instant ? "Continue to book" : "Request to book"}
        </Button>
        <p className="mt-1.5 text-center text-[10px] text-on-surface-variant">
          {instant ? "Checkout · demo mode" : "We’ll confirm within 24 hours"}
        </p>
      </div>
    </div>
  );
}
