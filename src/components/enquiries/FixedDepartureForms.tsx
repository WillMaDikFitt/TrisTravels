"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput, FormSelect, FormTextarea } from "@/components/ui/Form";
import { FieldGroup, FlowActions, FlowHeading, FlowShell } from "@/components/forms/FlowUI";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Journey } from "@/data/journeys";
import { submitEnquiry } from "@/lib/actions/enquiries";
import { formatINR, cn } from "@/lib/utils";

function formatDeparture(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FixedRegisterForm({ journey }: { journey: Journey }) {
  const { user, profile } = useAuth();
  const dates = journey.departureSeats?.map((d) => d.date) ?? [];

  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [cityCountry, setCityCountry] = useState("");
  const [departureDate, setDepartureDate] = useState(dates[0] ?? "");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [childAges, setChildAges] = useState("");
  const [roomPreference, setRoomPreference] = useState("share");
  const [airportTransfer, setAirportTransfer] = useState("shared");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState("");

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email) setEmail((e) => e || profile.email);
    if (profile?.phone) setPhone((p) => p || profile.phone || "");
  }, [profile]);

  const valid =
    name.trim() &&
    (!email.trim() || email.includes("@")) &&
    phone.trim().length >= 8 &&
    cityCountry.trim() &&
    Number(adults) >= 1 &&
    (Number(children) === 0 || childAges.trim()) &&
    (dates.length === 0 || departureDate) &&
    roomPreference &&
    agreed;

  if (done) {
    return (
      <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center shadow-ambient md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-primary">
          <Check size={32} />
        </div>
        <h2 className="mt-6 font-display text-3xl text-primary">Thank you</h2>
        <p className="mt-3 text-on-surface-variant">
          We&apos;ll get back to you with the details. Ref {refId}.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {journey.paymentLink ? (
            <Button href={journey.paymentLink} size="lg">
              Pay now
            </Button>
          ) : null}
          <Button href={`/journeys/${journey.slug}`}>Back to journey</Button>
          <Button href="/journeys?type=small-group" variant="ghost">
            All fixed departures
          </Button>
        </div>
      </div>
    );
  }

  return (
    <FlowShell steps={["Reserve my seat"]} current={0}>
      <FlowHeading
        eyebrow="Reserve my seat"
        title="Join the group"
        body="This form secures your spot provisionally. Final confirmation follows availability check and advance payment."
      />
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid) return;
          setBusy(true);
          setError("");
          try {
            const res = await submitEnquiry({
              source: "journey",
              name,
              email,
              phone,
              message: notes || `Reserve seat for ${journey.name}`,
              payload: {
                journeySlug: journey.slug,
                journeyName: journey.name,
                journeyIdCode: journey.idCode ?? "",
                bookingType: "fixed-departure-register",
                departureDate,
                cityCountry,
                adults,
                children,
                childAges,
                roomPreference:
                  roomPreference === "share"
                    ? "Happy to share a room"
                    : "Private room (extra cost if alone)",
                airportTransfer:
                  airportTransfer === "special"
                    ? "Special airport transfer requested (extra cost)"
                    : "Shared group pickup OK",
                agreedProvisional: "yes",
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
        }}
      >
        <FieldGroup title="Traveller information">
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
              label="Email address"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              hint="Optional"
            />
            <FormInput
              label="Phone / WhatsApp"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
            />
            <FormInput
              className="sm:col-span-2"
              label="City & country of residence"
              name="cityCountry"
              required
              value={cityCountry}
              onChange={setCityCountry}
              placeholder="e.g. Bengaluru, India"
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Tour & travellers">
          <FormInput
            label="Tour you're signing up for"
            name="tour"
            value={journey.name}
            disabled
          />
          {dates.length > 0 ? (
            <div className="mt-4">
              <FormSelect
                label="Departure date"
                name="departureDate"
                required
                value={departureDate}
                onChange={setDepartureDate}
                options={dates.map((d) => ({ value: d, label: formatDeparture(d) }))}
              />
            </div>
          ) : null}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormSelect
              label="Adults"
              name="adults"
              required
              value={adults}
              onChange={setAdults}
              options={Array.from({ length: 10 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1),
              }))}
            />
            <FormSelect
              label="Children"
              name="children"
              value={children}
              onChange={setChildren}
              options={Array.from({ length: 6 }, (_, i) => ({
                value: String(i),
                label: i === 0 ? "None" : String(i),
              }))}
            />
          </div>
          {Number(children) > 0 ? (
            <FormInput
              className="mt-4"
              label="Children's ages"
              name="childAges"
              required
              value={childAges}
              onChange={setChildAges}
              placeholder="e.g. 6, 9"
            />
          ) : null}
        </FieldGroup>

        <FieldGroup title="Room preference">
          <div className="space-y-2">
            {[
              { id: "share", label: "I'm happy to share a room" },
              { id: "private", label: "I/we need a private room (extra cost applies if you are alone)" },
            ].map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition",
                  roomPreference === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-outline-variant/40 hover:border-primary/40",
                )}
              >
                <input
                  type="radio"
                  name="roomPreference"
                  className="mt-1"
                  checked={roomPreference === opt.id}
                  onChange={() => setRoomPreference(opt.id)}
                />
                <span className="text-on-surface-variant">{opt.label}</span>
              </label>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup
          title="Airport transfer"
          body="Extra cost applies for special transfers. If you’re flexible with timing and okay to wait for the shared group pickup, no special transfer is required."
        >
          <FormSelect
            label="Do you need a special airport transfer arrangement?"
            name="airportTransfer"
            value={airportTransfer}
            onChange={setAirportTransfer}
            options={[
              { value: "shared", label: "No — shared group pickup is fine" },
              { value: "special", label: "Yes — special transfer (extra cost)" },
            ]}
          />
        </FieldGroup>

        <FieldGroup
          title="Anything you'd like us to know?"
          body="While we may not be able to meet every request, we’ll always do our best to accommodate you."
        >
          <FormTextarea
            label="Notes"
            name="notes"
            rows={4}
            value={notes}
            onChange={setNotes}
            placeholder="Allergies, special needs, or preferences…"
          />
        </FieldGroup>

        <label className="flex items-start gap-3 text-sm text-on-surface-variant">
          <input
            type="checkbox"
            className="mt-1"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>
            I understand that this form secures my spot provisionally. Final confirmation will be
            sent after availability check and advance payment. I agree to the{" "}
            <Link
              href="/terms/fixed-departures"
              target="_blank"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Fixed Departures Terms &amp; Conditions
            </Link>
            .
          </span>
        </label>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <FlowActions>
          <p className="text-xs text-on-surface-variant">
            From {formatINR(journey.priceFrom)} / person · {journey.groupSize}
          </p>
          <Button type="submit" size="lg" disabled={busy || !valid}>
            {busy ? "Sending…" : "Reserve my seat"}
          </Button>
        </FlowActions>
      </form>
    </FlowShell>
  );
}

