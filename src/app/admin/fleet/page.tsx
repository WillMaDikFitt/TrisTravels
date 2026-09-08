"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_FLEET_VEHICLES,
  hydrateFleetFromDefaults,
  mergeFleetVehicles,
  slugifyVehicleId,
  vehicleImages,
  type FleetVehicle,
} from "@/data/transport";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { PlatformSettings } from "@/lib/types";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { GalleryField } from "@/components/admin/ImageField";
import { cn } from "@/lib/utils";

function blankVehicle(index: number): FleetVehicle {
  return {
    id: `vehicle-${Date.now().toString(36)}`,
    label: "",
    maxGuests: 4,
    seats: "Up to 4 travellers",
    idealFor: "",
    luggage: "",
    summary: "",
    ac: "Yes",
    bestFor: "",
    goodToKnow: "",
    examples: "",
    images: [],
    defaultPrice: undefined,
    multiplier: 1,
    offerOnTransfers: true,
    active: true,
    sortOrder: index + 1,
  };
}

export default function FleetAdminPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [fleet, setFleet] = useState<FleetVehicle[]>(DEFAULT_FLEET_VEHICLES);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await fetchSettingsAdmin();
      if (cancelled) return;
      setSettings(next);
      const hydrated = hydrateFleetFromDefaults(next.fleetVehicles);
      setFleet(hydrated);
      const storedEmpty = !next.fleetVehicles?.length;
      const storedShort =
        (next.fleetVehicles?.length ?? 0) > 0 &&
        (next.fleetVehicles?.length ?? 0) < DEFAULT_FLEET_VEHICLES.length;
      if (storedEmpty || storedShort) {
        const res = await saveSettings({ ...next, fleetVehicles: hydrated });
        if (!cancelled && res.ok) {
          setSettings({ ...next, fleetVehicles: hydrated });
          setNote(
            storedEmpty
              ? "Loaded the TRIS transportation catalogue into Studio (with photos). Edit anytime."
              : "Synced missing vehicles from the learn-more catalogue into Studio.",
          );
        }
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const updateRow = (id: string, partial: Partial<FleetVehicle>) => {
    setFleet((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...partial };
        const images = vehicleImages(next);
        return { ...next, images, image: images[0] };
      }),
    );
  };

  const save = async () => {
    const cleaned = mergeFleetVehicles(
      fleet.map((row, index) => ({
        ...row,
        id: row.id.trim() || slugifyVehicleId(row.label || `vehicle-${index + 1}`),
        label: row.label.trim() || "Vehicle",
        sortOrder: index + 1,
      })),
    );
    if (!cleaned.length) {
      setNote("Keep at least one vehicle, or guests won’t see transport options.");
      return;
    }
    const ids = cleaned.map((v) => v.id);
    if (new Set(ids).size !== ids.length) {
      setNote("Each vehicle needs a unique id.");
      return;
    }
    setBusy(true);
    const next: PlatformSettings = { ...settings, fleetVehicles: cleaned };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setFleet(cleaned);
      setNote("Vehicles saved. Book / enquire / learn-more now use this catalogue.");
    } else {
      setNote(res.error ?? "Could not save.");
    }
  };

  const resetCatalogue = async () => {
    if (!confirm("Replace Studio vehicles with the full TRIS learn-more catalogue (including photos)?")) {
      return;
    }
    const seeded = DEFAULT_FLEET_VEHICLES.map((v) => ({ ...v, images: [...v.images] }));
    setBusy(true);
    const next: PlatformSettings = { ...settings, fleetVehicles: seeded };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setFleet(seeded);
      setOpenId(null);
      setNote("Reset to the TRIS transportation catalogue.");
    } else {
      setNote(res.error ?? "Could not reset.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Vehicles"
        description="Same transportation types guests see on Book now and Craft my journey — edit copy, capacity, and multiple photos here."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="ghost" onClick={resetCatalogue} disabled={busy}>
              Load TRIS catalogue
            </AdminButton>
            <AdminButton onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save vehicles"}
            </AdminButton>
          </div>
        }
      />
      {note ? <Notice>{note}</Notice> : null}

      <div className="space-y-4">
        {fleet.map((vehicle, index) => {
          const open = openId === vehicle.id;
          const images = vehicleImages(vehicle);
          return (
            <Panel key={vehicle.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setOpenId(open ? null : vehicle.id)}
                >
                  <div className="flex shrink-0 gap-1">
                    {(images.length ? images.slice(0, 2) : [""]).map((url, i) => (
                      <div
                        key={`${vehicle.id}-thumb-${i}`}
                        className="h-14 w-16 overflow-hidden rounded-xl bg-[#eef1e6]"
                      >
                        {url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full place-items-center text-[9px] font-semibold text-[#8a9a8c] uppercase">
                            No photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg text-[#26352b]">
                      {vehicle.label || `Vehicle ${index + 1}`}
                      <span className="ml-2 text-sm font-normal text-[#4a5a50]">
                        · Max {vehicle.maxGuests}
                      </span>
                    </p>
                    <p className="text-xs text-[#4a5a50]">
                      {vehicle.active === false ? "Hidden · " : ""}
                      {images.length} photo{images.length === 1 ? "" : "s"} · id `{vehicle.id}`
                    </p>
                  </div>
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : vehicle.id)}
                    className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#364037]"
                  >
                    {open ? "Collapse" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Remove ${vehicle.label || "this vehicle"}?`)) return;
                      setFleet((prev) => prev.filter((row) => row.id !== vehicle.id));
                      if (openId === vehicle.id) setOpenId(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#c96a3d]"
                  >
                    <Trash2 size={12} />
                    Remove
                  </button>
                </div>
              </div>

              {open ? (
                <div className="space-y-4 border-t border-[#c5cbb8] pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Name">
                      <input
                        value={vehicle.label}
                        onChange={(e) => updateRow(vehicle.id, { label: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Innova"
                      />
                    </Field>
                    <Field label="Id" hint="Stable key on bookings — don’t change casually">
                      <input
                        value={vehicle.id}
                        onChange={(e) => {
                          const nextId = slugifyVehicleId(e.target.value);
                          setFleet((prev) =>
                            prev.map((row) => (row.id === vehicle.id ? { ...row, id: nextId } : row)),
                          );
                          setOpenId(nextId);
                        }}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Max guests">
                      <input
                        type="number"
                        min={1}
                        value={vehicle.maxGuests}
                        onChange={(e) => {
                          const maxGuests = Math.max(1, Number(e.target.value) || 1);
                          updateRow(vehicle.id, {
                            maxGuests,
                            seats: `Up to ${maxGuests} travellers`,
                          });
                        }}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Ideal for">
                      <input
                        value={vehicle.idealFor}
                        onChange={(e) => updateRow(vehicle.id, { idealFor: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Luggage">
                      <input
                        value={vehicle.luggage}
                        onChange={(e) => updateRow(vehicle.id, { luggage: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="AC">
                      <input
                        value={vehicle.ac}
                        onChange={(e) => updateRow(vehicle.id, { ac: e.target.value })}
                        className={inputClass}
                        placeholder="Yes"
                      />
                    </Field>
                    <Field label="Windows (optional)">
                      <input
                        value={vehicle.windows ?? ""}
                        onChange={(e) => updateRow(vehicle.id, { windows: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Non-opening"
                      />
                    </Field>
                    <Field label="Default transfer price (₹)" hint="For experience enquire/book">
                      <input
                        type="number"
                        min={0}
                        value={vehicle.defaultPrice ?? ""}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          updateRow(vehicle.id, {
                            defaultPrice: e.target.value && Number.isFinite(n) ? Math.round(n) : undefined,
                          });
                        }}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Summary">
                    <textarea
                      rows={3}
                      value={vehicle.summary}
                      onChange={(e) => updateRow(vehicle.id, { summary: e.target.value })}
                      className={cn(inputClass, "resize-y")}
                    />
                  </Field>
                  <Field label="Best for">
                    <input
                      value={vehicle.bestFor}
                      onChange={(e) => updateRow(vehicle.id, { bestFor: e.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Good to know">
                    <textarea
                      rows={2}
                      value={vehicle.goodToKnow}
                      onChange={(e) => updateRow(vehicle.id, { goodToKnow: e.target.value })}
                      className={cn(inputClass, "resize-y")}
                    />
                  </Field>
                  <Field label="Examples (optional)">
                    <input
                      value={vehicle.examples ?? ""}
                      onChange={(e) => updateRow(vehicle.id, { examples: e.target.value })}
                      className={inputClass}
                      placeholder="Maruti Dzire, Honda City…"
                    />
                  </Field>

                  <GalleryField
                    key={`fleet-gallery-${vehicle.id}-${images.join("|")}`}
                    name={`fleetGallery_${vehicle.id}`}
                    label="Photos"
                    hint="Add several images — guests see them in learn more and on the booking card."
                    defaultValue={images}
                    purpose="fleet"
                    onChange={(urls) => updateRow(vehicle.id, { images: urls, image: urls[0] })}
                  />

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-[#26352b]">
                      <input
                        type="checkbox"
                        checked={vehicle.active !== false}
                        onChange={(e) => updateRow(vehicle.id, { active: e.target.checked })}
                      />
                      Show to guests
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#26352b]">
                      <input
                        type="checkbox"
                        checked={vehicle.offerOnTransfers !== false}
                        onChange={(e) => updateRow(vehicle.id, { offerOnTransfers: e.target.checked })}
                      />
                      Offer on experience / enquire transfers
                    </label>
                  </div>
                </div>
              ) : null}
            </Panel>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          const row = blankVehicle(fleet.length);
          setFleet((prev) => [...prev, row]);
          setOpenId(row.id);
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b7c3a8] bg-[#f6f8f1] px-4 py-3 text-sm font-semibold text-[#364037]"
      >
        <Plus size={16} />
        Add vehicle
      </button>

      <div className="mt-6 flex justify-end">
        <AdminButton onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save vehicles"}
        </AdminButton>
      </div>
    </div>
  );
}
