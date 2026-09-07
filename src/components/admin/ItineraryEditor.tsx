"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { AdminButton, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export type JourneyItineraryItem = {
  day: number;
  title: string;
  summary: string;
  activities?: string;
  meals?: string;
  trekDifficulty?: string;
  overnight?: string;
};

export type ExperienceItineraryItem = {
  title: string;
  description: string;
};

function preview(title: string, fallback: string) {
  const clean = title.replace(/\s+/g, " ").trim();
  return clean || fallback;
}

function blankJourney(day: number): JourneyItineraryItem {
  return { day, title: "", summary: "" };
}

function blankExperience(): ExperienceItineraryItem {
  return { title: "", description: "" };
}

type ShellProps = {
  heading: string;
  hint: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  addLabel: string;
  count: number;
  onSeed: () => void;
  onAdd: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  children: React.ReactNode;
};

function EditorShell({
  heading,
  hint,
  emptyTitle,
  emptyBody,
  emptyCta,
  addLabel,
  count,
  onSeed,
  onAdd,
  onExpandAll,
  onCollapseAll,
  children,
}: ShellProps) {
  if (!count) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c5cbb8] bg-[#faf8f3] px-5 py-8 text-center">
        <p className="font-display text-lg text-[#26352b]">{emptyTitle}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#4a5a50]">{emptyBody}</p>
        <AdminButton className="mt-5" onClick={onSeed}>
          <Plus size={14} />
          {emptyCta}
        </AdminButton>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#26352b]">{heading}</p>
          <p className="mt-0.5 text-xs text-[#4a5a50]">{hint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#4a5a50] uppercase"
            onClick={onExpandAll}
          >
            Expand all
          </button>
          <button
            type="button"
            className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#4a5a50] uppercase"
            onClick={onCollapseAll}
          >
            Collapse all
          </button>
        </div>
      </div>
      <ul className="space-y-2.5">{children}</ul>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b7c3a8] bg-[#f6f8f1] px-4 py-3 text-sm font-semibold text-[#364037] transition hover:border-[#8fa183] hover:bg-[#eef2e6]"
      >
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
  );
}

type CardProps = {
  badge: string;
  title: string;
  collapsedPreview: string;
  open: boolean;
  panelId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  children: React.ReactNode;
};

function ItineraryCard({
  badge,
  title,
  collapsedPreview,
  open,
  panelId,
  canMoveUp,
  canMoveDown,
  onToggle,
  onMoveUp,
  onMoveDown,
  onRemove,
  children,
}: CardProps) {
  return (
    <li
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition",
        open ? "border-[#aeb8a0] shadow-[0_10px_28px_rgba(54,64,55,0.08)]" : "border-[#dde1d0]",
      )}
    >
      <div className="flex items-stretch gap-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f6f1]"
        >
          <span className="inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-[#eef0e3] px-2 text-[11px] font-bold tracking-wide text-[#364037] uppercase">
            {badge}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-[#26352b]">{title}</span>
            {!open ? (
              <span className="mt-0.5 block truncate text-xs text-[#4a5a50]">{collapsedPreview}</span>
            ) : null}
          </span>
          <ChevronDown
            size={16}
            className={cn("shrink-0 text-[#4a5a50] transition", open ? "rotate-180" : "rotate-0")}
          />
        </button>
        <div className="flex shrink-0 items-center gap-0.5 border-l border-[#dde1d0] px-1.5">
          <button
            type="button"
            aria-label="Move up"
            disabled={!canMoveUp}
            onClick={onMoveUp}
            className="rounded-lg p-1.5 text-[#4a5a50] hover:bg-[#f8f6f1] disabled:opacity-25"
          >
            <ChevronUp size={15} />
          </button>
          <button
            type="button"
            aria-label="Move down"
            disabled={!canMoveDown}
            onClick={onMoveDown}
            className="rounded-lg p-1.5 text-[#4a5a50] hover:bg-[#f8f6f1] disabled:opacity-25"
          >
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            aria-label="Remove"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {open ? (
        <div id={panelId} className="space-y-3 border-t border-[#dde1d0] bg-[#fbfaf7] px-4 py-4">
          {children}
        </div>
      ) : null}
    </li>
  );
}

