"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { formatDepartureSeats, seatsLeft } from "@/lib/journey-seats";
import { AdminButton, Field, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export type DepartureSeatRow = {
  date: string;
  seats: number;
  held: number;
  booked: number;
  note?: string;
};

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

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function pretty(isoDate: string) {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DepartureSeatsCalendar({
  initial,
  defaultSeats = 10,
}: {
  initial?: DepartureSeatRow[];
  defaultSeats?: number;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });
  const [rows, setRows] = useState<DepartureSeatRow[]>(() =>
    [...(initial ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
  );
  const [active, setActive] = useState<string | null>(rows[0]?.date ?? null);

  const byDate = useMemo(() => new Map(rows.map((r) => [r.date, r])), [rows]);
  const cells = monthMatrix(cursor.year, cursor.month);
  const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const toggleDate = (date: string) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.date === date);
      if (exists) {
        const next = prev.filter((r) => r.date !== date);
        setActive((a) => (a === date ? next[0]?.date ?? null : a));
        return next;
      }
      const next = [...prev, { date, seats: defaultSeats, held: 0, booked: 0 }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      setActive(date);
      return next;
    });
  };

  const updateActive = (patch: Partial<DepartureSeatRow>) => {
    if (!active) return;
    setRows((prev) =>
      prev.map((r) => (r.date === active ? { ...r, ...patch } : r)),
    );
  };

  const activeRow = active ? byDate.get(active) : undefined;

  return (
    <div className="space-y-4">
      <input type="hidden" name="departureSeats" value={formatDepartureSeats(rows)} />
      <input
        type="hidden"
        name="departures"
        value={rows.map((r) => r.date).join(", ")}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-[#c5cbb8] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.year, c.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
            >
              <ChevronLeft size={16} />
            </AdminButton>
            <p className="text-sm font-semibold text-[#26352b]">{label}</p>
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() =>
                setCursor((c) => {
                  const d = new Date(c.year, c.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
            >
              <ChevronRight size={16} />
            </AdminButton>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold tracking-wide text-[#4a5a50] uppercase">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day == null) return <span key={`e-${i}`} />;
              const date = iso(cursor.year, cursor.month, day);
              const row = byDate.get(date);
              const selected = Boolean(row);
              const isActive = active === date;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => toggleDate(date)}
                  className={cn(
                    "relative flex h-10 flex-col items-center justify-center rounded-lg text-sm transition",
                    selected
                      ? "bg-[#364037] text-white"
                      : "text-[#26352b] hover:bg-[#e8ebdd]",
                    isActive && "ring-2 ring-[#7aa35a] ring-offset-1",
                  )}
                  title={selected ? `${seatsLeft(row!)} seats left` : "Add departure"}
                >
                  {day}
                  {selected ? (
                    <span className="absolute bottom-0.5 text-[8px] opacity-80">
                      {seatsLeft(row!)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[#4a5a50]">
            Click days to add or remove fixed departure dates. Selected days show remaining seats.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#26352b]">
            {rows.length} departure{rows.length === 1 ? "" : "s"} selected
          </p>
          <ul className="max-h-48 space-y-1.5 overflow-y-auto text-sm text-[#4a5a50]">
            {rows.length === 0 ? (
              <li className="text-[#4a5a50]">No dates yet — pick from the calendar.</li>
            ) : (
              rows.map((r) => (
                <li key={r.date}>
                  <button
                    type="button"
                    onClick={() => setActive(r.date)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition",
                      active === r.date ? "bg-[#e8ebdd] text-[#26352b]" : "hover:bg-[#f4f1ea]",
                    )}
                  >
                    <span>{pretty(r.date)}</span>
                    <span className="shrink-0 text-xs">{seatsLeft(r)} left</span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {activeRow ? (
            <div className="rounded-xl border border-[#c5cbb8] bg-[#f8f6f1] p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-[#26352b]">{pretty(activeRow.date)}</p>
                <button
                  type="button"
                  aria-label="Remove date"
                  onClick={() => toggleDate(activeRow.date)}
                  className="text-[#4a5a50] hover:text-[#26352b]"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Seats">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={activeRow.seats}
                    onChange={(e) => updateActive({ seats: Number(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Held">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={activeRow.held}
                    onChange={(e) => updateActive({ held: Number(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Booked">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={activeRow.booked}
                    onChange={(e) => updateActive({ booked: Number(e.target.value) || 0 })}
                  />
                </Field>
              </div>
              <Field label="Note" hint="optional">
                <input
                  className={inputClass}
                  value={activeRow.note ?? ""}
                  onChange={(e) => updateActive({ note: e.target.value || undefined })}
                  placeholder="e.g. Guwahati start"
                />
              </Field>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
