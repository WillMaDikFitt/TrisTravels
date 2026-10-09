"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Journey } from "@/data/journeys";
import {
  DEFAULT_PACKAGE_GST_PERCENT,
  DEFAULT_TRIS_SERVICE_PERCENT,
  operationalCostLine,
  type PackageOperationalCost,
  type PackageStayRate,
  type PackageVehicleRate,
  type StayPreferenceId,
} from "@/data/package-pricing";
import type { FleetVehicle } from "@/data/transport";
import type { StayStyle } from "@/data/stay-styles";
import type { PackageTransportId } from "@/data/journey-options";
import { quoteCuratedPackage } from "@/lib/pricing";
import { cn, formatINR } from "@/lib/utils";

type Props = {
  journey: Journey;
  packageRates: { vehicle: FleetVehicle; rate: PackageVehicleRate }[];
  stayRates: { style: StayStyle; rate: PackageStayRate }[];
};

/** Numbered step: letter badge, title, one-line explanation, then its fields. */
function Step({
  letter,
  title,
  formula,
  help,
  children,
}: {
  letter: string;
  title: string;
  formula: string;
  help: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4 md:p-5">
      <div className="flex gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#364037] text-sm font-bold text-white">
          {letter}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[#1f2a24]">{title}</h3>
          <p className="mt-1 inline-block rounded-lg bg-[#eef1e6] px-2.5 py-1 font-mono text-xs text-[#364037]">
            {letter} = {formula}
          </p>
          <p className="mt-1.5 text-sm text-[#4a5a50]">{help}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Label + input with a ₹ / % / unit tag stuck to it. Controlled, but keeps `name` for the form. */
function Num({
  label,
  hint,
  name,
  value,
  onChange,
  unit = "₹",
  after = false,
  min = 0,
  step,
}: {
  label: string;
  hint?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  after?: boolean;
  min?: number;
  step?: number;
}) {
  const tag = unit ? (
    <span className="grid place-items-center bg-[#eef1e6] px-3 text-sm font-semibold whitespace-nowrap text-[#4a5a50]">
      {unit}
    </span>
  ) : null;
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#26352b]">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-[#6a7a6c]">{hint}</span>
      ) : null}
      <span className="mt-1.5 flex h-11 overflow-hidden rounded-xl border border-[#c5cbb8] bg-white focus-within:border-[#364037]">
        {after ? null : tag}
        <input
          name={name}
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-[#26352b] outline-none"
        />
        {after ? tag : null}
      </span>
    </label>
  );
}

const toNum = (v: string) => Math.max(0, Number(v) || 0);
const str = (n: number | undefined | null) => (n == null ? "" : String(n));

/**
 * Curated journey "Book now" costs, laid out as the A–E formula with a live worked example.
 * Inputs keep their `pkg…` names so the journey editor reads them from the form on save.
 */
export function CuratedPackageCosts({
  journey,
  packageRates,
  stayRates,
}: Props) {
  const pricing = useMemo(
    () => journey.packagePricing ?? {},
    [journey.packagePricing],
  );
  const days = Math.max(1, journey.days);
  const nights = Math.max(0, journey.nights);
  const offeredVehicle = (id: string) =>
    !journey.offeredVehicleIds?.length ||
    journey.offeredVehicleIds.includes(id);
  const offeredStay = (id: string) =>
    !journey.offeredStayStyleIds?.length ||
    journey.offeredStayStyleIds.includes(id);

  const [vehicles, setVehicles] = useState(() =>
    Object.fromEntries(
      packageRates.map(({ vehicle, rate }) => [
        vehicle.id,
        { cost: String(rate.costPerDay), capacity: String(rate.capacity) },
      ]),
    ),
  );
  const [stays, setStays] = useState(() =>
    Object.fromEntries(
      stayRates.map(({ style, rate }) => [
        style.id,
        {
          room: String(rate.roomCost),
          mattress: String(rate.extraMattressPerPerson),
        },
      ]),
    ),
  );
  // C lines. A journey saved with the earlier single total starts with it as one line.
  const [opCosts, setOpCosts] = useState<
    { id: string; name: string; cost: string; capacity: string }[]
  >(() => {
    if (pricing.operationalCosts?.length) {
      return pricing.operationalCosts.map((row) => ({
        id: row.id,
        name: row.name,
        cost: String(row.cost),
        capacity: row.capacity > 0 ? String(row.capacity) : "",
      }));
    }
    if (pricing.operationalCostTotal != null) {
      return [
        {
          id: "op-1",
          name: "Operational cost",
          cost: String(pricing.operationalCostTotal),
          capacity: "",
        },
      ];
    }
    return [];
  });
  const opItems = useMemo<PackageOperationalCost[]>(
    () =>
      opCosts.map((row) => ({
        id: row.id,
        name: row.name.trim(),
        cost: toNum(row.cost),
        capacity: Math.round(toNum(row.capacity)),
      })),
    [opCosts],
  );
  const setOp = (index: number, patch: Partial<(typeof opCosts)[number]>) =>
    setOpCosts((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );
  const [tris, setTris] = useState(
    str(pricing.trisServicePercent ?? DEFAULT_TRIS_SERVICE_PERCENT),
  );
  const [gst, setGst] = useState(
    str(pricing.gstPercent ?? DEFAULT_PACKAGE_GST_PERCENT),
  );
  const legacyPerGuest = pricing.activityCostPerGuest;

  // Worked example inputs (preview only — never saved).
  const firstVehicle =
    packageRates.find(({ vehicle }) => offeredVehicle(vehicle.id))?.vehicle
      .id ??
    packageRates[0]?.vehicle.id ??
    "sedan";
  const firstStay =
    stayRates.find(({ style }) => offeredStay(style.id))?.style.id ??
    stayRates[0]?.style.id ??
    "homestay";
  const [ex, setEx] = useState({
    adults: 4,
    children: 0,
    vehicleId: firstVehicle,
    vehicleCount: 1,
    stayId: firstStay,
    rooms: 2,
    mattresses: 0,
  });

  const quote = useMemo(() => {
    const draft: Journey = {
      ...journey,
      packagePricing: {
        ...pricing,
        vehicles: Object.fromEntries(
          Object.entries(vehicles).map(([id, v]) => [
            id,
            {
              costPerDay: toNum(v.cost),
              capacity: Math.max(1, toNum(v.capacity)),
            },
          ]),
        ),
        stays: Object.fromEntries(
          Object.entries(stays).map(([id, s]) => [
            id,
            {
              roomCost: toNum(s.room),
              extraMattressPerPerson: toNum(s.mattress),
            },
          ]),
        ),
        operationalCosts: opItems,
        operationalCostTotal: null,
        trisServicePercent: toNum(tris),
        gstPercent: toNum(gst),
      },
    };
    return quoteCuratedPackage(draft, {
      adults: Math.max(1, ex.adults),
      children: ex.children,
      vehicleId: ex.vehicleId as PackageTransportId,
      vehicleCount: Math.max(1, ex.vehicleCount),
      stayPreference: ex.stayId as StayPreferenceId,
      rooms: Math.max(1, ex.rooms),
      extraMattresses: ex.mattresses,
    });
  }, [journey, pricing, vehicles, stays, opItems, tris, gst, ex]);

  const exVehicle = packageRates.find(
    ({ vehicle }) => vehicle.id === ex.vehicleId,
  );
  const exStay = stays[ex.stayId];
  const select =
    "h-11 w-full rounded-xl border border-[#c5cbb8] bg-white px-3 text-sm text-[#26352b]";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg text-[#26352b]">
          Book now price calculator
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-[#4a5a50]">
          Enter what this journey <strong>costs TRIS</strong>. When a guest
          books online, the price is worked out as{" "}
          <strong>A + B + C + D + E</strong>. This is separate from the transfer
          prices on the Enquire form (Transportation above). This journey is{" "}
          {days} days / {nights} nights.
        </p>
      </div>

      <Step
        letter="A"
        title="Transport"
        formula="vehicle cost per day × number of vehicles × number of days"
        help={`Cost to TRIS for one vehicle for one day, and how many guests it seats. Enough vehicles for the group are added automatically. Days = ${days}.`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {packageRates.map(({ vehicle }) => {
            const id = vehicle.id;
            const v = vehicles[id];
            return (
              <div
                key={id}
                className={cn(
                  "space-y-3 rounded-xl border bg-white p-3",
                  offeredVehicle(id)
                    ? "border-[#c5cbb8]"
                    : "border-dashed border-[#d5dbc8] opacity-70",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-[#eef1e6]">
                    {vehicle.images?.[0] || vehicle.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={vehicle.images?.[0] || vehicle.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[10px] font-semibold tracking-wide text-[#8a9a8c] uppercase">
                        No photo
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#26352b]">
                      {vehicle.label}
                    </p>
                    <p className="text-xs text-[#6a7a6c]">
                      {vehicle.seats || `Max ${vehicle.maxGuests}`}
                      {offeredVehicle(id) ? "" : " · not offered to guests"}
                    </p>
                  </div>
                </div>
                <Num
                  label="Cost per day"
                  name={`pkgVehicle_${id}_cost`}
                  value={v.cost}
                  onChange={(cost) =>
                    setVehicles((p) => ({ ...p, [id]: { ...p[id], cost } }))
                  }
                />
                <Num
                  label="Seats"
                  name={`pkgVehicle_${id}_capacity`}
                  unit="guests"
                  after
                  min={1}
                  value={v.capacity}
                  onChange={(capacity) =>
                    setVehicles((p) => ({ ...p, [id]: { ...p[id], capacity } }))
                  }
                />
              </div>
            );
          })}
        </div>
      </Step>

      <Step
        letter="B"
        title="Stay"
        formula="room cost × rooms + extra mattress cost × extra mattresses"
        help="Both are prices for the whole journey (all nights together): one room, and one extra mattress."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stayRates.map(({ style }) => {
            const id = style.id;
            const s = stays[id];
            return (
              <div
                key={id}
                className={cn(
                  "space-y-3 rounded-xl border bg-white p-3",
                  offeredStay(id)
                    ? "border-[#c5cbb8]"
                    : "border-dashed border-[#d5dbc8] opacity-70",
                )}
              >
                <p className="text-sm font-semibold text-[#26352b]">
                  {style.label}
                  {offeredStay(id) ? null : (
                    <span className="font-normal text-[#6a7a6c]">
                      {" "}
                      · not offered
                    </span>
                  )}
                </p>
                <Num
                  label="Room cost — whole journey"
                  name={`pkgStay_${id}_room`}
                  value={s.room}
                  onChange={(room) =>
                    setStays((p) => ({ ...p, [id]: { ...p[id], room } }))
                  }
                />
                <Num
                  label="Extra mattress — whole journey"
                  name={`pkgStay_${id}_mattress`}
                  value={s.mattress}
                  onChange={(mattress) =>
                    setStays((p) => ({ ...p, [id]: { ...p[id], mattress } }))
                  }
                />
              </div>
            );
          })}
        </div>
      </Step>

      <Step
        letter="C"
        title="Operational cost"
        formula="sum of (cost of one × how many the group needs)"
        help="Guides, activities, entry fees, permits — for the whole journey. Set how many guests one covers (e.g. one guide per 6 guests) and more are added for bigger groups. Leave it empty if one covers the whole group."
      >
        {opCosts.length === 0 ? (
          <p className="text-sm text-[#6a7a6c]">No operational costs yet.</p>
        ) : (
          <div className="space-y-3">
            {opCosts.map((row, index) => {
              const line = operationalCostLine(
                opItems[index],
                quote.totalGuests,
              );
              return (
                <div
                  key={row.id}
                  className="rounded-xl border border-[#d5dbc8] bg-white p-3.5"
                >
                  <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:items-end">
                    <label className="block">
                      <span className="block text-sm font-medium text-[#26352b]">
                        What is it?
                      </span>
                      <input
                        value={row.name}
                        onChange={(e) => setOp(index, { name: e.target.value })}
                        placeholder="e.g. Guide"
                        className="mt-1.5 h-11 w-full rounded-xl border border-[#c5cbb8] bg-white px-3 text-sm text-[#26352b] outline-none focus:border-[#364037]"
                      />
                    </label>
                    <Num
                      label="Cost of one — whole journey"
                      value={row.cost}
                      onChange={(cost) => setOp(index, { cost })}
                    />
                    <Num
                      label="One covers up to"
                      unit="guests"
                      after
                      value={row.capacity}
                      onChange={(capacity) => setOp(index, { capacity })}
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${row.name || "operational cost"}`}
                      onClick={() =>
                        setOpCosts((rows) => rows.filter((_, i) => i !== index))
                      }
                      className="grid h-11 w-11 place-items-center rounded-full border border-[#c5cbb8] text-[#364037] hover:bg-[#eef1e6]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="mt-2.5 text-xs text-[#4a5a50]">
                    {line.capacity > 0
                      ? `For the example group of ${quote.totalGuests}: ${line.units} × ${row.name || "this"} = `
                      : `One for the whole group: `}
                    <strong>{formatINR(line.total)}</strong>
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() =>
            setOpCosts((rows) => [
              ...rows,
              { id: `op-${Date.now()}`, name: "", cost: "", capacity: "" },
            ])
          }
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#c5cbb8] px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#364037] uppercase hover:bg-[#eef1e6]"
        >
          <Plus size={14} />
          Add operational cost
        </button>
        {opCosts.length === 0 && legacyPerGuest ? (
          <p className="mt-3 rounded-xl border border-[#e4c9a8] bg-[#fbf3e8] p-3 text-sm text-[#5a4630]">
            Not entered yet — until you add one, this journey still uses its old
            rate of{" "}
            <strong>
              {formatINR(legacyPerGuest)} per guest × number of guests
            </strong>
            .
          </p>
        ) : null}
        <input
          type="hidden"
          name="pkgOperationalCosts"
          value={JSON.stringify(opItems)}
        />
        {/* Old per-guest rate, kept so un-migrated journeys keep pricing the same. */}
        <input
          type="hidden"
          name="pkgActivityCost"
          value={str(legacyPerGuest)}
        />
      </Step>

      <Step
        letter="D"
        title="TRIS service fee"
        formula="TRIS % of (A + B + C)"
        help="Your fee, as a percentage of the three costs added together."
      >
        <div className="max-w-sm">
          <Num
            label="TRIS service fee"
            name="pkgTrisPercent"
            unit="%"
            after
            step={0.1}
            value={tris}
            onChange={setTris}
          />
        </div>
      </Step>

      <Step
        letter="E"
        title="GST"
        formula="GST % of D"
        help="GST is charged on the TRIS service fee (D) only — not on A, B or C."
      >
        <div className="max-w-sm">
          <Num
            label="GST rate"
            name="pkgGstPercent"
            unit="%"
            after
            step={0.1}
            value={gst}
            onChange={setGst}
          />
        </div>
      </Step>

      {/* Worked example, laid out like a receipt. */}
      <section className="rounded-2xl border-2 border-[#364037] bg-white p-4 md:p-5">
        <h3 className="text-base font-semibold text-[#1f2a24]">
          What a guest would pay
        </h3>
        <p className="mt-0.5 text-sm text-[#4a5a50]">
          Try any booking — this is only a preview and isn’t saved.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          <Num
            label="Adults"
            unit=""
            min={1}
            value={String(ex.adults)}
            onChange={(v) =>
              setEx((p) => ({
                ...p,
                adults: Math.max(1, Math.round(toNum(v))),
              }))
            }
          />
          <Num
            label="Children"
            unit=""
            value={String(ex.children)}
            onChange={(v) =>
              setEx((p) => ({ ...p, children: Math.round(toNum(v)) }))
            }
          />
          <label className="block lg:col-span-2">
            <span className="block text-sm font-medium text-[#26352b]">
              Vehicle
            </span>
            <select
              value={ex.vehicleId}
              onChange={(e) =>
                setEx((p) => ({ ...p, vehicleId: e.target.value }))
              }
              className={cn(select, "mt-1.5")}
            >
              {packageRates.map(({ vehicle }) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.label} · {vehicles[vehicle.id]?.capacity} seats
                </option>
              ))}
            </select>
          </label>
          <Num
            label="Vehicles"
            unit=""
            min={1}
            value={String(ex.vehicleCount)}
            onChange={(v) =>
              setEx((p) => ({
                ...p,
                vehicleCount: Math.max(1, Math.round(toNum(v))),
              }))
            }
          />
          <label className="block">
            <span className="block text-sm font-medium text-[#26352b]">
              Stay
            </span>
            <select
              value={ex.stayId}
              onChange={(e) => setEx((p) => ({ ...p, stayId: e.target.value }))}
              className={cn(select, "mt-1.5")}
            >
              {stayRates.map(({ style }) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Num
              label="Rooms"
              unit=""
              min={1}
              value={String(ex.rooms)}
              onChange={(v) =>
                setEx((p) => ({
                  ...p,
                  rooms: Math.max(1, Math.round(toNum(v))),
                }))
              }
            />
            <Num
              label="Mattresses"
              unit=""
              value={String(ex.mattresses)}
              onChange={(v) =>
                setEx((p) => ({ ...p, mattresses: Math.round(toNum(v)) }))
              }
            />
          </div>
        </div>

        {!quote.capacityOk ? (
          <p className="mt-3 rounded-xl border border-[#e4c9a8] bg-[#fbf3e8] p-3 text-sm text-[#5a4630]">
            {quote.totalGuests} guests need at least {quote.minVehiclesRequired}{" "}
            of this vehicle — guests can’t book with fewer.
          </p>
        ) : null}

        <dl className="mt-4 space-y-1.5 text-sm">
          <Row
            label={`A · ${exVehicle?.vehicle.label ?? "Vehicle"}: ${formatINR(toNum(vehicles[ex.vehicleId]?.cost ?? "0"))}/day × ${quote.vehicleCount} vehicle${quote.vehicleCount === 1 ? "" : "s"} × ${quote.days} days`}
            amount={quote.vehicleCost}
          />
          <Row
            label={`B · ${formatINR(toNum(exStay?.room ?? "0"))} × ${quote.rooms} room${quote.rooms === 1 ? "" : "s"}${
              quote.extraMattresses
                ? ` + ${formatINR(toNum(exStay?.mattress ?? "0"))} × ${quote.extraMattresses} mattress${quote.extraMattresses === 1 ? "" : "es"}`
                : ""
            }`}
            amount={quote.roomCost}
          />
          {opItems.length ? (
            opItems.map((item) => {
              const line = operationalCostLine(item, quote.totalGuests);
              return (
                <Row
                  key={item.id}
                  label={`C · ${line.units} × ${item.name || "operational cost"} (${formatINR(line.unitCost)} each)`}
                  amount={line.total}
                />
              );
            })
          ) : (
            <Row
              label={
                legacyPerGuest
                  ? `C · ${formatINR(legacyPerGuest)} × ${quote.totalGuests} guests (old per-guest rate)`
                  : "C · Operational cost"
              }
              amount={quote.activityCost}
            />
          )}
          <Row label="A + B + C" amount={quote.subtotalABC} rule strong />
          <Row
            label={`D · TRIS service fee ${quote.trisServicePercent}% of A + B + C`}
            amount={quote.trisService}
          />
          <Row label={`E · GST ${quote.gstPercent}% of D`} amount={quote.gst} />
        </dl>
        <div className="mt-3 rounded-xl bg-[#364037] px-4 py-3 text-white">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-semibold">
              Guest pays (A + B + C + D + E)
            </span>
            <span className="text-xl font-bold">{formatINR(quote.total)}</span>
          </div>
          <p className="mt-1 text-xs text-white/75">
            About {formatINR(quote.perPerson)} per guest ·{" "}
            {formatINR(quote.advanceAmount)} advance at booking,{" "}
            {formatINR(quote.balanceAmount)} before travel
          </p>
        </div>
      </section>
    </div>
  );
}

function Row({
  label,
  amount,
  rule,
  strong,
}: {
  label: string;
  amount: number;
  rule?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-4",
        rule && "mt-2 border-t border-[#d5dbc8] pt-2",
        strong ? "font-semibold text-[#1f2a24]" : "text-[#4a5a50]",
      )}
    >
      <dt>{label}</dt>
      <dd className="shrink-0 tabular-nums">{formatINR(amount)}</dd>
    </div>
  );
}
