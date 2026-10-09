"use client";

import { useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminButton, Notice, inputClass } from "@/components/admin/ui";
import {
  blankCapacityComponent,
  blankExperienceCosting,
  EXPERIENCE_COSTING_GST_PERCENT,
  quoteExperienceCosting,
  type ExperienceCosting,
} from "@/data/experience-costing";
import { cn, formatINR } from "@/lib/utils";

type Props = {
  value: ExperienceCosting | null | undefined;
  onChange: (next: ExperienceCosting | undefined) => void;
  transportMode: "none" | "optional" | "required";
};

const whole = (raw: string, min = 0) => Math.max(min, Math.round(Number(raw) || 0));

/** Numbered step: title, one-line explanation, then its fields. */
function Step({ n, title, help, children }: { n: number; title: string; help: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4 md:p-5">
      <div className="flex gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#364037] text-xs font-bold text-white">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[#1f2a24]">{title}</h3>
          <p className="mt-0.5 text-sm text-[#4a5a50]">{help}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Label above an input, with an optional ₹ / % / "guests" unit stuck to it. */
function Money({
  label,
  hint,
  unit = "₹",
  unitAfter = false,
  children,
}: {
  label: string;
  hint?: string;
  unit?: string;
  unitAfter?: boolean;
  children: ReactNode;
}) {
  const tag = unit ? (
    <span className="grid place-items-center bg-[#eef1e6] px-3 text-sm font-semibold text-[#4a5a50]">{unit}</span>
  ) : null;
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#26352b]">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-[#6a7a6c]">{hint}</span> : null}
      <span className="mt-1.5 flex h-11 overflow-hidden rounded-xl border border-[#c5cbb8] bg-white focus-within:border-[#364037]">
        {unitAfter ? null : tag}
        {children}
        {unitAfter ? tag : null}
      </span>
    </label>
  );
}

const bareInput = "min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-[#26352b] outline-none";

export function ExperienceCostingFields({ value, onChange, transportMode }: Props) {
  const costing = value ?? blankExperienceCosting();
  const enabled = Boolean(value);
  const [adults, setAdults] = useState(4);
  const [children, setChildren] = useState(2);

  const preview = quoteExperienceCosting(costing, {
    adults,
    children,
    trisTransport: transportMode !== "none",
  });
  const guests = preview.totalGuests;

  const setComponent = (index: number, patch: Partial<ExperienceCosting["capacityComponents"][number]>) =>
    onChange({
      ...costing,
      capacityComponents: costing.capacityComponents.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="font-display text-lg">Price calculator</h2>
          <p className="mt-1 text-sm text-[#4a5a50]">
            Enter what this experience <strong>costs TRIS</strong> to run. The guest price is worked out
            for you: your costs + your profit + GST. Guests only ever see the final price.
          </p>
        </div>
        <label
          className={cn(
            "flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold",
            enabled ? "border-[#364037] bg-[#364037] text-white" : "border-[#c5cbb8] text-[#364037]",
          )}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked ? costing : undefined)}
            className="h-4 w-4"
          />
          {enabled ? "Calculator on" : "Calculator off"}
        </label>
      </div>

      {!enabled ? (
        <Notice>
          The calculator is off, so bookings use the fixed adult / child prices set above and the vehicle
          prices in Transportation. Turn it on to price from your costs instead.
        </Notice>
      ) : (
        <>
          {costing.adultOperationalCost > 0 || costing.childOperationalCost > 0 ? (
            // "Cost per guest" was removed from the form; old amounts still count until cleared.
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e4c9a8] bg-[#fbf3e8] p-4 text-sm text-[#5a4630]">
              <p className="max-w-2xl">
                This experience still adds an old per-guest cost of{" "}
                <strong>{formatINR(costing.adultOperationalCost)} per adult</strong> and{" "}
                <strong>{formatINR(costing.childOperationalCost)} per child</strong> to the price. Clear it, then
                save, to price only from the costs below.
              </p>
              <AdminButton
                type="button"
                variant="ghost"
                onClick={() => onChange({ ...costing, adultOperationalCost: 0, childOperationalCost: 0 })}
              >
                Clear per-guest cost
              </AdminButton>
            </div>
          ) : null}

          <Step
            n={1}
            title="Operational cost"
            help="Things one person or item covers for several guests — e.g. one guide for every 5 guests. More guests means more of them. Optional."
          >
            {costing.capacityComponents.length === 0 ? (
              <p className="text-sm text-[#6a7a6c]">No operational costs yet.</p>
            ) : (
              <div className="space-y-3">
                {costing.capacityComponents.map((comp, index) => {
                  const line = preview.capacityLines[index];
                  return (
                    <div key={comp.id} className="rounded-xl border border-[#d5dbc8] bg-white p-3.5">
                      <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-end">
                        <label className="block">
                          <span className="block text-sm font-medium text-[#26352b]">What is it?</span>
                          <input
                            value={comp.name}
                            onChange={(e) => setComponent(index, { name: e.target.value })}
                            placeholder="e.g. Guide"
                            className={cn(inputClass, "mt-1.5")}
                          />
                        </label>
                        <Money label="Cost of one">
                          <input
                            type="number"
                            min={0}
                            value={comp.cost}
                            onChange={(e) => setComponent(index, { cost: whole(e.target.value) })}
                            className={bareInput}
                          />
                        </Money>
                        <Money label="One covers up to" unit="guests" unitAfter>
                          <input
                            type="number"
                            min={1}
                            value={comp.capacity}
                            onChange={(e) => setComponent(index, { capacity: whole(e.target.value, 1) })}
                            className={bareInput}
                          />
                        </Money>
                        <AdminButton
                          type="button"
                          variant="ghost"
                          aria-label={`Remove ${comp.name || "operational cost"}`}
                          onClick={() =>
                            onChange({
                              ...costing,
                              capacityComponents: costing.capacityComponents.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2 size={14} />
                        </AdminButton>
                      </div>
                      {line ? (
                        <p className="mt-2.5 text-xs text-[#4a5a50]">
                          For the example group of {guests}: {line.units} × {comp.name || "this"} ={" "}
                          <strong>{formatINR(line.cost)}</strong>
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
            <AdminButton
              type="button"
              variant="ghost"
              className="mt-3"
              onClick={() =>
                onChange({
                  ...costing,
                  capacityComponents: [
                    ...costing.capacityComponents,
                    blankCapacityComponent(costing.capacityComponents.length),
                  ],
                })
              }
            >
              <Plus size={14} className="mr-1 inline" />
              Add operational cost
            </AdminButton>
          </Step>

          <Step
            n={2}
            title="Transport"
            help={
              transportMode === "none"
                ? "TRIS transport is switched off for this experience, so no vehicle cost is added."
                : "Set each vehicle’s cost and how many guests it seats in the Transportation section. The right number of vehicles is added automatically."
            }
          >
            <p className="text-sm text-[#26352b]">
              {transportMode === "none"
                ? "Transport cost: ₹0"
                : `For the example group: ${preview.vehicleCount} vehicle${preview.vehicleCount === 1 ? "" : "s"} = ${formatINR(preview.transportCost)}`}
            </p>
          </Step>

          <Step n={3} title="Your profit and tax" help="Your profit is added on top of all costs. GST is then added on top of that.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Money label="Your profit" hint="% added on top of your total cost" unit="%" unitAfter>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={costing.marginPercent}
                  onChange={(e) => onChange({ ...costing, marginPercent: Math.max(0, Number(e.target.value) || 0) })}
                  className={bareInput}
                />
              </Money>
              <Money label="GST" hint="Fixed by policy — can’t be changed here" unit="%" unitAfter>
                <input
                  readOnly
                  value={EXPERIENCE_COSTING_GST_PERCENT}
                  className={cn(bareInput, "bg-[#f3f5ef] text-[#6a7a6c]")}
                />
              </Money>
            </div>
          </Step>

          {/* Worked example, laid out like a receipt. */}
          <section className="rounded-2xl border-2 border-[#364037] bg-white p-4 md:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#1f2a24]">What a guest would pay</h3>
                <p className="mt-0.5 text-sm text-[#4a5a50]">Try any group size — this is only a preview.</p>
              </div>
              <div className="flex gap-2">
                <Money label="Adults" unit="">
                  <input
                    type="number"
                    min={0}
                    value={adults}
                    onChange={(e) => setAdults(whole(e.target.value))}
                    className={cn(bareInput, "w-14")}
                  />
                </Money>
                <Money label="Children" unit="">
                  <input
                    type="number"
                    min={0}
                    value={children}
                    onChange={(e) => setChildren(whole(e.target.value))}
                    className={cn(bareInput, "w-14")}
                  />
                </Money>
              </div>
            </div>

            <dl className="mt-4 space-y-1.5 text-sm">
              {preview.adultOperationalCost > 0 && <Row label={`${preview.adults} adults × ${formatINR(preview.adultOperationalCost)}`} amount={preview.adults * preview.adultOperationalCost} />}
              {preview.childOperationalCost > 0 && <Row label={`${preview.children} children × ${formatINR(preview.childOperationalCost)}`} amount={preview.children * preview.childOperationalCost} />}
              {preview.capacityLines.map((line) => (
                <Row key={line.id} label={`${line.units} × ${line.name || "operational cost"} (${formatINR(line.unitCost)} each)`} amount={line.cost} />
              ))}
              {transportMode !== "none" ? (
                <Row label={`${preview.vehicleCount} vehicle${preview.vehicleCount === 1 ? "" : "s"}`} amount={preview.transportCost} />
              ) : null}
              <Row label="Your total cost" amount={preview.totalOperationalCost} rule strong />
              <Row label={`+ Your profit (${preview.marginPercent}%)`} amount={preview.marginAmount} />
              <Row label="Price before GST" amount={preview.sellingPriceBeforeGst} rule />
              <Row label={`+ GST (${preview.gstPercent}%)`} amount={preview.gst} />
            </dl>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-[#364037] px-4 py-3 text-white">
              <span className="font-semibold">Guest pays</span>
              <span className="text-right">
                <span className="text-xl font-bold">{formatINR(preview.grossAmount)}</span>
                {guests > 0 ? (
                  <span className="block text-xs text-white/75">
                    about {formatINR(Math.round(preview.grossAmount / guests))} per guest
                  </span>
                ) : null}
              </span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Row({ label, amount, rule, strong }: { label: string; amount: number; rule?: boolean; strong?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4",
        rule && "mt-2 border-t border-[#d5dbc8] pt-2",
        strong ? "font-semibold text-[#1f2a24]" : "text-[#4a5a50]",
      )}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{formatINR(amount)}</dd>
    </div>
  );
}
