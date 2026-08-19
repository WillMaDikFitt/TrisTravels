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
import type { PlatformSettings } from "@/lib/types";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [demoNote, setDemoNote] = useState("");
  const [demoSeeded, setDemoSeeded] = useState(false);

  useEffect(() => {
    fetchSettingsAdmin().then(setSettings);
    getStudioDemoStatus().then((status) => setDemoSeeded(status.seeded));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="How far ahead guests can book online, how long a hold lasts, and fee maths for staff. Guests only ever see the total."
      />
      <form
        key={`${settings.minAdvanceDays}-${settings.holdMinutes}-${settings.serviceFeePercent}-${settings.gstPercent}`}
        className="max-w-xl space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const next: PlatformSettings = {
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

      <Panel className="mt-8 max-w-xl space-y-4">
        <div>
          <h2 className="font-display text-lg text-[#2a2e1f]">Sample Studio data</h2>
          <p className="mt-1 text-sm text-[#5c6350]">
            Load realistic bookings, enquiries, closures, and travellers so you can review every Studio
            screen. Marked as demo and safe to clear later.
          </p>
        </div>
        <p className="text-xs font-semibold tracking-wider text-[#6b734f] uppercase">
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
