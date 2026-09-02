"use client";

import { useEffect, useState } from "react";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import {
  clearStudioDemo,
  getStudioDemoStatus,
  seedStudioDemo,
} from "@/lib/actions/studio-demo";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { ImpactStat, PlatformSettings } from "@/lib/types";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [impact, setImpact] = useState<ImpactStat[]>(DEFAULT_SETTINGS.impact);
  const [note, setNote] = useState("");
  const [impactNote, setImpactNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [impactBusy, setImpactBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoNote, setDemoNote] = useState("");
  const [demoSeeded, setDemoSeeded] = useState(false);

  useEffect(() => {
    fetchSettingsAdmin().then((next) => {
      setSettings(next);
      setImpact(next.impact?.length ? next.impact : DEFAULT_SETTINGS.impact);
    });
    getStudioDemoStatus().then((status) => setDemoSeeded(status.seeded));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Booking rules, fee maths, and About-page impact numbers you can update anytime."
      />
      <form
        key={`${settings.minAdvanceDays}-${settings.holdMinutes}-${settings.serviceFeePercent}-${settings.gstPercent}`}
        className="max-w-xl space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const next: PlatformSettings = {
            ...settings,
            impact,
            discountCodes: settings.discountCodes ?? [],
            minAdvanceDays: Number(fd.get("minAdvanceDays")),
            holdMinutes: Number(fd.get("holdMinutes")),
            serviceFeePercent: Number(fd.get("serviceFeePercent")),
            gstPercent: Number(fd.get("gstPercent")),
          };
          setBusy(true);
          const res = await saveSettings(next);
          setBusy(false);
          if (res.ok) {
            setSettings(next);
            setNote("Settings saved.");
          } else {
            setNote(res.error ?? "Could not save.");
          }
        }}
      >
        <Panel className="space-y-4">
          <Field
            label="Minimum days ahead for online booking"
            hint="Closer dates become a request for the team"
          >
            <input
              name="minAdvanceDays"
              type="number"
              defaultValue={settings.minAdvanceDays}
              className={inputClass}
            />
          </Field>
          <Field label="Hold duration (minutes)" hint="Unpaid holds expire after this">
            <input
              name="holdMinutes"
              type="number"
              defaultValue={settings.holdMinutes}
              className={inputClass}
            />
          </Field>
          <Field label="Service fee %" hint="Staff only — not shown to guests">
            <input
              name="serviceFeePercent"
              type="number"
              step="0.1"
              defaultValue={settings.serviceFeePercent}
              className={inputClass}
            />
          </Field>
          <Field label="GST % on fee" hint="Staff only — folded into guest total">
            <input
              name="gstPercent"
              type="number"
              step="0.1"
              defaultValue={settings.gstPercent}
              className={inputClass}
            />
          </Field>
        </Panel>
        {note && <Notice tone={note.includes("saved") ? "ok" : "warn"}>{note}</Notice>}
        <AdminButton type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </AdminButton>
      </form>

      <Panel className="mt-10 max-w-3xl space-y-5">
        <div>
          <h2 className="font-display text-lg text-[#26352b]">Discount codes</h2>
          <p className="mt-1 text-sm text-[#4a5a50]">
            Percent-off codes for curated Book Now (and shown when guests enter a code). Leave inactive to
            pause without deleting.
          </p>
        </div>
        <div className="space-y-3">
          {(settings.discountCodes ?? []).map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-xl border border-[#c5cbb8] bg-white p-4 sm:grid-cols-4"
            >
              <Field label="Code">
                <input
                  className={inputClass}
                  value={row.code}
                  onChange={(e) => {
                    const next = [...(settings.discountCodes ?? [])];
                    next[index] = { ...row, code: e.target.value.toUpperCase() };
                    setSettings({ ...settings, discountCodes: next });
                  }}
                />
              </Field>
              <Field label="Percent off">
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={100}
                  value={row.percent}
                  onChange={(e) => {
                    const next = [...(settings.discountCodes ?? [])];
                    next[index] = { ...row, percent: Number(e.target.value) || 0 };
                    setSettings({ ...settings, discountCodes: next });
                  }}
                />
              </Field>
              <Field label="Note">
                <input
                  className={inputClass}
                  value={row.note ?? ""}
                  onChange={(e) => {
                    const next = [...(settings.discountCodes ?? [])];
                    next[index] = { ...row, note: e.target.value };
                    setSettings({ ...settings, discountCodes: next });
                  }}
                />
              </Field>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-[#26352b]">
                  <input
                    type="checkbox"
                    checked={row.active}
                    onChange={(e) => {
                      const next = [...(settings.discountCodes ?? [])];
                      next[index] = { ...row, active: e.target.checked };
                      setSettings({ ...settings, discountCodes: next });
                    }}
                  />
                  Active
                </label>
                <AdminButton
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const next = (settings.discountCodes ?? []).filter((_, i) => i !== index);
                    setSettings({ ...settings, discountCodes: next });
                  }}
                >
                  Remove
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => {
              const next = [
                ...(settings.discountCodes ?? []),
                {
                  id: `disc_${Date.now()}`,
                  code: "",
                  percent: 10,
                  active: true,
                  note: "",
                },
              ];
              setSettings({ ...settings, discountCodes: next });
            }}
          >
            Add code
          </AdminButton>
          <AdminButton
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const res = await saveSettings({
                ...settings,
                impact,
                discountCodes: (settings.discountCodes ?? []).filter((d) => d.code.trim()),
              });
              setBusy(false);
              setNote(res.ok ? "Discount codes saved." : res.error ?? "Could not save.");
              if (res.ok) {
                setSettings({
                  ...settings,
                  discountCodes: (settings.discountCodes ?? []).filter((d) => d.code.trim()),
                });
              }
            }}
          >
            Save discount codes
          </AdminButton>
        </div>
      </Panel>

      <Panel className="mt-10 max-w-3xl space-y-5">
        <div>
          <h2 className="font-display text-lg text-[#26352b]">About — Our Impact</h2>
          <p className="mt-1 text-sm text-[#4a5a50]">
            Numbers and labels on the About page. Update these as partnerships and travellers grow.
          </p>
        </div>
        <div className="space-y-4">
          {impact.map((stat, index) => (
            <div
              key={stat.id}
              className="grid gap-3 rounded-xl border border-[#c5cbb8] bg-white p-4 sm:grid-cols-2"
            >
              <Field label="Value">
                <input
                  className={inputClass}
                  value={stat.value}
                  onChange={(e) => {
                    const next = [...impact];
                    next[index] = { ...stat, value: e.target.value };
                    setImpact(next);
                  }}
                />
              </Field>
              <Field label="Label">
                <input
                  className={inputClass}
                  value={stat.label}
                  onChange={(e) => {
                    const next = [...impact];
                    next[index] = { ...stat, label: e.target.value };
                    setImpact(next);
                  }}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    className={`${inputClass} min-h-[4.5rem]`}
                    value={stat.description}
                    onChange={(e) => {
                      const next = [...impact];
                      next[index] = { ...stat, description: e.target.value };
                      setImpact(next);
                    }}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
        {impactNote && (
          <Notice tone={impactNote.includes("saved") ? "ok" : "warn"}>{impactNote}</Notice>
        )}
        <AdminButton
          type="button"
          disabled={impactBusy}
          onClick={async () => {
            setImpactBusy(true);
            const next: PlatformSettings = { ...settings, impact };
            const res = await saveSettings(next);
            setImpactBusy(false);
            if (res.ok) {
              setSettings(next);
              setImpactNote("Impact numbers saved.");
            } else {
              setImpactNote(res.error ?? "Could not save impact.");
            }
          }}
        >
          {impactBusy ? "Saving…" : "Save impact numbers"}
        </AdminButton>
      </Panel>

      <Panel className="mt-8 max-w-xl space-y-4">
        <div>
          <h2 className="font-display text-lg text-[#26352b]">Sample Studio data</h2>
          <p className="mt-1 text-sm text-[#4a5a50]">
            Load realistic bookings, enquiries, closures, and travellers so you can review every Studio
            screen. Marked as demo and safe to clear later.
          </p>
        </div>
        <p className="text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">
          Status · {demoSeeded ? "Sample data loaded" : "No sample data"}
        </p>
        <div className="flex flex-wrap gap-2">
          <AdminButton
            type="button"
            disabled={demoBusy}
            onClick={async () => {
              setDemoBusy(true);
              setDemoNote("");
              const res = await seedStudioDemo();
              setDemoBusy(false);
              if (res.ok) {
                setDemoSeeded(true);
                setDemoNote(
                  `Loaded ${res.counts.bookings} bookings, ${res.counts.enquiries} enquiries, ${res.counts.closures} closures, ${res.counts.users} travellers.`,
                );
              } else {
                setDemoNote("Could not load sample data.");
              }
            }}
          >
            {demoBusy ? "Working…" : "Load sample data"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            disabled={demoBusy || !demoSeeded}
            onClick={async () => {
              setDemoBusy(true);
              setDemoNote("");
              const res = await clearStudioDemo();
              setDemoBusy(false);
              if (res.ok) {
                setDemoSeeded(false);
                setDemoNote("Sample data cleared.");
              } else {
                setDemoNote("Could not clear sample data.");
              }
            }}
          >
            Clear sample data
          </AdminButton>
        </div>
        {demoNote && <Notice tone={demoNote.includes("Could not") ? "warn" : "ok"}>{demoNote}</Notice>}
      </Panel>
    </div>
  );
}