export function ItineraryEditor(
  props:
    | {
        mode: "journey";
        value: JourneyItineraryItem[];
        onChange: (next: JourneyItineraryItem[]) => void;
      }
    | {
        mode: "experience";
        value: ExperienceItineraryItem[];
        onChange: (next: ExperienceItineraryItem[]) => void;
      },
) {
  if (props.mode === "journey") {
    return <JourneyItineraryEditor value={props.value} onChange={props.onChange} />;
  }
  return <ExperienceItineraryEditor value={props.value} onChange={props.onChange} />;
}

function JourneyItineraryEditor({
  value,
  onChange,
}: {
  value: JourneyItineraryItem[];
  onChange: (next: JourneyItineraryItem[]) => void;
}) {
  const baseId = useId();
  const items = value ?? [];
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  const renumber = (rows: JourneyItineraryItem[]) =>
    rows.map((item, i) => ({ ...item, day: i + 1 }));

  return (
    <EditorShell
      heading="Itinerary"
      hint="One card per day. Descriptions keep line breaks."
      emptyTitle="Build the day-by-day plan"
      emptyBody="Add each day with its own title and description. Guests see this on the journey page."
      emptyCta="Add day 1"
      addLabel={`Add day ${items.length + 1}`}
      count={items.length}
      onSeed={() => {
        onChange([blankJourney(1)]);
        setOpen({ 0: true });
      }}
      onAdd={() => {
        const next = renumber([...items, blankJourney(items.length + 1)]);
        onChange(next);
        setOpen({ [next.length - 1]: true });
      }}
      onExpandAll={() => setOpen(Object.fromEntries(items.map((_, i) => [i, true])))}
      onCollapseAll={() => setOpen({})}
    >
      {items.map((item, index) => {
        const isOpen = Boolean(open[index]);
        const panelId = `${baseId}-panel-${index}`;
        return (
          <ItineraryCard
            key={`${baseId}-${index}`}
            badge={`Day ${item.day}`}
            title={preview(item.title, "Untitled day")}
            collapsedPreview={item.summary.replace(/\s+/g, " ").trim() || "No description yet"}
            open={isOpen}
            panelId={panelId}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            onToggle={() => setOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
            onMoveUp={() => {
              if (index === 0) return;
              const next = [...items];
              const [row] = next.splice(index, 1);
              next.splice(index - 1, 0, row);
              onChange(renumber(next));
              setOpen({ [index - 1]: true });
            }}
            onMoveDown={() => {
              if (index >= items.length - 1) return;
              const next = [...items];
              const [row] = next.splice(index, 1);
              next.splice(index + 1, 0, row);
              onChange(renumber(next));
              setOpen({ [index + 1]: true });
            }}
            onRemove={() => {
              const next = renumber(items.filter((_, i) => i !== index));
              onChange(next.length ? next : [blankJourney(1)]);
              setOpen({ 0: true });
            }}
          >
            <label className="block text-sm font-medium text-[#26352b]">
              Day title
              <input
                value={item.title}
                onChange={(e) =>
                  onChange(items.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)))
                }
                placeholder="e.g. Arrive Shillong · settle in"
                className={cn(inputClass, "mt-1.5 bg-white")}
              />
            </label>
            <label className="block text-sm font-medium text-[#26352b]">
              Description
              <span className="ml-2 text-xs font-normal text-[#4a5a50]">Line breaks are kept</span>
              <textarea
                value={item.summary}
                onChange={(e) =>
                  onChange(items.map((row, i) => (i === index ? { ...row, summary: e.target.value } : row)))
                }
                rows={4}
                placeholder={"Morning transfer…\nAfternoon walk…\nEvening at the homestay…"}
                className={cn(inputClass, "mt-1.5 resize-y bg-white leading-relaxed")}
              />
            </label>
          </ItineraryCard>
        );
      })}
    </EditorShell>
  );
}