export function FixedCustomiseForm({ journey }: { journey: Journey }) {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [contactMode, setContactMode] = useState("WhatsApp");
  const [dates, setDates] = useState("");
  const [travellers, setTravellers] = useState("2");
  const [travelType, setTravelType] = useState("Solo");
  const [dream, setDream] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState("");

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email) setEmail((e) => e || profile.email);
    if (profile?.phone) setPhone((p) => p || profile.phone || "");
  }, [profile]);

  const valid =
    name.trim() &&
    (!email.trim() || email.includes("@")) &&
    phone.trim().length >= 8 &&
    dream.trim().length > 10;

  if (done) {
    return (
      <div className="rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center shadow-ambient md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-primary">
          <Check size={32} />
        </div>
        <h2 className="mt-6 font-display text-3xl text-primary">Request received</h2>
        <p className="mt-3 text-on-surface-variant">
          We&apos;ll tailor something that fits. Ref {refId}.
        </p>
        <Button className="mt-8" href={`/journeys/${journey.slug}`}>
          Back to journey
        </Button>
      </div>
    );
  }

  return (
    <FlowShell steps={["Customise"]} current={0}>
      <FlowHeading
        eyebrow="Customise"
        title="Customize your journey"
        body="We’d love to tailor a trip that’s just right for you."
      />
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!valid) return;
          setBusy(true);
          setError("");
          try {
            const res = await submitEnquiry({
              source: "journey",
              name,
              email,
              phone,
              message: dream,
              payload: {
                journeySlug: journey.slug,
                journeyName: journey.name,
                journeyIdCode: journey.idCode ?? "",
                bookingType: "fixed-departure-customise",
                preferredContact: contactMode,
                tentativeDates: dates,
                travellers,
                travelType,
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
        }}
      >
        <FieldGroup title="Traveller information">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              className="sm:col-span-2"
              label="Full name"
              name="name"
              required
              value={name}
              onChange={setName}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              hint="Optional"
            />
            <FormInput
              label="Phone (with country code)"
              name="phone"
              type="tel"
              required
              value={phone}
              onChange={setPhone}
            />
            <FormSelect
              className="sm:col-span-2"
              label="Preferred mode of contact"
              name="contactMode"
              value={contactMode}
              onChange={setContactMode}
              options={["Email", "Phone Call", "WhatsApp"]}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Trip details">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Tentative travel dates"
              name="dates"
              value={dates}
              onChange={setDates}
              placeholder="e.g. mid-November"
            />
            <FormInput
              label="Number of travellers"
              name="travellers"
              value={travellers}
              onChange={setTravellers}
            />
          </div>
          <div className="mt-4">
            <FormSelect
              label="Type of travel"
              name="travelType"
              value={travelType}
              onChange={setTravelType}
              options={["Solo", "Ladies only", "Group", "Family", "Couple"]}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Let us hear your thoughts">
          <FormTextarea
            label="Dreaming up something special?"
            name="dream"
            required
            rows={5}
            value={dream}
            onChange={setDream}
            placeholder="Tell us what kind of experience you’re looking for — changes to this itinerary, special experiences, or other services…"
          />
        </FieldGroup>

        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        <FlowActions>
          <Button type="submit" size="lg" disabled={busy || !valid}>
            {busy ? "Sending…" : "Send my request"}
          </Button>
        </FlowActions>
      </form>
    </FlowShell>
  );
}
