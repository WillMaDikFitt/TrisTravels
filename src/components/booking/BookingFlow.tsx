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
import {
  experienceSlotCapacity,
  experienceSlots,
  formatExperienceSlotLabel,
  isWholeDayExperience,
} from "@/lib/experience-slots";
import { fetchClosuresForExperience, fetchFleetVehicles } from "@/lib/actions/content-read";
import { dateIsClosed } from "@/lib/catalog";
import type { ClosureRecord } from "@/lib/types";
import { transportVehicleOptions, type FleetVehicle } from "@/data/transport";
import { adultRate, childRate, hasExperienceCosting, quoteExperience } from "@/lib/pricing";
import { GuestCompositionFields, GettingThereFields, type TransportChoice } from "@/components/booking/GuestTransportFields";
import { experienceTransportMode } from "@/lib/experience-meta";
import {
  FieldGroup,
  FlowActions,
  FlowHeading,
  FlowShell,
  FlowSummary,
  SecureNote,
} from "@/components/forms/FlowUI";
import { isValidChildAge } from "@/data/child-ages";
import { site } from "@/data/site";
import { openRazorpayCheckout } from "@/lib/razorpay-client";

function parseAges(raw: string | null, count: number) {
  if (!raw || count <= 0) return [] as number[];
  const parsed = raw
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((v) => isValidChildAge(v));
  return Array.from({ length: count }, (_, i) => parsed[i] ?? NaN);
}

