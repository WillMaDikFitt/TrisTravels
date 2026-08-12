"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import {
  FormCard,
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

const timingOptions = [
  { label: "Flexible", value: "flexible" },
  { label: "Within a month", value: "within-month" },
  { label: "Next few months", value: "next-few-months" },
  { label: "I have dates", value: "specific" },
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  group: string;
  timing: string;
  start: string;
  notes: string;
};

export default function CraftMyJourneyPage() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    group: "2",
    timing: "flexible",
    start: "",
    notes: "",
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const valid =
    form.name.trim() &&
    form.email.trim().includes("@") &&
    form.phone.trim().length >= 8 &&
    form.group;

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
        body="Name, contact, group size — then send. Add dates or ideas only if you want."
        primaryCta={{ href: "#craft-form", label: "Start your enquiry" }}
        secondaryCta={{ href: "/journeys", label: "See ready packages" }}
      />

      <section
        id="craft-form"
        className="scroll-mt-header mx-auto max-w-xl px-margin-mobile py-14 md:px-margin-desktop md:py-20"
      >
        <FadeIn>
          <FormCard>
            <p className="mb-6 text-sm text-on-surface-variant">
              This creates an enquiry, not a booking. We’ll reply within 1–2 working days.
            </p>

            <form
              className="space-y-7"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!valid) return;
                setSending(true);
                setSubmitError("");
                try {
                  const timingLabel =
                    timingOptions.find((t) => t.value === form.timing)?.label ?? form.timing;
                  const res = await submitEnquiry({
                    source: "craft-my-journey",
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    message: form.notes || "Craft My Journey brief",
                    payload: {
                      group: form.group,
                      timing: timingLabel,
                      start: form.timing === "specific" ? form.start : undefined,
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
                  Group size <span className="text-accent">*</span>
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

              <fieldset>
                <legend className="text-sm font-medium text-primary">When roughly?</legend>
                <p className="mt-1 text-xs text-on-surface-variant">Optional — tap one if you know</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {timingOptions.map((t) => {
                    const active = form.timing === t.value;
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setField("timing", t.value)}
                        className={cn(
                          "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                          active
                            ? "border-primary bg-primary text-on-primary"
                            : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                        )}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
                {form.timing === "specific" && (
                  <div className="mt-4">
                    <FormInput
                      label="Start date"
                      name="start"
                      type="date"
                      min={daysFromNow(1)}
                      value={form.start}
                      onChange={(v) => setField("start", v)}
                    />
                  </div>
                )}
              </fieldset>

              <FormTextarea
                label="Anything else?"
                name="notes"
                rows={3}
                placeholder="Trip length, interests, budget, kids, dietary needs… all optional"
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
