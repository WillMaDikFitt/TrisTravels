"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { HeartHandshake, Leaf, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import {
  FormInput,
  FormSelect,
  FormSuccess,
  FormTextarea,
} from "@/components/ui/Form";
import {
  FieldGroup,
  FlowActions,
  FlowHeading,
  FlowShell,
} from "@/components/forms/FlowUI";
import {
  PackageOptionsModal,
  type PackageLearnTab,
} from "@/components/booking/PackageOptionLearn";
import {
  PACKAGE_TRANSPORT,
  packageTransportMeta,
  STAY_STYLES,
  stayStyleMeta,
  type PackageTransportId,
  type StayStyleId,
} from "@/data/journey-options";
import { cn, daysFromNow } from "@/lib/utils";
import { submitEnquiry } from "@/lib/actions/enquiries";

const foodOptions = ["No preference", "Vegetarian", "Non Veg", "Jain"];

const FLOW_STEPS = ["About you", "Trip shape", "Preferences"] as const;

const INTRO_STEPS = [
  {
    n: "1",
    title: "Fill out the form & tell us about you.",
  },
  {
    n: "2",
    title:
      "While you relax and go about your day, we book, plan, and design your perfect getaway — then send you all the details.",
  },
  {
    n: "3",
    title: "You’re all set — just pack and let Meghalaya wow you!",
  },
] as const;

