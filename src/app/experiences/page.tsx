"use client";

import { useMemo, useState } from "react";
import { experiences, type Difficulty } from "@/data/experiences";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { ExperienceCard } from "@/components/listings/ExperienceCard";
import { Snail, Mountain, Users } from "lucide-react";

const locations = ["Sohra", "East Khasi Hills", "Jaintia Hills"];
const difficulties: Difficulty[] = ["Easy", "Moderate", "Challenging"];

export default function ExperiencesPage() {
  const [location, setLocation] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [spirit, setSpirit] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (location.length && !location.includes(e.region)) return false;
      if (difficulty && e.difficulty !== difficulty) return false;
      if (spirit === "family" && !e.suitableFor.some((s) => s.toLowerCase().includes("famil")))
        return false;
      if (spirit === "slow" && e.difficulty === "Challenging") return false;
      if (spirit === "thrill" && e.category !== "Adventure") return false;
      return true;
    });
  }, [location, difficulty, spirit]);

  const toggleLoc = (loc: string) => {
    setLocation((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  };

  return (
    <div className="bg-background">
      <PageHero
        src={media.heroMist}
        alt="Meghalaya hills"
        compact
        eyebrow="Experiences"
        title="Explore Experiences"
        body="Curated immersions led by local custodians — from a few hours to a full day."
        primaryCta={{ href: "#gallery", label: "Browse all" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Need a custom day?" }}
      />

      <BreathSection
        size="sm"
        eyebrow="Discover"
        title="Choose your pace"
        body="Filter by place, difficulty, or spirit — then open an experience to check availability and book online."
      />

      <div id="gallery" className="scroll-mt-header border-y border-outline-variant/20">
        <div className="mx-auto grid max-w-container-max lg:grid-cols-[240px_1fr]">
          <aside className="border-b border-outline-variant/20 bg-surface-container-low p-6 lg:border-r lg:border-b-0 lg:py-10">
            <h2 className="label-caps text-primary">Location</h2>
            <ul className="mt-3 space-y-2">
              {locations.map((loc) => (
                <li key={loc}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
                    <input
                      type="checkbox"
                      checked={location.includes(loc)}
                      onChange={() => toggleLoc(loc)}
                      className="rounded border-outline-variant text-accent focus:ring-accent"
                    />
                    {loc}
                  </label>
                </li>
              ))}
            </ul>
            <h2 className="label-caps mt-8 text-primary">Difficulty</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {difficulties.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(difficulty === d ? null : d)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    difficulty === d
                      ? "border-primary bg-primary text-on-primary"
                      : "border-outline-variant text-on-surface-variant hover:border-accent",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-8 text-sm text-accent underline-offset-2 hover:underline"
              onClick={() => {
                setLocation([]);
                setDifficulty(null);
                setSpirit(null);
              }}
            >
              Clear filters
            </button>
          </aside>

          <div className="bg-surface">
            <StaggerChildren className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 lg:p-6">
              {filtered.map((exp) => (
                <StaggerItem key={exp.slug}>
                  <ExperienceCard experience={exp} />
                </StaggerItem>
              ))}
            </StaggerChildren>

            {!filtered.length && (
              <p className="p-12 text-center text-on-surface-variant">
                No experiences match these filters.
              </p>
            )}
          </div>
        </div>
      </div>

      <BreathSection size="sm" eyebrow="Select by spirit" title="How do you want to feel?" />

      <div className="mx-auto grid max-w-container-max gap-4 px-margin-mobile pb-16 md:grid-cols-3 md:px-margin-desktop">
        {[
          { id: "slow", label: "Slow Paced", icon: Snail, blurb: "Quiet walks, village time, unhurried meals." },
          { id: "thrill", label: "Thrill Seeking", icon: Mountain, blurb: "Treks, caves, and active days outdoors." },
          { id: "family", label: "Family Friendly", icon: Users, blurb: "Gentle paces and shared experiences." },
        ].map(({ id, label, icon: Icon, blurb }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSpirit(spirit === id ? null : id)}
            className={cn(
              "rounded-2xl border px-6 py-6 text-left transition",
              spirit === id
                ? "border-primary bg-primary/15 text-primary"
                : "border-outline-variant/30 bg-surface-container-low hover:border-accent/40",
            )}
          >
            <Icon className="text-accent" size={22} />
            <h3 className="mt-4 font-display text-xl text-primary">{label}</h3>
            <p className="mt-2 text-sm text-on-surface-variant">{blurb}</p>
          </button>
        ))}
      </div>

      <FullBleedParallax
        src={media.ride}
        alt="Road journey through Meghalaya hills"
        eyebrow="Optional add-on"
        title="Trusted Local Ride Service"
        body="Add verified local drivers during booking — transparent pricing, community powered."
        height="md"
        align="left"
        overlay="left"
      />

      <BreathSection
        size="md"
        eyebrow="Prefer a full itinerary?"
        title="Explore multi-day journeys"
        body="Curated and small-group journeys across Meghalaya — or craft one entirely around you."
        cta={{ href: "/journeys", label: "View journeys" }}
      />
    </div>
  );
}
