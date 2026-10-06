"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ImageField } from "@/components/admin/ImageField";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import {
  blankCraftProduct,
  craftCategories,
  type CraftCategory,
  type CraftProduct,
} from "@/data/artisans";
import { loadCraftProducts, saveCraftProducts } from "@/lib/admin/crafts";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

export default function CraftEditorPage() {
  const params = useParams<{ slug: string }>();
  const slugKey = decodeURIComponent(String(params.slug ?? ""));
  const isNew = slugKey === "new";
  const router = useRouter();

  const [all, setAll] = useState<CraftProduct[] | null>(null);
  const [craft, setCraft] = useState<CraftProduct | null>(null);
  // Photo field keeps its own upload state, so bump this to remount it after a load.
  const [formKey, setFormKey] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadCraftProducts()
      .then((list) => {
        if (cancelled) return;
        setAll(list);
        setCraft(isNew ? blankCraftProduct(list.length) : (list.find((c) => c.slug === slugKey) ?? null));
        setFormKey((k) => k + 1);
      })
      .catch(() => {
        if (!cancelled) setNote("Could not load crafts. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [isNew, slugKey]);

  const update = (patch: Partial<CraftProduct>) =>
    setCraft((prev) => (prev ? { ...prev, ...patch } : prev));

  const back = (
    <AdminButton variant="ghost" onClick={() => router.push("/admin/crafts")}>
      Back to crafts
    </AdminButton>
  );

  if (!all) {
    return <p className="text-sm text-[#4a5a50]">{note || "Loading craft…"}</p>;
  }

  if (!craft) {
    return (
      <div>
        <PageHeader eyebrow="Catalogue" title="Craft" actions={back} />
        <p className="text-sm text-[#4a5a50]">This craft no longer exists — it may have been removed.</p>
      </div>
    );
  }

  const save = async () => {
    const name = craft.name.trim();
    if (!name) {
      setNote("Add a name first.");
      return;
    }
    const others = all.filter((c) => isNew || c.slug !== slugKey);
    // New crafts get a slug from the name; existing ones keep theirs so contact links stay valid.
    let slug = craft.slug;
    if (isNew) {
      const base = slugify(name) || "craft";
      slug = base;
      for (let n = 2; others.some((c) => c.slug === slug); n++) slug = `${base}-${n}`;
    }
    const saved: CraftProduct = { ...craft, name, slug };
    const nextList = isNew ? [...all, saved] : all.map((c) => (c.slug === slugKey ? saved : c));

    setBusy(true);
    setNote("");
    const res = await saveCraftProducts(nextList);
    setBusy(false);
    if (!res.ok) {
      setNote(res.error);
      return;
    }
    const done = `Saved ${name} — the Artisan’s Hub page updates within a minute.${
      saved.active !== false && !saved.image ? " Add a photo to show it on the site." : ""
    }`;
    router.push(`/admin/crafts?${new URLSearchParams({ note: done })}`);
  };

  const remove = async () => {
    if (all.length <= 1) {
      setNote("Keep at least one craft. To hide this one, untick “Show on site” and save.");
      return;
    }
    if (!confirm(`Remove ${craft.name}? It disappears from the site right away.`)) return;
    setBusy(true);
    const res = await saveCraftProducts(all.filter((c) => c.slug !== slugKey));
    setBusy(false);
    if (res.ok) {
      router.push(`/admin/crafts?${new URLSearchParams({ note: `${craft.name} removed.` })}`);
    } else {
      setNote(res.error);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New craft" : craft.name || "Edit craft"}
        description="Shown as a card on the Artisan’s Hub page."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/artisans" target="_blank">
              <AdminButton variant="ghost">View page</AdminButton>
            </Link>
            {back}
          </div>
        }
      />

      <Panel className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input
              value={craft.name}
              onChange={(e) => update({ name: e.target.value })}
              className={inputClass}
              placeholder="e.g. Besli: Local flute of Meghalaya"
            />
          </Field>
          <Field label="Category">
            <select
              value={craft.category}
              onChange={(e) => update({ category: e.target.value as CraftCategory })}
              className={inputClass}
            >
              {craftCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Maker note" hint="Small line under the category, e.g. “Crochet artisans”">
            <input
              value={craft.makerNote ?? ""}
              onChange={(e) => update({ makerNote: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Sort order" hint="Lower numbers show first">
            <input
              type="number"
              value={craft.sortOrder ?? ""}
              onChange={(e) => update({ sortOrder: Math.round(Number(e.target.value) || 0) })}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Short description" hint="About two lines — longer text is cut off on the card">
          <textarea
            rows={3}
            value={craft.blurb}
            onChange={(e) => update({ blurb: e.target.value })}
            className={cn(inputClass, "resize-y")}
          />
        </Field>
        <ImageField
          key={`craft-image-${formKey}`}
          name="image"
          label="Photo"
          hint="Landscape (4:3) works best. Crafts without a photo are not shown on the site."
          defaultValue={craft.image}
          purpose="crafts"
          onChange={(url) => update({ image: url })}
        />
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-[#26352b]">
            <input
              type="checkbox"
              checked={craft.active !== false}
              onChange={(e) => update({ active: e.target.checked })}
            />
            Show on site
          </label>
          <label className="flex items-center gap-2 text-sm text-[#26352b]">
            <input
              type="checkbox"
              checked={craft.bestSeller === true}
              onChange={(e) => update({ bestSeller: e.target.checked })}
            />
            Featured
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <AdminButton onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : isNew ? "Add craft" : "Save craft"}
          </AdminButton>
          {!isNew ? (
            <AdminButton variant="ghost" onClick={() => void remove()} disabled={busy}>
              Remove
            </AdminButton>
          ) : null}
        </div>
      </Panel>

      {note ? (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") ? "ok" : "warn"}>{note}</Notice>
        </div>
      ) : null}
    </div>
  );
}
