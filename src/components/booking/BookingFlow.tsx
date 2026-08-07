"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatINR, cn, isInstantBookingDate, BOOKING_NOTICE_DAYS } from "@/lib/utils";
import type { Experience } from "@/data/experiences";
import { FormInput } from "@/components/ui/Form";
import { Check, CreditCard } from "lucide-react";

const RIDE_FEE = 1800;

export function BookingFlow({ experience }: { experience: Experience }) {
  const search = useSearchParams();
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState("09:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [done, setDone] = useState(false);
  const [paying, setPaying] = useState(false);

  const date = search.get("date") ?? "";
  const guests = Number(search.get("guests") ?? 2);
  const ride = search.get("ride") === "1";
  const requestMode =
    search.get("request") === "1" || (date ? !isInstantBookingDate(date) : false);

  const steps = requestMode
    ? ["Details", "Contact", "Submit request"]
    : ["Details", "Contact", "Review", "Payment"];

  const total = useMemo(
    () => experience.priceFrom * guests + (ride ? RIDE_FEE : 0),
    [experience.priceFrom, guests, ride],
  );

  const slots = ["08:30", "09:00", "10:00"];

  const finish = async () => {
    setPaying(true);
    await new Promise((r) => setTimeout(r, 1400));
    setPaying(false);
    setDone(true);
    setStep(requestMode ? 2 : 3);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center shadow-ambient md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary-container">
          <Check size={32} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-primary">
          {requestMode ? "Request received" : "Booking reserved"}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          {requestMode ? (
            <>
              Demo request for <strong>{experience.name}</strong> on {date} at {slot}. Dates within{" "}
              {BOOKING_NOTICE_DAYS} days need our confirmation — we’ll get back within 24 hours
              (simulated).
            </>
          ) : (
            <>
              Demo confirmation for <strong>{experience.name}</strong> on {date} at {slot}. Payment
              simulated via Razorpay — no charge was made.
            </>
          )}
        </p>
        <div className="mt-6 rounded-2xl bg-surface-container-low p-4 text-left text-sm">
          <p>
            <span className="text-on-surface-variant">Guest:</span> {name || "Guest"}
          </p>
          <p className="mt-1">
            <span className="text-on-surface-variant">
              {requestMode ? "Estimated total:" : "Total:"}
            </span>{" "}
            {formatINR(total)}
          </p>
          <p className="mt-1">
            <span className="text-on-surface-variant">Ref:</span> TRIS-
            {requestMode ? "REQ" : "DEMO"}-
            {Math.random().toString(36).slice(2, 8).toUpperCase()}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={`/experiences/${experience.slug}`}>Back to experience</Button>
          <Button href="/experiences" variant="ghost">
            Browse more
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-ambient md:p-8">
        {requestMode && (
          <p className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-secondary">
            This date is within {BOOKING_NOTICE_DAYS} days — online booking isn’t available yet.
            Submit a request and we’ll confirm availability.
          </p>
        )}

        <div className="mb-8 flex flex-wrap gap-2">
          {steps.map((label, i) => (
            <div
              key={label}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase",
                i === step
                  ? "bg-primary-container text-primary-fixed"
                  : i < step
                    ? "bg-primary-fixed text-primary"
                    : "bg-surface-container text-on-surface-variant",
              )}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <h1 className="font-display text-3xl text-primary">Select time slot</h1>
            <p className="mt-2 text-on-surface-variant">
              {date || "Date from widget"} · {guests} guests
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {slots.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                    slot === s
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant hover:border-accent",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="mt-8 flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
              <input type="checkbox" checked={ride} readOnly className="mt-1" />
              <span>
                <span className="font-medium text-primary">Trusted Local Ride</span>
                <span className="mt-1 block text-sm text-on-surface-variant">
                  {ride
                    ? `Included · ${formatINR(RIDE_FEE)}`
                    : "Not selected — you can go back to the experience page to add it."}
                </span>
              </span>
            </label>
            <Button className="mt-8" onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl text-primary">Your details</h1>
            <p className="mt-2 text-on-surface-variant">
              {requestMode
                ? "We’ll use these details to confirm your short-notice request."
                : "We’ll send confirmation and travel notes here."}
            </p>
            <div className="mt-6 space-y-4">
              <FormInput
                label="Full name"
                name="name"
                value={name}
                onChange={setName}
                placeholder="Your name"
                required
                autoComplete="name"
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@email.com"
                required
                autoComplete="email"
              />
              <FormInput
                label="Mobile"
                name="phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+91 ..."
                required
                autoComplete="tel"
              />
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!name || !email || !phone}
              >
                {requestMode ? "Review request" : "Review booking"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-3xl text-primary">
              {requestMode ? "Review & submit" : "Review & pay"}
            </h1>
            <div className="mt-6 space-y-3 rounded-2xl bg-surface-container-low p-5 text-sm">
              <Row label="Experience" value={experience.name} />
              <Row label="Date" value={date} />
              <Row label="Time" value={slot} />
              <Row label="Guests" value={String(guests)} />
              <Row label="Guest name" value={name} />
              <Row label="Contact" value={`${email} · ${phone}`} />
              {ride && <Row label="Local ride" value={formatINR(RIDE_FEE)} />}
              <div className="border-t border-outline-variant/30 pt-3">
                <Row
                  label={requestMode ? "Estimated total" : "Total payable"}
                  value={formatINR(total)}
                  bold
                />
              </div>
            </div>
            <p className="mt-4 text-xs text-on-surface-variant">
              {requestMode
                ? `Short-notice requests (under ${BOOKING_NOTICE_DAYS} days) are confirmed by the TRIS team before payment.`
                : "Customer view shows only the total. Internal pricing components stay in admin — as per PRD."}
            </p>
            <div className="mt-8 flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              {requestMode ? (
                <Button onClick={finish} disabled={paying}>
                  {paying ? "Submitting…" : "Submit request"}
                </Button>
              ) : (
                <Button onClick={finish} disabled={paying} className="gap-2">
                  <CreditCard size={16} />
                  {paying ? "Opening Razorpay…" : "Pay with Razorpay"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-ambient">
        <p className="label-caps text-accent">
          {requestMode ? "Request summary" : "Booking summary"}
        </p>
        <h2 className="mt-2 font-display text-xl text-primary">{experience.name}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {experience.location} · {experience.duration}
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <Row label="Subtotal" value={formatINR(experience.priceFrom * guests)} />
          {ride && <Row label="Ride" value={formatINR(RIDE_FEE)} />}
          <Row label="Total" value={formatINR(total)} bold />
        </div>
        <Link
          href={`/experiences/${experience.slug}`}
          className="mt-6 inline-block text-sm text-accent hover:underline"
        >
          ← Edit on experience page
        </Link>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={cn("flex justify-between gap-4", bold && "font-semibold text-primary")}>
      <span className={bold ? undefined : "text-on-surface-variant"}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