const STAY_FEATURES = [
  { icon: Leaf, label: "Curated for Authenticity" },
  { icon: ShieldCheck, label: "Quality & Comfort" },
  { icon: HeartHandshake, label: "Community-First stays" },
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  adults: string;
  children: string;
  childAges: string;
  start: string;
  end: string;
  food: string;
  include: string;
  budgetPerPerson: string;
  notes: string;
};

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function PillRow({
  label,
  required,
  options,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-primary">
        {label} {required ? <span className="text-highlight">*</span> : null}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function CraftMyJourneyPage() {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [learnTab, setLearnTab] = useState<PackageLearnTab>("stay");
  const [vehicleId, setVehicleId] = useState<PackageTransportId>("sedan");
  const [stayStyle, setStayStyle] = useState<StayStyleId>("barefoot");
  const [form, setForm] = useState<FormState>(() => {
    const start = daysFromNow(7);
    return {
      name: "",
      email: "",
      phone: "",
      adults: "2",
      children: "0",
      childAges: "",
      start,
      end: addDays(start, 5),
      food: "No preference",
      include: "",
      budgetPerPerson: "",
      notes: "",
    };
  });

  const transportMeta = packageTransportMeta(vehicleId);
  const stayMeta = stayStyleMeta(stayStyle);

  const transportOptions = useMemo(
    () =>
      PACKAGE_TRANSPORT.map((t) => ({
        value: t.id,
        label: `${t.label} (Max ${t.maxGuests})`,
      })),
    [],
  );
  const stayOptions = useMemo(
    () => STAY_STYLES.map((s) => ({ value: s.id, label: s.label })),
    [],
  );

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const step0Valid =
    Boolean(form.name.trim()) &&
    form.email.trim().includes("@") &&
    form.phone.trim().length >= 8 &&
    Number(form.adults) > 0 &&
    Number(form.children) >= 0 &&
    (Number(form.children) === 0 || Boolean(form.childAges.trim()));

  const step1Valid = Boolean(form.start && form.end && form.end >= form.start && vehicleId && stayStyle);

  const canSubmit = step0Valid && step1Valid;

  async function handleSubmit() {
    if (!canSubmit || sending) return;
    setSending(true);
    setSubmitError("");
    try {
      const res = await submitEnquiry({
        source: "craft-my-journey",
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.include || form.notes || "Craft My Journey brief",
        payload: {
          adults: form.adults,
          children: form.children,
          childAges: form.childAges,
          start: form.start,
          end: form.end,
          vehicleId,
          vehicleLabel: transportMeta.label,
          stayStyle,
          stayLabel: stayMeta.label,
          food: form.food,
          include: form.include,
          budgetPerPerson: form.budgetPerPerson,
          notes: form.notes,
        },
      });
      if (!res.ok) setSubmitError(res.error);
      else setSent(true);
    } catch {
      setSubmitError("Could not send. Try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-surface">
        <FormSuccess
          title="Request received"
          body="A TRIS planner will review your enquiry and follow up personally — usually within 1–2 working days."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/journeys?type=curated">Browse curated journeys</Button>
            <Button href="/" variant="ghost">
              Back home
            </Button>
          </div>
        </FormSuccess>
      </div>
    );
  }

  return (
    <div className="bg-surface text-foreground">
      <section className="border-b border-outline-variant/25 bg-primary-container px-margin-mobile pt-[calc(var(--header-offset)+2.75rem)] pb-14 text-on-primary-container md:px-margin-desktop md:pb-16">
        <div className="mx-auto w-full max-w-container-max text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl tracking-tight md:text-5xl lg:text-[3.4rem]">
            Craft my journey.
          </h1>
          <p className="mt-4 text-base font-medium text-on-primary-container/85 md:text-lg">
            It&apos;s as easy as 1, 2, 3!
          </p>

          <ol className="mx-auto mt-10 grid max-w-5xl gap-6 text-left md:grid-cols-3 md:gap-8">
            {INTRO_STEPS.map((item) => (
              <li key={item.n} className="flex gap-4 md:flex-col md:gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-highlight text-sm font-bold text-on-highlight">
                  {item.n}
                </span>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] text-highlight uppercase">
                    Step {item.n}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-on-primary-container/90 md:text-[0.95rem]">
                    {item.title}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <Button href="#craft-form" className="mt-10" size="lg">
            Craft my journey
          </Button>
        </div>
      </section>

      <section
        id="craft-form"
        className="scroll-mt-header mx-auto w-full max-w-6xl px-margin-mobile py-14 md:px-margin-desktop md:py-20"
      >
        <FadeIn>
          <FlowShell steps={[...FLOW_STEPS]} current={step}>
            {step === 0 ? (
              <div>
                <FlowHeading
                  eyebrow="Step 1 of 3"
                  title="About you"
                  body="Who’s travelling, and how we can reach you. Book at least 5 days ahead."
                />
                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                  <FieldGroup title="Contact">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        label="Full name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Your name"
                        value={form.name}
                        onChange={(v) => setField("name", v)}
                        className="sm:col-span-2"
                      />
                      <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="you@email.com"
                        value={form.email}
                        onChange={(v) => setField("email", v)}
                      />
                      <FormInput
                        label="Mobile / WhatsApp"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="+91 98XXX XXXXX"
                        value={form.phone}
                        onChange={(v) => setField("phone", v)}
                      />
                    </div>
                  </FieldGroup>

                  <FieldGroup title="Guests" body="Tell us who’s coming along.">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormInput
                        label="Adults"
                        name="adults"
                        type="number"
                        min={1}
                        required
                        value={form.adults}
                        onChange={(v) => setField("adults", v)}
                      />
                      <FormInput
                        label="Children"
                        name="children"
                        type="number"
                        min={0}
                        required
                        value={form.children}
                        onChange={(v) => setField("children", v)}
                      />
                    </div>
                    {Number(form.children) > 0 ? (
                      <FormInput
                        label="Children’s ages"
                        name="childAges"
                        required
                        placeholder="For example: 4, 8"
                        className="mt-4"
                        value={form.childAges}
                        onChange={(v) => setField("childAges", v)}
                      />
                    ) : null}
                  </FieldGroup>
                </div>
                <FlowActions>
                  <p className="text-xs text-on-surface-variant">
                    A planner follows up personally within 1–2 working days.
                  </p>
                  <Button size="lg" disabled={!step0Valid} onClick={() => setStep(1)}>
                    Continue to trip shape
                  </Button>
                </FlowActions>
              </div>
            ) : null}

            {step === 1 ? (
              <div>
                <FlowHeading
                  eyebrow="Step 2 of 3"
                  title="Shape the trip"
                  body="Dates, transport, and stay style — same choices as our curated journeys."
                />
                <div className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                    <FieldGroup title="Travel dates">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput
                          label="Arrival date"
                          name="start"
                          type="date"
                          required
                          min={daysFromNow(5)}
                          value={form.start}
                          onChange={(v) => {
                            setForm((prev) => ({
                              ...prev,
                              start: v,
                              end: prev.end < v ? addDays(v, 3) : prev.end,
                            }));
                          }}
                        />
                        <FormInput
                          label="Departure date"
                          name="end"
                          type="date"
                          required
                          min={form.start || daysFromNow(5)}
                          value={form.end}
                          onChange={(v) => setField("end", v)}
                        />
                      </div>
                    </FieldGroup>

                    <FieldGroup title="Food">
                      <PillRow
                        label="Food preference"
                        options={foodOptions.map((f) => ({ label: f, value: f }))}
                        value={form.food}
                        onChange={(v) => setField("food", v)}
                      />
                    </FieldGroup>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                    <FieldGroup title="Vehicle">
                      <FormSelect
                        label="Vehicle type"
                        name="vehicleId"
                        required
                        options={transportOptions}
                        value={vehicleId}
                        onChange={(v) => setVehicleId(v as PackageTransportId)}
                      />

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

                    <FieldGroup title="Stay options">
                      <FormSelect
                        label="Stay style"
                        name="stayStyle"
                        required
                        options={stayOptions}
                        value={stayStyle}
                        onChange={(v) => setStayStyle(v as StayStyleId)}
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

                      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                        {STAY_FEATURES.map(({ icon: Icon, label }) => (
                          <li
                            key={label}
                            className="flex items-start gap-2 rounded-xl bg-surface-container-lowest px-3 py-2.5 text-xs text-on-surface-variant sm:text-sm"
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
                  </div>
                </div>
                <FlowActions>
                  <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button size="lg" disabled={!step1Valid} onClick={() => setStep(2)}>
                    Continue to preferences
                  </Button>
                </FlowActions>
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <FlowHeading
                  eyebrow="Step 3 of 3"
                  title="Preferences & budget"
                  body="The more you share, the better we can shape the journey."
                />
                <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                  <FieldGroup title="What to include">
                    <FormTextarea
                      label="What would you like to include?"
                      name="include"
                      rows={5}
                      value={form.include}
                      onChange={(v) => setField("include", v)}
                      placeholder="e.g. locations, trekking, waterfalls, caves, local food, villages, culture, photography, quiet places…"
                    />
                  </FieldGroup>

                  <div className="space-y-4">
                    <FieldGroup
                      title="Budget"
                      body="This helps us shape the journey around what feels comfortable for you."
                    >
                      <FormInput
                        label="Budget per person (₹)"
                        name="budgetPerPerson"
                        type="number"
                        min={0}
                        step={500}
                        placeholder="Amount in ₹"
                        value={form.budgetPerPerson}
                        onChange={(v) => setField("budgetPerPerson", v)}
                        hint="Optional"
                      />
                    </FieldGroup>

                    <FieldGroup title="Anything else?">
                      <FormTextarea
                        label="Notes"
                        name="notes"
                        rows={3}
                        placeholder="Accessibility, celebrations, must-avoids…"
                        value={form.notes}
                        onChange={(v) => setField("notes", v)}
                      />
                    </FieldGroup>
                  </div>
                </div>

                {submitError ? (
                  <p className="mt-4 text-sm text-primary" role="alert">
                    {submitError}
                  </p>
                ) : null}

                <FlowActions>
                  <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button size="lg" disabled={sending || !canSubmit} onClick={() => void handleSubmit()}>
                    {sending ? "Sending…" : "Craft my journey"}
                  </Button>
                </FlowActions>
              </div>
            ) : null}
          </FlowShell>
        </FadeIn>
      </section>

      <PackageOptionsModal
        open={learnOpen}
        onClose={() => setLearnOpen(false)}
        initialTab={learnTab}
        stayId={stayStyle}
        vehicleId={vehicleId}
        onStayChange={setStayStyle}
        onVehicleChange={setVehicleId}
      />
    </div>
  );
}