function ExperienceItineraryEditor({
  value,
  onChange,
}: {
  value: ExperienceItineraryItem[];
  onChange: (next: ExperienceItineraryItem[]) => void;
}) {
  const baseId = useId();
  const items = value ?? [];
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

  return (
    <EditorShell
      heading="Itinerary"
      hint="One card per day. Descriptions keep line breaks."
      emptyTitle="Build the day’s flow"
      emptyBody="Add each day with a title and description. Guests see this on the experience page."
      emptyCta="Add day 1"
      addLabel={`Add day ${items.length + 1}`}
      count={items.length}
      onSeed={() => {
        onChange([blankExperience()]);
        setOpen({ 0: true });
      }}
      onAdd={() => {
        const next = [...items, blankExperience()];
        onChange(next);
        setOpen({ [next.length - 1]: true });
      }}
      onExpandAll={() => setOpen(Object.fromEntries(items.map((_, i) => [i, true])))}
      onCollapseAll={() => setOpen({})}
    >
      {items.map((item, index) => {
        const isOpen = Boolean(open[index]);
        const panelId = `${baseId}-panel-${index}`;
        return (
          <ItineraryCard
            key={`${baseId}-${index}`}
            badge={`Day ${index + 1}`}
            title={preview(item.title, "Untitled day")}
            collapsedPreview={item.description.replace(/\s+/g, " ").trim() || "No description yet"}
            open={isOpen}
            panelId={panelId}
            canMoveUp={index > 0}
            canMoveDown={index < items.length - 1}
            onToggle={() => setOpen((prev) => ({ ...prev, [index]: !prev[index] }))}
            onMoveUp={() => {
              if (index === 0) return;
              const next = [...items];
              const [row] = next.splice(index, 1);
              next.splice(index - 1, 0, row);
              onChange(next);
              setOpen({ [index - 1]: true });
            }}
            onMoveDown={() => {
              if (index >= items.length - 1) return;
              const next = [...items];
              const [row] = next.splice(index, 1);
              next.splice(index + 1, 0, row);
              onChange(next);
              setOpen({ [index + 1]: true });
            }}
            onRemove={() => {
              const next = items.filter((_, i) => i !== index);
              onChange(next.length ? next : [blankExperience()]);
              setOpen({ 0: true });
            }}
          >
            <label className="block text-sm font-medium text-[#26352b]">
              Day title
              <input
                value={item.title}
                onChange={(e) =>
                  onChange(items.map((row, i) => (i === index ? { ...row, title: e.target.value } : row)))
                }
                placeholder="e.g. Meet at the village square"
                className={cn(inputClass, "mt-1.5 bg-white")}
              />
            </label>
            <label className="block text-sm font-medium text-[#26352b]">
              Description
              <span className="ml-2 text-xs font-normal text-[#4a5a50]">Line breaks are kept</span>
              <textarea
                value={item.description}
                onChange={(e) =>
                  onChange(
                    items.map((row, i) => (i === index ? { ...row, description: e.target.value } : row)),
                  )
                }
                rows={4}
                placeholder={"What happens this day…\nAny notes for the guest…"}
                className={cn(inputClass, "mt-1.5 resize-y bg-white leading-relaxed")}
              />
            </label>
          </ItineraryCard>
        );
      })}
    </EditorShell>
  );
}

/** Drop empty draft rows before save. */
export function compactJourneyItinerary(items: JourneyItineraryItem[]): JourneyItineraryItem[] {
  return items
    .filter((item) => item.title.trim() || item.summary.trim())
    .map((item, i) => ({ ...item, day: i + 1 }));
}

export function compactExperienceItinerary(
  items: ExperienceItineraryItem[],
): ExperienceItineraryItem[] {
  return items
    .filter((item) => item.title.trim() || item.description.trim())
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
    }));
}