export function BookingFlow({ experience }: { experience: Experience }) {
  const search = useSearchParams();
  const { user, profile } = useAuth();
  const slots = experienceSlots(experience);
  const wholeDay = isWholeDayExperience(experience);
  const slotCapacity = experienceSlotCapacity(experience);
  const partyCap = Math.min(experience.maxGuests, slotCapacity);
  const [fleet, setFleet] = useState<FleetVehicle[] | null>(null);
  const vehicles = useMemo(
    () => transportVehicleOptions(experience.transportPrice, experience.transportVehicles, fleet),
    [experience.transportPrice, experience.transportVehicles, fleet],
  );
  const minGuests = experience.minGuests ?? 1;
  const initialChildren = Math.max(0, Number(search.get("children") || 0));
  const initialAdults = Math.max(
    1,
    Number(search.get("adults") || Math.max(minGuests, 1)),
  );

  const transportMode = experienceTransportMode(experience);
  const usingCosting = hasExperienceCosting(experience);
  const initialTransportChoice: TransportChoice =
    transportMode === "required"
      ? "tris"
      : search.get("transport") === "1"
        ? "tris"
        : search.get("transport") === "0"
          ? "own"
          : null;

  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState(search.get("slot") || (wholeDay ? slots[0] ?? "" : ""));
  const [date, setDate] = useState(search.get("date") || "");
  const [adults, setAdults] = useState(
    Math.min(partyCap, Math.max(1, initialAdults)),
  );
  const [children, setChildren] = useState(
    Math.min(Math.max(0, partyCap - 1), initialChildren),
  );
  const [childAges, setChildAges] = useState<number[]>(
    parseAges(search.get("childAges"), initialChildren),
  );
  const [transportChoice, setTransportChoice] = useState<TransportChoice>(initialTransportChoice);
  const [vehicleId, setVehicleId] = useState<string>(search.get("vehicle") || "");
  const [vehicleCount, setVehicleCount] = useState(
    Math.max(1, Number(search.get("vehicles") || 1)),
  );
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
  useEffect(() => {
    fetchFleetVehicles()
      .then(setFleet)
      .catch(() => setFleet(null));
  }, []);
  useEffect(() => {
    if (wholeDay && slots[0] && !slot) setSlot(slots[0]);
  }, [wholeDay, slots[0], slot]);

  const [done, setDone] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  const requestMode = date ? !isInstantBookingDate(date) : true;

  const steps = ["Details", "Contact"];

  const guests = adults + children;
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
  const transportFee = quote.transportCost;

  const syncChildren = (next: number) => {
    const capped = Math.min(next, Math.max(0, partyCap - adults));
    setChildren(capped);
    setChildAges((prev) => Array.from({ length: capped }, (_, i) => prev[i] ?? 8));
  };

  const syncAdults = (next: number) => {
    const capped = Math.min(Math.max(1, next), partyCap);
    const nextChildren = Math.min(children, Math.max(0, partyCap - capped));
    setAdults(capped);
    if (nextChildren !== children) {
      setChildren(nextChildren);
      setChildAges((prev) => Array.from({ length: nextChildren }, (_, i) => prev[i] ?? 8));
    }
  };

  const transportReady =
    transportMode === "none"
      ? true
      : usingCosting
        ? transportMode === "required" || transportChoice === "own" || transportChoice === "tris"
        : transportMode === "required"
          ? Boolean(vehicleId)
          : transportChoice === "own" || (transportChoice === "tris" && Boolean(vehicleId));

  const detailsReady =
    Boolean(date) &&
    Boolean(slot) &&
    !dateIsClosed(date, closures, slot) &&
    guests >= minGuests &&
    guests <= partyCap &&
    (children === 0 ||
      (childAges.length === children && childAges.every(isValidChildAge))) &&
    transportReady;

  const contactReady = Boolean(name.trim() && phone.trim() && (!email.trim() || email.includes("@")));

  const persist = async () => {
    const result = await createBooking({
      experienceSlug: experience.slug,
      date,
      slot,
      adults,
      children,
      childAges: children > 0 ? childAges : undefined,
      customerName: name,
      customerEmail: email.trim() || "not-provided@trismeghalaya.com",
      customerPhone: phone,
      uid: user?.uid,
      request: requestMode,
      transportation,
      transportVehicle: transportation && vehicleId ? vehicleId : undefined,
      vehicleCount: transportation
        ? usingCosting
          ? quote.vehicleCount || undefined
          : vehicleCount
        : undefined,
    });
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    setBooking(result.booking);
    return result.booking;
  };

  const finishRequest = async () => {
    if (!contactReady) return;
    setPaying(true);
    setError("");
    const rec = await persist();
    setPaying(false);
    if (rec) {
      setPaid(false);
      setDone(true);
    }
  };

  const finishPay = async () => {
    if (!contactReady) return;
    setPaying(true);
    setError("");
    try {
      const rec = booking ?? (await persist());
      if (!rec) return;

      // Instant bookings stay on hold until Razorpay succeeds.
      if (site.razorpayKeyId && gross >= 1) {
        try {
          const pay = await openRazorpayCheckout({
            amountInr: gross,
            receipt: rec.id,
            description: experience.name,
            notes: {
              bookingId: rec.id,
              experienceSlug: experience.slug,
            },
            prefill: {
              name,
              email: email.trim() || undefined,
              contact: phone,
            },
          });

          if (pay.paid) {
            const confirmed = await confirmPayment(rec.id, {
              paymentId: pay.paymentId,
              orderId: pay.orderId,
            });
            if (!confirmed.ok) {
              setPaid(false);
              setDone(true);
              return;
            }
            setBooking(confirmed.booking);
            setPaid(true);
            setDone(true);
            return;
          }

          // Dismissed / failed / unavailable — keep hold, ask to pay later.
          setPaid(false);
          setDone(true);
          return;
        } catch (err) {
          console.error(err);
          setPaid(false);
          setDone(true);
          return;
        }
      }

      // No Razorpay key configured — take the hold and ask them to pay later.
      setPaid(false);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete booking. Try again.");
    } finally {
      setPaying(false);
    }
  };

  if (done && booking) {
    const confirmed = !requestMode && paid;
    const pendingPay = !requestMode && !paid;
    return (
      <div className="mx-auto max-w-xl rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest p-7 shadow-[0_22px_60px_rgba(42,46,31,0.09)] md:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-primary">
          <Check size={28} />
        </div>

        <p className="mt-5 text-center label-caps text-highlight">
          {requestMode ? "Enquiry" : confirmed ? "Confirmed" : "Awaiting payment"}
        </p>
        <h1 className="mt-2 text-center font-display text-3xl leading-tight text-primary md:text-[2rem]">
          {requestMode
            ? "Enquiry received"
            : confirmed
              ? "Booking confirmed"
              : "Place held — payment pending"}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          {requestMode
            ? `Dates within ${BOOKING_NOTICE_DAYS} days need a quick confirmation from our team. We’ll contact you shortly.`
            : confirmed
              ? "Payment received. Your place is confirmed — we’ll share any final trip details by email."
              : "Your details are saved, but this booking is not confirmed until payment is completed."}
        </p>

        <dl className="mt-7 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container/35">
          <div className="border-b border-outline-variant/25 px-5 py-4">
            <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
              Experience
            </dt>
            <dd className="mt-1 font-display text-lg text-primary">{experience.name}</dd>
          </div>
          <div className="grid sm:grid-cols-2">
            <div className="border-b border-outline-variant/25 px-5 py-4 sm:border-r sm:border-b-0">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
                Date & time
              </dt>
              <dd className="mt-1 text-sm font-medium text-primary">
                {date}
                {slot ? ` · ${formatExperienceSlotLabel(slot, experience)}` : ""}
              </dd>
            </div>
            <div className="border-b border-outline-variant/25 px-5 py-4 sm:border-b-0">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
                Reference
              </dt>
              <dd className="mt-1 font-mono text-sm font-medium text-primary">{booking.id}</dd>
            </div>
          </div>
          {!requestMode ? (
            <div className="border-t border-outline-variant/25 px-5 py-4">
              <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
                {confirmed ? "Amount paid" : "Amount due"}
              </dt>
              <dd className="mt-1 font-display text-2xl text-primary">
                {formatINR(gross)}
                <span className="ml-2 text-sm font-sans font-normal text-on-surface-variant">
                  incl. GST
                </span>
              </dd>
            </div>
          ) : null}
        </dl>

        {pendingPay ? (
          <div className="mt-5 rounded-2xl border border-highlight/25 bg-highlight/10 px-5 py-4 text-sm leading-relaxed text-primary">
            <p className="font-semibold">Next step</p>
            <p className="mt-1 text-on-surface-variant">
              We’ll share a payment link shortly — or message us on WhatsApp{" "}
              <span className="font-medium text-primary">{site.phoneDisplay}</span> quoting your
              reference.
            </p>
          </div>
        ) : null}

        {requestMode ? (
          <p className="mt-5 text-center text-sm text-on-surface-variant">
            We’ll reply about availability for this date. Keep ref{" "}
            <span className="font-mono font-medium text-primary">{booking.id}</span> handy.
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button href={`/experiences/${experience.slug}`}>Back to experience</Button>
          <Button href="/account?tab=bookings" variant="ghost">
            My bookings
          </Button>
          {pendingPay ? (
            <Button href={site.whatsappUrl} variant="ghost">
              WhatsApp to pay
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <FlowShell steps={steps} current={step}>
        {date && requestMode && (
          <p className="mb-7 rounded-2xl border border-primary/25 bg-secondary-container/60 px-4 py-3 text-sm leading-relaxed text-secondary">
            This date is within {BOOKING_NOTICE_DAYS} days — use Enquire availability and we&apos;ll
            confirm with you.
          </p>
        )}

        {step === 0 && (
          <div>
            <FlowHeading
              eyebrow="Trip details"
              title="Choose your date and travellers"
              body="Pick a date 5+ days ahead to book online, or enquire for closer dates."
            />

            <div className="space-y-4">
              <FieldGroup
                title="Date & travellers"
                body={`Up to ${partyCap} guests per ${wholeDay ? "day" : "slot"} (max ${experience.maxGuests} in one booking).`}
              >
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
                    maxGuests={partyCap}
                    minGuests={minGuests}
                    onAdults={syncAdults}
                    onChildren={syncChildren}
                    onChildAge={(index, age) =>
                      setChildAges((prev) => prev.map((value, i) => (i === index ? age : value)))
                    }
                  />
                </div>
              </FieldGroup>

              <FieldGroup
                title={wholeDay ? "Schedule" : "Start time"}
                body={wholeDay ? "This experience runs as a full-day booking." : "Unavailable times are disabled."}
              >
                {wholeDay ? (
                  <p
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-semibold",
                      !date || dateIsClosed(date, closures, slots[0] ?? "")
                        ? "border-outline-variant/30 text-on-surface-variant"
                        : "border-primary bg-primary text-on-primary",
                    )}
                  >
                    {formatExperienceSlotLabel(slots[0] ?? "all-day", experience)}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {slots.map((s, index) => (
                      <button
                        key={`${s}-${index}`}
                        type="button"
                        disabled={!date || dateIsClosed(date, closures, s)}
                        onClick={() => setSlot(s)}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-outline-variant/20 disabled:bg-surface-container disabled:text-on-surface-variant/40",
                          slot === s
                            ? "border-primary bg-primary text-on-primary shadow-sm"
                            : "border-outline-variant/40 bg-surface-container-lowest text-primary hover:border-primary/50",
                        )}
                      >
                        {formatExperienceSlotLabel(s, experience)}
                      </button>
                    ))}
                  </div>
                )}
              </FieldGroup>

              {transportMode !== "none" && (
                <FieldGroup title="Getting there" body="Choose how you reach the experience.">
                  <GettingThereFields
                    mode={transportMode}
                    options={vehicles}
                    choice={transportChoice}
                    vehicleId={vehicleId}
                    vehicleCount={vehicleCount}
                    note={experience.transportNote}
                    costingTransport={usingCosting}
                    onChoice={(next) => {
                      setTransportChoice(next);
                      if (next !== "tris") setVehicleId("");
                    }}
                    onVehicle={setVehicleId}
                    onVehicleCount={usingCosting ? undefined : setVehicleCount}
                  />
                </FieldGroup>
              )}
            </div>

            {date && dateIsClosed(date, closures) && (
              <p className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm text-primary">
                This date is fully unavailable. Please choose another date.
              </p>
            )}
            <FlowActions>
              <SecureNote request={requestMode} />
              <Button
                className="sm:ml-auto"
                size="lg"
                onClick={() => setStep(1)}
                disabled={!detailsReady}
              >
                Continue to contact
              </Button>
            </FlowActions>
          </div>
        )}

        {step === 1 && (
          <div>
            <FlowHeading
              eyebrow="Contact details"
              title="Where should we reach you?"
              body="We’ll use these details for this booking and essential trip updates."
            />
            <FieldGroup title="Lead traveller">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  className="sm:col-span-2"
                  label="Full name"
                  name="name"
                  value={name}
                  onChange={setName}
                  required
                  autoComplete="name"
                />
                <FormInput
                  label="Email address"
                  name="email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                  hint="Optional"
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
            {error && <p className="mt-3 text-sm text-primary">{error}</p>}
            <FlowActions>
              <Button variant="text" onClick={() => setStep(0)}>
                Back
              </Button>
              {requestMode ? (
                <Button size="lg" onClick={() => void finishRequest()} disabled={paying || !contactReady}>
                  {paying ? "Submitting…" : "Enquire availability"}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => void finishPay()}
                  disabled={paying || !contactReady}
                  className="gap-2"
                >
                  <CreditCard size={16} />
                  {paying
                    ? site.razorpayKeyId
                      ? "Opening payment…"
                      : "Saving booking…"
                    : site.razorpayKeyId
                      ? `Pay ${formatINR(gross)} & confirm`
                      : "Save booking"}
                </Button>
              )}
            </FlowActions>
          </div>
        )}
      </FlowShell>

      <FlowSummary
        eyebrow={requestMode ? "Enquiry summary" : "Booking summary"}
        title={experience.name}
        subtitle={`${experience.location} · ${experience.duration}`}
        footer={
          <Link
            href={`/experiences/${experience.slug}`}
            className="text-sm font-semibold text-accent hover:underline"
          >
            ← View experience details
          </Link>
        }
      >
        <div className="mt-6 space-y-2 text-sm">
          {date ? <Row label="Date" value={date} /> : null}
          {slot ? <Row label="Time" value={formatExperienceSlotLabel(slot, experience)} /> : null}
          {usingCosting ? (
            <>
              <Row label="Adults" value={String(adults)} />
              {children > 0 ? <Row label="Children" value={String(children)} /> : null}
              {transportation ? (
                <Row
                  label="Transport"
                  value={
                    quote.vehicleCount > 1
                      ? `TRIS · ${quote.vehicleCount} vehicles`
                      : "TRIS transport"
                  }
                />
              ) : transportMode === "optional" && transportChoice === "own" ? (
                <Row label="Transport" value="Own arrangement" />
              ) : null}
            </>
          ) : (
            <>
              <Row label={`Adults × ${adults}`} value={formatINR(adultRate(experience) * adults)} />
              {children > 0 ? (
                <Row
                  label={`Children × ${children}`}
                  value={formatINR(childRate(experience) * children)}
                />
              ) : null}
              {transportation && selectedVehicle ? (
                <Row
                  label={`Transport · ${selectedVehicle.label}${vehicleCount > 1 ? ` × ${vehicleCount}` : ""}`}
                  value={formatINR(transportFee)}
                />
              ) : null}
            </>
          )}
          <div className="mt-3 border-t border-outline-variant/25 pt-3">
            <Row label="Total (incl. GST)" value={formatINR(gross)} bold />
          </div>
          {name ? <Row label="Guest" value={name} /> : null}
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
