"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Difficulty, Experience, ExperienceCategory } from "@/data/experiences";
import { cn } from "@/lib/utils";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { ExperienceCard } from "@/components/listings/ExperienceCard";
import { PageHero } from "@/components/motion/FullBleedParallax";
import { EXPERIENCE_CATEGORIES, categoryFromSlug, slugFromCategory } from "@/lib/catalog";
import { media } from "@/data/media";

const difficulties: Difficulty[] = ["Easy", "Moderate", "Challenging"];

const typeVisuals: Record<string, string> = {
  adventure: media.heroRoots,
  "nature-wildlife": media.familyWaterfall,
  "culture-heritage": media.valueCommunity,
  "food-local-life": media.kitchen,
  wellness: media.heroMist,
  creative: media.craft,
};

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
    <div className="bg-background">
      <PageHero
        src={media.heroRoots}
        alt="A day in the Khasi Hills"
        compact
        eyebrow="Experiences"
        title="Six day types, one way to book"
        body="Immersions from a few hours to a full day — organised by how they feel, not by a generic tour list."
        primaryCta={{ href: "#gallery", label: "Browse days" }}
        secondaryCta={{ href: "/journeys", label: "See journeys" }}
      />

      <section className="bg-[#2a2e1f] py-12 text-primary-fixed md:py-16">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <p className="label-caps text-accent">How a day can feel</p>
          <h2 className="mt-2 font-display text-3xl md:text-4xl">Pick a type</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCE_CATEGORIES.map((c, i) => {
              const active = category === c.id;
              const count = experiences.filter((e) => e.category === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(active ? null : c.id)}
                  className={cn(
                    "group relative flex min-h-[200px] flex-col justify-between overflow-hidden p-6 text-left transition",
                    active ? "bg-accent" : "bg-[#323628] hover:bg-[#3a4030]",
                  )}
                >
                  {!active && (
                    <Image
                      src={typeVisuals[c.slug] ?? media.forest}
                      alt=""
                      fill
                      className="object-cover opacity-0 transition duration-500 group-hover:opacity-30"
                      sizes="33vw"
                    />
                  )}
                  <div className="relative z-10 flex items-baseline justify-between gap-2">
                    <span className={cn("font-serif text-3xl", active ? "text-on-accent/80" : "text-accent")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-xs tabular-nums opacity-70">{count}</span>
                  </div>
                  <div className="relative z-10 mt-8">
                    <h3 className="font-display text-2xl">{c.id}</h3>
                    <p className={cn("mt-2 text-sm", active ? "text-on-accent/85" : "text-primary-fixed/70")}>
                      {c.blurb}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-primary-fixed/60">Difficulty</span>
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(difficulty === d ? null : d)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  difficulty === d
                    ? "border-accent bg-accent text-on-accent"
                    : "border-white/20 text-primary-fixed/80 hover:border-white/40",
                )}
              >
                {d}
              </button>
            ))}
            {(category || difficulty) && (
              <button
                type="button"
                className="ml-2 text-xs text-accent underline-offset-2 hover:underline"
                onClick={() => {
                  setCategory(null);
                  setDifficulty(null);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <section id="gallery" className="scroll-mt-header bg-surface px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        <div className="mx-auto max-w-container-max">
          <p className="text-sm text-on-surface-variant">
            {filtered.length} {filtered.length === 1 ? "experience" : "experiences"}
            {category ? ` · ${category}` : ""}
          </p>
          <StaggerChildren className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((exp) => (
              <StaggerItem key={exp.slug} className="h-full">
                <ExperienceCard experience={exp} />
              </StaggerItem>
            ))}
          </StaggerChildren>
          {!filtered.length && (
            <p className="py-16 text-center text-on-surface-variant">No experiences in this type yet.</p>
          )}
          <p className="mt-12 text-center text-sm text-on-surface-variant">
            Want several days together?{" "}
            <Link href="/journeys" className="text-accent underline-offset-2 hover:underline">
              Explore journeys
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
