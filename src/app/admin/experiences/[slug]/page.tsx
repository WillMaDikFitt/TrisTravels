"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Difficulty, Experience, ExperienceCategory, ExperienceStatus } from "@/data/experiences";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { fetchExperiencesAdmin } from "@/lib/actions/content-read";
import { saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField } from "@/components/admin/ImageField";

const categories = EXPERIENCE_CATEGORIES.map((c) => c.id) as ExperienceCategory[];
const difficulties: Difficulty[] = ["Easy", "Moderate", "Challenging"];
const statuses: ExperienceStatus[] = ["active", "draft", "hidden", "seasonal", "soldOut"];

function blank(slug = ""): Experience {
  return {
    slug,
    name: "",
    tagline: "",
    category: "Adventure",
    tags: [],
    location: "",
    region: "East Khasi Hills",
    duration: "1 day",
    durationHours: 8,
    difficulty: "Moderate",
    suitableFor: [],
    bestSeason: "Oct–Apr",
    priceFrom: 0,
    maxGuests: 10,
    minGuests: 1,
    slots: ["08:30", "09:00", "10:00"],
    status: "draft",
    image: "",
    gallery: [],
    overview: "",
    trisStory: "",
    highlights: [],
    included: [],
    whatToBring: [],
    meetingPoint: "",
    itinerary: [],
    faqs: [],
    reviews: [],
  };
}

