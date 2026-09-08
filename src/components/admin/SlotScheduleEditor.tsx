"use client";

import { useMemo, useState } from "react";
import { Plus, Sun, Clock, Timer, X } from "lucide-react";
import type { ExperienceSlotConfig } from "@/data/experiences";
import { Field, inputClass } from "@/components/admin/ui";
import { ALL_DAY_SLOT } from "@/lib/experience-slots";
import { cn } from "@/lib/utils";

type ScheduleMode = ExperienceSlotConfig["mode"];

type Value = {
  slotConfig: ExperienceSlotConfig;
  minGuests: number;
  maxGuests: number;
};

type Props = {
  value: Value;
  onChange: (next: Value) => void;
};

const MODE_CARDS: {
  id: ScheduleMode;
  title: string;
  body: string;
  icon: typeof Sun;
}[] = [
  {
    id: "day",
    title: "Whole day",
    body: "One booking window for the date. Guests don’t pick a start time.",
    icon: Sun,
  },
  {
    id: "fixed",
    title: "Several start times",
    body: "Guests choose from the times you list (e.g. 8:30, 10:00, 14:00).",
    icon: Clock,
  },
  {
    id: "interval",
    title: "Every X minutes",
    body: "Auto-create start times between open and close (e.g. every hour).",
    icon: Timer,
  },
];

function normalizeTimes(times: string[]) {
  return Array.from(
    new Set(
      times
        .map((t) => t.trim())
        .filter(Boolean)
        .filter((t) => t !== ALL_DAY_SLOT),
    ),
  ).sort();
}

function previewIntervalSlots(config: ExperienceSlotConfig) {
  const start = config.start ?? "09:00";
  const end = config.end ?? "17:00";
  const interval = Math.max(15, config.intervalMinutes ?? 60);
  const toMin = (v: string) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(v);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  };
  const fromMin = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  const a = toMin(start);
  const b = toMin(end);
  if (a === null || b === null || b < a) return [] as string[];
  const out: string[] = [];
  for (let t = a; t <= b; t += interval) {
    const stamp = fromMin(t);
    const breaks = config.breaks ?? [];
    const blocked = breaks.some((window) => {
      const s = toMin(window.start);
      const e = toMin(window.end);
      if (s === null || e === null) return false;
      return t >= s && t < e;
    });
    if (!blocked) out.push(stamp);
  }
  return out;
}

function ModeCard({
  active,
  title,
  body,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  title: string;
  body: string;
  icon: typeof Sun;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col rounded-2xl border p-4 text-left transition",
        active
          ? "border-[#364037] bg-[#364037] text-[#f8f6f1] shadow-sm"
          : "border-[#c5cbb8] bg-[#faf8f3] text-[#26352b] hover:border-[#8fa183]",
      )}
    >
      <span className="flex items-center gap-2">
        <Icon size={18} className={active ? "text-[#d4e0c4]" : "text-[#5a6b5c]"} />
        <span className="text-sm font-semibold">{title}</span>
      </span>
      <span className={cn("mt-2 text-xs leading-relaxed", active ? "text-[#d8e2cf]" : "text-[#4a5a50]")}>
        {body}
      </span>
    </button>
  );
}

/**
 * Guided Studio editor for experience booking windows + guest limits.
 * Writes through onChange; parent persists on Save.
 */
