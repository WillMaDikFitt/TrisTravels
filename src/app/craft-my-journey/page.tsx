"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
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

const interestOptions = [
  "Adventure",
  "Nature",
  "Culture",
  "Food",
  "Crafts",
  "Photography",
  "Wellness",
  "Family-friendly",
];

const interestPresets: { label: string; values: string[] }[] = [
  { label: "Nature & trails", values: ["Nature", "Adventure"] },
  { label: "Culture & villages", values: ["Culture", "Food", "Crafts"] },
  { label: "Family trip", values: ["Family-friendly", "Nature", "Culture"] },
  { label: "Photo & slow", values: ["Photography", "Nature", "Wellness"] },
];

const groupOptions = [
  { label: "Solo", value: "1", hint: "1 traveller" },
  { label: "Couple", value: "2", hint: "2 travellers" },
  { label: "3–4", value: "4", hint: "Small group" },
  { label: "5–6", value: "6", hint: "Family / friends" },
  { label: "7+", value: "8", hint: "Larger group" },
];

const paceOptions = [
  { label: "Relaxed", hint: "Slow days, fewer moves" },
  { label: "Balanced", hint: "Mix of do & unwind" },
  { label: "Active", hint: "Full days outdoors" },
];

const stayOptions = [
  { label: "Homestays & village stays", hint: "Local & immersive" },
  { label: "Comfort cottages / hotels", hint: "Easy & comfortable" },
  { label: "Mix of both", hint: "Best of both" },
  { label: "Camping where possible", hint: "Outdoors-first" },
];

const durationOptions = [
  { label: "3 nights", nights: 3 },
  { label: "5 nights", nights: 5 },
  { label: "7 nights", nights: 7 },
  { label: "10 nights", nights: 10 },
];

const budgetOptions = [
  { label: "Under ₹50k", value: "Under ₹50,000 per person" },
  { label: "₹50–80k", value: "₹50,000–80,000 per person" },
  { label: "₹80k–1.2L", value: "₹80,000–1,20,000 per person" },
  { label: "₹1.2L+", value: "₹1,20,000+ per person" },
  { label: "Flexible", value: "Flexible — advise what’s possible" },
];

const notePrompts = [
  "Vegetarian / dietary needs",
  "Accessibility / mobility",
  "Celebrating something special",
  "Prefer quiet / offbeat places",
  "Travelling with kids",
];

