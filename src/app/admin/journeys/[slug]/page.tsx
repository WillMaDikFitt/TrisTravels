"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Journey } from "@/data/journeys";
import { getJourney as getStaticJourney } from "@/data/journeys";
import {
  DEFAULT_PACKAGE_GST_PERCENT,
  DEFAULT_PACKAGE_STAYS,
  DEFAULT_PACKAGE_VEHICLES,
  DEFAULT_TRIS_SERVICE_PERCENT,
  legacyRateKeyFor,
  legacyStayRateKeyFor,
  packageStayRate,
  resolveFleetPackageRates,
} from "@/data/package-pricing";
import { fetchJourneyAdmin } from "@/lib/actions/content-read";
import { saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { normalizeJourney } from "@/lib/normalize-listing";
import { useStudioListingHydration } from "@/lib/admin/useStudioListingHydration";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField, GalleryField } from "@/components/admin/ImageField";
import { parseDepartureSeats } from "@/lib/journey-seats";
import { DepartureSeatsCalendar } from "@/components/admin/DepartureSeatsCalendar";
import {
  compactJourneyItinerary,
  ItineraryEditor,
} from "@/components/admin/ItineraryEditor";
import { CuratedPackageCosts } from "@/components/admin/CuratedPackageCosts";
import { TransportPricingFields, transportEditorFromListing, transportFieldsFromEditor } from "@/components/admin/TransportPricingFields";
import type { FleetVehicle } from "@/data/transport";
import { fetchFleetVehicles, fetchStayStyles } from "@/lib/actions/content-read";
import { activeStayStyles, type StayStyle } from "@/data/stay-styles";

function blank(): Journey {
  return {
    slug: "",
    name: "",
    type: "curated",
    tagline: "",
    days: 3,
    nights: 2,
    priceFrom: 0,
    image: "",
    gallery: [],
    style: [],
    season: "",
    overview: "",
    highlights: [],
    experienceHighlights: [],
    itinerary: [],
    stays: [],
    inclusions: [],
    exclusions: [],
    packagePricing: {
      activityCostPerGuest: 0,
      trisServicePercent: DEFAULT_TRIS_SERVICE_PERCENT,
      gstPercent: DEFAULT_PACKAGE_GST_PERCENT,
    },
    sourceUrl: "",
    status: "draft",
  };
}

/** Fallback slug for a brand-new journey when the name doesn't slugify. */
function newJourneySlug(name: string) {
  return slugify(name) || `journey-${Date.now()}`;
}

const lines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function readPackagePricing(
  fd: FormData,
  type: Journey["type"],
  vehicleIds: string[],
  stayIds: string[],
): Journey["packagePricing"] {
  if (type !== "curated") return undefined;
  const vehicles: NonNullable<Journey["packagePricing"]>["vehicles"] = {};
  for (const id of vehicleIds) {
    const rawCost = String(fd.get(`pkgVehicle_${id}_cost`) ?? "").trim();
    const rawCapacity = String(fd.get(`pkgVehicle_${id}_capacity`) ?? "").trim();
    // Left blank = keep falling back to the legacy rate for this size of vehicle.
    if (!rawCost && !rawCapacity) continue;
    const cost = Number(rawCost);
    const capacity = Number(rawCapacity);
    const fallback = DEFAULT_PACKAGE_VEHICLES[legacyRateKeyFor(id)];
    vehicles[id] = {
      costPerDay: Number.isFinite(cost) && cost >= 0 ? Math.round(cost) : fallback.costPerDay,
      capacity:
        Number.isFinite(capacity) && capacity > 0 ? Math.round(capacity) : fallback.capacity,
    };
  }
  const stays: NonNullable<Journey["packagePricing"]>["stays"] = {};
  for (const id of stayIds) {
    const roomCost = Number(fd.get(`pkgStay_${id}_room`) || "");
    const mattress = Number(fd.get(`pkgStay_${id}_mattress`) || "");
    if (Number.isFinite(roomCost) || Number.isFinite(mattress)) {
      stays[id] = {
        roomCost:
          Number.isFinite(roomCost) && roomCost >= 0
            ? Math.round(roomCost)
            : DEFAULT_PACKAGE_STAYS[legacyStayRateKeyFor(id)].roomCost,
        extraMattressPerPerson:
          Number.isFinite(mattress) && mattress >= 0
            ? Math.round(mattress)
            : DEFAULT_PACKAGE_STAYS[legacyStayRateKeyFor(id)].extraMattressPerPerson,
      };
    }
  }
  const activity = Number(fd.get("pkgActivityCost") || "");
  // C lines arrive as JSON from the calculator. None = not entered yet, so the legacy
  // per-guest cost keeps pricing this journey.
  let operationalCosts: NonNullable<Journey["packagePricing"]>["operationalCosts"] = [];
  try {
    const parsed = JSON.parse(String(fd.get("pkgOperationalCosts") || "[]"));
    if (Array.isArray(parsed)) {
      operationalCosts = parsed
        .map((row, index) => ({
          id: String(row?.id || `op-${index + 1}`),
          name: String(row?.name ?? "").trim(),
          cost: Math.max(0, Math.round(Number(row?.cost) || 0)),
          capacity: Math.max(0, Math.round(Number(row?.capacity) || 0)),
        }))
        .filter((row) => row.name || row.cost > 0);
    }
  } catch {
    operationalCosts = [];
  }
  const tris = Number(fd.get("pkgTrisPercent") || "");
  const gst = Number(fd.get("pkgGstPercent") || "");
  return {
    vehicles: Object.keys(vehicles).length ? vehicles : undefined,
    stays: Object.keys(stays).length ? stays : undefined,
    // Saves merge into the stored journey, so write [] / null to really clear old values.
    operationalCosts,
    // Replaced by the lines above (the calculator turns an old total into the first line).
    operationalCostTotal: null,
    activityCostPerGuest: Number.isFinite(activity) && activity >= 0 ? Math.round(activity) : undefined,
    trisServicePercent: Number.isFinite(tris) && tris >= 0 ? tris : DEFAULT_TRIS_SERVICE_PERCENT,
    gstPercent: Number.isFinite(gst) && gst >= 0 ? gst : DEFAULT_PACKAGE_GST_PERCENT,
  };
}