export function SlotScheduleEditor({ value, onChange }: Props) {
  const config = value.slotConfig;
  const mode = config.mode ?? "fixed";
  const times = normalizeTimes(config.times ?? []);
  const breaks = config.breaks ?? [];
  const [draftTime, setDraftTime] = useState("09:00");
  const [draftBreakStart, setDraftBreakStart] = useState("12:00");
  const [draftBreakEnd, setDraftBreakEnd] = useState("13:00");
  const sharedSlot = config.capacity != null && Number.isFinite(config.capacity);

  const patchConfig = (partial: Partial<ExperienceSlotConfig>) => {
    onChange({
      ...value,
      slotConfig: { ...config, ...partial },
    });
  };

  const setMode = (next: ScheduleMode) => {
    if (next === "day") {
      patchConfig({
        mode: "day",
        times: [ALL_DAY_SLOT],
        dayLabel: config.dayLabel?.trim() || "Full day",
      });
      return;
    }
    if (next === "interval") {
      patchConfig({
        mode: "interval",
        start: config.start ?? "09:00",
        end: config.end ?? "17:00",
        intervalMinutes: config.intervalMinutes ?? 60,
        times: undefined,
      });
      return;
    }
    patchConfig({
      mode: "fixed",
      times: times.length ? times : ["08:30", "09:00", "10:00"],
    });
  };

  const addTime = () => {
    if (!draftTime) return;
    const next = normalizeTimes([...times, draftTime]);
    patchConfig({ mode: "fixed", times: next });
  };

  const removeTime = (time: string) => {
    patchConfig({ mode: "fixed", times: times.filter((t) => t !== time) });
  };

  const guestPreview = useMemo(() => {
    const perBooking = Math.max(1, value.maxGuests);
    const perSlot = Math.max(1, config.capacity ?? value.maxGuests);
    return { perBooking, perSlot };
  }, [config.capacity, value.maxGuests]);

  const intervalPreview = mode === "interval" ? previewIntervalSlots(config) : [];

  const addBreak = () => {
    if (!draftBreakStart || !draftBreakEnd) return;
    const next = [...breaks, { start: draftBreakStart, end: draftBreakEnd }];
    patchConfig({ breaks: next });
  };

  const updateBreak = (index: number, partial: { start?: string; end?: string }) => {
    const next = breaks.map((row, i) => (i === index ? { ...row, ...partial } : row));
    patchConfig({ breaks: next });
  };

  const removeBreak = (index: number) => {
    const next = breaks.filter((_, i) => i !== index);
    patchConfig({ breaks: next.length ? next : undefined });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg text-[#26352b]">Booking schedule</h2>
        <p className="mt-1 text-sm text-[#4a5a50]">
          Choose how guests pick a date — then set how many people each booking and each slot can take.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {MODE_CARDS.map((card) => (
          <ModeCard
            key={card.id}
            active={mode === card.id}
            title={card.title}
            body={card.body}
            icon={card.icon}
            onClick={() => setMode(card.id)}
          />
        ))}
      </div>

      {mode === "day" ? (
        <div className="rounded-2xl border border-[#c5cbb8] bg-[#f6f8f1] p-4">
          <Field label="What guests see" hint="Shown instead of a clock time">
            <input
              value={config.dayLabel ?? ""}
              onChange={(e) => patchConfig({ dayLabel: e.target.value })}
              placeholder="Full day"
              className={cn(inputClass, "bg-white")}
            />
          </Field>
          <p className="mt-3 text-xs text-[#4a5a50]">
            Guests pick a date only. Use Availability if you need to close specific dates.
          </p>
        </div>
      ) : null}

      {mode === "fixed" ? (
        <div className="rounded-2xl border border-[#c5cbb8] bg-[#f6f8f1] p-4">
          <p className="text-sm font-medium text-[#26352b]">Start times guests can choose</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {times.length ? (
              times.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#c5cbb8] bg-white px-3 py-1.5 text-sm font-semibold text-[#26352b]"
                >
                  {time}
                  <button
                    type="button"
                    aria-label={`Remove ${time}`}
                    onClick={() => removeTime(time)}
                    className="rounded-full p-0.5 text-[#4a5a50] hover:bg-[#e8ebdd] hover:text-[#26352b]"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))
            ) : (
              <p className="text-sm text-[#4a5a50]">No times yet — add at least one.</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-2">
            <label className="text-sm font-medium text-[#26352b]">
              Add time
              <input
                type="time"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                className={cn(inputClass, "mt-1.5 w-36 bg-white")}
              />
            </label>
            <button
              type="button"
              onClick={addTime}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#364037] px-4 py-2.5 text-sm font-semibold text-[#f8f6f1]"
            >
              <Plus size={16} />
              Add
            </button>
          </div>
        </div>
      ) : null}

      {mode === "interval" ? (
        <div className="space-y-4 rounded-2xl border border-[#c5cbb8] bg-[#f6f8f1] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Opens">
              <input
                type="time"
                value={config.start ?? "09:00"}
                onChange={(e) => patchConfig({ start: e.target.value })}
                className={cn(inputClass, "bg-white")}
              />
            </Field>
            <Field label="Closes">
              <input
                type="time"
                value={config.end ?? "17:00"}
                onChange={(e) => patchConfig({ end: e.target.value })}
                className={cn(inputClass, "bg-white")}
              />
            </Field>
            <Field label="Every (minutes)">
              <select
                value={config.intervalMinutes ?? 60}
                onChange={(e) => patchConfig({ intervalMinutes: Number(e.target.value) })}
                className={cn(inputClass, "bg-white")}
              >
                {[15, 30, 45, 60, 90, 120].map((n) => (
                  <option key={n} value={n}>
                    {n} min
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-[#4a5a50] uppercase">Guests will see</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {intervalPreview.length ? (
                intervalPreview.map((time) => (
                  <span
                    key={time}
                    className="rounded-full border border-[#c5cbb8] bg-white px-2.5 py-1 text-xs font-semibold text-[#26352b]"
                  >
                    {time}
                  </span>
                ))
              ) : (
                <p className="text-sm text-[#4a5a50]">Check open / close times.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {mode !== "day" ? (
        <div className="rounded-2xl border border-[#c5cbb8] bg-[#f6f8f1] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#26352b]">Breaks (optional)</p>
              <p className="mt-0.5 text-xs text-[#4a5a50]">
                Hide start times inside these windows (e.g. lunch). Add as many as you need.
              </p>
            </div>
          </div>

          {breaks.length ? (
            <ul className="mt-3 space-y-2">
              {breaks.map((window, index) => (
                <li
                  key={`${window.start}-${window.end}-${index}`}
                  className="flex flex-wrap items-end gap-2 rounded-xl border border-[#c5cbb8] bg-white p-3"
                >
                  <Field label="From">
                    <input
                      type="time"
                      value={window.start}
                      onChange={(e) => updateBreak(index, { start: e.target.value })}
                      className={cn(inputClass, "w-32")}
                    />
                  </Field>
                  <Field label="To">
                    <input
                      type="time"
                      value={window.end}
                      onChange={(e) => updateBreak(index, { end: e.target.value })}
                      className={cn(inputClass, "w-32")}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeBreak(index)}
                    className="mb-0.5 inline-flex items-center gap-1 rounded-full border border-[#c5cbb8] px-3 py-2 text-xs font-semibold text-[#4a5a50] hover:border-[#c96a3d] hover:text-[#c96a3d]"
                  >
                    <X size={14} />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#4a5a50]">No breaks yet.</p>
          )}

          <div className="mt-3 flex flex-wrap items-end gap-2">
            <Field label="Break from">
              <input
                type="time"
                value={draftBreakStart}
                onChange={(e) => setDraftBreakStart(e.target.value)}
                className={cn(inputClass, "w-32 bg-white")}
              />
            </Field>
            <Field label="Break to">
              <input
                type="time"
                value={draftBreakEnd}
                onChange={(e) => setDraftBreakEnd(e.target.value)}
                className={cn(inputClass, "w-32 bg-white")}
              />
            </Field>
            <button
              type="button"
              onClick={addBreak}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#364037] px-4 py-2.5 text-sm font-semibold text-[#f8f6f1]"
            >
              <Plus size={16} />
              Add break
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[#c5cbb8] p-4">
        <p className="text-sm font-medium text-[#26352b]">Guest limit</p>
        <p className="mt-1 text-xs text-[#4a5a50]">
          One number for how many people can join — usually the same for a booking and for the{" "}
          {mode === "day" ? "day" : "start time"}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Minimum guests">
            <input
              type="number"
              min={1}
              value={value.minGuests}
              onChange={(e) =>
                onChange({
                  ...value,
                  minGuests: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className={inputClass}
            />
          </Field>
          <Field label="Maximum guests" hint={`Per ${mode === "day" ? "day" : "start time"} and per booking`}>
            <input
              type="number"
              min={1}
              value={value.maxGuests}
              onChange={(e) => {
                const maxGuests = Math.max(1, Number(e.target.value) || 1);
                onChange({
                  ...value,
                  maxGuests,
                  slotConfig: {
                    ...config,
                    // Keep shared capacity only when explicitly enabled
                    capacity: sharedSlot ? Math.max(config.capacity ?? maxGuests, maxGuests) : undefined,
                  },
                });
              }}
              className={inputClass}
            />
          </Field>
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-[#f6f8f1] px-3 py-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={sharedSlot}
            onChange={(e) => {
              if (e.target.checked) {
                patchConfig({ capacity: Math.max(value.maxGuests * 2, value.maxGuests) });
              } else {
                patchConfig({ capacity: undefined });
              }
            }}
          />
          <span>
            <span className="block text-sm font-semibold text-[#26352b]">
              Allow more than one booking on the same {mode === "day" ? "day" : "start time"}
            </span>
            <span className="mt-1 block text-xs text-[#4a5a50]">
              Turn on only if several groups can share capacity (e.g. max 4 per booking, but 12 people total).
            </span>
          </span>
        </label>

        {sharedSlot ? (
          <div className="mt-3">
            <Field
              label={`Total guests this ${mode === "day" ? "day" : "start time"} can hold`}
              hint="Across all bookings combined"
            >
              <input
                type="number"
                min={value.maxGuests}
                value={config.capacity ?? value.maxGuests}
                onChange={(e) =>
                  patchConfig({ capacity: Math.max(value.maxGuests, Number(e.target.value) || value.maxGuests) })
                }
                className={inputClass}
              />
            </Field>
            <p className="mt-2 text-xs text-[#4a5a50]">
              Example: max {guestPreview.perBooking} per booking · {guestPreview.perSlot} total → about{" "}
              {Math.max(1, Math.floor(guestPreview.perSlot / guestPreview.perBooking))} booking
              {Math.floor(guestPreview.perSlot / guestPreview.perBooking) === 1 ? "" : "s"} can share.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
