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
  blankTestimonial,
  DEFAULT_TESTIMONIALS,
  normalizeTestimonials,
  type Testimonial,
} from "@/data/testimonials";
import { cn } from "@/lib/utils";

export default function TestimonialsAdminPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [items, setItems] = useState<Testimonial[]>(() => normalizeTestimonials(null, DEFAULT_TESTIMONIALS));
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
        setItems(normalizeTestimonials(next.homeTestimonials, DEFAULT_TESTIMONIALS));
        setFormKey((k) => k + 1);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (index: number, patch: Partial<Testimonial>) =>
    setItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const save = async () => {
    const cleaned = normalizeTestimonials(items, []);
    if (!cleaned.length) {
      // An empty list falls back to the defaults, so hiding is done with the Published box instead.
      setNote("Keep at least one testimonial with a quote and a name. To hide them, untick Published.");
      return;
    }
    setBusy(true);
    setNote("");
    const dropped = items.length - cleaned.length;
    const next: PlatformSettings = { ...settings, homeTestimonials: cleaned };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setItems(cleaned);
      setFormKey((k) => k + 1);
      setNote(
        `Testimonials saved — the homepage updates within a minute.${
          dropped ? ` ${dropped} without a quote or name ${dropped === 1 ? "was" : "were"} left out.` : ""
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
        title="Testimonials"
        description="Traveller quotes in the “From our travellers” carousel of the homepage’s Why TRIS section."
        actions={
          <AdminButton onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Save testimonials"}
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
            <Link href="/" className="font-semibold text-[#364037] underline" target="_blank">
              Homepage · Why TRIS
            </Link>
          </p>
          <div className="flex flex-wrap gap-2">
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => {
                if (!confirm("Replace this list with the default testimonials?")) return;
                setItems(DEFAULT_TESTIMONIALS.map((row) => ({ ...row })));
                setFormKey((k) => k + 1);
              }}
            >
              Reset to defaults
            </AdminButton>
            <AdminButton
              type="button"
              variant="ghost"
              onClick={() => setItems((prev) => [...prev, blankTestimonial(prev.length)])}
            >
              <Plus size={14} className="mr-1 inline" />
              Add testimonial
            </AdminButton>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={`${formKey}-${item.id}`}
              className="rounded-2xl border border-[#d5dbc8] bg-[#fbfcf8] p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-[#4a5a50] uppercase">
                  Testimonial {index + 1}
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
                  <Field label="Quote" hint="About 2–3 lines — longer quotes are cut off on the card">
                    <textarea
                      rows={3}
                      value={item.quote}
                      onChange={(e) => update(index, { quote: e.target.value })}
                      className={inputClass}
                      placeholder="What the traveller said"
                    />
                  </Field>
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_8rem]">
                    <Field label="Name">
                      <input
                        value={item.name}
                        onChange={(e) => update(index, { name: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Rahul Mehta"
                      />
                    </Field>
                    <Field label="Place">
                      <input
                        value={item.place}
                        onChange={(e) => update(index, { place: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Bangalore"
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
                  name={`testimonial-image-${item.id}`}
                  label="Photo"
                  hint="Square photos work best. Leave empty to show initials."
                  defaultValue={item.image}
                  purpose="testimonials"
                  onChange={(url) => update(index, { image: url })}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <AdminButton onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : "Save testimonials"}
          </AdminButton>
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setItems((prev) => [...prev, blankTestimonial(prev.length)])}
          >
            Add testimonial
          </AdminButton>
        </div>
      </Panel>
    </div>
  );
}