const STEPS = [
  {
    id: "you",
    label: "About you",
    title: "Who’s travelling?",
    hint: "Tap your group size, then add how we can reach you.",
  },
  {
    id: "when",
    label: "When & how",
    title: "When do you want to go?",
    hint: "Pick a trip length — we’ll fill dates. Adjust anytime.",
  },
  {
    id: "style",
    label: "Your style",
    title: "What should we craft around?",
    hint: "Tap a preset or interests. Budget & notes are optional.",
  },
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  group: string;
  start: string;
  end: string;
  pace: string;
  stay: string;
  budget: string;
  notes: string;
};

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function ChoiceGrid({
  label,
  options,
  value,
  onChange,
  columns = 2,
}: {
  label: string;
  options: { label: string; value?: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
  columns?: 2 | 3 | 5;
}) {
  const cols =
    columns === 5
      ? "grid-cols-2 sm:grid-cols-5"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  return (
    <fieldset>
      <legend className="text-sm font-medium text-primary">{label}</legend>
      <div className={cn("mt-3 grid gap-2", cols)}>
        {options.map((o) => {
          const v = o.value ?? o.label;
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={cn(
                "rounded-xl border px-3.5 py-3 text-left transition",
                active
                  ? "border-primary bg-primary/15 text-primary shadow-sm"
                  : "border-outline-variant/40 bg-surface-container-low text-secondary hover:border-primary/40",
              )}
            >
              <span className="block text-sm font-semibold">{o.label}</span>
              {o.hint ? (
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    active ? "text-primary/80" : "text-on-surface-variant",
                  )}
                >
                  {o.hint}
                </span>
              ) : null}
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
  const [step, setStep] = useState(0);
  const [nights, setNights] = useState(5);
  const [interests, setInterests] = useState<string[]>(["Nature", "Culture"]);
  const [form, setForm] = useState<FormState>(() => {
    const start = daysFromNow(21);
    return {
      name: "",
      email: "",
      phone: "",
      group: "2",
      start,
      end: addDays(start, 5),
      pace: "Balanced",
      stay: "Mix of both",
      budget: "",
      notes: "",
    };
  });
  const [attempted, setAttempted] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const applyDuration = (n: number, startOverride?: string) => {
    setNights(n);
    setForm((prev) => {
      const start = startOverride ?? (prev.start || daysFromNow(21));
      return { ...prev, start, end: addDays(start, n) };
    });
  };

  const stepValid = useMemo(() => {
    if (step === 0) {
      return Boolean(
        form.name.trim() &&
          form.email.trim().includes("@") &&
          form.phone.trim().length >= 8 &&
          form.group,
      );
    }
    if (step === 1) {
      return Boolean(form.start && form.end && form.pace && form.stay && form.end >= form.start);
    }
    return true;
  }, [step, form]);

  const goNext = () => {
    setAttempted(true);
    if (!stepValid) return;
    setAttempted(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setAttempted(false);
    setStep((s) => Math.max(s - 1, 0));
  };

  const firstPaint = useRef(true);
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const appendNote = (prompt: string) => {
    setForm((prev) => {
      if (prev.notes.includes(prompt)) return prev;
      const next = prev.notes.trim() ? `${prev.notes.trim()}\n· ${prompt}` : `· ${prompt}`;
      return { ...prev, notes: next };
    });
  };

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

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;
  const groupLabel = groupOptions.find((g) => g.value === form.group)?.label ?? form.group;

  return (
    <div className="bg-background">
      <PageHero
        src={media.heroMist}
        alt="Craft your Meghalaya journey"
        compact
        eyebrow="Personalised travel"
        title="Craft My Journey"
        body="Three short steps. Mostly taps — type only what we need to reach you."
        primaryCta={{ href: "#craft-form", label: "Start your enquiry" }}
        secondaryCta={{ href: "/journeys", label: "See ready packages" }}
      />

      <BreathSection
        size="sm"
        eyebrow="How it works"
        title="Tap through. We’ll fill the rest."
        body="Group size, dates, pace, and interests are mostly one-tap choices. Contact details are the only typing required."
      />

      <section className="border-y border-outline-variant/20 bg-surface-container-low">
        <div className="mx-auto grid max-w-container-max gap-0 sm:grid-cols-3">
          {[
            { n: "01", t: "Quick brief", d: "Mostly taps, little typing" },
            { n: "02", t: "We craft", d: "A planner designs your route" },
            { n: "03", t: "Refine together", d: "Stays, pace, and experiences" },
          ].map((s) => (
            <div
              key={s.n}
              className="border-b border-outline-variant/20 px-margin-mobile py-7 last:border-b-0 sm:border-r sm:border-b-0 sm:px-8 sm:last:border-r-0 md:px-10"
            >
              <p className="label-caps text-accent">{s.n}</p>
              <p className="mt-2 font-display text-xl text-primary">{s.t}</p>
              <p className="mt-1 text-sm text-on-surface-variant">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="craft-form"
        className="scroll-mt-header mx-auto grid max-w-container-max gap-10 px-margin-mobile py-14 md:grid-cols-[1fr_300px] md:gap-12 md:px-margin-desktop md:py-20"
      >
        <div ref={formTopRef}>
          <FadeIn key={step}>
            <FormCard>
              <div className="mb-6 border-b border-outline-variant/20 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="label-caps text-primary">
                    Step {step + 1} of {STEPS.length}
                  </p>
                </div>

                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container"
                  role="progressbar"
                  aria-valuenow={step + 1}
                  aria-valuemin={1}
                  aria-valuemax={STEPS.length}
                  aria-label="Enquiry progress"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <ol className="mt-4 flex gap-2">
                  {STEPS.map((s, i) => (
                    <li key={s.id} className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (i < step) {
                            setAttempted(false);
                            setStep(i);
                          }
                        }}
                        disabled={i > step}
                        className={cn(
                          "w-full rounded-lg px-2 py-2 text-left transition",
                          i === step
                            ? "bg-primary/15 text-primary"
                            : i < step
                              ? "text-secondary hover:bg-surface-container-low"
                              : "cursor-default text-on-surface-variant/50",
                        )}
                      >
                        <span className="block text-[10px] font-bold tracking-[0.12em] uppercase">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="mt-0.5 block truncate text-xs font-medium md:text-sm">
                          {s.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                <h2 className="mt-5 font-display text-2xl text-primary md:text-3xl">
                  {current.title}
                </h2>
                <p className="mt-2 text-sm text-on-surface-variant">{current.hint}</p>
              </div>

              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (step < STEPS.length - 1) {
                    goNext();
                    return;
                  }
                  setAttempted(true);
                  if (!stepValid) return;
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
                        pace: form.pace,
                        stay: form.stay,
                        budget: form.budget,
                        interests,
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
                {step === 0 && (
                  <div className="space-y-6">
                    <ChoiceGrid
                      label="Group size"
                      columns={5}
                      value={form.group}
                      onChange={(v) => setField("group", v)}
                      options={groupOptions}
                    />
                    <div className="grid gap-5 md:grid-cols-2">
                      <FormInput
                        label="Full name"
                        name="name"
                        required
                        autoComplete="name"
                        autoFocus
                        enterKeyHint="next"
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
                        inputMode="email"
                        enterKeyHint="next"
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
                        inputMode="tel"
                        enterKeyHint="done"
                        placeholder="+91 98XXX XXXXX"
                        className="md:col-span-2"
                        value={form.phone}
                        onChange={(v) => setField("phone", v)}
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <fieldset>
                      <legend className="text-sm font-medium text-primary">
                        Trip length <span className="text-accent">*</span>
                      </legend>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        One tap sets your end date. Change dates below if needed.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {durationOptions.map((d) => (
                          <button
                            key={d.nights}
                            type="button"
                            onClick={() => applyDuration(d.nights)}
                            className={cn(
                              "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                              nights === d.nights
                                ? "border-primary bg-primary text-on-primary"
                                : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                            )}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="grid gap-5 md:grid-cols-2">
                      <FormInput
                        label="Travel start"
                        name="start"
                        type="date"
                        required
                        min={daysFromNow(1)}
                        value={form.start}
                        onChange={(v) => {
                          setForm((prev) => ({
                            ...prev,
                            start: v,
                            end: addDays(v, nights),
                          }));
                        }}
                      />
                      <FormInput
                        label="Travel end"
                        name="end"
                        type="date"
                        required
                        min={form.start || daysFromNow(1)}
                        value={form.end}
                        onChange={(v) => setField("end", v)}
                      />
                    </div>

                    <ChoiceGrid
                      label="Pace"
                      columns={3}
                      value={form.pace}
                      onChange={(v) => setField("pace", v)}
                      options={paceOptions}
                    />

                    <ChoiceGrid
                      label="Stay preference"
                      value={form.stay}
                      onChange={(v) => setField("stay", v)}
                      options={stayOptions}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <fieldset>
                      <legend className="text-sm font-medium text-primary">Quick start</legend>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Optional presets — or pick interests one by one below.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {interestPresets.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setInterests(p.values)}
                            className="rounded-full border border-outline-variant/40 px-3.5 py-2 text-xs font-bold tracking-wide text-secondary uppercase transition hover:border-primary hover:text-primary"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <FormChipGroup
                      label="Interests"
                      name="interests"
                      options={interestOptions}
                      selected={interests}
                      hint="Tap to select — choose as many as you like"
                      onToggle={(v) =>
                        setInterests((prev) =>
                          prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
                        )
                      }
                    />

                    <fieldset>
                      <legend className="text-sm font-medium text-primary">
                        Approximate budget{" "}
                        <span className="font-normal text-on-surface-variant">(optional)</span>
                      </legend>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {budgetOptions.map((b) => {
                          const active = form.budget === b.value;
                          return (
                            <button
                              key={b.label}
                              type="button"
                              onClick={() => setField("budget", b.value)}
                              className={cn(
                                "rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                                active
                                  ? "border-primary bg-primary text-on-primary"
                                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                              )}
                            >
                              {b.label}
                            </button>
                          );
                        })}
                      </div>
                      {/* Keep free-text budget field for custom amounts */}
                      <div className="mt-4">
                        <FormInput
                          label="Or type a custom budget"
                          name="budgetCustom"
                          hint="Skip if you used a range above"
                          placeholder="e.g. 90,000 per person"
                          value={
                            budgetOptions.some((b) => b.value === form.budget) ? "" : form.budget
                          }
                          onChange={(v) => setField("budget", v)}
                        />
                      </div>
                    </fieldset>

                    <div>
                      <FormTextarea
                        label="Tell us more (optional)"
                        name="notes"
                        rows={3}
                        placeholder="Anything else — or tap a prompt below."
                        value={form.notes}
                        onChange={(v) => setField("notes", v)}
                      />
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notePrompts.map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => appendNote(p)}
                            className="rounded-full border border-dashed border-outline-variant/50 px-3 py-1.5 text-xs text-on-surface-variant transition hover:border-primary hover:text-primary"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {attempted && !stepValid && (
                  <p className="text-sm text-primary" role="alert">
                    {step === 0
                      ? "Add your name, a valid email, and WhatsApp number to continue."
                      : "Check your dates — end should be on or after start."}
                  </p>
                )}
                {submitError && (
                  <p className="text-sm text-primary" role="alert">
                    {submitError}
                  </p>
                )}

                <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xs text-xs text-on-surface-variant">
                    {step === STEPS.length - 1
                      ? "Ready when you are — this creates an enquiry, not a booking."
                      : `Next up: ${STEPS[step + 1]?.label ?? ""}`}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {step > 0 && (
                      <Button type="button" variant="ghost" onClick={goBack}>
                        Back
                      </Button>
                    )}
                    {step < STEPS.length - 1 ? (
                      <Button type="submit" size="lg" disabled={!stepValid && attempted}>
                        Continue
                      </Button>
                    ) : (
                      <Button type="submit" size="lg" disabled={sending}>
                        {sending ? "Sending…" : "Submit enquiry"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </FormCard>
          </FadeIn>
        </div>

        <aside className="space-y-5 md:sticky md:top-36 md:self-start">
          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5 shadow-ambient">
            <p className="label-caps text-accent">Your brief so far</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-on-surface-variant">Group</dt>
                <dd className="text-right font-medium text-secondary">{groupLabel}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-on-surface-variant">Dates</dt>
                <dd className="text-right font-medium text-secondary">
                  {form.start && form.end ? `${form.start} → ${form.end}` : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-on-surface-variant">Pace</dt>
                <dd className="text-right font-medium text-secondary">{form.pace}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-on-surface-variant">Stay</dt>
                <dd className="max-w-[9rem] text-right font-medium text-secondary">{form.stay}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-on-surface-variant">Interests</dt>
                <dd className="max-w-[9rem] text-right font-medium text-secondary">
                  {interests.length ? interests.join(", ") : "—"}
                </dd>
              </div>
              {form.budget ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-on-surface-variant">Budget</dt>
                  <dd className="max-w-[9rem] text-right font-medium text-secondary">
                    {form.budget}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src={media.heroRoots}
              alt="Meghalaya trail"
              fill
              className="object-cover"
              sizes="300px"
            />
          </div>

          <div className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5">
            <p className="label-caps text-accent">What happens next</p>
            <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
              <li className="flex gap-2">
                <span className="text-accent">·</span>
                We review within 1–2 working days
              </li>
              <li className="flex gap-2">
                <span className="text-accent">·</span>A planner follows up personally
              </li>
              <li className="flex gap-2">
                <span className="text-accent">·</span>
                Together we refine stays, pace & experiences
              </li>
            </ul>
          </div>
        </aside>
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
