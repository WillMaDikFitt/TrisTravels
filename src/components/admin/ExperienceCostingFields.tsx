"use client";

import { Plus, Trash2 } from "lucide-react";
import { AdminButton, Field, Notice, inputClass } from "@/components/admin/ui";
import {
  blankCapacityComponent,
  blankExperienceCosting,
  EXPERIENCE_COSTING_GST_PERCENT,
  quoteExperienceCosting,
  type ExperienceCosting,
} from "@/data/experience-costing";
import { formatINR } from "@/lib/utils";

type Props = {
  value: ExperienceCosting | null | undefined;
  onChange: (next: ExperienceCosting | undefined) => void;
  transportMode: "none" | "optional" | "required";
};

export function ExperienceCostingFields({ value, onChange, transportMode }: Props) {
  const costing = value ?? blankExperienceCosting();
  const enabled = Boolean(value);

  const preview = quoteExperienceCosting(costing, {
    adults: 4,
    children: 2,
    trisTransport: transportMode !== "none",
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg">Operational costing</h2>
          <p className="mt-1 max-w-2xl text-sm text-[#4a5a50]">
            Booking totals use adult/child op costs, capacity resources, transport, your margin %, then
            GST @ {EXPERIENCE_COSTING_GST_PERCENT}%. Guests only see the gross amount.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-[#1f2a24]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked ? costing : undefined)}
            className="h-4 w-4 rounded border-[#c5cbb8]"
          />
          Use costing engine
        </label>
      </div>

      {!enabled ? (
        <Notice>
          Off — bookings still use legacy adult/child selling prices and fleet transfer prices.
        </Notice>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Per-adult operational cost (₹)" hint="Internal · consolidated">
              <input
                type="number"
                min={0}
                value={costing.adultOperationalCost}
                onChange={(e) =>
                  onChange({
                    ...costing,
                    adultOperationalCost: Math.max(0, Math.round(Number(e.target.value) || 0)),
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Per-child operational cost (₹)" hint="Internal · consolidated">
              <input
                type="number"
                min={0}
                value={costing.childOperationalCost}
                onChange={(e) =>
                  onChange({
                    ...costing,
                    childOperationalCost: Math.max(0, Math.round(Number(e.target.value) || 0)),
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="Margin %" hint="Added on total op cost">
              <input
                type="number"
                min={0}
                step={0.1}
                value={costing.marginPercent}
                onChange={(e) =>
                  onChange({
                    ...costing,
                    marginPercent: Math.max(0, Number(e.target.value) || 0),
                  })
                }
                className={inputClass}
              />
            </Field>
            <Field label="GST" hint="Fixed by policy">
              <input
                type="text"
                readOnly
                value={`${EXPERIENCE_COSTING_GST_PERCENT}%`}
                className={`${inputClass} bg-[#f3f5ef]`}
              />
            </Field>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#1f2a24]">Capacity-based components</h3>
              <AdminButton
                type="button"
                variant="ghost"
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
                Add component
              </AdminButton>
            </div>
            {costing.capacityComponents.length === 0 ? (
              <p className="text-sm text-[#4a5a50]">
                Optional — e.g. Guide ₹1,500 / 6 guests. Units are calculated as ceil(guests ÷ capacity).
              </p>
            ) : (
              <div className="space-y-3">
                {costing.capacityComponents.map((comp, index) => (
                  <div
                    key={comp.id}
                    className="grid gap-3 rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto_auto]"
                  >
                    <Field label="Name">
                      <input
                        value={comp.name}
                        onChange={(e) => {
                          const capacityComponents = costing.capacityComponents.map((row, i) =>
                            i === index ? { ...row, name: e.target.value } : row,
                          );
                          onChange({ ...costing, capacityComponents });
                        }}
                        placeholder="Guide / Instructor / …"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Cost per unit (₹)">
                      <input
                        type="number"
                        min={0}
                        value={comp.cost}
                        onChange={(e) => {
                          const capacityComponents = costing.capacityComponents.map((row, i) =>
                            i === index
                              ? { ...row, cost: Math.max(0, Math.round(Number(e.target.value) || 0)) }
                              : row,
                          );
                          onChange({ ...costing, capacityComponents });
                        }}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Guest capacity / unit">
                      <input
                        type="number"
                        min={1}
                        value={comp.capacity}
                        onChange={(e) => {
                          const capacityComponents = costing.capacityComponents.map((row, i) =>
                            i === index
                              ? {
                                  ...row,
                                  capacity: Math.max(1, Math.round(Number(e.target.value) || 1)),
                                }
                              : row,
                          );
                          onChange({ ...costing, capacityComponents });
                        }}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Required">
                      <select
                        value={comp.required ? "yes" : "no"}
                        onChange={(e) => {
                          const capacityComponents = costing.capacityComponents.map((row, i) =>
                            i === index ? { ...row, required: e.target.value === "yes" } : row,
                          );
                          onChange({ ...costing, capacityComponents });
                        }}
                        className={inputClass}
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </Field>
                    <div className="flex items-end">
                      <AdminButton
                        type="button"
                        variant="ghost"
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {transportMode !== "none" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vehicle cost (₹)" hint="Lump sum per vehicle · not split per guest">
                <input
                  type="number"
                  min={0}
                  value={costing.transport.vehicleCost}
                  onChange={(e) =>
                    onChange({
                      ...costing,
                      transport: {
                        ...costing.transport,
                        vehicleCost: Math.max(0, Math.round(Number(e.target.value) || 0)),
                      },
                    })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Vehicle capacity (guests)" hint="Vehicles = ceil(guests ÷ capacity)">
                <input
                  type="number"
                  min={1}
                  value={costing.transport.vehicleCapacity}
                  onChange={(e) =>
                    onChange({
                      ...costing,
                      transport: {
                        ...costing.transport,
                        vehicleCapacity: Math.max(1, Math.round(Number(e.target.value) || 1)),
                      },
                    })
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          ) : (
            <Notice>Transport mode is “not offered” — transport cost stays ₹0.</Notice>
          )}

          <div className="rounded-2xl border border-[#d5dbc8] bg-[#f3f5ef] p-4 text-sm text-[#1f2a24]">
            <p className="font-semibold">Preview · 4 adults + 2 children
              {transportMode !== "none" ? " · TRIS transport" : ""}
            </p>
            <dl className="mt-3 grid gap-1.5 sm:grid-cols-2">
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">Per-person op</dt>
                <dd>{formatINR(preview.perPersonOperationalCost)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">Capacity components</dt>
                <dd>{formatINR(preview.capacityComponentsCost)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">Transport ({preview.vehicleCount} veh.)</dt>
                <dd>{formatINR(preview.transportCost)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">Total op cost</dt>
                <dd>{formatINR(preview.totalOperationalCost)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">Margin ({preview.marginPercent}%)</dt>
                <dd>{formatINR(preview.marginAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">Before GST</dt>
                <dd>{formatINR(preview.sellingPriceBeforeGst)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[#4a5a50]">GST ({preview.gstPercent}%)</dt>
                <dd>{formatINR(preview.gst)}</dd>
              </div>
              <div className="flex justify-between gap-4 font-semibold">
                <dt>Gross (guest pays)</dt>
                <dd>{formatINR(preview.grossAmount)}</dd>
              </div>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
