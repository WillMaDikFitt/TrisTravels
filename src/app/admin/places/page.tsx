"use client";

import { useEffect, useState } from "react";
import { destinations as staticDest, type Destination, type DestinationRegion } from "@/data/destinations";
import { fetchDestinationsAdmin } from "@/lib/actions/content-read";
import { deleteDocument, saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
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
  const [dests, setDests] = useState(staticDest);
  const [dest, setDest] = useState<Destination | null>(null);
  const [creating, setCreating] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchDestinationsAdmin().then(setDests);
  }, []);

  const editing = creating ? blank() : dest;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Places"
        description="Destinations shown on the public site."
        actions={
          <AdminButton
            type="button"
            onClick={() => {
              setCreating(true);
              setDest(null);
              setNote("");
            }}
          >
            New place
          </AdminButton>
        }
      />
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
                  onClick={() => {
                    setCreating(false);
                    setDest(d);
                    setNote("");
                  }}
                  className="text-xs font-semibold text-[#364037]"
                >
                  Edit
                </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </Panel>

        {editing ? (
          <form
            key={creating ? "new" : editing.slug}
            onSubmit={async (e) => {
              e.preventDefault();
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
                image: String(fd.get("image")),
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
              };
              setBusy(true);
              const res = await saveDocument("destinations", slug, next as unknown as Record<string, unknown>);
              setBusy(false);
              setNote(res.ok ? `Saved ${next.name}` : res.error ?? "Could not save.");
              if (res.ok) {
                setCreating(false);
                setDest(next);
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
              <ImageField name="image" label="Cover image" defaultValue={editing.image} />
              <div className="flex flex-wrap gap-2">
                <AdminButton type="submit" disabled={busy}>
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
                        setDests((prev) => prev.filter((d) => d.slug !== dest.slug));
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
      {note && (
        <div className="mt-6">
          <Notice tone={note.startsWith("Saved") || note.startsWith("Removed") ? "ok" : "warn"}>{note}</Notice>
        </div>
      )}
    </div>
  );
}
