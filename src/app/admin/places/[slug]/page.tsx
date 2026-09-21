"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getDestination,
  type Destination,
  type DestinationRegion,
} from "@/data/destinations";
import { fetchDestinationAdmin } from "@/lib/actions/content-read";
import { deleteDocument, saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { useStudioListingHydration } from "@/lib/admin/useStudioListingHydration";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField, GalleryField } from "@/components/admin/ImageField";

const regions: DestinationRegion[] = [
  "East Khasi Hills",
  "West Khasi Hills",
  "West Jaintia Hills",
  "Ri Bhoi",
];

function blank(slug = ""): Destination {
  return {
    slug,
    name: "",
    region: "East Khasi Hills",
    tagline: "",
    overview: "",
    highlights: [],
    interestingFact: "",
    distances: { shillong: "", guwahatiAirport: "", umroiAirport: "" },
    image: "",
    gallery: [],
    sourceUrl: "",
  };
}

export default function PlaceEditorPage() {
  const params = useParams<{ slug: string }>();
  const slugKey = decodeURIComponent(String(params.slug ?? ""));
  const router = useRouter();
  const isNew = slugKey === "new";
  const { row, hydrated, formKey, loadError, canSave, applySaved } =
    useStudioListingHydration<Destination>({
      isNew,
      slugKey,
      blank: () => blank(isNew ? "" : slugKey),
      seedFallback: () => getDestination(slugKey) ?? null,
      isRemoved: (place) => place.removedFromCatalogue === true,
      load: () => fetchDestinationAdmin(slugKey),
    });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loadError) setNote(loadError);
  }, [loadError]);

  if (!hydrated) {
    return <p className="text-sm text-[#4a5a50]">Loading saved place…</p>;
  }

  if (!row) {
    return (
      <div>
        <PageHeader
          eyebrow="Catalogue"
          title="Place"
          actions={
            <AdminButton variant="ghost" onClick={() => router.push("/admin/places")}>
              Back to places
            </AdminButton>
          }
        />
        <p className="text-sm text-[#4a5a50]">{note || "This place could not be opened."}</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New place" : row.name || "Edit place"}
        description="Edits load from live Studio data before this form opens, so seed defaults cannot overwrite your work."
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/places")}>
            Back to places
          </AdminButton>
        }
      />

      <form
        key={formKey}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSave) {
            setNote("Still loading — wait, then try Save again.");
            return;
          }
          const fd = new FormData(e.currentTarget);
          const name = String(fd.get("name"));
          const slug = isNew ? slugify(String(fd.get("slug") || name)) : row.slug;
          if (!slug) {
            setNote("Add a name (and slug) first.");
            return;
          }
          const next: Destination = {
            ...row,
            slug,
            name,
            region: String(fd.get("region")) as DestinationRegion,
            tagline: String(fd.get("tagline")),
            overview: String(fd.get("overview")),
            interestingFact: String(fd.get("interestingFact")),
            image: (() => {
              const cover = String(fd.get("image") || "").trim();
              if (cover) return cover;
              return (
                String(fd.get("gallery") || "")
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean)[0] || ""
              );
            })(),
            gallery: String(fd.get("gallery") || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            highlights: String(fd.get("highlights") || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean),
            distances: {
              shillong: String(fd.get("distShillong")),
              guwahatiAirport: String(fd.get("distGuwahati")),
              umroiAirport: String(fd.get("distUmroi")),
            },
            sourceUrl: row.sourceUrl || "",
            removedFromCatalogue: false,
          };
          setBusy(true);
          const res = await saveDocument("destinations", slug, next as unknown as Record<string, unknown>);
          setBusy(false);
          setNote(res.ok ? `Saved ${next.name}` : res.error ?? "Could not save.");
          if (res.ok) {
            applySaved(next);
            if (isNew) router.replace(`/admin/places/${slug}`);
          }
        }}
      >
        <Panel className="space-y-4">
          <Field label="Name">
            <input name="name" required defaultValue={row.name} className={inputClass} />
          </Field>
          {isNew ? (
            <Field label="URL slug" hint="auto from name if blank">
              <input name="slug" placeholder="mawlynnong" className={inputClass} />
            </Field>
          ) : null}
          <Field label="Region">
            <select name="region" defaultValue={row.region} className={inputClass}>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tagline">
            <input name="tagline" defaultValue={row.tagline} className={inputClass} />
          </Field>
          <Field label="Overview">
            <textarea name="overview" rows={5} defaultValue={row.overview} className={inputClass} />
          </Field>
          <Field label="Interesting fact">
            <textarea
              name="interestingFact"
              rows={3}
              defaultValue={row.interestingFact ?? ""}
              className={inputClass}
            />
          </Field>
          <Field label="Highlights" hint="one per line">
            <textarea
              name="highlights"
              rows={5}
              defaultValue={row.highlights.join("\n")}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="From Shillong">
              <input name="distShillong" defaultValue={row.distances.shillong} className={inputClass} />
            </Field>
            <Field label="From Guwahati airport">
              <input
                name="distGuwahati"
                defaultValue={row.distances.guwahatiAirport}
                className={inputClass}
              />
            </Field>
            <Field label="From Umroi airport">
              <input name="distUmroi" defaultValue={row.distances.umroiAirport} className={inputClass} />
            </Field>
          </div>
          <ImageField
            key={`cover-${formKey}-${row.image}`}
            name="image"
            label="Cover image"
            defaultValue={row.image}
          />
          <div className="mt-6">
            <GalleryField
              key={`gallery-${formKey}-${(row.gallery ?? []).join("|")}`}
              name="gallery"
              label="Gallery images"
              defaultValue={row.gallery ?? []}
              hint="Extra photos for the destination page. Upload several at once; reorder as needed."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton type="submit" disabled={busy || !canSave}>
              {busy ? "Saving…" : "Save place"}
            </AdminButton>
            {!isNew ? (
              <AdminButton
                type="button"
                variant="ghost"
                onClick={async () => {
                  if (!confirm(`Remove ${row.name} from the catalogue?`)) return;
                  const res = await deleteDocument("destinations", row.slug);
                  setNote(res.ok ? `Removed ${row.name}` : res.error ?? "Could not remove.");
                  if (res.ok) router.push("/admin/places");
                }}
              >
                Remove
              </AdminButton>
            ) : null}
          </div>
        </Panel>
      </form>

      {note ? (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") || note.startsWith("Removed") ? "ok" : "warn"}>
            {note}
          </Notice>
        </div>
      ) : null}
    </div>
  );
}
