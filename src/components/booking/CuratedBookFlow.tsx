"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "@/components/ui/Form";
import {
  FieldGroup,
  FlowActions,
  FlowHeading,
  FlowShell,
  FlowSummary,
  SecureNote,
} from "@/components/forms/FlowUI";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Journey } from "@/data/journeys";
import {
  canBookCuratedOnline,
  CURATED_BALANCE_DUE_DAYS,
  CURATED_ONLINE_BOOK_DAYS,
  journeyEndDate,
  PACKAGE_TRANSPORT,
  packageTransportMeta,
  STAY_STYLES,
  BOOKING_STAY_STYLE_IDS,
  stayStyleMeta,
  type PackageTransportId,
} from "@/data/journey-options";
import { PackageOptionsModal, type PackageLearnTab } from "@/components/booking/PackageOptionLearn";
import {
  minVehiclesForGuests,
  suggestedExtraMattresses,
  suggestedRooms,
  type BookingStayStyleId,
} from "@/data/package-pricing";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { quoteCuratedPackage } from "@/lib/pricing";
import { formatINR, cn } from "@/lib/utils";

const steps = ["Transport", "Stay", "Confirm"];

const STAY_FEATURES = [
  { icon: Leaf, label: "Curated for Authenticity" },
  { icon: ShieldCheck, label: "Quality & Comfort" },
  { icon: HeartHandshake, label: "Community-First stays" },
] as const;

function rangeOptions(from: number, to: number, labelFn?: (n: number) => string) {
  return Array.from({ length: to - from + 1 }, (_, i) => {
    const n = from + i;
    return { value: String(n), label: labelFn ? labelFn(n) : String(n) };
  });
}

