"use client";

import { useEffect, useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import {
  AdminButton,
  Field,
  Notice,
  Panel,
  inputClass,
} from "@/components/admin/ui";
import type { CraftsPageCopy } from "@/data/artisans";
import { loadCraftsPage, saveCraftsPage } from "@/lib/admin/crafts";
import { cn } from "@/lib/utils";

type TextKey = Exclude<
  keyof CraftsPageCopy,
  "connectorNotes" | "specialPoints"
>;

export function PageTextTab() {
  const [copy, setCopy] = useState<CraftsPageCopy | null>(null);
  // Photo field keeps its own upload state, so bump this to remount it after a load.
  const [formKey, setFormKey] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCraftsPage()
      .then((next) => {
        if (cancelled) return;
        setCopy(next);
        setFormKey((k) => k + 1);
      })
      .catch(() => {
        if (!cancelled)
          setNote("Could not load the page text. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!copy)
    return (
      <p className="text-sm text-[#4a5a50]">{note || "Loading page text…"}</p>
    );

  const update = (patch: Partial<CraftsPageCopy>) =>
    setCopy((prev) => (prev ? { ...prev, ...patch } : prev));

  const text = (
    key: TextKey,
    label: string,
    opts: { rows?: number; hint?: string } = {},
  ) => (
    <Field label={label} hint={opts.hint}>
      {opts.rows ? (
        <textarea
          rows={opts.rows}
          value={copy[key]}
          onChange={(e) => update({ [key]: e.target.value })}
          className={cn(inputClass, "resize-y")}
        />
      ) : (
        <input
          value={copy[key]}
          onChange={(e) => update({ [key]: e.target.value })}
          className={inputClass}
        />
      )}
    </Field>
  );

  const save = async () => {
    setBusy(true);
    setNote("");
    const res = await saveCraftsPage(copy);
    setBusy(false);
    if (res.ok) {
      setCopy(res.copy);
      setNote("Saved — the makers pages update within a minute.");
    } else {
      setNote(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <Panel className="space-y-4">
        <h2 className="font-display text-xl text-[#26352b]">Coming soon page</h2>
        <p className="text-sm text-[#4a5a50]">
          Shown instead of the makers pages while “Coming soon” is on. It also uses the hero image and
          title below.
        </p>
        {text("comingSoonTitle", "Headline")}
        {text("comingSoonBody", "Message", { rows: 3 })}
      </Panel>

      <Panel className="space-y-4">
        <h2 className="font-display text-xl text-[#26352b]">Hero</h2>
        <ImageField
          key={`crafts-hero-${formKey}`}
          name="heroImage"
          label="Hero image"
          hint="Wide landscape photo behind the title — also used on the coming soon page."
          defaultValue={copy.heroImage}
          purpose="crafts"
          onChange={(url) => update({ heroImage: url })}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {text("heroTitle", "Title", { hint: "Also used in the breadcrumbs" })}
          {text("heroSubtitle", "Subtitle")}
        </div>
        {text("heroBody", "Intro paragraph", { rows: 3 })}
        {text("heroScript", "Handwritten lines", {
          rows: 4,
          hint: "One line per row — shown on the right of the hero",
        })}
      </Panel>

      <Panel className="space-y-4">
        <h2 className="font-display text-xl text-[#26352b]">Makers list</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {text("makersTitle", "Heading")}
          {text("makersSubtitle", "Subheading")}
        </div>
        {text("makersNote", "Note beside the heading", { rows: 2 })}
      </Panel>

      <Panel className="space-y-4">
        <h2 className="font-display text-xl text-[#26352b]">Connector strip</h2>
        {text("connectorTitle", "Title")}
        {text("connectorBody", "Text", { rows: 2 })}
        <div className="grid gap-4 md:grid-cols-3">
          {copy.connectorNotes.map((n, i) => (
            <div
              key={i}
              className="space-y-2 rounded-2xl border border-[#d5dbc8] p-3"
            >
              <p className="text-xs font-semibold text-[#4a5a50]">
                Note {i + 1} · {["Delivery", "Calendar", "Payment"][i]} icon
              </p>
              <input
                value={n.title}
                onChange={(e) =>
                  update({
                    connectorNotes: copy.connectorNotes.map((row, j) =>
                      j === i ? { ...row, title: e.target.value } : row,
                    ),
                  })
                }
                className={inputClass}
                placeholder="Title"
              />
              <input
                value={n.detail}
                onChange={(e) =>
                  update({
                    connectorNotes: copy.connectorNotes.map((row, j) =>
                      j === i ? { ...row, detail: e.target.value } : row,
                    ),
                  })
                }
                className={inputClass}
                placeholder="Small print"
              />
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="space-y-4">
        <h2 className="font-display text-xl text-[#26352b]">
          Maker profile pages
        </h2>
        {text("connectCaption", "Caption under “Connect with the Maker”")}
        <Field
          label="“What makes their work special?” points"
          hint="Shared by every maker profile"
        >
          <div className="grid gap-2 md:grid-cols-2">
            {copy.specialPoints.map((p, i) => (
              <input
                key={i}
                value={p}
                onChange={(e) =>
                  update({
                    specialPoints: copy.specialPoints.map((row, j) =>
                      j === i ? e.target.value : row,
                    ),
                  })
                }
                className={inputClass}
              />
            ))}
          </div>
        </Field>
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <AdminButton onClick={() => void save()} disabled={busy}>
          {busy ? "Saving…" : "Save page text"}
        </AdminButton>
        {note ? (
          <Notice tone={note.startsWith("Saved") ? "ok" : "warn"}>
            {note}
          </Notice>
        ) : null}
      </div>
    </div>
  );
}
