"use client";

import { useEffect, useState } from "react";
import { destinations as staticDest, type Destination, type DestinationRegion } from "@/data/destinations";
import { fetchDestinationAdmin, fetchDestinationsAdmin } from "@/lib/actions/content-read";
import { deleteDocument, saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField, GalleryField } from "@/components/admin/ImageField";
import { VisibilityToggle } from "@/components/admin/VisibilityToggle";
import { cn } from "@/lib/utils";

const regions: DestinationRegion[] = [
  "East Khasi Hills",
  "West Khasi Hills",
  "West Jaintia Hills",
  "Ri Bhoi",
];

function blank(): Destination {
  return {
    slug: "",
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

export default function AdminPlacesPage() {
  const [dests, setDests] = useState<Destination[]>([]);
  const [listReady, setListReady] = useState(false);
  const [dest, setDest] = useState<Destination | null>(null);
  const [creating, setCreating] = useState(false);
  const [editorEpoch, setEditorEpoch] = useState(0);
  const [openingSlug, setOpeningSlug] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchDestinationsAdmin()
      .then((rows) => {
        if (cancelled) return;
        setDests(rows);
        setListReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setDests(staticDest);
        setListReady(true);
        setNote("Could not reach live Places data — showing local fallback. Prefer not to save until live load works.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const editing = creating ? blank() : dest;

  const openEditor = async (row: Destination) => {
    setCreating(false);
    setOpeningSlug(row.slug);
    setNote("");
    try {
      const fresh = await fetchDestinationAdmin(row.slug);
      if (fresh?.removedFromCatalogue) {
        setDest(null);
        setNote("This place was removed from the catalogue.");
        const next = await fetchDestinationsAdmin().catch(() => null);
        if (next) setDests(next);
      } else {
        setDest(fresh ?? row);
        setEditorEpoch((n) => n + 1);
      }
    } catch {
      setDest(row);
      setEditorEpoch((n) => n + 1);
      setNote("Could not refresh this place from live data — check carefully before saving.");
    } finally {
      setOpeningSlug(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Places"
        description="Destinations shown on the public site. Editors open from live Studio data so seed defaults cannot overwrite your work."
        actions={
          <AdminButton
            type="button"
            disabled={!listReady}
            onClick={() => {
              setCreating(true);
              setDest(null);
              setEditorEpoch((n) => n + 1);
              setNote("");
            }}
          >
            New place
          </AdminButton>
        }
      />
      {!listReady ? (
        <p className="text-sm text-[#4a5a50]">Loading saved places…</p>
      ) : (
        <div className="space-y-6">
          <Panel className="overflow-x-auto">
            <p className="mb-3 text-xs font-semibold tracking-wider text-[#4a5a50] uppercase">All places</p>
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#f8f6f1] text-[11px] font-semibold tracking-wider text-[#4a5a50] uppercase">
                <tr>
                  <th className="px-3 py-2.5">Place</th>
                  <th className="px-3 py-2.5">Region</th>
                  <th className="px-3 py-2.5">From Shillong</th>
                  <th className="px-3 py-2.5">Front</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {dests.map((d) => (
                  <tr
                    key={d.slug}
                    className={cn(
                      "border-t border-[#dde1d0]",
                      !creating && dest?.slug === d.slug ? "bg-[#eef0e3]" : "hover:bg-[#faf8f3]",
                    )}
                  >
                    <td className="px-3 py-3 font-medium">{d.name}</td>
                    <td className="px-3 py-3 text-[#4a5a50]">{d.region}</td>
                    <td className="px-3 py-3 text-[#4a5a50]">{d.distances.shillong || "—"}</td>
                    <td className="px-3 py-3">
                      <VisibilityToggle
                        collection="destinations"
                        id={d.slug}
                        status={d.status}
                        onChange={(status) =>
                          setDests((prev) =>
                            prev.map((row) => (row.slug === d.slug ? { ...row, status } : row)),
                          )
                        }
                      />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        disabled={openingSlug === d.slug}
                        onClick={() => void openEditor(d)}
                        className="text-xs font-semibold text-[#364037] disabled:opacity-50"
                      >
                        {openingSlug === d.slug ? "Opening…" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {editing ? (
            <form
              key={`${creating ? "new" : editing.slug}-${editorEpoch}`}
              onSubmit={async (e) => {
                e.preventDefault();
                if (!listReady) {
                  setNote("Still loading saved places — wait, then try Save again.");
                  return;
                }
                const fd = new FormData(e.currentTarget);
                const name = String(fd.get("name"));
                const slug = creating ? slugify(String(fd.get("slug") || name)) : editing.slug;
                if (!slug) {
                  setNote("Add a name (and slug) first.");
                  return;
                }
                const next: Destination = {
                  ...editing,
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
                  sourceUrl: editing.sourceUrl || "",
                  removedFromCatalogue: false,
                };
                setBusy(true);
                const res = await saveDocument("destinations", slug, next as unknown as Record<string, unknown>);
                setBusy(false);
                setNote(res.ok ? `Saved ${next.name}` : res.error ?? "Could not save.");
                if (res.ok) {
                  setCreating(false);
                  setDest(next);
                  setEditorEpoch((n) => n + 1);
                  setDests((prev) => {
                    const i = prev.findIndex((d) => d.slug === slug);
                    if (i >= 0) {
                      const copy = [...prev];
                      copy[i] = next;
                      return copy;
                    }
                    return [next, ...prev];
                  });
                }
              }}
            >
              <Panel className="space-y-4">
                <p className="font-display text-xl">{creating ? "New place" : editing.name}</p>
                <Field label="Name">
                  <input name="name" required defaultValue={editing.name} className={inputClass} />
                </Field>
                {creating && (
                  <Field label="URL slug" hint="auto from name if blank">
                    <input name="slug" placeholder="mawlynnong" className={inputClass} />
                  </Field>
                )}
                <Field label="Region">
                  <select name="region" defaultValue={editing.region} className={inputClass}>
                    {regions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tagline">
                  <input name="tagline" defaultValue={editing.tagline} className={inputClass} />
                </Field>
                <Field label="Overview">
                  <textarea name="overview" rows={5} defaultValue={editing.overview} className={inputClass} />
                </Field>
                <Field label="Interesting fact">
                  <textarea
                    name="interestingFact"
                    rows={3}
                    defaultValue={editing.interestingFact ?? ""}
                    className={inputClass}
                  />
                </Field>
                <Field label="Highlights" hint="one per line">
                  <textarea
                    name="highlights"
                    rows={5}
                    defaultValue={editing.highlights.join("\n")}
                    className={inputClass}
                  />
                </Field>
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="From Shillong">
                    <input name="distShillong" defaultValue={editing.distances.shillong} className={inputClass} />
                  </Field>
                  <Field label="From Guwahati airport">
                    <input
                      name="distGuwahati"
                      defaultValue={editing.distances.guwahatiAirport}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="From Umroi airport">
                    <input name="distUmroi" defaultValue={editing.distances.umroiAirport} className={inputClass} />
                  </Field>
                </div>
                <ImageField
                  key={`cover-${creating ? "new" : editing.slug}-${editing.image}-${editorEpoch}`}
                  name="image"
                  label="Cover image"
                  defaultValue={editing.image}
                />
                <div className="mt-6">
                  <GalleryField
                    key={`gallery-${creating ? "new" : editing.slug}-${(editing.gallery ?? []).join("|")}-${editorEpoch}`}
                    name="gallery"
                    label="Gallery images"
                    defaultValue={editing.gallery ?? []}
                    hint="Extra photos for the destination page. Upload several at once; reorder as needed."
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton type="submit" disabled={busy || !listReady}>
                    {busy ? "Saving…" : "Save place"}
                  </AdminButton>
                  {!creating && dest && (
                    <AdminButton
                      type="button"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm(`Remove ${dest.name} from the catalogue?`)) return;
                        const res = await deleteDocument("destinations", dest.slug);
                        setNote(res.ok ? `Removed ${dest.name}` : res.error ?? "Could not remove.");
                        if (res.ok) {
                          const next = await fetchDestinationsAdmin().catch(() => null);
                          if (next) setDests(next);
                          else setDests((prev) => prev.filter((d) => d.slug !== dest.slug));
                          setDest(null);
                        }
                      }}
                    >
                      Remove
                    </AdminButton>
                  )}
                </div>
              </Panel>
            </form>
          ) : (
            <Panel>
              <p className="text-sm text-[#4a5a50]">Select a place to edit, or create a new one.</p>
            </Panel>
          )}
        </div>
      )}
      {note && (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") || note.startsWith("Removed") ? "ok" : "warn"}>{note}</Notice>
        </div>
      )}
    </div>
  );
}
