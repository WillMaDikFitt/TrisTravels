"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Difficulty, Experience, ExperienceCategory, ExperienceStatus } from "@/data/experiences";
import { getExperience as getStaticExperience } from "@/data/experiences";
import { EXPERIENCE_CATEGORIES } from "@/lib/catalog";
import { fetchExperienceAdmin } from "@/lib/actions/content-read";
import { saveDocument } from "@/lib/actions/cms";
import { slugify } from "@/lib/slug";
import { normalizeExperience } from "@/lib/normalize-listing";
import { AdminButton, Field, Notice, PageHeader, Panel, inputClass } from "@/components/admin/ui";
import { ImageField, GalleryField } from "@/components/admin/ImageField";
import {
  compactExperienceItinerary,
  ItineraryEditor,
} from "@/components/admin/ItineraryEditor";
import { SlotScheduleEditor } from "@/components/admin/SlotScheduleEditor";
import {
  TransportPricingFields,
  transportEditorFromListing,
  transportFieldsFromEditor,
} from "@/components/admin/TransportPricingFields";
import { ExperienceCostingFields } from "@/components/admin/ExperienceCostingFields";
import { ALL_DAY_SLOT, experienceSlots } from "@/lib/experience-slots";
import { hasExperienceCosting } from "@/data/experience-costing";

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
    slotConfig: { mode: "fixed", times: ["08:30", "09:00", "10:00"] },
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
  const params = useParams<{ slug: string }>();
  const slugKey = decodeURIComponent(String(params.slug ?? ""));
  const router = useRouter();
  const isNew = slugKey === "new";
  const [row, setRow] = useState<Experience | null>(() => {
    if (isNew) return blank();
    const seeded = getStaticExperience(slugKey);
    return seeded ? normalizeExperience(seeded, slugKey) : null;
  });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    const seeded = getStaticExperience(slugKey);
    let cancelled = false;

    fetchExperienceAdmin(slugKey)
      .then((exp) => {
        if (cancelled) return;
        if (exp?.name?.trim()) setRow(normalizeExperience(exp, slugKey));
        else if (seeded) setRow(normalizeExperience(seeded, slugKey));
        else if (exp) setRow(normalizeExperience(exp, slugKey));
        else setRow(blank(slugKey));
      })
      .catch(() => {
        if (!cancelled) setRow(seeded ? normalizeExperience(seeded, slugKey) : blank(slugKey));
      });

    return () => {
      cancelled = true;
    };
  }, [isNew, slugKey]);

  if (!row) {
    return <p className="text-sm text-[#4a5a50]">Loading editor…</p>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={isNew ? "New experience" : row.name || "Edit experience"}
        description={
          !row.name.trim() && !isNew
            ? "This listing has no saved content yet. If it should be a seed experience, check the URL slug matches the list."
            : "Public pages show active and seasonal experiences. Drafts stay in the studio."
        }
        actions={
          <AdminButton variant="ghost" onClick={() => router.push("/admin/experiences")}>
            Back to list
          </AdminButton>
        }
      />
      <form
        key={row.slug}
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
            priceChild: Number(fd.get("priceChild") || 0) || undefined,
            costing: row.costing ?? null,
            minGuests: row.minGuests ?? 1,
            maxGuests: row.maxGuests || 10,
            slots:
              row.slotConfig?.mode === "day"
                ? [ALL_DAY_SLOT]
                : row.slotConfig?.mode === "fixed"
                  ? row.slotConfig.times ?? []
                  : experienceSlots(row),
            slotConfig: {
              ...(row.slotConfig ?? { mode: "fixed" as const, times: ["08:30", "09:00", "10:00"] }),
              capacity: row.slotConfig?.capacity ?? row.maxGuests,
            },
            transportMode: row.transportMode ?? (row.transportAvailable ? "optional" : "none"),
            transportAvailable: ["optional", "required"].includes(
              row.transportMode ?? (row.transportAvailable ? "optional" : "none"),
            ),
            transportPrice: row.transportPrice,
            transportNote: row.transportNote ?? "",
            transportVehicles: row.transportVehicles,
            status: String(fd.get("status")) as ExperienceStatus,
            backendId: String(fd.get("backendId") || "").trim() || undefined,
            image: (() => {
              const cover = String(fd.get("image") || "").trim();
              if (cover) return cover;
              const galleryFirst = lines(String(fd.get("gallery") || ""))[0];
              return galleryFirst || "";
            })(),
            gallery: lines(String(fd.get("gallery") || "")),
            overview: String(fd.get("overview")),
            trisStory: String(fd.get("trisStory")),
            highlights: lines(String(fd.get("highlights") || "")),
            included: lines(String(fd.get("included") || "")),
            excluded: lines(String(fd.get("excluded") || "")),
            whatToBring: lines(String(fd.get("whatToBring") || "")),
            meetingPoint: String(fd.get("meetingPoint")),
            tags: lines(String(fd.get("tags") || "").replace(/,/g, "\n")),
            suitableFor: lines(String(fd.get("suitableFor") || "")),
            sortOrder: Number(fd.get("sortOrder") || 0) || undefined,
            itinerary: compactExperienceItinerary(row.itinerary ?? []),
            faqs: row.faqs ?? [],
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
            <Field
              label="Backend ID"
              hint="Ops / backend catalogue ID — saved onto bookings for this experience"
            >
              <input
                name="backendId"
                defaultValue={row.backendId ?? ""}
                placeholder="e.g. EXP-0042"
                className={inputClass}
              />
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
              <input name="tags" defaultValue={(row.tags ?? []).join(", ")} className={inputClass} />
            </Field>
            <Field label="Meeting point">
              <input name="meetingPoint" defaultValue={row.meetingPoint} className={inputClass} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first on the site">
              <input name="sortOrder" type="number" defaultValue={row.sortOrder ?? ""} className={inputClass} />
            </Field>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Guest-facing from price</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="From price (₹)" hint="Shown on cards / browse">
              <input name="priceFrom" type="number" defaultValue={row.priceFrom} className={inputClass} />
            </Field>
            {!hasExperienceCosting(row) ? (
              <>
                <Field label="Adult (₹)" hint="Legacy booking rate">
                  <input
                    name="priceAdult"
                    type="number"
                    defaultValue={row.priceAdult ?? row.priceFrom}
                    className={inputClass}
                  />
                </Field>
                <Field label="Child (₹)" hint="Leave blank for 70% of adult">
                  <input
                    name="priceChild"
                    type="number"
                    min="0"
                    defaultValue={row.priceChild ?? ""}
                    className={inputClass}
                  />
                </Field>
              </>
            ) : (
              <>
                <input type="hidden" name="priceAdult" value={row.priceAdult ?? row.priceFrom} />
                <input type="hidden" name="priceChild" value={row.priceChild ?? ""} />
                <div className="sm:col-span-2 flex items-end">
                  <p className="text-sm text-[#4a5a50]">
                    Booking totals come from operational costing below. Keep “from price” for marketing cards.
                  </p>
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel>
          <ExperienceCostingFields
            value={row.costing}
            transportMode={row.transportMode ?? (row.transportAvailable ? "optional" : "none")}
            onChange={(costing) => setRow((prev) => (prev ? { ...prev, costing } : prev))}
          />
        </Panel>

        <Panel>
          <SlotScheduleEditor
            value={{
              slotConfig: row.slotConfig ?? { mode: "fixed", times: ["08:30", "09:00", "10:00"] },
              minGuests: row.minGuests ?? 1,
              maxGuests: row.maxGuests,
            }}
            onChange={(next) =>
              setRow((prev) =>
                prev
                  ? {
                      ...prev,
                      slotConfig: next.slotConfig,
                      minGuests: next.minGuests,
                      maxGuests: next.maxGuests,
                    }
                  : prev,
              )
            }
          />
        </Panel>

        <Panel>
          <TransportPricingFields
            variant="experience"
            value={transportEditorFromListing({
              variant: "experience",
              transportMode: row.transportMode,
              transportAvailable: row.transportAvailable,
              transportPrice: row.transportPrice,
              transportNote: row.transportNote,
              transportVehicles: row.transportVehicles,
            })}
            onChange={(next) => {
              const fields = transportFieldsFromEditor(next);
              setRow((prev) =>
                prev
                  ? {
                      ...prev,
                      transportMode: fields.transportMode,
                      transportAvailable: fields.transportAvailable,
                      transportPrice: fields.transportPrice,
                      transportNote: fields.transportNote,
                      transportVehicles: fields.transportVehicles,
                    }
                  : prev,
              );
            }}
            hideVehiclePrices={hasExperienceCosting(row)}
          />
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
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Highlights" hint="one per line">
                <textarea name="highlights" rows={6} defaultValue={(row.highlights ?? []).join("\n")} className={inputClass} />
              </Field>
              <Field label="Included" hint="one per line">
                <textarea name="included" rows={6} defaultValue={(row.included ?? []).join("\n")} className={inputClass} />
              </Field>
              <Field label="Excluded" hint="one per line">
                <textarea name="excluded" rows={6} defaultValue={(row.excluded ?? []).join("\n")} className={inputClass} />
              </Field>
              <Field label="What to bring" hint="one per line">
                <textarea name="whatToBring" rows={6} defaultValue={(row.whatToBring ?? []).join("\n")} className={inputClass} />
              </Field>
            </div>
            <Field label="Suitable for" hint="one per line">
              <textarea name="suitableFor" rows={3} defaultValue={(row.suitableFor ?? []).join("\n")} className={inputClass} />
            </Field>
            <div className="pt-2">
              <ItineraryEditor
                mode="experience"
                value={row.itinerary ?? []}
                onChange={(itinerary) => setRow((prev) => (prev ? { ...prev, itinerary } : prev))}
              />
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 font-display text-lg">Media & SEO</h2>
          <ImageField key={`cover-${row.slug}-${row.image}`} name="image" label="Cover image" defaultValue={row.image} />
          <div className="mt-6">
            <GalleryField
              key={`gallery-${row.slug}-${(row.gallery ?? []).join("|")}`}
              name="gallery"
              label="Gallery images"
              defaultValue={row.gallery ?? []}
              hint="Extra photos on the experience detail page. Upload several at once; reorder as needed."
            />
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