export default function JourneyEditorPage() {
  const params = useParams<{ slug: string }>();
  const slugKey = decodeURIComponent(String(params.slug ?? ""));
  const router = useRouter();
  const isNew = slugKey === "new";
  const { row, setRow, hydrated, formKey, loadError, canSave, applySaved } =
    useStudioListingHydration<Journey>({
      isNew,
      slugKey,
      blank,
      seedFallback: () => {
        const seeded = getStaticJourney(slugKey);
        return seeded ? normalizeJourney(seeded, slugKey) : null;
      },
      isRemoved: (journey) => journey.removedFromCatalogue === true,
      load: async () => {
        const journey = await fetchJourneyAdmin(slugKey);
        return journey ? normalizeJourney(journey, slugKey) : null;
      },
    });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [fleet, setFleet] = useState<FleetVehicle[] | null>(null);
  const [stayStyles, setStayStyles] = useState<StayStyle[] | null>(null);

  useEffect(() => {
    if (loadError) setNote(loadError);
  }, [loadError]);

  useEffect(() => {
    fetchFleetVehicles()
      .then((rows) => setFleet(rows?.length ? rows : null))
      .catch(() => setFleet(null));
    fetchStayStyles()
      .then((rows) => setStayStyles(rows?.length ? rows : null))
      .catch(() => setStayStyles(null));
  }, []);

  if (!hydrated) return <p className="text-sm text-[#4a5a50]">Loading saved content…</p>;
  if (!row) return <p className="text-sm text-[#4a5a50]">{note || "Loading editor…"}</p>;

  // A rate card per fleet vehicle, pre-filled from this journey or the standard rate for its size.
  const packageRates = resolveFleetPackageRates(fleet, row.packagePricing?.vehicles);
  // Every stay style from Studio → Stays, so Luxury and mixed stays can be offered and priced.
  const stayStyleOptions = activeStayStyles(stayStyles);
  const stayRates = stayStyleOptions.map((style) => ({
    style,
    rate: packageStayRate(style.id, row.packagePricing?.stays),
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New journey" : row.name || "Edit journey"}
        description="Edits load from live Studio data before this form opens, so seed defaults cannot overwrite your work."
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/journeys")}>
            Back to list
          </AdminButton>
        }
      />
      {note ? (
        <div className="mb-4">
          <Notice tone={note.startsWith("Saved") ? "ok" : note.includes("Do not save") ? "warn" : "info"}>
            {note}
          </Notice>
        </div>
      ) : null}
      <form
        key={formKey}
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSave) {
            setNote("Still loading saved content — wait a moment, then try Save again.");
            return;
          }
          const fd = new FormData(e.currentTarget);
          const nextSlug = isNew ? newJourneySlug(String(fd.get("name") || "")) : row.slug;
          const next: Journey = {
            ...row,
            slug: nextSlug,
            name: String(fd.get("name")),
            type: String(fd.get("type")) as Journey["type"],
            tagline: String(fd.get("tagline")),
            days: Number(fd.get("days") || 3),
            nights: Number(fd.get("nights") || 2),
            priceFrom: Number(fd.get("priceFrom") || 0),
            priceNote: String(fd.get("priceNote") || ""),
            priceChild: Number(fd.get("priceChild") || 0) || undefined,
            transportAvailable: row.transportAvailable !== false,
            transportPrice: row.transportPrice,
            transportNote: row.transportNote ?? "",
            transportVehicles: row.transportVehicles,
            offeredVehicleIds: row.offeredVehicleIds?.length ? row.offeredVehicleIds : undefined,
            offeredStayStyleIds: row.offeredStayStyleIds?.length ? row.offeredStayStyleIds : undefined,
            removedFromCatalogue: false,
            season: String(fd.get("season")),
            route: String(fd.get("route") || "").trim(),
            totalDistance: String(fd.get("totalDistance") || "").trim(),
            overview: String(fd.get("overview")),
            image: (() => {
              const cover = String(fd.get("image") || "").trim();
              if (cover) return cover;
              return lines(String(fd.get("gallery") || ""))[0] || "";
            })(),
            gallery: lines(String(fd.get("gallery") || "")),
            highlights: lines(String(fd.get("highlights") || "")),
            experienceHighlights: lines(String(fd.get("experienceHighlights") || "")),
            notSuitableFor: lines(String(fd.get("notSuitableFor") || "")),
            stays: lines(String(fd.get("stays") || "")),
            inclusions: lines(String(fd.get("inclusions") || "")),
            exclusions: lines(String(fd.get("exclusions") || "")),
            packagePricing: readPackagePricing(
              fd,
              String(fd.get("type")) as Journey["type"],
              packageRates.map(({ vehicle }) => vehicle.id),
              stayRates.map(({ style }) => style.id),
            ),
            nextDeparture: String(fd.get("nextDeparture") || ""),
            departures: String(fd.get("departures") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            departureSeats: parseDepartureSeats(String(fd.get("departureSeats") || "")),
            groupSize: String(fd.get("groupSize") || ""),
            itinerary: compactJourneyItinerary(row.itinerary ?? []),
            status: String(fd.get("status") || "active") as Journey["status"],
            backendId: String(fd.get("backendId") || "").trim() || undefined,
            idCode: String(fd.get("idCode") || "").trim() || undefined,
            paymentLink: String(fd.get("paymentLink") || "").trim() || undefined,
          };
          // Prefer earliest calendar date as next-departure label when blank
          if (!next.nextDeparture && next.departureSeats?.length) {
            const soonest = [...next.departureSeats].sort((a, b) => a.date.localeCompare(b.date))[0];
            if (soonest) {
              next.nextDeparture = new Date(`${soonest.date}T12:00:00`).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            }
          }
          setBusy(true);
          const res = await saveDocument("journeys", nextSlug, {
            ...(next as unknown as Record<string, unknown>),
            offeredVehicleIds: row.offeredVehicleIds?.length ? row.offeredVehicleIds : null,
            offeredStayStyleIds: row.offeredStayStyleIds?.length ? row.offeredStayStyleIds : null,
          });
          setBusy(false);
          if (res.ok) {
            setNote("Saved. Your edits are stored live — refresh to confirm they stuck.");
            applySaved(next);
            if (isNew) router.replace(`/admin/journeys/${nextSlug}`);
          } else {
            setNote(res.error ?? "Could not save.");
          }
        }}
      >
        <Panel>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input name="name" required defaultValue={row.name} className={inputClass} />
            </Field>
            <Field label="Type">
              <select
                name="type"
                value={row.type}
                onChange={(e) =>
                  setRow((prev) =>
                    prev
                      ? { ...prev, type: e.target.value as Journey["type"] }
                      : prev,
                  )
                }
                className={inputClass}
              >
                <option value="curated">Curated (Book now + Customise)</option>
                <option value="small-group">Small group (fixed departure)</option>
              </select>
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={row.tagline} className={inputClass} />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={row.status ?? "active"} className={inputClass}>
                <option>active</option>
                <option>draft</option>
                <option>hidden</option>
              </select>
            </Field>
            <Field
              label="Backend ID"
              hint="Ops / backend catalogue ID — included on bookings and enquiries"
            >
              <input
                name="backendId"
                defaultValue={row.backendId ?? ""}
                placeholder={row.type === "small-group" ? "e.g. FD-01" : "e.g. CJ-0018"}
                className={inputClass}
              />
            </Field>
            {row.type === "small-group" ? (
              <Field label="Display code" hint="Optional public label, e.g. FD:01">
                <input
                  name="idCode"
                  defaultValue={row.idCode ?? ""}
                  placeholder="FD:01"
                  className={inputClass}
                />
              </Field>
            ) : null}
            <Field label="Days">
              <input name="days" type="number" defaultValue={row.days} className={inputClass} />
            </Field>
            <Field label="Nights">
              <input name="nights" type="number" defaultValue={row.nights} className={inputClass} />
            </Field>
            <Field label="Price from (₹)">
              <input name="priceFrom" type="number" defaultValue={row.priceFrom} className={inputClass} />
            </Field>
            <Field
              label="Child price (₹)"
              hint="Used on enquire. Enter the child rate — no automatic 70% fallback (blank = ₹0 for children)."
            >
              <input name="priceChild" type="number" min="0" defaultValue={row.priceChild ?? ""} className={inputClass} />
            </Field>
            <Field label="Price note">
              <input name="priceNote" defaultValue={row.priceNote ?? ""} className={inputClass} />
            </Field>
            <Field
              label="Route"
              hint="Shown in Journey at a glance, e.g. 2 Nights in Sohra → 1 Night in Nongriat"
            >
              <input
                name="route"
                defaultValue={row.route ?? ""}
                placeholder="2 Nights in Sohra → 1 Night in Nongriat → 1 Night in Shillong"
                className={inputClass}
              />
            </Field>
            <Field label="Season">
              <input name="season" defaultValue={row.season} className={inputClass} />
            </Field>
            <Field label="Total travelling distance" hint="e.g. 540 km — shown in Journey at a glance">
              <input
                name="totalDistance"
                defaultValue={row.totalDistance ?? ""}
                className={inputClass}
              />
            </Field>
            <Field label="Group size" hint="small-group">
              <input name="groupSize" defaultValue={row.groupSize ?? ""} className={inputClass} />
            </Field>
            <Field label="Next departure label" hint="shown on public cards">
              <input name="nextDeparture" defaultValue={row.nextDeparture ?? ""} className={inputClass} />
            </Field>
            <Field
              label="Payment link / raise payment"
              hint="Paste a Razorpay payment link (or UPI/bank URL). Shown as Pay now on the journey page and after Reserve my seat."
            >
              <input
                name="paymentLink"
                type="url"
                placeholder="https://razorpay.me/… or payment page URL"
                defaultValue={row.paymentLink ?? ""}
                className={inputClass}
              />
            </Field>
            {row.type !== "small-group" ? (
              <Field label="Simple departure dates" hint="comma-separated, for public cards">
                <input name="departures" defaultValue={(row.departures ?? []).join(", ")} className={inputClass} />
              </Field>
            ) : null}
          </div>
        </Panel>

        <Panel>
          <TransportPricingFields
            variant="journey"
            hidePrices={row.type === "curated"}
            value={transportEditorFromListing({
              variant: "journey",
              transportAvailable: row.transportAvailable,
              transportPrice: row.transportPrice,
              transportNote: row.transportNote,
              transportVehicles: row.transportVehicles,
              offeredVehicleIds: row.offeredVehicleIds,
            })}
            onChange={(next) => {
              const fields = transportFieldsFromEditor(next);
              setRow((prev) =>
                prev
                  ? {
                      ...prev,
                      transportAvailable: next.available !== false,
                      transportPrice: fields.transportPrice,
                      transportNote: fields.transportNote,
                      transportVehicles: fields.transportVehicles,
                      offeredVehicleIds: fields.offeredVehicleIds,
                    }
                  : prev,
              );
            }}
          />
        </Panel>

        {row.type === "curated" ? (
          <Panel>
            <h2 className="mb-2 font-display text-lg">Stay styles on Book now</h2>
            <p className="mb-4 text-sm text-[#4a5a50]">
              Choose which Studio stay categories guests can pick on this journey. Photos come from Studio → Stays.
              Leave all ticked to offer every booking-enabled stay.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stayStyleOptions.map((style) => {
                const id = style.id;
                const meta = { label: style.label, hint: style.short };
                const selected =
                  !row.offeredStayStyleIds?.length || row.offeredStayStyleIds.includes(id);
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                      selected
                        ? "border-[#364037] bg-white text-[#26352b]"
                        : "border-[#d5dbc8] bg-[#f3f5ef] text-[#4a5a50]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        const allIds = stayStyleOptions.map((s) => s.id);
                        const current = row.offeredStayStyleIds?.length
                          ? [...row.offeredStayStyleIds]
                          : [...allIds];
                        const next = current.includes(id)
                          ? current.filter((item) => item !== id)
                          : [...current, id];
                        setRow((prev) =>
                          prev
                            ? {
                                ...prev,
                                // Keep the explicit list even when all are ticked, so styles that
                                // aren't flagged globally (Luxury, mixed) still reach guests.
                                offeredStayStyleIds: next.length === 0 ? undefined : next,
                              }
                            : prev,
                        );
                      }}
                    />
                    <span className="font-medium">{meta?.label ?? id}</span>
                  </label>
                );
              })}
            </div>
          </Panel>
        ) : null}

        {row.type === "curated" ? (
          <Panel>
            <CuratedPackageCosts
              // Remount once Studio's vehicles and stays load, so every card gets its own field.
              key={`${packageRates.map((r) => r.vehicle.id).join(",")}|${stayRates.map((r) => r.style.id).join(",")}`}
              journey={row}
              packageRates={packageRates}
              stayRates={stayRates}
            />
          </Panel>
        ) : null}

        {row.type === "small-group" ? (
          <Panel>
            <h3 className="font-display text-base text-[#26352b]">Fixed departure calendar</h3>
            <p className="mt-1 text-sm text-[#4a5a50]">
              Select multiple departure days on the calendar. Set seats, held, and booked for each date.
            </p>
            <div className="mt-4">
              <DepartureSeatsCalendar
                key={`${row.slug}-${(row.departureSeats ?? []).map((d) => d.date).join(",")}`}
                initial={row.departureSeats}
              />
            </div>
          </Panel>
        ) : null}

        <Panel>
          <Field label="Overview">
            <textarea name="overview" rows={5} defaultValue={row.overview} className={inputClass} />
          </Field>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field label="Experience highlights" hint="3–5 short labels for listing cards, one per line">
              <textarea
                name="experienceHighlights"
                rows={6}
                defaultValue={(row.experienceHighlights ?? []).join("\n")}
                className={inputClass}
                placeholder={"Living Root Bridges\nWaterfalls\nCaves"}
              />
            </Field>
            <Field label="Detail highlights" hint="one per line — length can vary by journey">
              <textarea name="highlights" rows={6} defaultValue={(row.highlights ?? []).join("\n")} className={inputClass} />
            </Field>
            <Field label="Not suitable for" hint="shown in Journey at a Glance — one per line">
              <textarea
                name="notSuitableFor"
                rows={6}
                defaultValue={(row.notSuitableFor ?? []).join("\n")}
                className={inputClass}
                placeholder={"Extreme trekkers\nTravellers seeking nightlife"}
              />
            </Field>
            <Field label="Stays" hint="one per line">
              <textarea name="stays" rows={6} defaultValue={(row.stays ?? []).join("\n")} className={inputClass} />
            </Field>
            <Field label="Inclusions" hint="one per line">
              <textarea name="inclusions" rows={6} defaultValue={(row.inclusions ?? []).join("\n")} className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Exclusions" hint="one per line — shown on the journey detail page">
              <textarea
                name="exclusions"
                rows={4}
                defaultValue={(row.exclusions ?? []).join("\n")}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="mt-4">
            <ItineraryEditor
              mode="journey"
              value={row.itinerary ?? []}
              onChange={(itinerary) => setRow((prev) => (prev ? { ...prev, itinerary } : prev))}
            />
          </div>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-display text-lg">Media</h2>
          <ImageField key={`cover-${row.slug}-${row.image}`} name="image" label="Cover image" defaultValue={row.image} />
          <div className="mt-6">
            <GalleryField
              key={`gallery-${row.slug}-${(row.gallery ?? []).join("|")}`}
              name="gallery"
              label="Gallery images"
              defaultValue={row.gallery ?? []}
              hint="Extra photos on the journey detail page. Upload several at once; reorder as needed."
            />
          </div>
        </Panel>
        {note && <Notice tone={note === "Saved." ? "ok" : "warn"}>{note}</Notice>}
        <AdminButton type="submit" disabled={busy || !canSave}>
          {busy ? "Saving…" : "Save journey"}
        </AdminButton>
      </form>
    </div>
  );
}
