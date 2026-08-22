"use client";

import { useEffect, useMemo, useState } from "react";
import { experiences as staticExperiences } from "@/data/experiences";
import { fetchClosuresAdmin, fetchExperiencesAdmin } from "@/lib/actions/content-read";
import { deleteClosure, saveClosure } from "@/lib/actions/cms";
import type { ClosureRecord } from "@/lib/types";
import { dateIsClosed } from "@/lib/catalog";
import { experienceSlots } from "@/lib/experience-slots";
import { AdminButton, EmptyState, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function datesInRange(from: string, to?: string) {
  if (!from) return [];
  const end = to && to >= from ? to : from;
  const out: string[] = [];
  const cursor = new Date(`${from}T12:00:00`);
  const last = new Date(`${end}T12:00:00`);
  while (cursor <= last) {
    out.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function formatDateList(dates: string[]) {
  if (!dates.length) return "—";
  const sorted = [...dates].sort();
  const consecutive =
    sorted.length > 1 &&
    sorted.every((d, i) => i === 0 || datesInRange(sorted[i - 1], d).length === 2);
  if (consecutive) {
    const a = new Date(`${sorted[0]}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const b = new Date(`${sorted[sorted.length - 1]}T12:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${a} – ${b} (${sorted.length} days)`;
  }
  return sorted
    .map((d) =>
      new Date(`${d}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    )
    .join(", ");
}

function prettyDay(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function closureTouchesDate(closure: ClosureRecord, iso: string) {
  const weekday = new Date(`${iso}T12:00:00`).getDay();
  return Boolean(closure.dates?.includes(iso) || closure.weekdays?.includes(weekday));
}

function blockedSlotsForDate(iso: string, closures: ClosureRecord[], allSlots: string[]) {
  if (dateIsClosed(iso, closures)) return { mode: "full" as const, slots: [] as string[] };
  const slots = allSlots.filter((slot) => dateIsClosed(iso, closures, slot));
  return { mode: slots.length ? ("slots" as const) : ("open" as const), slots };
}

async function removeDatesFromClosures(closures: ClosureRecord[], datesToRemove: string[]) {
  for (const closure of closures) {
    const dates = closure.dates ?? [];
    if (!dates.length) continue;
    const nextDates = dates.filter((date) => !datesToRemove.includes(date));
    if (nextDates.length === dates.length) continue;
    if (!nextDates.length && !(closure.weekdays?.length)) {
      await deleteClosure(closure.id);
    } else {
      await saveClosure({ ...closure, dates: nextDates });
    }
  }
}

export default function AdminAvailabilityPage() {
  const [catalog, setCatalog] = useState(staticExperiences);
  const [slug, setSlug] = useState(staticExperiences[0]?.slug ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [scope, setScope] = useState<"full" | "slots">("full");
  const [reason, setReason] = useState("Closed");
  const [rows, setRows] = useState<ClosureRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [showWeekdays, setShowWeekdays] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const refresh = async () => {
    const list = await fetchClosuresAdmin();
    setRows(list);
    return list;
  };

  useEffect(() => {
    refresh().catch(() => undefined);
    fetchExperiencesAdmin()
      .then((list) => {
        if (list.length) {
          setCatalog(list);
          setSlug((prev) => prev || list[0].slug);
        }
      })
      .catch(() => undefined);
  }, []);

  const forExperience = useMemo(
    () => rows.filter((c) => c.experienceSlug === slug),
    [rows, slug],
  );
  const selectedExperience = catalog.find((experience) => experience.slug === slug);
  const slots = selectedExperience ? experienceSlots(selectedExperience) : [];
  const selectedDates = datesInRange(from, to);
  const singleDay = selectedDates.length === 1 ? selectedDates[0] : "";
  const selectedLabel =
    selectedDates.length === 0
      ? "No days selected"
      : selectedDates.length === 1
        ? prettyDay(selectedDates[0])
        : `${prettyDay(selectedDates[0])} → ${prettyDay(selectedDates[selectedDates.length - 1])} · ${selectedDates.length} days`;

  const dayStatus = useMemo(() => {
    if (!singleDay) return null;
    return blockedSlotsForDate(singleDay, forExperience, slots);
  }, [singleDay, forExperience, slots]);

  const overlappingBlocks = useMemo(() => {
    if (!selectedDates.length) return [] as ClosureRecord[];
    return forExperience.filter((closure) => selectedDates.some((date) => closureTouchesDate(closure, date)));
  }, [forExperience, selectedDates]);

  const weekdayOnlyConflicts = useMemo(() => {
    if (!selectedDates.length) return [] as ClosureRecord[];
    return forExperience.filter(
      (closure) =>
        Boolean(closure.weekdays?.length) &&
        !(closure.dates?.length) &&
        selectedDates.some((date) => closure.weekdays?.includes(new Date(`${date}T12:00:00`).getDay())),
    );
  }, [forExperience, selectedDates]);

  const cells = monthMatrix(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const resetComposer = () => {
    setFrom("");
    setTo("");
    setWeekdays([]);
    setBlockedSlots([]);
    setScope("full");
    setReason("Closed");
    setEditingId(null);
    setShowWeekdays(false);
  };

  const hydrateFromDay = (iso: string, closures = forExperience) => {
    const status = blockedSlotsForDate(iso, closures, slots);
    if (status.mode === "full") {
      setScope("full");
      setBlockedSlots([]);
    } else if (status.mode === "slots") {
      setScope("slots");
      setBlockedSlots(status.slots);
    } else {
      setScope("full");
      setBlockedSlots([]);
    }
  };

  const pickDay = (iso: string) => {
    setError("");
    setNote("");
    setEditingId(null);
    if (!from || (from && to)) {
      setFrom(iso);
      setTo("");
      hydrateFromDay(iso);
      return;
    }
    if (iso === from) {
      setTo(iso);
      hydrateFromDay(iso);
      return;
    }
    if (iso < from) {
      setTo(from);
      setFrom(iso);
      setScope("full");
      setBlockedSlots([]);
      return;
    }
    setTo(iso);
    setScope("full");
    setBlockedSlots([]);
  };

  const loadBlock = (closure: ClosureRecord) => {
    setEditingId(closure.id);
    setSlug(closure.experienceSlug);
    const dates = [...(closure.dates ?? [])].sort();
    setFrom(dates[0] ?? "");
    setTo(dates.length > 1 ? dates[dates.length - 1] : dates[0] ?? "");
    setWeekdays(closure.weekdays ?? []);
    if (closure.slots?.length) {
      setScope("slots");
      setBlockedSlots(closure.slots);
    } else {
      setScope("full");
      setBlockedSlots([]);
    }
    setReason(closure.reason || "Closed");
    setShowWeekdays(Boolean(closure.weekdays?.length));
    setError("");
    setNote(
      closure.slots?.length
        ? `Editing slot block · ${closure.slots.join(", ")}`
        : `Editing full-day block · ${closure.reason || "Closed"}`,
    );
    if (dates[0]) {
      const d = new Date(`${dates[0]}T12:00:00`);
      setCursor({ y: d.getFullYear(), m: d.getMonth() });
    }
  };

  /** Replace date-based blocks on selected days with the chosen full-day or slot rule. */
  const saveBlock = async () => {
    const dates = datesInRange(from, to);
    if (!dates.length && !weekdays.length) {
      setError("Select one or more days on the calendar, or choose repeating weekdays.");
      return;
    }
    if (scope === "slots" && !blockedSlots.length) {
      setError("Pick at least one time slot, or switch to Full day.");
      return;
    }
    if (to && from && to < from) {
      setError("End date should be on or after the start date.");
      return;
    }
    if (weekdayOnlyConflicts.length && dates.length) {
      setError(
        "A repeating weekday rule already covers these days. Edit or remove that rule first, or clear weekdays before saving a date block.",
      );
      return;
    }

    setBusy(true);
    setError("");
    try {
      // When editing one saved rule, update it in place.
      if (editingId) {
        await saveClosure({
          id: editingId,
          experienceSlug: slug,
          dates,
          weekdays,
          slots: scope === "slots" ? blockedSlots : [],
          reason: reason.trim() || "Closed",
          soldOut: reason.toLowerCase().includes("sold"),
        });
        setNote(scope === "slots" ? "Slot block updated." : "Full-day block updated.");
        resetComposer();
        await refresh();
        return;
      }

      // Otherwise sync selected dates to the desired slot/full-day state.
      if (dates.length) {
        const dateClosures = forExperience.filter((closure) =>
          dates.some((date) => closure.dates?.includes(date)),
        );
        await removeDatesFromClosures(dateClosures, dates);
        await saveClosure({
          experienceSlug: slug,
          dates,
          weekdays: [],
          slots: scope === "slots" ? blockedSlots : [],
          reason: reason.trim() || "Closed",
          soldOut: reason.toLowerCase().includes("sold"),
        });
      }

      if (weekdays.length) {
        await saveClosure({
          experienceSlug: slug,
          dates: [],
          weekdays,
          slots: scope === "slots" ? blockedSlots : [],
          reason: reason.trim() || "Closed",
          soldOut: reason.toLowerCase().includes("sold"),
        });
      }

      setNote(
        scope === "slots"
          ? `Saved slot block${blockedSlots.length === 1 ? "" : "s"}: ${blockedSlots.join(", ")}.`
          : "Saved full-day block.",
      );
      resetComposer();
      await refresh();
    } catch {
      setError("Could not save that block. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const clearSelectedDates = async () => {
    if (!selectedDates.length) {
      setError("Select the days you want to clear first.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const dateClosures = forExperience.filter((closure) =>
        selectedDates.some((date) => closure.dates?.includes(date)),
      );
      await removeDatesFromClosures(dateClosures, selectedDates);

      if (!dateClosures.length && weekdayOnlyConflicts.length) {
        setError(
          "These days are closed by a repeating weekday rule. Remove that rule from the list below.",
        );
      } else {
        setNote(
          `Opened ${selectedDates.length === 1 ? "1 day" : `${selectedDates.length} days`} again.`,
        );
        resetComposer();
        await refresh();
      }
    } catch {
      setError("Could not clear those days. Try again.");
    } finally {
      setBusy(false);
    }
  };

  /** Unblock only the currently selected slots on the selected days. */
  const clearSelectedSlots = async () => {
    if (!selectedDates.length) {
      setError("Select the days first.");
      return;
    }
    if (scope !== "slots" || !blockedSlots.length) {
      setError("Choose the time slots you want to reopen, then clear them.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      let changed = 0;
      for (const closure of forExperience) {
        const dates = closure.dates ?? [];
        const touchedDates = dates.filter((date) => selectedDates.includes(date));
        if (!touchedDates.length) continue;

        // Full-day → convert remaining days to open for selected dates, keep other dates.
        if (!closure.slots?.length) {
          const remainingDates = dates.filter((date) => !selectedDates.includes(date));
          const remainingSlots = slots.filter((slot) => !blockedSlots.includes(slot));
          changed += 1;
          if (!remainingDates.length && !(closure.weekdays?.length)) {
            await deleteClosure(closure.id);
          } else {
            await saveClosure({ ...closure, dates: remainingDates });
          }
          // If some slots should stay blocked on the cleared days, write a partial rule.
          if (remainingSlots.length && remainingSlots.length < slots.length) {
            await saveClosure({
              experienceSlug: slug,
              dates: touchedDates,
              weekdays: [],
              slots: remainingSlots,
              reason: closure.reason || "Closed",
              soldOut: false,
            });
          }
          continue;
        }

        const nextSlots = closure.slots.filter((slot) => !blockedSlots.includes(slot));
        if (nextSlots.length === closure.slots.length) continue;
        changed += 1;

        // Slots changed only for selected dates inside a multi-date rule: split the rule.
        const untouchedDates = dates.filter((date) => !selectedDates.includes(date));
        if (untouchedDates.length) {
          await saveClosure({ ...closure, dates: untouchedDates });
          if (nextSlots.length) {
            await saveClosure({
              experienceSlug: slug,
              dates: touchedDates,
              weekdays: [],
              slots: nextSlots,
              reason: closure.reason || "Closed",
              soldOut: false,
            });
          }
        } else if (!nextSlots.length && !(closure.weekdays?.length)) {
          await deleteClosure(closure.id);
        } else {
          await saveClosure({ ...closure, slots: nextSlots });
        }
      }

      setNote(
        changed
          ? `Reopened ${blockedSlots.join(", ")} on ${selectedDates.length === 1 ? "that day" : "selected days"}.`
          : "Those slots were not blocked on the selected days.",
      );
      const latest = await refresh();
      if (singleDay) {
        const nextForExp = latest.filter((c) => c.experienceSlug === slug);
        hydrateFromDay(singleDay, nextForExp);
        setFrom(singleDay);
        setTo("");
        setEditingId(null);
      } else {
        resetComposer();
      }
    } catch {
      setError("Could not clear those slots. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const removeBlock = async (closure: ClosureRecord) => {
    const label = formatDateList(closure.dates ?? []);
    if (
      !window.confirm(
        `Remove this block?\n${label}${closure.slots?.length ? `\nSlots: ${closure.slots.join(", ")}` : ""}`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await deleteClosure(closure.id);
      if (editingId === closure.id) resetComposer();
      setNote("Block removed.");
      await refresh();
    } catch {
      setError("Could not remove that block.");
    } finally {
      setBusy(false);
    }
  };

  const toggleSlot = (time: string) => {
    setScope("slots");
    setBlockedSlots((current) =>
      current.includes(time) ? current.filter((slot) => slot !== time) : [...current, time],
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Availability"
        description="Block a full day or only specific slots. Select a day to see current slot status, then update just the times you need."
      />

      <div className="mb-6 max-w-xl">
        <Field label="Experience">
          <select
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              resetComposer();
              setNote("");
              setError("");
            }}
            className={inputClass}
          >
            {catalog.map((experience) => (
              <option key={experience.slug} value={experience.slug}>
                {experience.name}
                  </option>
                ))}
              </select>
              </Field>
            </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg text-[#2a2e1f]">{monthLabel}</h2>
              <p className="mt-1 text-xs text-[#8a917c]">
                Orange = full day · Amber = some slots · Olive ring = selected
              </p>
            </div>
              <div className="flex gap-2">
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setCursor((c) => {
                      const d = new Date(c.y, c.m - 1, 1);
                      return { y: d.getFullYear(), m: d.getMonth() };
                    })
                  }
                >
                  Prev
                </AdminButton>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => {
                  const n = new Date();
                  setCursor({ y: n.getFullYear(), m: n.getMonth() });
                }}
              >
                Today
              </AdminButton>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setCursor((c) => {
                      const d = new Date(c.y, c.m + 1, 1);
                      return { y: d.getFullYear(), m: d.getMonth() };
                    })
                  }
                >
                  Next
                </AdminButton>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold tracking-wider text-[#8a917c] uppercase">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="aspect-square" />;
                const iso = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const blocked = dateIsClosed(iso, forExperience);
              const partiallyBlocked =
                !blocked && slots.some((time) => dateIsClosed(iso, forExperience, time));
                const inPick = selectedDates.includes(iso);
                const isEdge = iso === from || iso === (to || from);
                return (
                  <button
                    key={iso}
                    type="button"
                  disabled={busy}
                  onClick={() => pickDay(iso)}
                    className={cn(
                      "aspect-square rounded-xl text-sm transition",
                      blocked
                        ? "bg-[#c2643a]/15 font-semibold text-[#8a3b1f] ring-1 ring-[#c2643a]/30"
                      : partiallyBlocked
                        ? "bg-amber-50 font-semibold text-amber-800 ring-1 ring-amber-300"
                        : "bg-[#f7f4ee] text-[#2a2e1f] hover:bg-[#e4e8d4]",
                      inPick && "bg-[#e4e8d4] font-semibold text-[#2a2e1f]",
                      isEdge && "ring-2 ring-[#4a5a28]",
                    )}
                  title={
                    blocked
                      ? "Full day blocked — select to edit slots or clear"
                      : partiallyBlocked
                        ? "Some slots blocked — select to edit"
                        : "Open"
                  }
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </Panel>

        <Panel className="h-fit">
          <div className="flex items-start justify-between gap-3">
          <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6b734f] uppercase">
                {editingId ? "Update block" : "Block / clear"}
              </p>
              <h2 className="mt-1 font-display text-xl text-[#2a2e1f]">{selectedLabel}</h2>
            </div>
            {(from || editingId) && (
              <button
                type="button"
                className="text-xs text-[#8a917c] underline-offset-2 hover:underline"
                onClick={() => {
                  resetComposer();
                  setNote("");
                  setError("");
                }}
              >
                Reset
              </button>
            )}
          </div>

          {dayStatus && (
            <div className="mt-3 rounded-xl bg-[#f7f4ee] px-3 py-2 text-xs text-[#5c6350]">
              Current status:{" "}
              <span className="font-semibold text-[#2a2e1f]">
                {dayStatus.mode === "full"
                  ? "Full day blocked"
                  : dayStatus.mode === "slots"
                    ? `Slots blocked · ${dayStatus.slots.join(", ")}`
                    : "Open"}
              </span>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="From">
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  if (to && e.target.value && to < e.target.value) setTo(e.target.value);
                  if (e.target.value && (!to || to === e.target.value)) hydrateFromDay(e.target.value);
                }}
                className={inputClass}
              />
            </Field>
            <Field label="To">
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => {
                  setTo(e.target.value);
                  if (from && e.target.value === from) hydrateFromDay(from);
                }}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium text-[#2a2e1f]">What to block</p>
              <span className="text-xs text-[#8a917c]">
                {scope === "full"
                  ? "Full day"
                  : `${blockedSlots.length} slot${blockedSlots.length === 1 ? "" : "s"}`}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#8a917c]">
              Choose Full day, or tap individual times to block / keep open only those slots.
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setScope("full");
                  setBlockedSlots([]);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  scope === "full" ? "bg-[#4a5a28] text-[#f7f4ee]" : "bg-[#f3efe8] text-[#5c6350]",
                )}
              >
                Full day
              </button>
              {slots.map((time) => {
                const currentlyBlocked = singleDay ? dateIsClosed(singleDay, forExperience, time) || dateIsClosed(singleDay, forExperience) : false;
                const selected = scope === "slots" && blockedSlots.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleSlot(time)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                      selected
                        ? "bg-[#c2643a] text-white"
                        : currentlyBlocked
                          ? "bg-amber-100 text-amber-900 ring-1 ring-amber-300"
                          : "bg-[#f3efe8] text-[#5c6350]",
                    )}
                    title={
                      selected
                        ? "Will be blocked on save"
                        : currentlyBlocked
                          ? "Currently blocked — click to include in slot edit"
                          : "Currently open"
                    }
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {scope === "slots" && (
              <p className="mt-2 text-xs text-[#6b734f]">
                Saving will replace the day’s blocks with only the orange slots. Amber chips are currently blocked.
              </p>
            )}
          </div>

          <div className="mt-4">
            <Field label="Reason">
              <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
            </Field>
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="text-xs font-semibold text-[#6b734f] underline-offset-2 hover:underline"
              onClick={() => setShowWeekdays((v) => !v)}
            >
              {showWeekdays ? "Hide repeating weekdays" : "Add repeating weekdays"}
            </button>
            {showWeekdays && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {WEEKDAYS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() =>
                      setWeekdays((prev) =>
                        prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
                      )
                    }
                    aria-pressed={weekdays.includes(i)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      weekdays.includes(i) ? "bg-[#4a5a28] text-[#f7f4ee]" : "bg-[#f3efe8] text-[#5c6350]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
                    </div>

          {overlappingBlocks.length > 0 && (
            <div className="mt-4 rounded-xl bg-[#f7f4ee] p-3">
              <p className="text-xs font-semibold text-[#5c6350]">
                Already blocked on these days ({overlappingBlocks.length})
              </p>
              <ul className="mt-2 space-y-1.5">
                {overlappingBlocks.slice(0, 4).map((closure) => (
                  <li key={closure.id} className="flex items-center justify-between gap-2 text-xs text-[#5c6350]">
                    <span className="min-w-0 truncate">
                      {formatDateList(closure.dates ?? [])}
                      {closure.weekdays?.length
                        ? ` · ${closure.weekdays.map((d) => WEEKDAYS[d]).join("/")}`
                        : ""}
                      {closure.slots?.length ? ` · ${closure.slots.join(", ")}` : " · all slots"}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 font-semibold text-[#4a5a28] underline-offset-2 hover:underline"
                      onClick={() => loadBlock(closure)}
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <Notice tone="warn">{error}</Notice>
            </div>
          )}
          {note && !error && (
            <div className="mt-4">
              <Notice tone="ok">{note}</Notice>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <AdminButton type="button" disabled={busy} onClick={saveBlock}>
              {busy
                ? "Saving…"
                : editingId
                  ? scope === "slots"
                    ? "Update slots"
                    : "Update full day"
                  : scope === "slots"
                    ? "Save slot block"
                    : "Save full-day block"}
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              disabled={busy || !selectedDates.length || scope !== "slots" || !blockedSlots.length}
              onClick={clearSelectedSlots}
            >
              Clear selected slots
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              disabled={busy || !selectedDates.length}
              onClick={clearSelectedDates}
            >
              Clear whole day
            </AdminButton>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-[#8a917c]">
            Example: select a blocked day, tap only `09:00`, then Save slot block — the rest of the day stays bookable.
          </p>
        </Panel>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#6b734f] uppercase">Saved blocks</p>
            <p className="mt-1 text-sm text-[#5c6350]">
              {forExperience.length
                ? `${forExperience.length} rule${forExperience.length === 1 ? "" : "s"} for this experience`
                : "No blocks yet for this experience"}
            </p>
          </div>
        </div>

        {forExperience.length ? (
          <div className="overflow-x-auto rounded-2xl border border-[#e4dfd4] bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[#f7f4ee] text-[11px] font-semibold tracking-wider text-[#6b734f] uppercase">
                <tr>
                  <th className="px-4 py-3">Date / repeat</th>
                  <th className="px-4 py-3">Slots</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forExperience.map((closure) => (
                  <tr
                    key={closure.id}
                    className={cn(
                      "border-t border-[#f0ebe3]",
                      editingId === closure.id && "bg-[#f7f4ee]/70",
                    )}
                  >
                    <td className="px-4 py-3 text-[#5c6350]">
                      {formatDateList(closure.dates ?? [])}
                      {closure.weekdays?.length
                        ? ` · ${closure.weekdays.map((d) => WEEKDAYS[d]).join("/")}`
                        : ""}
                    </td>
                    <td className="px-4 py-3 text-[#5c6350]">
                      {closure.slots?.length ? closure.slots.join(", ") : "All slots"}
                    </td>
                    <td className="px-4 py-3 text-[#5c6350]">{closure.reason}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          closure.soldOut
                            ? "bg-amber-50 text-amber-800"
                            : closure.slots?.length
                              ? "bg-amber-50 text-amber-800"
                              : "bg-[#f3efe8] text-[#5c6350]",
                        )}
                      >
                        {closure.soldOut ? "Sold out" : closure.slots?.length ? "Partial" : "Full day"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="text-xs font-semibold text-[#4a5a28]"
                          disabled={busy}
                          onClick={() => loadBlock(closure)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs font-semibold text-rose-700"
                          disabled={busy}
                          onClick={() => removeBlock(closure)}
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No blocks for this experience"
            body="Select days on the calendar, choose full day or specific slots, then save."
          />
        )}
      </div>
    </div>
  );
}
