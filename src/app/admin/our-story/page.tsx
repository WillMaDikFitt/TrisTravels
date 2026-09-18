"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { ImageField } from "@/components/admin/ImageField";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { PlatformSettings } from "@/lib/types";
import {
  blankStoryMoment,
  DEFAULT_STORY_MOMENTS,
  normalizeStoryMoments,
  type StoryMoment,
} from "@/data/about-story";
import { cn } from "@/lib/utils";

export default function OurStoryAdminPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<StoryMoment[]>(() =>
    normalizeStoryMoments(null, DEFAULT_STORY_MOMENTS),
  );
  // Photo fields keep their own upload state, so bump this to remount them after a load, save or reset.
  const [formKey, setFormKey] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchSettingsAdmin()
      .then((next) => {
        if (cancelled) return;
        setSettings(next);
        setItems(normalizeStoryMoments(next.aboutStory, DEFAULT_STORY_MOMENTS));
        setFormKey((k) => k + 1);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (index: number, patch: Partial<StoryMoment>) =>
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const save = async () => {
    const cleaned = normalizeStoryMoments(items, []);
    if (!cleaned.length) {
      // An empty list falls back to the defaults, so hiding is done with the Published box instead.
      setNote("Keep at least one part with some text. To hide one, untick Published.");
      return;
    }
    setBusy(true);
    setNote("");
    const dropped = items.length - cleaned.length;
    const next: PlatformSettings = { ...settings, aboutStory: cleaned };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setItems(cleaned);
      setFormKey((k) => k + 1);
      setNote(
        `Story saved — the About page updates within a minute.${
          dropped ? ` ${dropped} empty ${dropped === 1 ? "part was" : "parts were"} left out.` : ""
        }`,
      );
    } else {
      setNote(res.error ?? "Could not save.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Our story"
        description="The photos and text on the About page — the “Read our story” page guests reach from the homepage."
        actions={
          <AdminButton onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Save story"}
          </AdminButton>
        }
      />

      {note ? (
        <div className="mb-4">
          <Notice>{note}</Notice>
        </div>
      ) : null}

      <Panel>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#4a5a50]">
            Public page:{" "}
            <Link href="/about" className="font-semibold text-[#364037] underline" target="_blank">
              /about
            </Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => {
                if (!confirm("Replace the story with the default text and photos?")) return;
                setItems(DEFAULT_STORY_MOMENTS.map((row) => ({ ...row })));
                setFormKey((k) => k + 1);
              }}
            >
              Reset to defaults
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => setItems((prev) => [...prev, blankStoryMoment(prev.length)])}
            >
              <Plus size={14} className="mr-1 inline" />
              Add part
            </AdminButton>
          </div>
        </div>

        <p className="mb-4 text-sm text-[#4a5a50]">
          Each part is one photo and its text. Photos alternate left and right down the page.
        </p>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`${formKey}-${item.id}`}
              className="rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-[#4a5a50] uppercase">
                  Part {index + 1} · photo on the {index % 2 === 1 ? "right" : "left"}
                </p>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#364037]">
                    <input
                      type="checkbox"
                      checked={item.active !== false}
                      onChange={(e) => update(index, { active: e.target.checked })}
                    />
                    Published
                  </label>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 size={14} />
                  </AdminButton>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Field
                    label="Opening line"
                    hint="Larger italic line above the paragraph — leave empty to start with the paragraph"
                  >
                    <textarea
                      rows={2}
                      value={item.lead}
                      onChange={(e) => update(index, { lead: e.target.value })}
                      className={inputClass}
                      placeholder="e.g. Born in Mairang, Mei-ieid embodied true Khasi hospitality…"
                    />
                  </Field>
                  <Field label="Paragraph">
                    <textarea
                      rows={3}
                      value={item.body}
                      onChange={(e) => update(index, { body: e.target.value })}
                      className={inputClass}
                      placeholder="The rest of this part of the story"
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                    <Field
                      label="Photo description"
                      hint="Describes the photo for screen readers and search engines"
                    >
                      <input
                        value={item.alt}
                        onChange={(e) => update(index, { alt: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Hospitality by the fire in Meghalaya"
                      />
                    </Field>
                    <Field label="Sort order">
                      <input
                        type="number"
                        value={item.sortOrder ?? index + 1}
                        onChange={(e) =>
                          update(index, { sortOrder: Math.round(Number(e.target.value) || index + 1) })
                        }
                        className={cn(inputClass)}
                      />
                    </Field>
                  </div>
                </div>
                <ImageField
                  name={`story-image-${item.id}`}
                  label="Photo"
                  hint="Wide photos work best. Leave empty to run the text full width."
                  defaultValue={item.image}
                  purpose="about-story"
                  onChange={(url) => update(index, { image: url })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <AdminButton onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Save story"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setItems((prev) => [...prev, blankStoryMoment(prev.length)])}
          >
            Add part
          </AdminButton>
        </div>
      </Panel>
    </div>
  );
}
