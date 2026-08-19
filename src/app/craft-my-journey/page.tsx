"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import {
  FormCard,
  FormChipGroup,
  FormInput,
  FormSuccess,
  FormTextarea,
} from "@/components/ui/Form";
import { media } from "@/data/media";
import { cn, daysFromNow } from "@/lib/utils";
import { submitEnquiry } from "@/lib/actions/enquiries";

const vehicleOptions = ["Sedan", "SUV", "Traveller", "Flexible"];
const stayOptions = ["Homestay", "Boutique hotel", "Resort", "Camping", "A mix of stays"];

const experienceOptions = [
  "Trekking & trails",
  "Culture & villages",
  "Food & markets",
  "Scenic & relaxed",
  "Root bridges",
];

const foodOptions = ["No preference", "Vegetarian", "Jain"];

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
        {label} {required ? <span className="text-accent">*</span> : null}
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
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<string[]>([]);
  const [stays, setStays] = useState<string[]>([]);
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
      notes: "",
    };
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const valid =
    form.name.trim() &&
    form.email.trim().includes("@") &&
    form.phone.trim().length >= 8 &&
    Number(form.adults) > 0 &&
    Number(form.children) >= 0 &&
    (Number(form.children) === 0 || form.childAges.trim()) &&
    form.start &&
    form.end &&
    form.end >= form.start;

  if (sent) {
    return (
      <div className="bg-background">
        <FormSuccess
          title="Request received"
          body="A TRIS planner will review your enquiry and follow up personally — usually within 1–2 working days."
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/journeys">Browse ready journeys</Button>
            <Button href="/" variant="ghost">
              Back home
            </Button>
          </div>
        </FormSuccess>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageHero
        src={media.local.groupTrail}
        alt="Sunset over the Meghalaya hills"
        compact
        eyebrow="Personalised travel"
        title="Craft My Journey"
        body="Tell us who’s travelling and when — we’ll plan the rest."
        primaryCta={{ href: "#craft-form", label: "Start your enquiry" }}
        secondaryCta={{ href: "/journeys", label: "See ready packages" }}
      />

      <section
        id="craft-form"
        className="scroll-mt-header mx-auto max-w-container-max px-margin-mobile py-14 md:px-margin-desktop md:py-20"
      >
        <FadeIn>
          <FormCard>
            <p className="mb-6 text-sm text-on-surface-variant">
              Book at least 5 days ahead. This creates an enquiry — we’ll reply within 1–2 working days.
            </p>

            <form
              className="space-y-8 lg:space-y-0"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!valid) return;
                setSending(true);
                setSubmitError("");
                try {
                  const res = await submitEnquiry({
                    source: "craft-my-journey",
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    message: form.notes || "Craft My Journey brief",
                    payload: {
                      adults: form.adults,
                      children: form.children,
                      childAges: form.childAges,
                      start: form.start,
                      end: form.end,
                      vehicles,
                      experiences,
                      food: form.food,
                      stays,
                    },
                  });
                  if (!res.ok) setSubmitError(res.error);
                  else setSent(true);
                } catch {
                  setSubmitError("Could not send. Try again.");
                } finally {
                  setSending(false);
                }
              }}
            >
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-6">
                <div className="space-y-6">
                  <p className="label-caps text-accent">You & your trip</p>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <FormInput
                      label="Full name"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(v) => setField("name", v)}
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
                      className="sm:col-span-2 lg:col-span-1 xl:col-span-2"
                      value={form.phone}
                      onChange={(v) => setField("phone", v)}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-primary">
                      Guests <span className="text-accent">*</span>
                    </p>
                    <div className="mt-3 grid gap-5 sm:grid-cols-2">
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
                    {Number(form.children) > 0 && (
                      <FormInput
                        label="Children’s ages"
                        name="childAges"
                        required
                        placeholder="For example: 4, 8"
                        className="mt-5"
                        value={form.childAges}
                        onChange={(v) => setField("childAges", v)}
                      />
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
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
                </div>

                <div className="space-y-6">
                  <p className="label-caps text-accent">Preferences</p>
                  <FormChipGroup
                    label="Vehicle"
                    name="vehicles"
                    options={vehicleOptions}
                    selected={vehicles}
                    hint="Optional"
                    onToggle={(v) =>
                      setVehicles((prev) =>
                        prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                      )
                    }
                  />

                  <FormChipGroup
                    label="Include"
                    name="experiences"
                    options={experienceOptions}
                    selected={experiences}
                    hint="Optional"
                    onToggle={(v) =>
                      setExperiences((prev) =>
                        prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                      )
                    }
                  />
                  <FormChipGroup
                    label="Stay preference"
                    name="stays"
                    options={stayOptions}
                    selected={stays}
                    hint="Choose any that suit your trip"
                    onToggle={(v) =>
                      setStays((prev) =>
                        prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                      )
                    }
                  />

                  <PillRow
                    label="Food"
                    options={foodOptions.map((f) => ({ label: f, value: f }))}
                    value={form.food}
                    onChange={(v) => setField("food", v)}
                  />

                  <FormTextarea
                    label="Anything else?"
                    name="notes"
                    rows={2}
                    placeholder="Budget, kids, accessibility…"
                    value={form.notes}
                    onChange={(v) => setField("notes", v)}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-6">
                {submitError ? (
                  <p className="text-sm text-primary" role="alert">
                    {submitError}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">
                    One short form — a planner follows up personally.
                  </p>
                )}
                <Button type="submit" size="lg" disabled={sending || !valid}>
                  {sending ? "Sending…" : "Submit enquiry"}
                </Button>
              </div>
            </form>
          </FormCard>
        </FadeIn>
      </section>

      <FullBleedParallax
        src={media.familyWaterfall}
        alt="Travellers in Meghalaya"
        title="Prefer a ready-made journey?"
        body="Browse customizable packages and fixed departures — then enquire to personalise."
        cta={{ href: "/journeys", label: "Browse journeys" }}
        height="md"
        align="center"
        overlay="soft"
      />
    </div>
  );
}
