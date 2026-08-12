"use client";

import { useEffect, useState } from "react";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { PlatformSettings } from "@/lib/types";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchSettingsAdmin().then(setSettings);
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
    </div>
  );
}
