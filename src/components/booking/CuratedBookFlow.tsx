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
  packageTransportList,
  packageTransportMeta,
  toLegacyTransportId,
  normalizePackageTransportId,
  bookingStayStyles,
  stayStyleMeta,
  type PackageTransportId,
} from "@/data/journey-options";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { PackageOptionsModal, type PackageLearnTab } from "@/components/booking/PackageOptionLearn";
import {
  minVehiclesForGuests,
  resolvePackageVehicles,
  type BookingStayStyleId,
} from "@/data/package-pricing";
import { CHILD_AGE_SELECT_OPTIONS, isValidChildAge } from "@/data/child-ages";
import { submitEnquiry } from "@/lib/actions/enquiries";
import {
  previewDiscountedTotal,
  recordAdvancePaidAndNotify,
} from "@/lib/actions/payments";
import { quoteCuratedPackage } from "@/lib/pricing";
import { fetchFleetVehicles, fetchStayStyles } from "@/lib/actions/content-read";
import type { FleetVehicle } from "@/data/transport";
import type { StayStyle } from "@/data/stay-styles";
import { site } from "@/data/site";
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

function minOnlineStartDate() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + CURATED_ONLINE_BOOK_DAYS);
  return d.toISOString().slice(0, 10);
}

export function CuratedBookFlow({ journey }: { journey: Journey }) {
  const { user, profile } = useAuth();
  const dateMin = useMemo(() => minOnlineStartDate(), []);

  const [step, setStep] = useState(0);
  const [adults, setAdults] = useState<number | "">("");
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [vehicleId, setVehicleId] = useState<PackageTransportId | "">("");
  const [vehicleCount, setVehicleCount] = useState<number | "">("");
  const [stayStyle, setStayStyle] = useState<BookingStayStyleId | "">("");
  const [rooms, setRooms] = useState<number | "">("");
  const [extraMattresses, setExtraMattresses] = useState(0);
  const [preferredFrom, setPreferredFrom] = useState("");
  const [preferredTo, setPreferredTo] = useState("");
  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [message, setMessage] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountNote, setDiscountNote] = useState("");
  const [discountBusy, setDiscountBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState("");
  const [paid, setPaid] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [learnTab, setLearnTab] = useState<PackageLearnTab>("stay");
  const [fleet, setFleet] = useState<FleetVehicle[] | null>(null);
  const [stays, setStays] = useState<StayStyle[] | null>(null);

  const adultCount = typeof adults === "number" ? adults : 0;
  const roomCount = typeof rooms === "number" ? rooms : 0;
  const vehicleCountNum = typeof vehicleCount === "number" ? vehicleCount : 0;
  const totalGuests = adultCount + children;
  const transportMeta = packageTransportMeta(vehicleId || "sedan", fleet);
  const stayMeta = stayStyleMeta(stayStyle || "barefoot", stays);
  const packageVehicles = useMemo(
    () => resolvePackageVehicles(journey.packagePricing?.vehicles),
    [journey.packagePricing?.vehicles],
  );
  const capacity = Math.max(
    1,
    packageVehicles[toLegacyTransportId(normalizePackageTransportId(vehicleId || "sedan"))]?.capacity ??
      transportMeta.maxGuests,
  );
  const minVehicles = minVehiclesForGuests(Math.max(totalGuests, 1), capacity);
  const onlineBookOk = !preferredFrom || canBookCuratedOnline(preferredFrom);
  const selectionsReady = Boolean(
    adultCount >= 1 && vehicleId && vehicleCountNum >= 1 && stayStyle && roomCount >= 1,
  );

  const adultOptions = useMemo(
    () => [
      { value: "", label: "Select adults" },
      ...rangeOptions(1, 20, (n) => `${n} adult${n === 1 ? "" : "s"}`),
    ],
    [],
  );
  const childOptions = useMemo(
    () =>
      rangeOptions(0, Math.max(0, 20 - Math.max(adultCount, 1)), (n) =>
        n === 0 ? "No children" : `${n} child${n === 1 ? "" : "ren"}`,
      ),
    [adultCount],
  );
  const vehicleCountOptions = useMemo(
    () => [
      { value: "", label: "Select vehicles" },
      ...rangeOptions(1, 10, (n) => `${n} vehicle${n === 1 ? "" : "s"}`),
    ],
    [],
  );
  const roomOptions = useMemo(
    () => [
      { value: "", label: "Select rooms" },
      ...rangeOptions(1, 20, (n) => `${n} room${n === 1 ? "" : "s"}`),
    ],
    [],
  );
  const mattressOptions = useMemo(
    () => rangeOptions(0, 20, (n) => (n === 0 ? "None" : `${n} mattress${n === 1 ? "" : "es"}`)),
    [],
  );
  const transportOptions = useMemo(
    () => [
      { value: "", label: "Select vehicle type" },
      ...packageTransportList(fleet).map((t) => ({
        value: t.id,
        label: `${t.label} (Max ${t.maxGuests})`,
      })),
    ],
    [fleet],
  );
  const stayOptions = useMemo(
    () => [
      { value: "", label: "Select stay style" },
      ...bookingStayStyles(stays).map((s) => ({ value: s.id, label: s.label })),
    ],
    [stays],
  );

  useEffect(() => {
    if (profile?.name) setName((n) => n || profile.name);
    if (profile?.email) setEmail((e) => e || profile.email);
    if (profile?.phone) setPhone((p) => p || profile.phone || "");
  }, [profile]);

  useEffect(() => {
    fetchFleetVehicles()
      .then(setFleet)
      .catch(() => setFleet(null));
    fetchStayStyles()
      .then(setStays)
      .catch(() => setStays(null));
  }, []);

  useEffect(() => {
    setChildAges((prev) => {
      if (children <= 0) return [];
      const next = prev.slice(0, children);
      while (next.length < children) next.push(NaN);
      return next;
    });
  }, [children]);

  useEffect(() => {
    if (!preferredFrom) {
      setPreferredTo("");
      return;
    }
    setPreferredTo(journeyEndDate(preferredFrom, journey.nights));
  }, [preferredFrom, journey.nights]);

  const quote = useMemo(() => {
    if (!selectionsReady || !vehicleId || !stayStyle) return null;
    return quoteCuratedPackage(journey, {
      vehicleId,
      vehicleCount: Math.max(vehicleCountNum, minVehicles),
      stayPreference: stayStyle,
      rooms: roomCount,
      extraMattresses,
      adults: adultCount,
      children,
    });
  }, [
    journey,
    selectionsReady,
    vehicleId,
    vehicleCountNum,
    minVehicles,
    stayStyle,
    roomCount,
    extraMattresses,
    adultCount,
    children,
  ]);

  const priced = useMemo(() => {
    if (!quote) return null;
    if (discountPercent <= 0) {
      return {
        total: quote.total,
        advanceAmount: quote.advanceAmount,
        balanceAmount: quote.balanceAmount,
        saved: 0,
      };
    }
    const total = Math.round(quote.total * (1 - discountPercent / 100));
    const advanceAmount = Math.round(total * 0.5);
    return {
      total,
      advanceAmount,
      balanceAmount: total - advanceAmount,
      saved: quote.total - total,
    };
  }, [quote, discountPercent]);

  const capacityOk = quote?.capacityOk ?? true;
  const childAgesComplete =
    children === 0 || (childAges.length === children && childAges.every(isValidChildAge));

  const canLeaveVehicle =
    adultCount >= 1 && Boolean(vehicleId) && vehicleCountNum >= 1 && capacityOk && childAgesComplete;
  const canLeaveStay = Boolean(stayStyle) && roomCount >= 1 && Boolean(preferredFrom) && onlineBookOk;

  const saveEnquiry = async (paymentExtra?: Record<string, string | number>) => {
    const res = await submitEnquiry({
      source: "journey",
      name,
      email,
      phone,
      message: message || `Book now — 50% advance for ${journey.name}`,
      payload: {
        journeySlug: journey.slug,
        journeyName: journey.name,
        backendId: journey.backendId || journey.idCode || "",
        bookingType: "curated-package-booking",
        paymentPlan: "50-advance-50-balance",
        preferredFrom,
        preferredTo: preferredTo || preferredFrom,
        adults: adultCount,
        children,
        childAges: children > 0 ? childAges.map(String) : [],
        totalTravellers: totalGuests,
        vehicleId: vehicleId || "",
        transportVehicle: quote?.vehicleLabel || "",
        vehicleCount: vehicleCountNum,
        stayPreference: stayMeta.label,
        stayStyle: stayStyle || "",
        rooms: roomCount,
        extraMattresses,
        estimatedTotal: priced?.total ?? quote?.total ?? 0,
        advanceAmount: priced?.advanceAmount ?? quote?.advanceAmount ?? 0,
        balanceAmount: priced?.balanceAmount ?? quote?.balanceAmount ?? 0,
        balanceDueDaysBeforeTravel: CURATED_BALANCE_DUE_DAYS,
        pricePerPerson: quote?.perPerson ?? 0,
        discountCode: discountCode.trim().toUpperCase(),
        discountPercent,
        paymentLink: journey.paymentLink || "",
        ...paymentExtra,
      },
      uid: user?.uid,
    });
    return res;
  };

  const openRazorpayForEnquiry = async (enquiryId: string) => {
    if (!priced) return { paid: false as const, reason: "unavailable" as const };
    return openRazorpayCheckout({
      amountInr: priced.advanceAmount,
      receipt: enquiryId,
      description: `50% advance — ${journey.name}`,
      notes: {
        journeySlug: journey.slug,
        enquiryId,
      },
      prefill: {
        name,
        email,
        contact: phone,
      },
    });
  };

  const submit = async () => {
    if (!quote || !priced || !termsAccepted) return;
    if (!capacityOk) {
      setError(`Add enough vehicles — max ${capacity} guests per ${quote.vehicleLabel}.`);
      return;
    }
    if (!onlineBookOk) {
      setError(
        `Online booking opens ${CURATED_ONLINE_BOOK_DAYS}+ days before travel. Please enquire or customise instead.`,
      );
      return;
    }
    if (!childAgesComplete) {
      setError("Please select an age for each child.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const res = await saveEnquiry();
      if (!res.ok) {
        setError(res.error);
        return;
      }

      let paymentOk = false;
      let paymentId = "";
      let orderId = "";

      if (site.razorpayKeyId) {
        try {
          const pay = await openRazorpayForEnquiry(res.id);
          if (pay.paid) {
            paymentOk = true;
            paymentId = pay.paymentId || "";
            orderId = pay.orderId || "";
            await saveEnquiry({
              paymentStatus: "advance-paid",
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId,
              enquiryRef: res.id,
            });
            await recordAdvancePaidAndNotify({
              enquiryId: res.id,
              paymentId,
              orderId,
            });
          } else {
            setRefId(res.id);
            setDone(true);
            setPaid(false);
            return;
          }
        } catch (err) {
          console.error(err);
          // Fall through to link / enquiry success
        }
      }

      if (!paymentOk && journey.paymentLink) {
        setRefId(res.id);
        setDone(true);
        setPaid(false);
        window.open(journey.paymentLink, "_blank", "noopener,noreferrer");
        return;
      }

      setRefId(res.id);
      setPaid(paymentOk);
      setDone(true);
    } catch {
      setError("Could not complete booking. Try again.");
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
          {paid ? "Booking confirmed" : "Booking request received"}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          {paid
            ? "Your 50% advance is received. We’ll send confirmation details shortly."
            : "We’ve saved your booking. Complete the advance payment if a payment window opened, or we’ll share next steps shortly."}{" "}
          Ref {refId}.
        </p>
        {quote ? (
          <>
            <p className="mt-4 font-display text-2xl font-semibold text-primary">
              {formatINR(priced?.advanceAmount ?? quote.advanceAmount)}
            </p>
            <p className="text-sm text-on-surface-variant">
              advance of {formatINR(priced?.total ?? quote.total)} total (incl. GST) · {totalGuests}{" "}
              travellers
            </p>
          </>
        ) : null}
        <p className="mt-3 text-xs text-on-surface-variant">
          50% to confirm. Remaining balance due {CURATED_BALANCE_DUE_DAYS} days before travel.
        </p>
        {!paid && journey.paymentLink ? (
          <a
            href={journey.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-cta px-6 text-[12px] font-bold tracking-[0.14em] text-on-cta uppercase"
          >
            Pay advance now
          </a>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href={`/journeys/${journey.slug}`}>Back to journey</Button>
          <Button href="/account?tab=bookings" variant="ghost">
            My account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <FlowShell steps={steps} current={step} onStepClick={(i) => setStep(i)}>
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
                      value={adults === "" ? "" : String(adults)}
                      onChange={(v) => {
                        if (!v) {
                          setAdults("");
                          return;
                        }
                        const next = Math.min(Math.max(1, Number(v) || 1), 20);
                        setAdults(next);
                        setChildren((c) => Math.min(c, Math.max(0, 20 - next)));
                      }}
                    />
                    <FormSelect
                      label="Children"
                      name="children"
                      options={childOptions}
                      value={String(children)}
                      onChange={(v) => setChildren(Math.max(0, Number(v) || 0))}
                    />
                  </div>
                  {children > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {Array.from({ length: children }, (_, index) => (
                        <FormSelect
                          key={index}
                          label={`Child ${index + 1} age`}
                          name={`child-age-${index}`}
                          required
                          options={[
                            { value: "", label: "Select age" },
                            ...CHILD_AGE_SELECT_OPTIONS.map((o) => ({
                              value: o.value,
                              label: o.label,
                            })),
                          ]}
                          value={
                            Number.isFinite(childAges[index]) ? String(childAges[index]) : ""
                          }
                          onChange={(v) => {
                            const age = v === "" ? NaN : Number(v);
                            setChildAges((prev) => {
                              const next = [...prev];
                              next[index] = age;
                              return next;
                            });
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Children: ages under 1 (−1) to 9 years
                    </p>
                  )}
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
                        setVehicleId((v || "") as PackageTransportId | "");
                        setVehicleCount("");
                      }}
                    />
                    <FormSelect
                      label="Number of vehicles"
                      name="vehicleCount"
                      required
                      options={vehicleCountOptions}
                      value={vehicleCount === "" ? "" : String(vehicleCount)}
                      onChange={(v) => {
                        if (!v) {
                          setVehicleCount("");
                          return;
                        }
                        setVehicleCount(Math.max(1, Math.min(10, Number(v) || 1)));
                      }}
                    />
                  </div>

                  {vehicleId ? (
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
                  ) : null}

                  {quote && !quote.capacityOk && (
                    <p className="mt-3 text-sm text-red-700">
                      Too many guests for {vehicleCountNum} × {quote.vehicleLabel} (max{" "}
                      {capacity * vehicleCountNum}). Increase vehicles or choose a larger vehicle.
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
                    onChange={(v) => setStayStyle((v || "") as BookingStayStyleId | "")}
                  />

                  {stayStyle ? (
                    <div className="mt-4 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4">
                      <p className="font-medium text-primary">{stayMeta.label}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                        {stayMeta.short}
                      </p>
                      <p className="mt-2 text-xs font-medium text-primary/80">
                        Best for: {stayMeta.bestFor}
                      </p>
                    </div>
                  ) : null}

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
                      value={rooms === "" ? "" : String(rooms)}
                      onChange={(v) => setRooms(v ? Math.max(1, Number(v) || 1) : "")}
                    />
                    <div>
                      <FormSelect
                        label="Extra mattresses"
                        name="extraMattresses"
                        options={mattressOptions}
                        value={String(extraMattresses)}
                        onChange={(v) => setExtraMattresses(Math.max(0, Number(v) || 0))}
                      />
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Charged per mattress ×{" "}
                        {Math.max(1, journey.nights || journey.days - 1 || 1)} night(s)
                      </p>
                    </div>
                  </div>
                </FieldGroup>

                <FieldGroup title="Travel dates">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Preferred start date"
                      name="preferredFrom"
                      type="date"
                      required
                      min={dateMin}
                      value={preferredFrom}
                      onChange={setPreferredFrom}
                      hint={`Online booking from ${dateMin} onwards (${CURATED_ONLINE_BOOK_DAYS}+ days ahead)`}
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
                eyebrow="Next steps"
                title="Confirm your journey"
                body="Pay 50% at booking to confirm. The remaining balance is due 20 days before your journey."
              />
              <div className="space-y-4">
                {priced ? (
                  <div className="grid gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-low/40 p-5 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.14em] text-on-surface-variant uppercase">
                        Advance
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold text-primary">
                        {formatINR(priced.advanceAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.14em] text-on-surface-variant uppercase">
                        Balance
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold text-primary">
                        {formatINR(priced.balanceAmount)}
                      </p>
                    </div>
                  </div>
                ) : null}

                <FieldGroup title="Discount code (optional)">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <FormInput
                      className="flex-1"
                      label="Code"
                      name="discountCode"
                      value={discountCode}
                      onChange={(v) => {
                        setDiscountCode(v.toUpperCase());
                        setDiscountPercent(0);
                        setDiscountNote("");
                      }}
                      placeholder="e.g. TRIS10"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={discountBusy || !discountCode.trim() || !quote}
                      onClick={async () => {
                        if (!quote) return;
                        setDiscountBusy(true);
                        const res = await previewDiscountedTotal(quote.total, discountCode);
                        setDiscountBusy(false);
                        if (!res.ok) {
                          setDiscountPercent(0);
                          setDiscountNote(res.error);
                          return;
                        }
                        setDiscountPercent(res.percent);
                        setDiscountNote(
                          res.saved > 0
                            ? `${res.percent}% off · you save ${formatINR(res.saved)}`
                            : `${res.percent}% applied`,
                        );
                      }}
                    >
                      {discountBusy ? "Checking…" : "Apply"}
                    </Button>
                  </div>
                  {discountNote ? (
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        discountPercent > 0 ? "text-primary" : "text-red-700",
                      )}
                    >
                      {discountNote}
                    </p>
                  ) : null}
                </FieldGroup>

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

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface-variant">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-primary"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Terms &amp; Conditions
                    </Link>
                    .
                  </span>
                </label>

                {error && <p className="text-sm text-red-700">{error}</p>}
                <SecureNote request />
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
                      busy ||
                      !termsAccepted ||
                      !name.trim() ||
                      !email.trim() ||
                      !phone.trim() ||
                      !quote ||
                      !capacityOk
                    }
                  >
                    {busy
                      ? "Processing…"
                      : `Book now · ${priced ? formatINR(priced.advanceAmount) : ""}`}
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
            <Row
              label="Guests"
              value={totalGuests > 0 ? String(totalGuests) : "—"}
            />
            <Row
              label="Transport"
              value={
                vehicleId && vehicleCountNum
                  ? `${vehicleCountNum} × ${quote?.vehicleLabel || transportMeta.label}`
                  : "—"
              }
            />
            <Row label="Stay style" value={stayStyle ? stayMeta.label : "—"} />
            <Row label="Rooms" value={roomCount > 0 ? String(roomCount) : "—"} />
            {preferredFrom ? (
              <Row
                label="Dates"
                value={`${preferredFrom}${preferredTo ? ` → ${preferredTo}` : ""}`}
              />
            ) : null}

            <div className="mt-4 space-y-2.5 border-t border-outline-variant/25 pt-4">
              {priced?.saved ? (
                <Row label="Discount saved" value={formatINR(priced.saved)} />
              ) : null}
              <Row
                label="Total (Inclusive of GST)"
                value={priced ? formatINR(priced.total) : "—"}
                bold
              />
              <Row
                label="Advance amount payable (50%)"
                value={priced ? formatINR(priced.advanceAmount) : "—"}
                bold
              />
              <Row
                label={`Balance Amount (Due ${CURATED_BALANCE_DUE_DAYS} days before)`}
                value={priced ? formatINR(priced.balanceAmount) : "—"}
                bold
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
        stayId={stayStyle || "barefoot"}
        vehicleId={(vehicleId || "sedan") as PackageTransportId}
        fleet={fleet}
        stays={stays}
        onStayChange={(id) => {
          if (bookingStayStyles(stays).some((s) => s.id === id)) {
            setStayStyle(id as BookingStayStyleId);
          }
        }}
        onVehicleChange={(id) => {
          setVehicleId(id);
          setVehicleCount("");
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
