"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "@/components/ui/Form";
import { Check } from "lucide-react";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Journey } from "@/data/journeys";
import { transportVehicleOptions } from "@/data/transport";
import { formatINR, cn } from "@/lib/utils";
import { GuestCompositionFields, TransportVehicleFields } from "@/components/booking/GuestTransportFields";
import {
  FieldGroup,
  FlowActions,
  FlowHeading,
  FlowShell,
  FlowSummary,
  SecureNote,
} from "@/components/forms/FlowUI";

export function JourneyEnquireFlow({ journey }: { journey: Journey }) {
  const { user, profile } = useAuth();
  const fixed = journey.type === "small-group";
  const departureDates = journey.departureSeats?.map((d) => d.date) ?? journey.departures ?? [];
  const vehicles = useMemo(
    () => transportVehicleOptions(journey.transportPrice ?? 3500, journey.transportVehicles),
    [journey.transportPrice, journey.transportVehicles],
  );
  const maxGuests = 12;

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [message, setMessage] = useState("");
  const [departureDate, setDepartureDate] = useState(departureDates[0] ?? "");
  const [preferredFrom, setPreferredFrom] = useState("");
  const [preferredTo, setPreferredTo] = useState("");
  const [dateFlexibility, setDateFlexibility] = useState("Flexible ± a few days");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [roomPreference, setRoomPreference] = useState("");
  const [transportation, setTransportation] = useState(false);
  const [vehicleId, setVehicleId] = useState<string>(vehicles[0]?.id ?? "sedan");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState("");

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];
  const childRate = journey.priceChild ?? Math.round(journey.priceFrom * 0.7);
  const guestSubtotal = journey.priceFrom * adults + childRate * children;
  const transportFee = transportation ? selectedVehicle?.price ?? 0 : 0;
  const estimatedTotal = guestSubtotal + transportFee;

  const steps = fixed
    ? ["Travellers", "Stay & transport", "Contact"]
    : ["Travellers", "Preferences", "Contact"];

  const syncChildren = (next: number) => {
    const capped = Math.min(next, Math.max(0, maxGuests - adults));
    setChildren(capped);
    setChildAges((prev) => Array.from({ length: capped }, (_, i) => prev[i] ?? 8));
  };

  const syncAdults = (next: number) => {
    const capped = Math.min(Math.max(1, next), maxGuests);
    const nextChildren = Math.min(children, Math.max(0, maxGuests - capped));
    setAdults(capped);
    if (nextChildren !== children) {
      setChildren(nextChildren);
      setChildAges((prev) => Array.from({ length: nextChildren }, (_, i) => prev[i] ?? 8));
    }
  };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await submitEnquiry({
        source: "journey",
        name,
        email,
        phone,
        message:
          message ||
          `${fixed ? "Seat reservation" : "Customise request"} for ${journey.name}`,
        payload: {
          journeySlug: journey.slug,
          journeyName: journey.name,
          bookingType: fixed ? "fixed-journey-reservation" : "curated-journey-customise",
          departureDate: fixed ? departureDate : preferredFrom,
          preferredFrom: fixed ? departureDate : preferredFrom,
          preferredTo: fixed ? departureDate : preferredTo,
          dateFlexibility: fixed ? "Fixed departure" : dateFlexibility,
          adults,
          children,
          childAges: childAges.map(String),
          totalTravellers: adults + children,
          roomPreference,
          transportation: transportation ? "yes" : "no",
          transportVehicle: transportation ? selectedVehicle?.label ?? "" : "",
          transportPrice: transportation ? selectedVehicle?.price ?? 0 : 0,
          estimatedTotal,
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
        <h1 className="mt-6 font-display text-3xl text-primary">
          {fixed ? "Reservation received" : "Customise request sent"}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          {fixed
            ? "We’ll confirm availability and payment next."
            : "We’ll reply within 1–2 working days with a tailored plan."}{" "}
          Ref {refId}.
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
    <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <FlowShell steps={steps} current={step}>

        {step === 0 && (
          <div>
            <FlowHeading
              eyebrow="Trip details"
              title="When and who is travelling?"
              body="Preferred dates and traveller ages help us check availability and prepare an accurate quote."
            />
            <div className="space-y-4">
              <FieldGroup
                title={fixed ? "Choose your departure" : "Preferred travel dates"}
                body={fixed ? "Select from the available fixed departures." : "Tell us your ideal window and how flexible it is."}
              >
                {fixed ? (
                  departureDates.length ? (
                    <FormSelect
                      label="Departure date"
                      name="departureDate"
                      required
                      value={departureDate}
                      onChange={setDepartureDate}
                      placeholder="Choose a date"
                      options={departureDates}
                    />
                  ) : (
                    <FormInput
                      label="Preferred departure date"
                      name="departureDate"
                      type="date"
                      required
                      value={departureDate}
                      onChange={setDepartureDate}
                    />
                  )
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        label="Preferred start date"
                        name="preferredFrom"
                        type="date"
                        required
                        value={preferredFrom}
                        onChange={(value) => {
                          setPreferredFrom(value);
                          if (preferredTo && preferredTo < value) setPreferredTo(value);
                        }}
                      />
                      <FormInput
                        label="Preferred end date"
                        name="preferredTo"
                        type="date"
                        required
                        min={preferredFrom || undefined}
                        value={preferredTo}
                        onChange={setPreferredTo}
                      />
                    </div>
                    <FormSelect
                      label="How flexible are these dates?"
                      name="dateFlexibility"
                      required
                      value={dateFlexibility}
                      onChange={setDateFlexibility}
                      options={[
                        "Exact dates only",
                        "Flexible ± a few days",
                        "Flexible within the month",
                        "Open / need suggestions",
                      ]}
                    />
                  </div>
                )}
              </FieldGroup>

              <FieldGroup title="Your group" body="Add every traveller so accommodation and transport can be planned correctly.">
                <GuestCompositionFields
                  adults={adults}
                  children={children}
                  childAges={childAges}
                  maxGuests={maxGuests}
                  onAdults={syncAdults}
                  onChildren={syncChildren}
                  onChildAge={(index, age) =>
                    setChildAges((prev) => prev.map((value, i) => (i === index ? age : value)))
                  }
                />
              </FieldGroup>
            </div>
            <FlowActions>
              <SecureNote request />
              <Button
                className="sm:ml-auto"
                size="lg"
                onClick={() => setStep(1)}
                disabled={
                  fixed
                    ? !departureDate
                    : !preferredFrom || !preferredTo || preferredTo < preferredFrom
                }
              >
                Continue to preferences
              </Button>
            </FlowActions>
          </div>
        )}

        {step === 1 && (
          <div>
            <FlowHeading
              eyebrow="Preferences"
              title={fixed ? "Plan your stay and transport" : "Help us shape the journey"}
              body="These details help us prepare the right rooms, vehicle, pace, and inclusions."
            />
            <div className="space-y-4">
              {fixed && (
                <FieldGroup title="Room preference">
                  <FormSelect
                    label="Preferred room setup"
                    name="roomPreference"
                    required
                    value={roomPreference}
                    onChange={setRoomPreference}
                    placeholder="Select a room"
                    options={["Single occupancy", "Twin sharing", "Double occupancy", "Flexible"]}
                  />
                </FieldGroup>
              )}
              {journey.transportAvailable !== false && (
                <FieldGroup title="Private transport" body="Select a vehicle only if you would like transfers included in the quote.">
                  <TransportVehicleFields
                    options={vehicles}
                    enabled={transportation}
                    vehicleId={vehicleId}
                    note={journey.transportNote || "Airport / local transfers — priced by vehicle"}
                    onEnabled={setTransportation}
                    onVehicle={setVehicleId}
                  />
                </FieldGroup>
              )}
              <FieldGroup title="Anything else?" body="Optional—share interests, accessibility needs, dietary requirements, or must-see places.">
                <FormTextarea
                  label="Trip notes"
                  name="message"
                  rows={4}
                  value={message}
                  onChange={setMessage}
                  placeholder={
                    fixed
                      ? "Allergies, special needs, or preferences…"
                      : "Preferred pace, stay style, must-sees…"
                  }
                />
              </FieldGroup>
            </div>
            <FlowActions>
              <Button variant="text" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button size="lg" onClick={() => setStep(2)} disabled={fixed && !roomPreference}>
                Continue to contact
              </Button>
            </FlowActions>
          </div>
        )}

        {step === 2 && (
          <div>
            <FlowHeading
              eyebrow="Contact details"
              title="Where can our trip designer reach you?"
              body="We’ll review your request and respond with availability and the next steps."
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
            {error && <p className="mt-3 text-sm text-primary">{error}</p>}
            <FlowActions>
              <Button variant="text" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button size="lg" onClick={submit} disabled={busy || !name || !email || !phone}>
                {busy ? "Sending…" : fixed ? "Reserve your seat" : "Send customise request"}
              </Button>
            </FlowActions>
          </div>
        )}
      </FlowShell>

      <FlowSummary
        eyebrow={fixed ? "Reservation summary" : "Customise summary"}
        title={journey.name}
        subtitle={`${journey.days} Days / ${journey.nights} Nights`}
        footer={
          <div className="space-y-2">
            {!fixed && (
              <Link href={`/journeys/${journey.slug}/book`} className="block text-sm font-semibold text-accent hover:underline">
                Prefer a calculated quote? Book now →
              </Link>
            )}
            <Link href={`/journeys/${journey.slug}`} className="block text-sm font-semibold text-accent hover:underline">
              ← View journey details
            </Link>
          </div>
        }
      >
        <div className="mt-6 space-y-2 text-sm">
          {fixed && departureDate ? <Row label="Departure" value={departureDate} /> : null}
          {!fixed && preferredFrom ? (
            <Row
              label="Preferred dates"
              value={
                preferredTo && preferredTo !== preferredFrom
                  ? `${preferredFrom} → ${preferredTo}`
                  : preferredFrom
              }
            />
          ) : null}
          {!fixed && dateFlexibility ? <Row label="Flexibility" value={dateFlexibility} /> : null}
          <Row label={`Adults × ${adults}`} value={formatINR(journey.priceFrom * adults)} />
          {children > 0 && (
            <Row label={`Children × ${children}`} value={formatINR(childRate * children)} />
          )}
          {transportation && selectedVehicle && (
            <Row label={selectedVehicle.label} value={formatINR(selectedVehicle.price)} />
          )}
          <div className="mt-4 border-t border-outline-variant/25 pt-4">
            <Row label="Estimated total" value={formatINR(estimatedTotal)} bold />
          </div>
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">
          Estimate only — final quote confirmed by TRIS.
        </p>
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
