"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput, FormTextarea } from "@/components/ui/Form";
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
  STAY_PREFERENCE_IDS,
  STAY_PREFERENCE_META,
  minVehiclesForGuests,
  resolvePackageStays,
  resolvePackageVehicles,
  suggestedExtraMattresses,
  suggestedRooms,
  type StayPreferenceId,
} from "@/data/package-pricing";
import { TRANSPORT_VEHICLE_IDS, TRANSPORT_VEHICLE_META, type TransportVehicleId } from "@/data/transport";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { quoteCuratedPackage } from "@/lib/pricing";
import { formatINR, cn } from "@/lib/utils";

const steps = ["Vehicle", "Stay", "Confirm"];

export function CuratedBookFlow({ journey }: { journey: Journey }) {
  const { user, profile } = useAuth();
  const vehicles = useMemo(
    () => resolvePackageVehicles(journey.packagePricing?.vehicles),
    [journey.packagePricing?.vehicles],
  );
  const stays = useMemo(
    () => resolvePackageStays(journey.packagePricing?.stays),
    [journey.packagePricing?.stays],
  );

  const [step, setStep] = useState(0);
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(0);
  const [vehicleId, setVehicleId] = useState<TransportVehicleId>("sedan");
  const [vehicleCount, setVehicleCount] = useState(1);
  const [stayPreference, setStayPreference] = useState<StayPreferenceId>("homestay");
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

  const totalGuests = adults + children;
  const capacity = vehicles[vehicleId]?.capacity ?? 4;
  const minVehicles = minVehiclesForGuests(totalGuests, capacity);

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

  const quote = useMemo(
    () =>
      quoteCuratedPackage(journey, {
        vehicleId,
        vehicleCount,
        stayPreference,
        rooms,
        extraMattresses,
        adults,
        children,
      }),
    [journey, vehicleId, vehicleCount, stayPreference, rooms, extraMattresses, adults, children],
  );

  const syncAdults = (next: number) => {
    const capped = Math.min(Math.max(1, next), 20);
    const nextChildren = Math.min(children, Math.max(0, 20 - capped));
    setAdults(capped);
    setChildren(nextChildren);
  };

  const syncChildren = (next: number) => {
    setChildren(Math.min(Math.max(0, next), Math.max(0, 20 - adults)));
  };

  const canLeaveVehicle = quote.capacityOk && adults >= 1;
  const canLeaveStay = rooms >= 1 && Boolean(preferredFrom);

  const submit = async () => {
    if (!quote.capacityOk) {
      setError(`Add enough vehicles — max ${capacity} guests per ${quote.vehicleLabel}.`);
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
        message: message || `Book now request for ${journey.name}`,
        payload: {
          journeySlug: journey.slug,
          journeyName: journey.name,
          bookingType: "curated-package-booking",
          preferredFrom,
          preferredTo: preferredTo || preferredFrom,
          adults,
          children,
          totalTravellers: totalGuests,
          vehicleId,
          transportVehicle: quote.vehicleLabel,
          vehicleCount,
          stayPreference: STAY_PREFERENCE_META[stayPreference].label,
          rooms,
          extraMattresses,
          vehicleCost: quote.vehicleCost,
          roomCost: quote.roomCost,
          activityCost: quote.activityCost,
          trisService: quote.trisService,
          gst: quote.gst,
          estimatedTotal: quote.total,
          pricePerPerson: quote.perPerson,
          trisServicePercent: quote.trisServicePercent,
          gstPercent: quote.gstPercent,
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
        <h1 className="mt-6 font-display text-3xl text-primary">Booking request received</h1>
        <p className="mt-3 text-on-surface-variant">
          We’ll confirm availability and next steps shortly. Ref {refId}.
        </p>
        <p className="mt-4 font-display text-2xl text-primary">{formatINR(quote.total)}</p>
        <p className="text-sm text-on-surface-variant">
          {formatINR(quote.perPerson)} / person · {totalGuests} travellers
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
              eyebrow="Step 1"
              title="Travellers & vehicle"
              body="Choose how many are travelling and the vehicle that fits your group. Guests cannot exceed vehicle capacity."
            />
            <div className="space-y-4">
              <FieldGroup title="Travellers">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    label="Adults"
                    name="adults"
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={String(adults)}
                    onChange={(v) => syncAdults(Number(v) || 1)}
                  />
                  <FormInput
                    label="Children"
                    name="children"
                    type="number"
                    min={0}
                    max={19}
                    value={String(children)}
                    onChange={(v) => syncChildren(Number(v) || 0)}
                    hint="Ages 2–8"
                  />
                </div>
              </FieldGroup>

              <FieldGroup
                title="Vehicle preference"
                body="Cost = vehicle rate × number of vehicles × journey days."
              >
                <div className="grid gap-3">
                  {TRANSPORT_VEHICLE_IDS.map((id) => {
                    const rate = vehicles[id];
                    const selected = vehicleId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setVehicleId(id);
                          setVehicleCountTouched(false);
                        }}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-left transition",
                          selected
                            ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                            : "border-outline-variant/40 hover:border-outline-variant",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-primary">{TRANSPORT_VEHICLE_META[id].label}</p>
                            <p className="mt-0.5 text-sm text-on-surface-variant">
                              Max {rate.capacity} guests · {formatINR(rate.costPerDay)} / day
                            </p>
                          </div>
                          {selected && <Check size={18} className="mt-0.5 shrink-0 text-accent" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4">
                  <FormInput
                    label="Number of vehicles"
                    name="vehicleCount"
                    type="number"
                    min={minVehicles}
                    max={10}
                    required
                    value={String(vehicleCount)}
                    onChange={(v) => {
                      setVehicleCountTouched(true);
                      setVehicleCount(Math.max(minVehicles, Math.min(10, Number(v) || minVehicles)));
                    }}
                    hint={`Minimum ${minVehicles} for ${totalGuests} guests in this vehicle type`}
                  />
                </div>
                {!quote.capacityOk && (
                  <p className="mt-3 text-sm text-red-700">
                    Too many guests for {vehicleCount} × {quote.vehicleLabel} (max {capacity * vehicleCount}).
                    Increase vehicles or choose a larger vehicle.
                  </p>
                )}
              </FieldGroup>
            </div>
            <FlowActions>
              <SecureNote request />
              <Button className="sm:ml-auto" size="lg" onClick={() => setStep(1)} disabled={!canLeaveVehicle}>
                Continue to stay
              </Button>
            </FlowActions>
          </div>
        )}

        {step === 1 && (
          <div>
            <FlowHeading
              eyebrow="Step 2"
              title="Stay preference"
              body="Pick a stay style, rooms, and any extra mattresses. Dates help us lock availability."
            />
            <div className="space-y-4">
              <FieldGroup title="Stay style">
                <div className="grid gap-3 sm:grid-cols-2">
                  {STAY_PREFERENCE_IDS.map((id) => {
                    const meta = STAY_PREFERENCE_META[id];
                    const stayRate = stays[id];
                    const selected = stayPreference === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setStayPreference(id)}
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-left transition",
                          selected
                            ? "border-accent bg-accent/5 ring-1 ring-accent/30"
                            : "border-outline-variant/40 hover:border-outline-variant",
                        )}
                      >
                        <p className="font-medium text-primary">{meta.label}</p>
                        <p className="mt-0.5 text-sm text-on-surface-variant">{meta.hint}</p>
                        <p className="mt-1 text-xs text-on-surface-variant">
                          Room {formatINR(stayRate.roomCost)} · mattress {formatINR(stayRate.extraMattressPerPerson)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </FieldGroup>

              <FieldGroup title="Rooms & mattresses">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    label="Total rooms"
                    name="rooms"
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={String(rooms)}
                    onChange={(v) => {
                      setRoomsTouched(true);
                      setRooms(Math.max(1, Number(v) || 1));
                    }}
                  />
                  <FormInput
                    label="Extra mattresses"
                    name="extraMattresses"
                    type="number"
                    min={0}
                    max={20}
                    value={String(extraMattresses)}
                    onChange={(v) => {
                      setMattressTouched(true);
                      setExtraMattresses(Math.max(0, Number(v) || 0));
                    }}
                    hint="For guests beyond 2 per room"
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
                    onChange={(value) => {
                      setPreferredFrom(value);
                      if (preferredTo && preferredTo < value) setPreferredTo(value);
                    }}
                  />
                  <FormInput
                    label="Preferred end date"
                    name="preferredTo"
                    type="date"
                    min={preferredFrom || undefined}
                    value={preferredTo}
                    onChange={setPreferredTo}
                  />
                </div>
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
              title="Confirm & send"
              body="Review the live quote, then share your contact details. We’ll confirm and share payment next."
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
                    placeholder="Dietary needs, pickup point, special requests…"
                  />
                </div>
              </FieldGroup>

              <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/60 p-4 text-sm">
                <p className="font-medium text-primary">Price breakdown</p>
                <ul className="mt-3 space-y-1.5 text-on-surface-variant">
                  <li className="flex justify-between gap-3">
                    <span>
                      A · Vehicle ({quote.vehicleCount} × {quote.days} days)
                    </span>
                    <span>{formatINR(quote.vehicleCost)}</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>
                      B · Stay ({quote.rooms} rooms
                      {quote.extraMattresses ? ` · ${quote.extraMattresses} mattress` : ""})
                    </span>
                    <span>{formatINR(quote.roomCost)}</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>C · Activities ({quote.totalGuests} guests)</span>
                    <span>{formatINR(quote.activityCost)}</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>D · TRIS services ({quote.trisServicePercent}%)</span>
                    <span>{formatINR(quote.trisService)}</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>E · GST ({quote.gstPercent}% of D)</span>
                    <span>{formatINR(quote.gst)}</span>
                  </li>
                </ul>
                <div className="mt-3 flex justify-between border-t border-outline-variant/30 pt-3 font-medium text-primary">
                  <span>Total</span>
                  <span>{formatINR(quote.total)}</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-700">{error}</p>}
              <SecureNote request />
            </div>
            <FlowActions>
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                size="lg"
                onClick={submit}
                disabled={busy || !name.trim() || !email.trim() || !phone.trim() || !quote.capacityOk}
              >
                {busy ? "Sending…" : "Submit booking request"}
              </Button>
            </FlowActions>
          </div>
        )}
      </FlowShell>

      <FlowSummary
        eyebrow="Live quote"
        title={journey.name}
        subtitle={`${journey.days} Days / ${journey.nights} Nights`}
        footer={
          <p className="text-xs leading-relaxed text-on-surface-variant">
            Prefer to shape it differently?{" "}
            <Link href={`/journeys/${journey.slug}/enquire`} className="font-semibold text-accent hover:underline">
              Customise instead
            </Link>
          </p>
        }
      >
        <div className="space-y-2 text-sm">
          <Row label="Guests" value={String(totalGuests)} />
          <Row label="Vehicles" value={`${quote.vehicleCount} × ${quote.vehicleLabel}`} />
          <Row label="Stay" value={STAY_PREFERENCE_META[stayPreference].label} />
          <Row label="Rooms" value={String(quote.rooms)} />
          <div className="mt-4 space-y-2 border-t border-outline-variant/25 pt-4">
            <Row label="Vehicle (A)" value={formatINR(quote.vehicleCost)} />
            <Row label="Stay (B)" value={formatINR(quote.roomCost)} />
            <Row label="Activities (C)" value={formatINR(quote.activityCost)} />
            <Row label={`TRIS ${quote.trisServicePercent}% (D)`} value={formatINR(quote.trisService)} />
            <Row label={`GST ${quote.gstPercent}% (E)`} value={formatINR(quote.gst)} />
          </div>
          <div className="mt-4 border-t border-outline-variant/25 pt-4">
            <Row label="Total" value={formatINR(quote.total)} bold />
            <Row label="Per person" value={formatINR(quote.perPerson)} />
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
