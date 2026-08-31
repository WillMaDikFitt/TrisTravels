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
  STAY_PREFERENCE_IDS,
  STAY_PREFERENCE_META,
} from "@/data/package-pricing";
import { fetchJourneyAdmin } from "@/lib/actions/content-read";
import { saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { parseDepartureSeats } from "@/lib/journey-seats";
import { DepartureSeatsCalendar } from "@/components/admin/DepartureSeatsCalendar";
import { readTransportVehiclePrices, TRANSPORT_VEHICLE_IDS, TRANSPORT_VEHICLE_META } from "@/data/transport";

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

const lines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

function readPackagePricing(fd: FormData, type: Journey["type"]): Journey["packagePricing"] {
  if (type !== "curated") return undefined;
  const vehicles: NonNullable<Journey["packagePricing"]>["vehicles"] = {};
  for (const id of TRANSPORT_VEHICLE_IDS) {
    const cost = Number(fd.get(`pkgVehicle_${id}_cost`) || "");
    const capacity = Number(fd.get(`pkgVehicle_${id}_capacity`) || "");
    if (Number.isFinite(cost) || Number.isFinite(capacity)) {
      vehicles[id] = {
        costPerDay: Number.isFinite(cost) && cost >= 0 ? Math.round(cost) : DEFAULT_PACKAGE_VEHICLES[id].costPerDay,
        capacity:
          Number.isFinite(capacity) && capacity > 0
            ? Math.round(capacity)
            : DEFAULT_PACKAGE_VEHICLES[id].capacity,
      };
    }
  }
  const stays: NonNullable<Journey["packagePricing"]>["stays"] = {};
  for (const id of STAY_PREFERENCE_IDS) {
    const roomCost = Number(fd.get(`pkgStay_${id}_room`) || "");
    const mattress = Number(fd.get(`pkgStay_${id}_mattress`) || "");
    if (Number.isFinite(roomCost) || Number.isFinite(mattress)) {
      stays[id] = {
        roomCost:
          Number.isFinite(roomCost) && roomCost >= 0 ? Math.round(roomCost) : DEFAULT_PACKAGE_STAYS[id].roomCost,
        extraMattressPerPerson:
          Number.isFinite(mattress) && mattress >= 0
            ? Math.round(mattress)
            : DEFAULT_PACKAGE_STAYS[id].extraMattressPerPerson,
      };
    }
  }
  const activity = Number(fd.get("pkgActivityCost") || "");
  const tris = Number(fd.get("pkgTrisPercent") || "");
  const gst = Number(fd.get("pkgGstPercent") || "");
  return {
    vehicles: Object.keys(vehicles).length ? vehicles : undefined,
    stays: Object.keys(stays).length ? stays : undefined,
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
  const [row, setRow] = useState<Journey | null>(() => {
    if (isNew) return blank();
    return getStaticJourney(slugKey) ?? null;
  });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    const seeded = getStaticJourney(slugKey);
    let cancelled = false;

    fetchJourneyAdmin(slugKey)
      .then((j) => {
        if (cancelled) return;
        if (j?.name?.trim()) setRow(j);
        else if (seeded) setRow(seeded);
        else if (j) setRow(j);
        else setRow(blank());
      })
      .catch(() => {
        if (!cancelled) setRow(seeded ?? blank());
      });

    return () => {
      cancelled = true;
    };
  }, [isNew, slugKey]);

  if (!row) return <p className="text-sm text-[#5c6350]">Loading editor…</p>;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New journey" : row.name || "Edit journey"}
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/journeys")}>
            Back to list
          </AdminButton>
        }
      />
      <form
        key={row.slug}
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const nextSlug = isNew ? slugify(String(fd.get("name") || "")) || `journey-${Date.now()}` : row.slug;
          const itinerary = lines(String(fd.get("itinerary") || "")).map((line, i) => {
            const [title, ...rest] = line.split("—");
            return { day: i + 1, title: (title || `Day ${i + 1}`).trim(), summary: rest.join("—").trim() };
          });
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
            transportAvailable: fd.get("transportAvailable") === "on",
            transportPrice: Number(fd.get("transportPrice") || 0) || undefined,
            transportNote: String(fd.get("transportNote") || ""),
            transportVehicles: readTransportVehiclePrices(fd),
            season: String(fd.get("season")),
            overview: String(fd.get("overview")),
            image: String(fd.get("image")),
            gallery: lines(String(fd.get("gallery") || "")),
            highlights: lines(String(fd.get("highlights") || "")),
            experienceHighlights: lines(String(fd.get("experienceHighlights") || "")),
            notSuitableFor: lines(String(fd.get("notSuitableFor") || "")),
            stays: lines(String(fd.get("stays") || "")),
            inclusions: lines(String(fd.get("inclusions") || "")),
            exclusions: lines(String(fd.get("exclusions") || "")),
            packagePricing: readPackagePricing(fd, String(fd.get("type")) as Journey["type"]),
            nextDeparture: String(fd.get("nextDeparture") || ""),
            departures: String(fd.get("departures") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            departureSeats: parseDepartureSeats(String(fd.get("departureSeats") || "")),
            groupSize: String(fd.get("groupSize") || ""),
            itinerary,
            status: String(fd.get("status") || "active") as Journey["status"],
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
          const res = await saveDocument("journeys", nextSlug, next as unknown as Record<string, unknown>);
          setBusy(false);
          setNote(res.ok ? "Saved." : res.error ?? "Could not save.");
          if (res.ok && isNew) router.replace(`/admin/journeys/${nextSlug}`);
          else setRow(next);
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
            <Field label="Days">
              <input name="days" type="number" defaultValue={row.days} className={inputClass} />
            </Field>
            <Field label="Nights">
              <input name="nights" type="number" defaultValue={row.nights} className={inputClass} />
            </Field>
            <Field label="Price from (₹)">
              <input name="priceFrom" type="number" defaultValue={row.priceFrom} className={inputClass} />
            </Field>
            <Field label="Child price (₹)" hint="blank = 70% of adult">
              <input name="priceChild" type="number" min="0" defaultValue={row.priceChild ?? ""} className={inputClass} />
            </Field>
            <Field label="Price note">
              <input name="priceNote" defaultValue={row.priceNote ?? ""} className={inputClass} />
            </Field>
            <Field label="Season">
              <input name="season" defaultValue={row.season} className={inputClass} />
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
          <div className="mt-6 border-t border-[#e4dfd4] pt-5">
            <h3 className="font-display text-base text-[#2a2e1f]">Transportation</h3>
            <label className="mt-3 flex items-center gap-2 text-sm text-[#2a2e1f]">
              <input
                name="transportAvailable"
                type="checkbox"
                defaultChecked={row.transportAvailable !== false}
              />
              Offer transportation on the enquire form
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Base transport price (₹)" hint="Used when a vehicle rate below is blank">
                <input
                  name="transportPrice"
                  type="number"
                  min="0"
                  defaultValue={row.transportPrice ?? ""}
                  className={inputClass}
                />
              </Field>
              <Field label="Transport note">
                <input name="transportNote" defaultValue={row.transportNote ?? ""} className={inputClass} />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TRANSPORT_VEHICLE_IDS.map((id) => (
                <Field
                  key={id}
                  label={`${TRANSPORT_VEHICLE_META[id].label} (₹)`}
                  hint={TRANSPORT_VEHICLE_META[id].seats}
                >
                  <input
                    name={`transport${id.charAt(0).toUpperCase()}${id.slice(1)}`}
                    type="number"
                    min="0"
                    defaultValue={row.transportVehicles?.[id] ?? ""}
                    className={inputClass}
                    placeholder="Auto from base"
                  />
                </Field>
              ))}
            </div>
          </div>
          {row.type === "curated" && (
            <div className="mt-6 border-t border-[#e4dfd4] pt-5">
              <h3 className="font-display text-base text-[#2a2e1f]">Book now package costs (A–E)</h3>
              <p className="mt-1 text-sm text-[#5c6350]">
                A = vehicle/day × vehicles × days · B = stay cost × rooms + mattresses · C = guests × activity · D =
                TRIS % of (A+B+C) · E = GST % of D
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Field label="C · Activity cost per guest (₹)">
                  <input
                    name="pkgActivityCost"
                    type="number"
                    min="0"
                    defaultValue={row.packagePricing?.activityCostPerGuest ?? ""}
                    className={inputClass}
                    placeholder="Per guest for whole journey"
                  />
                </Field>
                <Field label="D · TRIS services %">
                  <input
                    name="pkgTrisPercent"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue={row.packagePricing?.trisServicePercent ?? DEFAULT_TRIS_SERVICE_PERCENT}
                    className={inputClass}
                  />
                </Field>
                <Field label="E · GST % of D">
                  <input
                    name="pkgGstPercent"
                    type="number"
                    min="0"
                    step="0.1"
                    defaultValue={row.packagePricing?.gstPercent ?? DEFAULT_PACKAGE_GST_PERCENT}
                    className={inputClass}
                  />
                </Field>
              </div>
              <h4 className="mt-5 text-sm font-semibold text-[#2a2e1f]">A · Vehicle rates (₹ / day) & capacity</h4>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {TRANSPORT_VEHICLE_IDS.map((id) => {
                  const rate = row.packagePricing?.vehicles?.[id] ?? DEFAULT_PACKAGE_VEHICLES[id];
                  return (
                    <div key={id} className="space-y-2 rounded-xl border border-[#e4dfd4] p-3">
                      <p className="text-sm font-medium text-[#2a2e1f]">{TRANSPORT_VEHICLE_META[id].label}</p>
                      <Field label="Cost / day">
                        <input
                          name={`pkgVehicle_${id}_cost`}
                          type="number"
                          min="0"
                          defaultValue={rate.costPerDay}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Capacity">
                        <input
                          name={`pkgVehicle_${id}_capacity`}
                          type="number"
                          min="1"
                          defaultValue={rate.capacity}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  );
                })}
              </div>
              <h4 className="mt-5 text-sm font-semibold text-[#2a2e1f]">B · Stay preference costs (₹ / journey)</h4>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STAY_PREFERENCE_IDS.map((id) => {
                  const rate = row.packagePricing?.stays?.[id] ?? DEFAULT_PACKAGE_STAYS[id];
                  return (
                    <div key={id} className="space-y-2 rounded-xl border border-[#e4dfd4] p-3">
                      <p className="text-sm font-medium text-[#2a2e1f]">{STAY_PREFERENCE_META[id].label}</p>
                      <Field label="Room cost">
                        <input
                          name={`pkgStay_${id}_room`}
                          type="number"
                          min="0"
                          defaultValue={rate.roomCost}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Extra mattress / person">
                        <input
                          name={`pkgStay_${id}_mattress`}
                          type="number"
                          min="0"
                          defaultValue={rate.extraMattressPerPerson}
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {row.type === "small-group" ? (
            <div className="mt-6 border-t border-[#e4dfd4] pt-5">
              <h3 className="font-display text-base text-[#2a2e1f]">Fixed departure calendar</h3>
              <p className="mt-1 text-sm text-[#5c6350]">
                Select multiple departure days on the calendar. Set seats, held, and booked for each date.
              </p>
              <div className="mt-4">
                <DepartureSeatsCalendar
                  key={`${row.slug}-${(row.departureSeats ?? []).map((d) => d.date).join(",")}`}
                  initial={row.departureSeats}
                />
              </div>
            </div>
          ) : null}
        </Panel>
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
              <textarea name="highlights" rows={6} defaultValue={row.highlights.join("\n")} className={inputClass} />
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
              <textarea name="stays" rows={6} defaultValue={row.stays.join("\n")} className={inputClass} />
            </Field>
            <Field label="Inclusions" hint="one per line">
              <textarea name="inclusions" rows={6} defaultValue={row.inclusions.join("\n")} className={inputClass} />
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
            <Field label="Itinerary" hint="one day per line: Title — summary">
              <textarea
                name="itinerary"
                rows={8}
                defaultValue={row.itinerary.map((d) => `${d.title} — ${d.summary}`).join("\n")}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>
        <Panel>
          <ImageField key={row.image} name="image" label="Cover image" defaultValue={row.image} />
          <div className="mt-4">
            <Field label="Gallery images" hint="one URL or path per line — shown in the detail carousel">
              <textarea
                name="gallery"
                rows={5}
                defaultValue={(row.gallery ?? []).join("\n")}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>
        {note && <Notice tone={note === "Saved." ? "ok" : "warn"}>{note}</Notice>}
        <AdminButton type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save journey"}
        </AdminButton>
      </form>
    </div>
  );
}