function lines(v: string) {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ExperienceEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const isNew = slug === "new";
  const [row, setRow] = useState<Experience | null>(isNew ? blank() : null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    fetchExperiencesAdmin().then((list) => {
      const found = list.find((e) => e.slug === slug);
      setRow(found ?? blank(slug));
    });
  }, [isNew, slug]);

  if (!row) {
    return <p className="text-sm text-[#5c6350]">Loading editor…</p>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New experience" : row.name || "Edit experience"}
        description="Public pages show active and seasonal experiences. Drafts stay in the studio."
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/experiences")}>
            Back to list
          </AdminButton>
        }
      />
      <form
        className="space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const nextSlug = isNew ? slugify(String(fd.get("name") || "")) || `exp-${Date.now()}` : row.slug;
          const next: Experience = {
            ...row,
            slug: nextSlug,
            name: String(fd.get("name")),
            tagline: String(fd.get("tagline")),
            category: String(fd.get("category")) as ExperienceCategory,
            location: String(fd.get("location")),
            region: String(fd.get("region")),
            duration: String(fd.get("duration")),
            durationHours: Number(fd.get("durationHours") || 8),
            difficulty: String(fd.get("difficulty")) as Difficulty,
            bestSeason: String(fd.get("bestSeason")),
            priceFrom: Number(fd.get("priceFrom") || 0),
            priceAdult: Number(fd.get("priceAdult") || fd.get("priceFrom") || 0),
            minGuests: Number(fd.get("minGuests") || 1),
            maxGuests: Number(fd.get("maxGuests") || 10),
            slots: lines(String(fd.get("slots") || "")),
            status: String(fd.get("status")) as ExperienceStatus,
            image: String(fd.get("image")),
            gallery: lines(String(fd.get("gallery") || "")),
            overview: String(fd.get("overview")),
            trisStory: String(fd.get("trisStory")),
            highlights: lines(String(fd.get("highlights") || "")),
            included: lines(String(fd.get("included") || "")),
            whatToBring: lines(String(fd.get("whatToBring") || "")),
            meetingPoint: String(fd.get("meetingPoint")),
            tags: lines(String(fd.get("tags") || "").replace(/,/g, "\n")),
            suitableFor: lines(String(fd.get("suitableFor") || "")),
            itinerary: lines(String(fd.get("itinerary") || "")).map((line) => {
              const [time, title, ...rest] = line.split("—").map((s) => s.trim());
              return { time: time || "", title: title || line, description: rest.join(" — ") };
            }),
            faqs: lines(String(fd.get("faqs") || "")).map((line) => {
              const [q, ...rest] = line.split("—").map((s) => s.trim());
              return { q: q || line, a: rest.join(" — ") };
            }),
            seo: { title: String(fd.get("seoTitle") || ""), description: String(fd.get("seoDescription") || "") },
          };
          setBusy(true);
          const res = await saveDocument("experiences", nextSlug, next as unknown as Record<string, unknown>);
          setBusy(false);
          setNote(res.ok ? "Saved." : res.error ?? "Could not save.");
          if (res.ok && isNew) router.replace(`/admin/experiences/${nextSlug}`);
          else setRow(next);
        }}
      >
        <Panel>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input name="name" required defaultValue={row.name} className={inputClass} />
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={row.status ?? "active"} className={inputClass}>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Tagline" hint="One line under the name">
              <input name="tagline" defaultValue={row.tagline} className={inputClass} />
            </Field>
            <Field label="Type">
              <select name="category" defaultValue={row.category} className={inputClass}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input name="location" defaultValue={row.location} className={inputClass} />
            </Field>
            <Field label="Region">
              <input name="region" defaultValue={row.region} className={inputClass} />
            </Field>
            <Field label="Duration label">
              <input name="duration" defaultValue={row.duration} className={inputClass} />
            </Field>
            <Field label="Duration (hours)">
              <input name="durationHours" type="number" defaultValue={row.durationHours} className={inputClass} />
            </Field>
            <Field label="Difficulty">
              <select name="difficulty" defaultValue={row.difficulty} className={inputClass}>
                {difficulties.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Best season">
              <input name="bestSeason" defaultValue={row.bestSeason} className={inputClass} />
            </Field>
            <Field label="Tags" hint="comma or new line">
              <input name="tags" defaultValue={row.tags.join(", ")} className={inputClass} />
            </Field>
            <Field label="Meeting point">
              <input name="meetingPoint" defaultValue={row.meetingPoint} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Pricing & capacity</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Price from (₹)">
              <input name="priceFrom" type="number" defaultValue={row.priceFrom} className={inputClass} />
            </Field>
            <Field label="Adult price (₹)" hint="optional">
              <input name="priceAdult" type="number" defaultValue={row.priceAdult ?? row.priceFrom} className={inputClass} />
            </Field>
            <Field label="Min guests">
              <input name="minGuests" type="number" defaultValue={row.minGuests ?? 1} className={inputClass} />
            </Field>
            <Field label="Max guests">
              <input name="maxGuests" type="number" defaultValue={row.maxGuests} className={inputClass} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Time slots" hint="one per line">
              <textarea name="slots" rows={3} defaultValue={(row.slots ?? ["08:30", "09:00", "10:00"]).join("\n")} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Story</h2>
          <div className="space-y-4">
            <Field label="Overview">
              <textarea name="overview" rows={4} defaultValue={row.overview} className={inputClass} />
            </Field>
            <Field label="TRIS story">
              <textarea name="trisStory" rows={4} defaultValue={row.trisStory} className={inputClass} />
            </Field>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Highlights" hint="one per line">
                <textarea name="highlights" rows={6} defaultValue={row.highlights.join("\n")} className={inputClass} />
              </Field>
              <Field label="Included" hint="one per line">
                <textarea name="included" rows={6} defaultValue={row.included.join("\n")} className={inputClass} />
              </Field>
              <Field label="What to bring" hint="one per line">
                <textarea name="whatToBring" rows={6} defaultValue={row.whatToBring.join("\n")} className={inputClass} />
              </Field>
            </div>
            <Field label="Suitable for" hint="one per line">
              <textarea name="suitableFor" rows={3} defaultValue={row.suitableFor.join("\n")} className={inputClass} />
            </Field>
            <Field label="Itinerary" hint="one beat per line: Time — Title — description">
              <textarea
                name="itinerary"
                rows={6}
                defaultValue={row.itinerary.map((i) => `${i.time} — ${i.title} — ${i.description}`).join("\n")}
                className={inputClass}
              />
            </Field>
            <Field label="FAQs" hint="one per line: Question — Answer">
              <textarea
                name="faqs"
                rows={5}
                defaultValue={row.faqs.map((f) => `${f.q} — ${f.a}`).join("\n")}
                className={inputClass}
              />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Media & SEO</h2>
          <ImageField name="image" label="Cover image" defaultValue={row.image} />
          <div className="mt-4">
            <Field label="Gallery URLs" hint="one per line">
              <textarea name="gallery" rows={4} defaultValue={row.gallery.join("\n")} className={inputClass} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="SEO title">
              <input name="seoTitle" defaultValue={row.seo?.title ?? ""} className={inputClass} />
            </Field>
            <Field label="SEO description">
              <input name="seoDescription" defaultValue={row.seo?.description ?? ""} className={inputClass} />
            </Field>
          </div>
        </Panel>

        {note && <Notice tone={note === "Saved." ? "ok" : "warn"}>{note}</Notice>}
        <AdminButton type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save experience"}
        </AdminButton>
      </form>
    </div>
  );
}
