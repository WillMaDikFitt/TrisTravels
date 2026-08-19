"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  formatINR,
  cn,
  daysFromNow,
  isInstantBookingDate,
  BOOKING_NOTICE_DAYS,
} from "@/lib/utils";
import type { Experience } from "@/data/experiences";
import { FormInput } from "@/components/ui/Form";
import { Check, CreditCard } from "lucide-react";
import { confirmPayment, createBooking } from "@/lib/actions/bookings";
import { useAuth } from "@/components/auth/AuthProvider";
import type { BookingRecord } from "@/lib/types";
import { experienceSlots } from "@/lib/experience-slots";
import { fetchClosuresForExperience } from "@/lib/actions/content-read";
import { dateIsClosed } from "@/lib/catalog";
import type { ClosureRecord } from "@/lib/types";
import { transportVehicleOptions } from "@/data/transport";
import { adultRate, childRate } from "@/lib/pricing";
import { GuestCompositionFields, TransportVehicleFields } from "@/components/booking/GuestTransportFields";
import {
  FieldGroup,
  FlowActions,
  FlowHeading,
  FlowShell,
  FlowSummary,
  SecureNote,
} from "@/components/forms/FlowUI";

function parseAges(raw: string | null, count: number) {
  if (!raw || count <= 0) return [] as number[];
  const parsed = raw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
  return Array.from({ length: count }, (_, i) => parsed[i] ?? 8);
}

