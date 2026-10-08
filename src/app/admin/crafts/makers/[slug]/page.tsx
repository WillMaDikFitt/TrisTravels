"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { GalleryField, ImageField } from "@/components/admin/ImageField";
import {
  AdminButton,
  Field,
  Notice,
  PageHeader,
  Panel,
  inputClass,
} from "@/components/admin/ui";
import {
  blankCraftMaker,
  craftCategories,
  makerCategoryLabels,
  type CraftCategory,
  type CraftMaker,
  type CraftProduct,
} from "@/data/artisans";
import {
  loadCraftMakers,
  loadCraftProducts,
  saveCraftMakers,
} from "@/lib/admin/crafts";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

const listHref = (note?: string) =>
  `/admin/crafts?${new URLSearchParams(note ? { tab: "makers", note } : { tab: "makers" })}`;

export default function MakerEditorPage() {
  const params = useParams<{ slug: string }>();
  const slugKey = decodeURIComponent(String(params.slug ?? ""));
  const isNew = slugKey === "new";
  const router = useRouter();

  const [all, setAll] = useState<CraftMaker[] | null>(null);
  const [crafts, setCrafts] = useState<CraftProduct[]>([]);
  const [maker, setMaker] = useState<CraftMaker | null>(null);
  // Photo fields keep their own upload state, so bump this to remount them after a load.
  const [formKey, setFormKey] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadCraftMakers(), loadCraftProducts()])
      .then(([list, products]) => {
        if (cancelled) return;
        setAll(list);
        setCrafts(products);
        setMaker(
          isNew
            ? blankCraftMaker(list.length)
            : (list.find((m) => m.slug === slugKey) ?? null),
        );
        setFormKey((k) => k + 1);
      })
      .catch(() => {
        if (!cancelled) setNote("Could not load makers. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [isNew, slugKey]);

  const update = (patch: Partial<CraftMaker>) =>
    setMaker((prev) => (prev ? { ...prev, ...patch } : prev));

  const back = (
    <AdminButton variant="ghost" onClick={() => router.push(listHref())}>
      Back to makers
    </AdminButton>
  );

  if (!all)
    return <p className="text-sm text-[#4a5a50]">{note || "Loading maker…"}</p>;

  if (!maker) {
    return (
      <div>
        <PageHeader eyebrow="Crafts" title="Maker" actions={back} />
        <p className="text-sm text-[#4a5a50]">
          This maker no longer exists — it may have been removed.
        </p>
      </div>
    );
  }

  // Same rule as the site: without a main photo, the first linked craft with a photo is used.
  const fallbackCraft = maker.craftSlugs
    .map((s) => crafts.find((c) => c.slug === s))
    .find((c) => c?.image);

  const toggleCraft = (slug: string) =>
    update({
      craftSlugs: maker.craftSlugs.includes(slug)
        ? maker.craftSlugs.filter((s) => s !== slug)
        : [...maker.craftSlugs, slug],
    });

  const save = async () => {
    const name = maker.name.trim();
    if (!name) {
      setNote("Add a name first.");
      return;
    }
    const others = all.filter((m) => isNew || m.slug !== slugKey);
    // New makers get a slug from the name; existing ones keep theirs so profile links stay valid.
    let slug = maker.slug;
    if (isNew) {
      const base = slugify(name) || "maker";
      slug = base;
      for (let n = 2; others.some((m) => m.slug === slug); n++)
        slug = `${base}-${n}`;
    }
    const saved: CraftMaker = { ...maker, name, slug };
    const nextList = isNew
      ? [...all, saved]
      : all.map((m) => (m.slug === slugKey ? saved : m));

    setBusy(true);
    setNote("");
    const res = await saveCraftMakers(nextList);
    setBusy(false);
    if (!res.ok) {
      setNote(res.error);
      return;
    }
    const hasPhoto =
      saved.portrait ||
      saved.craftSlugs.some((s) => crafts.find((c) => c.slug === s)?.image);
    router.push(
      listHref(
        `Saved ${name} — the makers pages update within a minute.${
          saved.active !== false && !hasPhoto
            ? " It shows a placeholder until you add a main photo."
            : ""
        }`,
      ),
    );
  };

  const remove = async () => {
    if (all.length <= 1) {
      setNote(
        "Keep at least one maker. To hide this one, untick “Show on site” and save.",
      );
      return;
    }
    if (
      !confirm(`Remove ${maker.name}? It disappears from the site right away.`)
    )
      return;
    setBusy(true);
    const res = await saveCraftMakers(all.filter((m) => m.slug !== slugKey));
    setBusy(false);
    if (res.ok) router.push(listHref(`${maker.name} removed.`));
    else setNote(res.error);
  };

  const input = (
    key: "name" | "location" | "whatsapp" | "phone" | "instagram" | "email",
    placeholder = "",
  ) => (
    <input
      value={maker[key]}
      onChange={(e) => update({ [key]: e.target.value })}
      className={inputClass}
      placeholder={placeholder}
    />
  );

  const textarea = (key: "story" | "about" | "journey" | "find", rows = 3) => (
    <textarea
      rows={rows}
      value={maker[key]}
      onChange={(e) => update({ [key]: e.target.value })}
      className={cn(inputClass, "resize-y")}
    />
  );

  return (
    <div>
      <PageHeader
        eyebrow="Crafts · Makers"
        title={isNew ? "New maker" : maker.name || "Edit maker"}
        description="A card on the makers page and its own profile page."
        actions={
          <div className="flex flex-wrap gap-2">
            {!isNew ? (
              <Link
                href={`/artisans/${encodeURIComponent(maker.slug)}`}
                target="_blank"
              >
                <AdminButton variant="ghost">View profile</AdminButton>
              </Link>
            ) : null}
            {back}
          </div>
        }
      />

      <div className="space-y-6">
        <Panel className="space-y-4">
          <h2 className="font-display text-xl text-[#26352b]">Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              {input("name", "e.g. Kong Ibahun Marak")}
            </Field>
            <Field
              label="Category"
              hint="Sets the filter chip on the makers page"
            >
              <select
                value={maker.category}
                onChange={(e) =>
                  update({ category: e.target.value as CraftCategory })
                }
                className={inputClass}
              >
                {craftCategories.map((c) => (
                  <option key={c} value={c}>
                    {makerCategoryLabels[c]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              {input("location", "e.g. Nongpoh, Meghalaya")}
            </Field>
            <Field label="Sort order" hint="Lower numbers show first">
              <input
                type="number"
                value={maker.sortOrder ?? ""}
                onChange={(e) =>
                  update({ sortOrder: Math.round(Number(e.target.value) || 0) })
                }
                className={inputClass}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-[#26352b]">
            <input
              type="checkbox"
              checked={maker.active !== false}
              onChange={(e) => update({ active: e.target.checked })}
            />
            Show on site
          </label>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-xl text-[#26352b]">Photos</h2>
          <ImageField
            key={`maker-portrait-${formKey}`}
            name="portrait"
            label="Main photo"
            hint="The maker at work — used on the card and as the big profile photo. Leave empty to use the first linked craft's photo."
            defaultValue={maker.portrait}
            purpose="crafts"
            onChange={(url) => update({ portrait: url })}
          />
          {!maker.portrait && fallbackCraft ? (
            <div className="flex items-center gap-3 rounded-2xl border border-[#e4c9a8] bg-[#fbf3e8] p-3 text-sm text-[#5a4630]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fallbackCraft.image}
                alt=""
                className="h-14 w-16 shrink-0 rounded-xl object-cover"
              />
              <p>
                No main photo yet, so the site is showing the photo from the
                craft <strong>{fallbackCraft.name}</strong>. Upload a main photo
                above to replace it, or change that craft’s photo on the Crafts
                tab.
              </p>
            </div>
          ) : null}
          <GalleryField
            key={`maker-gallery-${formKey}`}
            name="gallery"
            label="Profile gallery"
            hint="Any number of photos. The profile shows the main photo big with up to 4 beside it — the rest open in the photo viewer. The first 4 also appear as thumbnails on the makers page."
            defaultValue={maker.gallery}
            purpose="crafts"
            onChange={(urls) => update({ gallery: urls })}
          />
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-xl text-[#26352b]">Contact</h2>
          <p className="text-sm text-[#4a5a50]">
            Shown in the contact bar on the profile. Leave a field empty to hide
            it.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="WhatsApp"
              hint="With country code, e.g. +91 98765 43210"
            >
              {input("whatsapp", "+91 …")}
            </Field>
            <Field label="Phone">{input("phone", "+91 …")}</Field>
            <Field label="Instagram" hint="Handle or profile link">
              {input("instagram", "@handle")}
            </Field>
            <Field label="Email">{input("email", "name@example.com")}</Field>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-xl text-[#26352b]">Story</h2>
          <Field
            label="Short intro"
            hint="On the card and under the name on the profile"
          >
            {textarea("story", 2)}
          </Field>
          <Field label="About the Maker" hint="Leave empty to hide the section">
            {textarea("about")}
          </Field>
          <Field
            label="The Maker’s Journey"
            hint="Leave empty to hide the section"
          >
            {textarea("journey")}
          </Field>
          <Field
            label="What You’ll Find"
            hint="Leave empty to list the linked crafts automatically"
          >
            {textarea("find")}
          </Field>
        </Panel>

        <Panel className="space-y-4">
          <h2 className="font-display text-xl text-[#26352b]">
            What they make
          </h2>
          <p className="text-sm text-[#4a5a50]">
            Tick this maker’s pieces — they show as tags, thumbnails and
            “Available pieces”. Add new pieces on the Crafts tab.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {crafts.map((c) => {
              const on = maker.craftSlugs.includes(c.slug);
              return (
                <label
                  key={c.slug}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-2xl border p-2.5 text-sm transition",
                    on
                      ? "border-[#364037] bg-[#eef1e6]"
                      : "border-[#d5dbc8] bg-[#fbfcf8]",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleCraft(c.slug)}
                  />
                  <span className="h-10 w-12 shrink-0 overflow-hidden rounded-lg bg-[#eef1e6]">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[#26352b]">
                    {c.name}
                    {c.active === false ? (
                      <span className="text-xs text-[#8a9a8c]"> · hidden</span>
                    ) : null}
                  </span>
                  {/* New tab, so unsaved changes to this maker aren't lost. */}
                  <a
                    href={`/admin/crafts/${encodeURIComponent(c.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 rounded-full border border-[#c5cbb8] px-2.5 py-1 text-[11px] font-semibold text-[#364037] hover:bg-white"
                  >
                    Edit
                  </a>
                </label>
              );
            })}
          </div>
        </Panel>

        <div className="flex flex-wrap gap-2">
          <AdminButton onClick={() => void save()} disabled={busy}>
            {busy ? "Saving…" : isNew ? "Add maker" : "Save maker"}
          </AdminButton>
          {!isNew ? (
            <AdminButton
              variant="ghost"
              onClick={() => void remove()}
              disabled={busy}
            >
              Remove
            </AdminButton>
          ) : null}
        </div>
      </div>

      {note ? (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") ? "ok" : "warn"}>
            {note}
          </Notice>
        </div>
      ) : null}
    </div>
  );
}
