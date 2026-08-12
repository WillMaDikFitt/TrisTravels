"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { formatINR, cn, isInstantBookingDate, BOOKING_NOTICE_DAYS } from "@/lib/utils";
import type { Experience } from "@/data/experiences";
import { FormInput } from "@/components/ui/Form";
import { Check, CreditCard } from "lucide-react";
import { confirmPayment, createBooking } from "@/lib/actions/bookings";
import { useAuth } from "@/components/auth/AuthProvider";
import type { BookingRecord } from "@/lib/types";
import { DEFAULT_SLOTS } from "@/lib/catalog";

export function BookingFlow({ experience }: { experience: Experience }) {
  const search = useSearchParams();
  const { user, profile } = useAuth();
  const slots = experience.slots?.length ? experience.slots : DEFAULT_SLOTS;
  const [step, setStep] = useState(0);
  const [slot, setSlot] = useState(search.get("slot") || slots[0]);
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email || user?.email) setEmail((e) => e || profile?.email || user?.email || "");
    if (profile?.phone) setPhone((p) => p || profile.phone || "");
  }, [profile, user?.email]);
  const [done, setDone] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);

  const date = search.get("date") ?? "";
  const guests = Number(search.get("guests") ?? 2);
  const requestMode =
    search.get("request") === "1" || (date ? !isInstantBookingDate(date) : false);

  const steps = requestMode
    ? ["Details", "Contact", "Submit request"]
    : ["Details", "Contact", "Pay"];

  const total = useMemo(() => experience.priceFrom * guests, [experience.priceFrom, guests]);

  const persist = async () => {
    const result = await createBooking({
      experienceSlug: experience.slug,
      date,
      slot,
      guests,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      uid: user?.uid,
      request: requestMode,
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
              Confirmation for <strong>{experience.name}</strong> on {date} at {slot}. Payment
              simulated — ref {booking.id}.
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
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-ambient md:p-8">
        {requestMode && (
          <p className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-secondary">
            This date is within {BOOKING_NOTICE_DAYS} days — submit a request and we’ll confirm
            availability.
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
                    ? "bg-secondary-container text-primary"
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
              {date || "No date selected"} · {guests} guests
            </p>
            {!date && (
              <p className="mt-3 text-sm text-primary">
                Pick a date on the experience page first.{" "}
                <Link href={`/experiences/${experience.slug}`} className="underline">
                  Go back
                </Link>
              </p>
            )}
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
            <Button className="mt-8" onClick={() => setStep(1)} disabled={!date}>
              Continue
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-3xl text-primary">Your details</h1>
            <div className="mt-6 space-y-4">
              <FormInput label="Full name" name="name" value={name} onChange={setName} required autoComplete="name" />
              <FormInput
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={setEmail}
                required
                autoComplete="email"
              />
              <FormInput
                label="Mobile"
                name="phone"
                type="tel"
                value={phone}
                onChange={setPhone}
                required
                autoComplete="tel"
              />
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="ghost" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)} disabled={!name || !email || !phone}>
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
              <div className="border-t border-outline-variant/30 pt-3">
                <Row label={requestMode ? "Estimated total" : "Total payable"} value={formatINR(total)} bold />
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-primary">{error}</p>}
            <div className="mt-8 flex gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              {requestMode ? (
                <Button onClick={finishRequest} disabled={paying}>
                  {paying ? "Submitting…" : "Submit request"}
                </Button>
              ) : (
                <Button onClick={finishPay} disabled={paying} className="gap-2">
                  <CreditCard size={16} />
                  {paying ? "Processing…" : "Pay (demo)"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="h-fit rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-ambient">
        <p className="label-caps text-accent">{requestMode ? "Request summary" : "Booking summary"}</p>
        <h2 className="mt-2 font-display text-xl text-primary">{experience.name}</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          {experience.location} · {experience.duration}
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <Row label="Subtotal" value={formatINR(experience.priceFrom * guests)} />
          <Row label="Total" value={formatINR(total)} bold />
        </div>
        <Link href={`/experiences/${experience.slug}`} className="mt-6 inline-block text-sm text-accent hover:underline">
          ← Edit on experience page
        </Link>
      </aside>
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