export function BookingFlow({ experience }: { experience: Experience }) {
  const search = useSearchParams();
  const { user, profile } = useAuth();
  const slots = experienceSlots(experience);
  const vehicles = useMemo(
    () => transportVehicleOptions(experience.transportPrice, experience.transportVehicles),
    [experience.transportPrice, experience.transportVehicles],
  );
  const minGuests = experience.minGuests ?? 1;
  const initialChildren = Math.max(0, Number(search.get("children") ?? 0));
  const fallbackGuests = Number(search.get("guests") ?? Math.max(minGuests, 2));
  const initialAdults = Math.max(
    1,
    Number(search.get("adults") ?? Math.max(1, fallbackGuests - initialChildren)),
  );

  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState(search.get("slot") || slots[0]);
  const [date, setDate] = useState(search.get("date") || daysFromNow(BOOKING_NOTICE_DAYS));
  const [adults, setAdults] = useState(
    Math.min(experience.maxGuests, Math.max(1, Number(search.get("adults") ?? initialAdults))),
  );
  const [children, setChildren] = useState(
    Math.min(experience.maxGuests - 1, initialChildren),
  );
  const [childAges, setChildAges] = useState<number[]>(
    parseAges(search.get("childAges"), initialChildren),
  );
  const [transportation, setTransportation] = useState(
    search.get("transport") === "1" && Boolean(experience.transportAvailable),
  );
  const [vehicleId, setVehicleId] = useState<string>(search.get("vehicle") || vehicles[0]?.id || "sedan");
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [closures, setClosures] = useState<ClosureRecord[]>([]);

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email || user?.email) setEmail((e) => e || profile?.email || user?.email || "");
    if (profile?.phone) setPhone((p) => p || profile.phone || "");
  }, [profile, user?.email]);
  useEffect(() => {
    fetchClosuresForExperience(experience.slug).then(setClosures).catch(() => setClosures([]));
  }, [experience.slug]);
  const [done, setDone] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  const requestMode =
    search.get("request") === "1" || (date ? !isInstantBookingDate(date) : false);

  const steps = requestMode
    ? ["Details", "Contact", "Submit request"]
    : ["Details", "Contact", "Pay"];

  const guests = adults + children;
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
    if (nextChildren !== children) {
      setChildren(nextChildren);
      setChildAges((prev) => Array.from({ length: nextChildren }, (_, i) => prev[i] ?? 8));
    }
  };

  const detailsReady =
    Boolean(date) &&
    !dateIsClosed(date, closures, slot) &&
    guests >= minGuests &&
    guests <= experience.maxGuests &&
    (children === 0 || childAges.length === children) &&
    (!transportation || Boolean(vehicleId));

  const persist = async () => {
    const result = await createBooking({
      experienceSlug: experience.slug,
      date,
      slot,
      adults,
      children,
      childAges: children > 0 ? childAges : undefined,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      uid: user?.uid,
      request: requestMode,
      transportation,
      transportVehicle: transportation ? vehicleId : undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setBooking(result.booking);
    return result.booking;
  };

  const finishRequest = async () => {
    setPaying(true);
    setError("");
    const rec = await persist();
    setPaying(false);
    if (rec) {
      setDone(true);
      setStep(2);
    }
  };

  const finishPay = async () => {
    setPaying(true);
    setError("");
    try {
      const rec = booking ?? (await persist());
      if (!rec) return;
      await confirmPayment(rec.id);
      setDone(true);
      setStep(2);
    } catch {
      setError("Payment simulation failed. Try again.");
    } finally {
      setPaying(false);
    }
  };

  if (done && booking) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center shadow-ambient md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-primary">
          <Check size={32} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-primary">
          {requestMode ? "Request received" : "Booking reserved"}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          {requestMode ? (
            <>
              Request for <strong>{experience.name}</strong> on {date}. Dates within{" "}
              {BOOKING_NOTICE_DAYS} days need confirmation — ref {booking.id}.
            </>
          ) : (
            <>
              Confirmation for <strong>{experience.name}</strong> on {date} at {slot}. Your
              place is held — ref {booking.id}.
            </>
          )}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={`/experiences/${experience.slug}`}>Back to experience</Button>
          <Button href="/account" variant="ghost">
            My bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <FlowShell steps={steps} current={step}>
        {requestMode && (
          <p className="mb-7 rounded-2xl border border-primary/25 bg-secondary-container/60 px-4 py-3 text-sm leading-relaxed text-secondary">
            This date is within {BOOKING_NOTICE_DAYS} days — submit a request and we’ll confirm
            availability.
          </p>
        )}

        {step === 0 && (
          <div>
            <FlowHeading
              eyebrow="Trip details"
              title="Choose your date and travellers"
              body="Tell us who is joining. Child ages and transport choices update your total automatically."
            />

            <div className="space-y-4">
              <FieldGroup title="Date & travellers" body={`This experience hosts up to ${experience.maxGuests} guests.`}>
                <div className="space-y-5">
                  <FormInput
                    label="Experience date"
                    name="booking-date"
                    type="date"
                    min={daysFromNow(1)}
                    value={date}
                    onChange={setDate}
                    required
                  />
                <GuestCompositionFields
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
                </div>
              </FieldGroup>

              <FieldGroup title="Start time" body="Unavailable times are disabled automatically.">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {slots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={dateIsClosed(date, closures, s)}
                      onClick={() => setSlot(s)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:bg-surface-container disabled:text-on-surface-variant/40",
                        slot === s
                          ? "border-primary bg-primary text-on-primary shadow-sm"
                          : "border-outline-variant/40 bg-surface-container-lowest text-primary hover:border-primary/50",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              {experience.transportAvailable && (
                <FieldGroup title="Getting there" body="Optional private transport can be added to this booking.">
                  <TransportVehicleFields
                    options={vehicles}
                    enabled={transportation}
                    vehicleId={vehicleId}
                    note={experience.transportNote}
                    onEnabled={setTransportation}
                    onVehicle={setVehicleId}
                  />
                </FieldGroup>
              )}
            </div>

            {dateIsClosed(date, closures) && (
              <p className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                This date is fully unavailable. Please choose another date.
              </p>
            )}
            <FlowActions>
              <SecureNote request={requestMode} />
              <Button className="sm:ml-auto" size="lg" onClick={() => setStep(1)} disabled={!detailsReady}>
                Continue to contact
              </Button>
            </FlowActions>
          </div>
        )}

        {step === 1 && (
          <div>
            <FlowHeading
              eyebrow="Contact details"
              title="Where should we send your confirmation?"
              body="We’ll only use these details for this booking and essential trip updates."
            />
            <FieldGroup title="Lead traveller">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput className="sm:col-span-2" label="Full name" name="name" value={name} onChange={setName} required autoComplete="name" />
                <FormInput
                  label="Email address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  required
                  autoComplete="email"
                />
                <FormInput
                  label="Mobile number"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  required
                  autoComplete="tel"
                />
              </div>
            </FieldGroup>
            <FlowActions>
              <Button variant="text" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button size="lg" onClick={() => setStep(2)} disabled={!name || !email || !phone}>
                {requestMode ? "Review request" : "Review booking"}
              </Button>
            </FlowActions>
          </div>
        )}

        {step === 2 && (
          <div>
            <FlowHeading
              eyebrow="Final check"
              title={requestMode ? "Review your request" : "Review your booking"}
              body="Please check the details below before continuing."
            />
            <div className="space-y-3 rounded-2xl border border-outline-variant/25 bg-surface-container-low/65 p-5 text-sm md:p-6">
              <Row label="Experience" value={experience.name} />
              <Row label="Date" value={date} />
              <Row label="Time" value={slot} />
              <Row label="Adults" value={String(adults)} />
              {children > 0 && (
                <Row
                  label="Children"
                  value={`${children} · ages ${childAges.join(", ")}`}
                />
              )}
              {transportation && selectedVehicle && (
                <Row
                  label="Transportation"
                  value={`${selectedVehicle.label} · ${formatINR(selectedVehicle.price)}`}
                />
              )}
              <Row label="Guest name" value={name} />
              <div className="border-t border-outline-variant/30 pt-3">
                <Row label={requestMode ? "Estimated total" : "Total payable"} value={formatINR(total)} bold />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-primary">{error}</p>}
            <FlowActions>
              <Button variant="text" onClick={() => setStep(1)}>
                Back
              </Button>
              {requestMode ? (
                <Button size="lg" onClick={finishRequest} disabled={paying}>
                  {paying ? "Submitting…" : "Submit request"}
                </Button>
              ) : (
                <Button size="lg" onClick={finishPay} disabled={paying} className="gap-2">
                  <CreditCard size={16} />
                  {paying ? "Processing…" : "Confirm & pay"}
                </Button>
              )}
            </FlowActions>
          </div>
        )}
      </FlowShell>

      <FlowSummary
        eyebrow={requestMode ? "Request summary" : "Booking summary"}
        title={experience.name}
        subtitle={`${experience.location} · ${experience.duration}`}
        footer={
          <Link href={`/experiences/${experience.slug}`} className="text-sm font-semibold text-accent hover:underline">
            ← View experience details
          </Link>
        }
      >
        <div className="mt-6 space-y-2 text-sm">
          <Row label={`Adults × ${adults}`} value={formatINR(adultRate(experience) * adults)} />
          {children > 0 && (
            <Row label={`Children × ${children}`} value={formatINR(childRate(experience) * children)} />
          )}
          {transportation && selectedVehicle && (
            <Row label={selectedVehicle.label} value={formatINR(selectedVehicle.price)} />
          )}
          <div className="mt-4 border-t border-outline-variant/25 pt-4">
            <Row label={requestMode ? "Estimated total" : "Total"} value={formatINR(total)} bold />
          </div>
        </div>
      </FlowSummary>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", bold && "font-semibold text-primary")}>
      <span className={bold ? undefined : "text-on-surface-variant"}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
