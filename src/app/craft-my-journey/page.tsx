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

const groupOptions = [
  { label: "Solo", value: "1" },
  { label: "Couple", value: "2" },
  { label: "3–4", value: "4" },
  { label: "5–6", value: "6" },
  { label: "7+", value: "8" },
];

const vehicleOptions = ["Sedan", "SUV", "Traveller", "Flexible"];

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
  group: string;
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

export default function CraftMyJourneyPage() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(() => {
    const start = daysFromNow(7);
    return {
      name: "",
      email: "",
      phone: "",
      group: "2",
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
    form.group &&
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
        src={media.heroMist}
        alt="Craft your Meghalaya journey"
        compact
        eyebrow="Personalised travel"
        title="Craft My Journey"
        body="Tell us who’s travelling and when — we’ll plan the rest."
        primaryCta={{ href: "#craft-form", label: "Start your enquiry" }}
        secondaryCta={{ href: "/journeys", label: "See ready packages" }}
      />

      <section
        id="craft-form"
        className="scroll-mt-header mx-auto max-w-2xl px-margin-mobile py-14 md:px-margin-desktop md:py-20"
      >
        <FadeIn>
          <FormCard>
            <p className="mb-6 text-sm text-on-surface-variant">
              Book at least 5 days ahead. This creates an enquiry — we’ll reply within 1–2 working days.
            </p>

            <form
              className="space-y-7"
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
                      group: form.group,
                      start: form.start,
                      end: form.end,
                      vehicles,
                      experiences,
                      food: form.food,
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
              <div className="grid gap-5 sm:grid-cols-2">
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
                  className="sm:col-span-2"
                  value={form.phone}
                  onChange={(v) => setField("phone", v)}
                />
              </div>

              <fieldset>
                <legend className="text-sm font-medium text-primary">
                  Guests <span className="text-accent">*</span>
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {groupOptions.map((g) => {
                    const active = form.group === g.value;
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => setField("group", g.value)}
                        className={cn(
                          "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                          active
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                        )}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

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

              <FormChipGroup
                label="Vehicle preference"
                name="vehicles"
                options={vehicleOptions}
                selected={vehicles}
                hint="Optional — tap if you know"
                onToggle={(v) =>
                  setVehicles((prev) =>
                    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                  )
                }
              />

              <FormChipGroup
                label="What should we include?"
                name="experiences"
                options={experienceOptions}
                selected={experiences}
                hint="Optional — trekking, culture, food…"
                onToggle={(v) =>
                  setExperiences((prev) =>
                    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                  )
                }
              />

              <fieldset>
                <legend className="text-sm font-medium text-primary">Food preference</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {foodOptions.map((f) => {
                    const active = form.food === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setField("food", f)}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          active
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                        )}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <FormTextarea
                label="Anything else?"
                name="notes"
                rows={3}
                placeholder="Budget, kids, accessibility, places you’ve heard about…"
                value={form.notes}
                onChange={(v) => setField("notes", v)}
              />

              {submitError && (
                <p className="text-sm text-primary" role="alert">
                  {submitError}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={sending || !valid}
              >
                {sending ? "Sending…" : "Submit enquiry"}
              </Button>
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
