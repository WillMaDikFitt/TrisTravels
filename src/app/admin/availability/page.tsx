"use client";

import { useEffect, useMemo, useState } from "react";
import { experiences as staticExperiences } from "@/data/experiences";
import { fetchClosuresAdmin, fetchExperiencesAdmin } from "@/lib/actions/content-read";
import { deleteClosure, saveClosure } from "@/lib/actions/cms";
import type { ClosureRecord } from "@/lib/types";
import { dateIsClosed } from "@/lib/catalog";
import { AdminButton, EmptyState, Field, PageHeader, Panel, inputClass } from "@/components/admin/ui";
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

export default function AdminAvailabilityPage() {
  const [catalog, setCatalog] = useState(staticExperiences);
  const [slug, setSlug] = useState(staticExperiences[0]?.slug ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [reason, setReason] = useState("Closed");
  const [rows, setRows] = useState<ClosureRecord[]>([]);
  const [formError, setFormError] = useState("");
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });

  const refresh = () => fetchClosuresAdmin().then(setRows);
  useEffect(() => {
    refresh();
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

  const cells = monthMatrix(cursor.y, cursor.m);
  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const selectedDates = datesInRange(from, to);
  const pickDay = (iso: string) => {
    if (!from || (from && to)) {
      setFrom(iso);
      setTo("");
      return;
    }
    if (iso < from) {
      setTo(from);
      setFrom(iso);
      return;
    }
    setTo(iso);
  };

  const unblockDate = async (iso: string) => {
    const dated = forExperience.filter((c) => c.dates?.includes(iso));
    if (dated.length) {
      setFormError("");
      for (const c of dated) {
        const nextDates = (c.dates ?? []).filter((d) => d !== iso);
        if (!nextDates.length && !(c.weekdays?.length)) {
          await deleteClosure(c.id);
        } else {
          await saveClosure({ ...c, dates: nextDates });
        }
      }
      await refresh();
      return;
    }
    const weekday = new Date(`${iso}T12:00:00`).getDay();
    if (forExperience.some((c) => c.weekdays?.includes(weekday))) {
      setFormError("That weekday is closed every week. Unblock the repeating rule in the list below.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Availability"
        description="Block days guests shouldn’t book. To open a day again, click it on the calendar or Unblock it in the list."
      />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const dates = datesInRange(from, to);
              if (!dates.length && !weekdays.length) {
                setFormError("Pick a date range or at least one weekday.");
                return;
              }
              if (to && from && to < from) {
                setFormError("End date should be on or after the start date.");
                return;
              }
              setFormError("");
              await saveClosure({
                experienceSlug: slug,
                dates,
                weekdays,
                reason,
                soldOut: reason.toLowerCase().includes("sold"),
              });
              setFrom("");
              setTo("");
              setWeekdays([]);
              refresh();
            }}
          >
            <Field label="Experience">
              <select value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass}>
                {catalog.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    if (to && e.target.value && to < e.target.value) setTo(e.target.value);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="To" hint="same day is fine">
                <input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => setTo(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            {selectedDates.length > 0 && (
              <p className="text-xs text-[#6b734f]">
                {selectedDates.length === 1
                  ? "1 day will be blocked."
                  : `${selectedDates.length} days will be blocked.`}
              </p>
            )}
            <div>
              <p className="text-sm font-medium">Repeat weekdays</p>
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
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      weekdays.includes(i) ? "bg-[#4a5a28] text-[#f7f4ee]" : "bg-[#f3efe8] text-[#5c6350]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Field label="Reason">
              <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
            </Field>
            {formError && <p className="text-sm text-rose-700">{formError}</p>}
            <AdminButton type="submit">Add block</AdminButton>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg">{monthLabel}</h2>
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
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="aspect-square" />;
                const iso = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const blocked = dateIsClosed(iso, forExperience);
                const inPick = selectedDates.includes(iso);
                const isEdge = iso === from || iso === (to || from);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => (blocked ? unblockDate(iso) : pickDay(iso))}
                    className={cn(
                      "aspect-square rounded-xl text-sm transition",
                      blocked
                        ? "bg-[#c2643a]/15 font-semibold text-[#8a3b1f] ring-1 ring-[#c2643a]/30"
                        : "bg-[#f7f4ee] text-[#2a2e1f] hover:bg-[#e4e8d4]",
                      inPick && "bg-[#e4e8d4] font-semibold text-[#2a2e1f]",
                      isEdge && "ring-2 ring-[#4a5a28]",
                    )}
                    title={blocked ? "Blocked — click to open again" : "Open"}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-[#8a917c]">
              Orange = blocked. Click an orange day to open it again. On open days, click start then end to
              select a stretch.
            </p>
          </Panel>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider text-[#6b734f] uppercase">
              Blocks for this experience
            </p>
            {forExperience.length ? (
              <ul className="space-y-2">
                {forExperience.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[#e4dfd4] bg-white px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="text-[#5c6350]">
                        {formatDateList(c.dates ?? [])}
                        {c.weekdays?.length
                          ? ` · ${c.weekdays.map((d) => WEEKDAYS[d]).join("/")}`
                          : ""}
                        · {c.reason}
                        {c.soldOut ? " · sold out" : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-rose-700"
                      onClick={async () => {
                        await deleteClosure(c.id);
                        refresh();
                      }}
                    >
                      Unblock
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="No blocks for this experience"
                body="Add a date or weekday when a trail or host is unavailable."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