export function CuratedBookFlow({ journey }: { journey: Journey }) {
  const { user, profile } = useAuth();

  const [step, setStep] = useState(0);
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(0);
  const [vehicleId, setVehicleId] = useState<PackageTransportId>("sedan");
  const [vehicleCount, setVehicleCount] = useState(1);
  const [stayStyle, setStayStyle] = useState<BookingStayStyleId>("barefoot");
  const [rooms, setRooms] = useState(2);
  const [extraMattresses, setExtraMattresses] = useState(0);
  const [preferredFrom, setPreferredFrom] = useState("");
  const [preferredTo, setPreferredTo] = useState("");
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState("");
  const [roomsTouched, setRoomsTouched] = useState(false);
  const [mattressTouched, setMattressTouched] = useState(false);
  const [vehicleCountTouched, setVehicleCountTouched] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [learnTab, setLearnTab] = useState<PackageLearnTab>("stay");

  const totalGuests = adults + children;
  const transportMeta = packageTransportMeta(vehicleId);
  const capacity = transportMeta.maxGuests;
  const minVehicles = minVehiclesForGuests(totalGuests, capacity);
  const onlineBookOk = !preferredFrom || canBookCuratedOnline(preferredFrom);
  const stayMeta = stayStyleMeta(stayStyle);

  const adultOptions = useMemo(() => rangeOptions(1, 20, (n) => `${n} adult${n === 1 ? "" : "s"}`), []);
  const childOptions = useMemo(
    () =>
      rangeOptions(0, Math.max(0, 20 - adults), (n) =>
        n === 0 ? "No children" : `${n} child${n === 1 ? "" : "ren"}`,
      ),
    [adults],
  );
  const vehicleCountOptions = useMemo(
    () => rangeOptions(minVehicles, 10, (n) => `${n} vehicle${n === 1 ? "" : "s"}`),
    [minVehicles],
  );
  const roomOptions = useMemo(() => rangeOptions(1, 20, (n) => `${n} room${n === 1 ? "" : "s"}`), []);
  const mattressOptions = useMemo(
    () => rangeOptions(0, 20, (n) => (n === 0 ? "None" : `${n} mattress${n === 1 ? "" : "es"}`)),
    [],
  );
  const transportOptions = useMemo(
    () =>
      PACKAGE_TRANSPORT.map((t) => ({
        value: t.id,
        label: `${t.label} (Max ${t.maxGuests})`,
      })),
    [],
  );
  const stayOptions = useMemo(
    () =>
      STAY_STYLES.filter((s) =>
        (BOOKING_STAY_STYLE_IDS as readonly string[]).includes(s.id),
      ).map((s) => ({ value: s.id, label: s.label })),
    [],
  );

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email) setEmail((e) => e || profile.email);
    if (profile?.phone) setPhone((p) => p || profile.phone || "");
  }, [profile]);

  useEffect(() => {
    if (!vehicleCountTouched) setVehicleCount(minVehicles);
  }, [minVehicles, vehicleCountTouched]);

  useEffect(() => {
    if (!roomsTouched) setRooms(suggestedRooms(totalGuests));
  }, [totalGuests, roomsTouched]);

  useEffect(() => {
    if (!mattressTouched) setExtraMattresses(suggestedExtraMattresses(totalGuests, rooms));
  }, [totalGuests, rooms, mattressTouched]);

  useEffect(() => {
    if (!preferredFrom) {
      setPreferredTo("");
      return;
    }
    setPreferredTo(journeyEndDate(preferredFrom, journey.nights));
  }, [preferredFrom, journey.nights]);

  const quote = useMemo(
    () =>
      quoteCuratedPackage(journey, {
        vehicleId,
        vehicleCount,
        stayPreference: stayStyle,
        rooms,
        extraMattresses,
        adults,
        children,
      }),
    [journey, vehicleId, vehicleCount, stayStyle, rooms, extraMattresses, adults, children],
  );

  const syncAdults = (next: number) => {
    const capped = Math.min(Math.max(1, next), 20);
    const nextChildren = Math.min(children, Math.max(0, 20 - capped));
    setAdults(capped);
    setChildren(nextChildren);
  };

  const canLeaveVehicle = quote.capacityOk && adults >= 1;
  const canLeaveStay = rooms >= 1 && Boolean(preferredFrom);

  const submit = async () => {
    if (!quote.capacityOk) {
      setError(`Add enough vehicles — max ${capacity} guests per ${quote.vehicleLabel}.`);
      return;
    }
    if (!onlineBookOk) {
      setError(
        `Online booking opens ${CURATED_ONLINE_BOOK_DAYS}+ days before travel. Please enquire or customise instead.`,
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await submitEnquiry({
        source: "journey",
        name,
        email,
        phone,
        message: message || `Book now — 50% advance for ${journey.name}`,
        payload: {
          journeySlug: journey.slug,
          journeyName: journey.name,
          bookingType: "curated-package-booking",
          paymentPlan: "50-advance-50-balance",
          preferredFrom,
          preferredTo: preferredTo || preferredFrom,
          adults,
          children,
          totalTravellers: totalGuests,
          vehicleId,
          transportVehicle: quote.vehicleLabel,
          vehicleCount,
          stayPreference: stayMeta.label,
          stayStyle,
          rooms,
          extraMattresses,
          estimatedTotal: quote.total,
          advanceAmount: quote.advanceAmount,
          balanceAmount: quote.balanceAmount,
          balanceDueDaysBeforeTravel: CURATED_BALANCE_DUE_DAYS,
          pricePerPerson: quote.perPerson,
        },
        uid: user?.uid,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setRefId(res.id);
      setDone(true);
    } catch {
      setError("Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center shadow-ambient md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-primary">
          <Check size={32} />
        </div>
        <h1 className="mt-6 font-display text-3xl text-primary">Advance request received</h1>
        <p className="mt-3 text-on-surface-variant">
          We&apos;ll confirm next steps for your 50% advance shortly. Ref {refId}.
        </p>
        <p className="mt-4 font-display text-2xl text-primary">{formatINR(quote.advanceAmount)}</p>
        <p className="text-sm text-on-surface-variant">
          of {formatINR(quote.total)} total (incl. GST) · {totalGuests} travellers
        </p>
        <p className="mt-3 text-xs text-on-surface-variant">
          50% to confirm. Remaining balance due {CURATED_BALANCE_DUE_DAYS} days before travel.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={`/journeys/${journey.slug}`}>Back to journey</Button>
          <Button href="/account" variant="ghost">
            My account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <FlowShell steps={steps} current={step}>
          {step === 0 && (
            <div>
              <FlowHeading
                eyebrow="Step 1"
                title="Transportation Choice"
                body="Choose how many are travelling and the vehicle that fits your group."
              />
              <div className="space-y-4">
                <FieldGroup title="Travellers">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      label="Adults"
                      name="adults"
                      required
                      options={adultOptions}
                      value={String(adults)}
                      onChange={(v) => syncAdults(Number(v) || 1)}
                    />
                    <FormSelect
                      label="Children"
                      name="children"
                      options={childOptions}
                      value={String(children)}
                      onChange={(v) => setChildren(Math.max(0, Number(v) || 0))}
                    />
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">Children: ages 2–8</p>
                </FieldGroup>

                <FieldGroup title="Vehicle">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      label="Vehicle type"
                      name="vehicleId"
                      required
                      options={transportOptions}
                      value={vehicleId}
                      onChange={(v) => {
                        setVehicleId(v as PackageTransportId);
                        setVehicleCountTouched(false);
                      }}
                    />
                    <FormSelect
                      label="Number of vehicles"
                      name="vehicleCount"
                      required
                      options={vehicleCountOptions}
                      value={String(vehicleCount)}
                      onChange={(v) => {
                        setVehicleCountTouched(true);
                        setVehicleCount(Math.max(minVehicles, Math.min(10, Number(v) || minVehicles)));
                      }}
                    />
                  </div>

                  <div className="mt-4 flex gap-3 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-3">
                    <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                      <Image
                        src={transportMeta.images[0]}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-primary">
                        {transportMeta.label}{" "}
                        <span className="font-normal text-on-surface-variant">
                          · Max {transportMeta.maxGuests}
                        </span>
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
                        {transportMeta.summary}
                      </p>
                    </div>
                  </div>

                  {!quote.capacityOk && (
                    <p className="mt-3 text-sm text-red-700">
                      Too many guests for {vehicleCount} × {quote.vehicleLabel} (max{" "}
                      {capacity * vehicleCount}). Increase vehicles or choose a larger vehicle.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setLearnTab("vehicle");
                      setLearnOpen(true);
                    }}
                    className="mt-4 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-surface"
                  >
                    Learn more about Transportation Type
                  </button>
                </FieldGroup>
              </div>
              <FlowActions>
                <SecureNote request />
                <Button
                  className="sm:ml-0"
                  size="lg"
                  onClick={() => setStep(1)}
                  disabled={!canLeaveVehicle}
                >
                  Continue to stay
                </Button>
              </FlowActions>
            </div>
          )}

          {step === 1 && (
            <div>
              <FlowHeading
                eyebrow="Step 2"
                title="Choose your stay style"
                body="Each stay type offers a different way to experience Meghalaya. Your travel dates help us secure the right stay for you."
              />
              <div className="space-y-4">
                <FieldGroup title="Stay options">
                  <FormSelect
                    label="Stay style"
                    name="stayStyle"
                    required
                    options={stayOptions}
                    value={stayStyle}
                    onChange={(v) => setStayStyle(v as BookingStayStyleId)}
                  />

                  <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                    <p className="font-medium text-primary">{stayMeta.label}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                      {stayMeta.short}
                    </p>
                    <p className="mt-2 text-xs font-medium text-primary/80">
                      Best for: {stayMeta.bestFor}
                    </p>
                  </div>

                  <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                    {STAY_FEATURES.map(({ icon: Icon, label }) => (
                      <li
                        key={label}
                        className="flex items-start gap-2 rounded-xl bg-surface-container-lowest px-3 py-3 text-sm text-on-surface-variant"
                      >
                        <Icon size={16} className="mt-0.5 shrink-0 text-highlight" />
                        <span>{label}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      setLearnTab("stay");
                      setLearnOpen(true);
                    }}
                    className="mt-4 w-full rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-surface"
                  >
                    Learn more about Stay Type
                  </button>
                </FieldGroup>

                <FieldGroup title="Rooms">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormSelect
                      label="Total rooms"
                      name="rooms"
                      required
                      options={roomOptions}
                      value={String(rooms)}
                      onChange={(v) => {
                        setRoomsTouched(true);
                        setRooms(Math.max(1, Number(v) || 1));
                      }}
                    />
                    <FormSelect
                      label="Extra mattresses"
                      name="extraMattresses"
                      options={mattressOptions}
                      value={String(extraMattresses)}
                      onChange={(v) => {
                        setMattressTouched(true);
                        setExtraMattresses(Math.max(0, Number(v) || 0));
                      }}
                    />
                  </div>
                </FieldGroup>

                <FieldGroup title="Travel dates">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Preferred start date"
                      name="preferredFrom"
                      type="date"
                      required
                      value={preferredFrom}
                      onChange={setPreferredFrom}
                    />
                    <FormInput
                      label="End date"
                      name="preferredTo"
                      type="date"
                      value={preferredTo}
                      hint={`Auto-set · ${journey.nights} nights`}
                      disabled
                    />
                  </div>
                  {preferredFrom && !onlineBookOk && (
                    <p className="mt-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
                      This start date is within {CURATED_ONLINE_BOOK_DAYS} days. Online booking is
                      available only {CURATED_ONLINE_BOOK_DAYS}+ days ahead. Please{" "}
                      <Link
                        href={`/journeys/${journey.slug}/enquire`}
                        className="font-semibold text-primary underline-offset-2 hover:underline"
                      >
                        enquire availability or customise
                      </Link>{" "}
                      instead.
                    </p>
                  )}
                </FieldGroup>
              </div>
              <FlowActions>
                <Button variant="ghost" onClick={() => setStep(0)}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep(2)} disabled={!canLeaveStay}>
                  Continue to confirm
                </Button>
              </FlowActions>
            </div>
          )}

          {step === 2 && (
            <div>
              <FlowHeading
                eyebrow="Step 3"
                title="Confirm & pay advance"
                body="Review your choices and contact details. Pay 50% at booking to confirm; the balance is due 20 days before your journey."
              />
              <div className="space-y-4">
                <FieldGroup title="Your details">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      className="sm:col-span-2"
                      label="Full name"
                      name="name"
                      required
                      value={name}
                      onChange={setName}
                      autoComplete="name"
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={setEmail}
                      autoComplete="email"
                    />
                    <FormInput
                      label="Phone"
                      name="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={setPhone}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="mt-4">
                    <FormTextarea
                      label="Notes (optional)"
                      name="message"
                      rows={3}
                      value={message}
                      onChange={setMessage}
                      placeholder="Please share any specific needs or requests in advance."
                    />
                  </div>
                </FieldGroup>

                {!onlineBookOk && (
                  <p className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
                    Online booking isn’t available for this travel window.{" "}
                    <Link
                      href={`/journeys/${journey.slug}/enquire`}
                      className="font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      Enquire availability or customise
                    </Link>
                    .
                  </p>
                )}

              {error && <p className="text-sm text-red-700">{error}</p>}
              <SecureNote request />
              <p className="text-xs text-on-surface-variant">
                By confirming, you agree to our{" "}
                <Link
                  href="/terms"
                  target="_blank"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Package Tours Terms &amp; Conditions
                </Link>
                .
              </p>
              </div>
              <FlowActions>
                <Button variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                {onlineBookOk ? (
                  <Button
                    size="lg"
                    onClick={submit}
                    disabled={
                      busy || !name.trim() || !email.trim() || !phone.trim() || !quote.capacityOk
                    }
                  >
                    {busy ? "Sending…" : `Confirm & Pay advance · ${formatINR(quote.advanceAmount)}`}
                  </Button>
                ) : (
                  <Button size="lg" href={`/journeys/${journey.slug}/enquire`}>
                    Enquire availability or customise
                  </Button>
                )}
              </FlowActions>
            </div>
          )}
        </FlowShell>

        <FlowSummary
          eyebrow="Your quote"
          title={journey.name}
          subtitle={`${journey.days} Days / ${journey.nights} Nights`}
          footer={
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Prefer to shape it differently?{" "}
              <Link
                href={`/journeys/${journey.slug}/enquire`}
                className="font-semibold text-primary hover:underline"
              >
                Customise instead
              </Link>
            </p>
          }
        >
          <div className="space-y-2 text-sm">
            <Row label="Guests" value={String(totalGuests)} />
            <Row label="Transport" value={`${quote.vehicleCount} × ${quote.vehicleLabel}`} />
            <Row label="Stay style" value={stayMeta.label} />
            <Row label="Rooms" value={String(quote.rooms)} />
            {preferredFrom ? (
              <Row
                label="Dates"
                value={`${preferredFrom}${preferredTo ? ` → ${preferredTo}` : ""}`}
              />
            ) : null}

            <div className="mt-4 space-y-2.5 border-t border-outline-variant/25 pt-4">
              <Row label="Total (Inclusive of GST)" value={formatINR(quote.total)} bold />
              <Row label="Advance amount payable (50%)" value={formatINR(quote.advanceAmount)} />
              <Row
                label={`Balance (due ${CURATED_BALANCE_DUE_DAYS} days before)`}
                value={formatINR(quote.balanceAmount)}
              />
            </div>

            <div className="mt-4 border-t border-outline-variant/25 pt-4">
              <p className="text-xs leading-relaxed text-on-surface-variant">
                50% to confirm. 50% before you travel.
              </p>
            </div>
          </div>
        </FlowSummary>
      </div>

      <PackageOptionsModal
        open={learnOpen}
        onClose={() => setLearnOpen(false)}
        initialTab={learnTab}
        stayId={stayStyle}
        vehicleId={vehicleId}
        onStayChange={(id) => {
          if ((BOOKING_STAY_STYLE_IDS as readonly string[]).includes(id)) {
            setStayStyle(id as BookingStayStyleId);
          }
        }}
        onVehicleChange={(id) => {
          setVehicleId(id);
          setVehicleCountTouched(false);
        }}
      />
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4", bold && "font-semibold text-primary")}>
      <span className={cn("min-w-0", bold ? undefined : "text-on-surface-variant")}>{label}</span>
      <span className="shrink-0 text-right">{value}</span>
    </div>
  );
}
