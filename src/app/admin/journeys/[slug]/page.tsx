"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Journey } from "@/data/journeys";
import { fetchJourneysAdmin } from "@/lib/actions/content-read";
import { saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";
import { formatDepartureSeats, parseDepartureSeats, seatsLeft } from "@/lib/journey-seats";

function blank(): Journey {
  return {
    slug: "",
    name: "",
    type: "curated",
    tagline: "",
    days: 3,
    nights: 2,
    priceFrom: 0,
    image: "",
    style: [],
    season: "",
    overview: "",
    highlights: [],
    itinerary: [],
    stays: [],
    inclusions: [],
    sourceUrl: "",
    status: "draft",
  };
}

const lines = (v: string) =>
  v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export default function JourneyEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const isNew = slug === "new";
  const [row, setRow] = useState<Journey | null>(isNew ? blank() : null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetchJourneysAdmin()
      .then((list) => setRow(list.find((j) => j.slug === slug) ?? blank()))
      .catch(() => setRow(blank()));
  }, [isNew, slug]);

  if (!row) return <p className="text-sm text-[#5c6350]">Loading editor…</p>;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New journey" : row.name || "Edit journey"}
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/journeys")}>
            Back to list
          </AdminButton>
        }
      />
      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const nextSlug = isNew ? slugify(String(fd.get("name") || "")) || `journey-${Date.now()}` : row.slug;
          const itinerary = lines(String(fd.get("itinerary") || "")).map((line, i) => {
            const [title, ...rest] = line.split("—");
            return { day: i + 1, title: (title || `Day ${i + 1}`).trim(), summary: rest.join("—").trim() };
          });
          const next: Journey = {
            ...row,
            slug: nextSlug,
            name: String(fd.get("name")),
            type: String(fd.get("type")) as Journey["type"],
            tagline: String(fd.get("tagline")),
            days: Number(fd.get("days") || 3),
            nights: Number(fd.get("nights") || 2),
            priceFrom: Number(fd.get("priceFrom") || 0),
            priceNote: String(fd.get("priceNote") || ""),
            season: String(fd.get("season")),
            overview: String(fd.get("overview")),
            image: String(fd.get("image")),
            highlights: lines(String(fd.get("highlights") || "")),
            stays: lines(String(fd.get("stays") || "")),
            inclusions: lines(String(fd.get("inclusions") || "")),
            nextDeparture: String(fd.get("nextDeparture") || ""),
            departures: String(fd.get("departures") || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            departureSeats: parseDepartureSeats(String(fd.get("departureSeats") || "")),
            groupSize: String(fd.get("groupSize") || ""),
            itinerary,
            status: String(fd.get("status") || "active") as Journey["status"],
          };
          setBusy(true);
          const res = await saveDocument("journeys", nextSlug, next as unknown as Record<string, unknown>);
          setBusy(false);
          setNote(res.ok ? "Saved." : res.error ?? "Could not save.");
          if (res.ok && isNew) router.replace(`/admin/journeys/${nextSlug}`);
          else setRow(next);
        }}
      >
        <Panel>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input name="name" required defaultValue={row.name} className={inputClass} />
            </Field>
            <Field label="Type">
              <select name="type" defaultValue={row.type} className={inputClass}>
                <option value="curated">Curated (flexible / enquire)</option>
                <option value="small-group">Small group (fixed departure)</option>
              </select>
            </Field>
            <Field label="Tagline">
              <input name="tagline" defaultValue={row.tagline} className={inputClass} />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={row.status ?? "active"} className={inputClass}>
                <option>active</option>
                <option>draft</option>
                <option>hidden</option>
              </select>
            </Field>
            <Field label="Days">
              <input name="days" type="number" defaultValue={row.days} className={inputClass} />
            </Field>
            <Field label="Nights">
              <input name="nights" type="number" defaultValue={row.nights} className={inputClass} />
            </Field>
            <Field label="Price from (₹)">
              <input name="priceFrom" type="number" defaultValue={row.priceFrom} className={inputClass} />
            </Field>
            <Field label="Price note">
              <input name="priceNote" defaultValue={row.priceNote ?? ""} className={inputClass} />
            </Field>
            <Field label="Season">
              <input name="season" defaultValue={row.season} className={inputClass} />
            </Field>
            <Field label="Group size" hint="small-group">
              <input name="groupSize" defaultValue={row.groupSize ?? ""} className={inputClass} />
            </Field>
            <Field label="Next departure label" hint="shown on public cards">
              <input name="nextDeparture" defaultValue={row.nextDeparture ?? ""} className={inputClass} />
            </Field>
            <Field label="Simple departure dates" hint="comma-separated, for public cards">
              <input name="departures" defaultValue={(row.departures ?? []).join(", ")} className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label="Seat tracking (small group)"
              hint="One departure per line: date|total seats|held|booked|optional note"
            >
              <textarea
                name="departureSeats"
                rows={6}
                defaultValue={formatDepartureSeats(row.departureSeats)}
                placeholder={"2026-09-12|10|1|4|Guwahati start"}
                className={inputClass}
              />
            </Field>
            {(row.departureSeats?.length ?? 0) > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-[#5c6350]">
                {row.departureSeats!.map((d) => (
                  <li key={d.date}>
                    {d.date}: {seatsLeft(d)} seats left
                    <span className="text-[#8a917c]">
                      {" "}
                      ({d.booked} booked · {d.held} held · {d.seats} total)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Panel>
        <Panel>
          <Field label="Overview">
            <textarea name="overview" rows={5} defaultValue={row.overview} className={inputClass} />
          </Field>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="Highlights" hint="one per line">
              <textarea name="highlights" rows={6} defaultValue={row.highlights.join("\n")} className={inputClass} />
            </Field>
            <Field label="Stays" hint="one per line">
              <textarea name="stays" rows={6} defaultValue={row.stays.join("\n")} className={inputClass} />
            </Field>
            <Field label="Inclusions" hint="one per line">
              <textarea name="inclusions" rows={6} defaultValue={row.inclusions.join("\n")} className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Itinerary" hint="one day per line: Title — summary">
              <textarea
                name="itinerary"
                rows={8}
                defaultValue={row.itinerary.map((d) => `${d.title} — ${d.summary}`).join("\n")}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>
        <Panel>
          <ImageField name="image" label="Cover image" defaultValue={row.image} />
        </Panel>
        {note && <Notice tone={note === "Saved." ? "ok" : "warn"}>{note}</Notice>}
        <AdminButton type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save journey"}
        </AdminButton>
      </form>
    </div>
  );
}
