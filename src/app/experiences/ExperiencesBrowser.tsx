"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Difficulty, Experience, ExperienceCategory } from "@/data/experiences";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { ExperienceCard } from "@/components/listings/ExperienceCard";
import { FilterPills, ListingShell } from "@/components/listings/ListingShell";
import { EXPERIENCE_CATEGORIES, categoryFromSlug, slugFromCategory } from "@/lib/catalog";

const difficulties: Difficulty[] = ["Easy", "Moderate", "Challenging"];

export function ExperiencesBrowser({ experiences }: { experiences: Experience[] }) {
  const search = useSearchParams();
  const router = useRouter();
  const typeSlug = search.get("type");
  const category = typeSlug ? categoryFromSlug(typeSlug) ?? null : null;
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const setCategory = (next: ExperienceCategory | null) => {
    const params = new URLSearchParams(search.toString());
    if (next) params.set("type", slugFromCategory(next));
    else params.delete("type");
    const q = params.toString();
    router.replace(q ? `/experiences?${q}` : "/experiences", { scroll: false });
  };

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (category && e.category !== category) return false;
      if (difficulty && e.difficulty !== difficulty) return false;
      return true;
    });
  }, [experiences, category, difficulty]);

  return (
    <ListingShell
      eyebrow="Experiences"
      title="Days in the hills"
      description="Immersions from a few hours to a full day — filter by how the day feels."
      countLabel={`${filtered.length} ${filtered.length === 1 ? "experience" : "experiences"}${category ? ` · ${category}` : ""}`}
      sidebar={
        <div className="space-y-6">
          <p className="label-caps text-accent">Filters</p>
          <FilterPills
            label="Type"
            value={category}
            onChange={(id) => setCategory(id as ExperienceCategory | null)}
            options={[
              { id: "all", label: "All" },
              ...EXPERIENCE_CATEGORIES.map((c) => ({ id: c.id, label: c.id })),
            ]}
          />
          <FilterPills
            label="Difficulty"
            value={difficulty}
            onChange={(id) => setDifficulty(id as Difficulty | null)}
            options={[
              { id: "all", label: "All" },
              ...difficulties.map((d) => ({ id: d, label: d })),
            ]}
          />
          {(category || difficulty) && (
            <button
              type="button"
              className="text-xs text-accent underline-offset-2 hover:underline"
              onClick={() => {
                setCategory(null);
                setDifficulty(null);
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      }
      footer={
        <p className="mt-12 text-center text-sm text-on-surface-variant">
          Want several days together?{" "}
          <Link href="/journeys" className="text-accent underline-offset-2 hover:underline">
            Explore journeys
          </Link>
        </p>
      }
    >
      <StaggerChildren
        key={`${category ?? "all"}-${difficulty ?? "all"}`}
        mode="mount"
        className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {filtered.map((exp) => (
          <StaggerItem key={exp.slug} className="h-full">
            <ExperienceCard experience={exp} />
          </StaggerItem>
        ))}
      </StaggerChildren>
      {!filtered.length && (
        <p className="py-16 text-center text-on-surface-variant">No experiences in this type yet.</p>
      )}
    </ListingShell>
  );
}
