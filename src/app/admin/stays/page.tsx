"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_STAY_STYLES,
  hydrateStayStylesFromDefaults,
  mergeStayStyles,
  slugifyStayId,
  stayImages,
  type StayStyle,
} from "@/data/stay-styles";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { PlatformSettings } from "@/lib/types";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { GalleryField } from "@/components/admin/ImageField";
import { cn } from "@/lib/utils";

function blankStay(index: number): StayStyle {
  return {
    id: `stay-${Date.now().toString(36)}`,
    label: "",
    short: "",
    bestFor: "",
    think: "",
    expect: [],
    learnIntro: "",
    images: [],
    offerOnBooking: false,
    active: true,
    sortOrder: index + 1,
  };
}

export default function StaysAdminPage() {
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [stays, setStays] = useState<StayStyle[]>(DEFAULT_STAY_STYLES);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next = await fetchSettingsAdmin();
      if (cancelled) return;
      setSettings(next);
      const hydrated = hydrateStayStylesFromDefaults(next.stayStyles);
      setStays(hydrated);
      const storedEmpty = !next.stayStyles?.length;
      const storedShort =
        (next.stayStyles?.length ?? 0) > 0 &&
        (next.stayStyles?.length ?? 0) < DEFAULT_STAY_STYLES.length;
      if (storedEmpty || storedShort) {
        const res = await saveSettings({ ...next, stayStyles: hydrated });
        if (!cancelled && res.ok) {
          setSettings({ ...next, stayStyles: hydrated });
          setNote(
            storedEmpty
              ? "Loaded the TRIS stay catalogue into Studio (with photos). Edit anytime."
              : "Synced missing stay styles from the learn-more catalogue into Studio.",
          );
        }
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const updateRow = (id: string, partial: Partial<StayStyle>) => {
    setStays((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const next = { ...row, ...partial };
        return { ...next, images: stayImages(next) };
      }),
    );
  };

  const save = async () => {
    const cleaned = mergeStayStyles(
      stays.map((row, index) => ({
        ...row,
        id: row.id.trim() || slugifyStayId(row.label || `stay-${index + 1}`),
        label: row.label.trim() || "Stay style",
        sortOrder: index + 1,
      })),
    );
    if (!cleaned.length) {
      setNote("Keep at least one stay style.");
      return;
    }
    const ids = cleaned.map((s) => s.id);
    if (new Set(ids).size !== ids.length) {
      setNote("Each stay needs a unique id.");
      return;
    }
    setBusy(true);
    const next: PlatformSettings = { ...settings, stayStyles: cleaned };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setStays(cleaned);
      setNote("Stays saved. Book / craft / learn-more now use this catalogue.");
    } else {
      setNote(res.error ?? "Could not save.");
    }
  };

  const resetCatalogue = async () => {
    if (!confirm("Replace Studio stays with the full TRIS learn-more catalogue (including photos)?")) {
      return;
    }
    const seeded = DEFAULT_STAY_STYLES.map((s) => ({
      ...s,
      images: [...s.images],
      expect: [...s.expect],
    }));
    setBusy(true);
    const next: PlatformSettings = { ...settings, stayStyles: seeded };
    const res = await saveSettings(next);
    setBusy(false);
    if (res.ok) {
      setSettings(next);
      setStays(seeded);
      setOpenId(null);
      setNote("Reset to the TRIS stay catalogue.");
    } else {
      setNote(res.error ?? "Could not reset.");
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Stays"
        description="Same stay types guests see on Book now and Craft my journey — edit copy, what to expect, and multiple photos here."
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminButton variant="ghost" onClick={resetCatalogue} disabled={busy}>
              Load TRIS catalogue
            </AdminButton>
            <AdminButton onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save stays"}
            </AdminButton>
          </div>
        }
      />
      {note ? <Notice>{note}</Notice> : null}

      <div className="space-y-4">
        {stays.map((stay, index) => {
          const open = openId === stay.id;
          const images = stayImages(stay);
          return (
            <Panel key={stay.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  onClick={() => setOpenId(open ? null : stay.id)}
                >
                  <div className="flex shrink-0 gap-1">
                    {(images.length ? images.slice(0, 2) : [""]).map((url, i) => (
                      <div
                        key={`${stay.id}-thumb-${i}`}
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
                      {stay.label || `Stay ${index + 1}`}
                    </p>
                    <p className="text-xs text-[#4a5a50]">
                      {stay.active === false ? "Hidden · " : ""}
                      {stay.offerOnBooking ? "Book now · " : ""}
                      {images.length} photo{images.length === 1 ? "" : "s"} · id `{stay.id}`
                    </p>
                  </div>
                </button>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : stay.id)}
                    className="rounded-full border border-[#c5cbb8] px-3 py-1.5 text-xs font-semibold text-[#364037]"
                  >
                    {open ? "Collapse" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm(`Remove ${stay.label || "this stay"}?`)) return;
                      setStays((prev) => prev.filter((row) => row.id !== stay.id));
                      if (openId === stay.id) setOpenId(null);
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
                        value={stay.label}
                        onChange={(e) => updateRow(stay.id, { label: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Barefoot Stays"
                      />
                    </Field>
                    <Field label="Id" hint="Stable key on bookings — don’t change casually">
                      <input
                        value={stay.id}
                        onChange={(e) => {
                          const nextId = slugifyStayId(e.target.value);
                          setStays((prev) =>
                            prev.map((row) => (row.id === stay.id ? { ...row, id: nextId } : row)),
                          );
                          setOpenId(nextId);
                        }}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <Field label="Short description" hint="Used in pickers and cards">
                    <textarea
                      rows={2}
                      value={stay.short}
                      onChange={(e) => updateRow(stay.id, { short: e.target.value })}
                      className={cn(inputClass, "resize-y")}
                    />
                  </Field>
                  <Field label="Best for">
                    <input
                      value={stay.bestFor}
                      onChange={(e) => updateRow(stay.id, { bestFor: e.target.value })}
                      className={inputClass}
                      placeholder="Budget travellers · Families"
                    />
                  </Field>
                  <Field label="Guest quote / think" hint="Shown in italics in learn more">
                    <input
                      value={stay.think}
                      onChange={(e) => updateRow(stay.id, { think: e.target.value })}
                      className={inputClass}
                      placeholder="I want a good, authentic place…"
                    />
                  </Field>
                  <Field label="Learn-more intro">
                    <textarea
                      rows={3}
                      value={stay.learnIntro}
                      onChange={(e) => updateRow(stay.id, { learnIntro: e.target.value })}
                      className={cn(inputClass, "resize-y")}
                    />
                  </Field>
                  <Field label="What to expect" hint="One point per line">
                    <textarea
                      rows={5}
                      value={stay.expect.join("\n")}
                      onChange={(e) =>
                        updateRow(stay.id, {
                          expect: e.target.value
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean),
                        })
                      }
                      className={cn(inputClass, "resize-y")}
                    />
                  </Field>

                  <GalleryField
                    key={`stay-gallery-${stay.id}-${images.join("|")}`}
                    name={`stayGallery_${stay.id}`}
                    label="Photos"
                    hint="Add several images — guests see them in learn more and on the booking card."
                    defaultValue={images}
                    purpose="stays"
                    onChange={(urls) => updateRow(stay.id, { images: urls })}
                  />

                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm text-[#26352b]">
                      <input
                        type="checkbox"
                        checked={stay.active !== false}
                        onChange={(e) => updateRow(stay.id, { active: e.target.checked })}
                      />
                      Show to guests
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#26352b]">
                      <input
                        type="checkbox"
                        checked={stay.offerOnBooking === true}
                        onChange={(e) => updateRow(stay.id, { offerOnBooking: e.target.checked })}
                      />
                      Offer on curated Book now
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
          const row = blankStay(stays.length);
          setStays((prev) => [...prev, row]);
          setOpenId(row.id);
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b7c3a8] bg-[#f6f8f1] px-4 py-3 text-sm font-semibold text-[#364037]"
      >
        <Plus size={16} />
        Add stay style
      </button>

      <div className="mt-6 flex justify-end">
        <AdminButton onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save stays"}
        </AdminButton>
      </div>
    </div>
  );
}
