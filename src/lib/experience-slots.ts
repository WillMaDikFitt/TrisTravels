import type { Experience } from "@/data/experiences";
import { DEFAULT_SLOTS } from "@/lib/catalog";

/** Synthetic slot id used when an experience is whole-day (no timed starts). */
export const ALL_DAY_SLOT = "all-day";

function minutesFromTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function timeFromMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isInsideBreak(time: string, breaks?: { start: string; end: string }[]) {
  if (!breaks?.length) return false;
  const minutes = minutesFromTime(time);
  if (minutes === null) return false;
  return breaks.some((window) => {
    const start = minutesFromTime(window.start);
    const end = minutesFromTime(window.end);
    if (start === null || end === null || end <= start) return false;
    return minutes >= start && minutes < end;
  });
}

export function isWholeDayExperience(experience: Experience) {
  return experience.slotConfig?.mode === "day";
}

/** Max guests that can fill one slot across all bookings. */
export function experienceSlotCapacity(experience: Experience) {
  const configured = experience.slotConfig?.capacity;
  if (configured != null && Number.isFinite(configured) && configured > 0) {
    return Math.round(configured);
  }
  return Math.max(1, experience.maxGuests);
}

export function formatExperienceSlotLabel(slot: string, experience: Experience) {
  if (slot === ALL_DAY_SLOT || isWholeDayExperience(experience)) {
    return experience.slotConfig?.dayLabel?.trim() || "Full day";
  }
  return slot;
}

export function experienceSlots(experience: Experience) {
  const config = experience.slotConfig;
  let slots: string[] = [];

  if (config?.mode === "day") {
    return [ALL_DAY_SLOT];
  }

  if (config?.mode === "interval") {
    const start = minutesFromTime(config.start ?? "");
    const end = minutesFromTime(config.end ?? "");
    const interval = config.intervalMinutes ?? 60;
    if (start !== null && end !== null && end >= start && interval > 0) {
      for (let time = start; time <= end; time += interval) slots.push(timeFromMinutes(time));
    }
  } else if (config?.mode === "fixed" && config.times?.length) {
    slots = config.times;
  } else if (experience.slots?.length) {
    slots = experience.slots;
  } else {
    slots = DEFAULT_SLOTS;
  }

  const withoutBreaks = slots.filter((time) => !isInsideBreak(time, config?.breaks));
  const cleaned = (withoutBreaks.length ? withoutBreaks : slots)
    .map((time) => time.trim())
    .filter(Boolean)
    .map((time) => (time.toLowerCase() === "all-day" || time.toLowerCase() === "all day" ? ALL_DAY_SLOT : time));
  // Studio textareas can accidentally list the same time twice — keep order, drop dupes.
  return Array.from(new Set(cleaned));
}
