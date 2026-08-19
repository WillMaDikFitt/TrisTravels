"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  artisanHub,
  craftCategories,
  craftProcess,
  craftProducts,
  type CraftCategory,
} from "@/data/artisans";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { Button } from "@/components/ui/Button";
import { CraftCard } from "@/components/listings/CraftCard";

export function ArtisansPageClient() {
  const [category, setCategory] = useState<CraftCategory | "All" | "Best Sellers">("All");

  const filtered = useMemo(() => {
    if (category === "All") return craftProducts;
    if (category === "Best Sellers") return craftProducts.filter((p) => p.bestSeller);
    return craftProducts.filter((p) => p.category === category);
  }, [category]);

  return (
    <div className="bg-background">
      <PageHero
        src={media.craft}
        alt="Artisan's Hub"
        compact
        eyebrow={artisanHub.eyebrow}
        title={artisanHub.title}
        body={`${artisanHub.tagline}. ${artisanHub.closing}`}
        primaryCta={{ href: "#hub", label: "Browse crafts" }}
        secondaryCta={{ href: "/contact", label: "Connect with a maker" }}
      />

      <BreathSection
        size="md"
        eyebrow="Why this exists"
        title="Sourcing local crafts shouldn’t be a scavenger hunt"
        body={artisanHub.intro[0]}
      />

      <section className="border-y border-outline-variant/20 bg-surface-container-low">
        <div className="mx-auto grid max-w-container-max gap-0 sm:grid-cols-3">
          {artisanHub.rules.map((r) => (
            <div
              key={r.label}
              className="border-b border-outline-variant/20 px-margin-mobile py-6 last:border-b-0 sm:border-r sm:border-b-0 sm:px-8 sm:last:border-r-0 md:px-10"
            >
              <p className="label-caps text-primary">{r.label}</p>
              <p className="mt-2 font-display text-xl text-secondary">{r.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div id="hub" className="scroll-mt-header bg-surface py-12 md:py-16">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn className="max-w-2xl">
            <p className="label-caps text-primary">From our network</p>
            <h2 className="mt-2 font-display text-3xl text-secondary md:text-4xl">
              Crafts we can help you source
            </h2>
            <p className="mt-3 text-on-surface-variant">{artisanHub.intro[2]}</p>
          </FadeIn>

          <div className="mt-8 flex flex-wrap gap-2">
            {(["All", "Best Sellers", ...craftCategories] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition",
                  category === c
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/40 text-on-surface-variant hover:border-secondary/40 hover:text-secondary",
                )}
              >
                {c === "Best Sellers" ? "Featured" : c}
              </button>
            ))}
          </div>

          <StaggerChildren
            key={category}
            mode="mount"
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((p) => (
              <StaggerItem key={p.slug}>
                <CraftCard product={p} />
              </StaggerItem>
            ))}
          </StaggerChildren>

          <FadeIn className="mt-12 rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div className="max-w-xl">
              <p className="label-caps text-primary">Can’t find what you need?</p>
              <p className="mt-2 text-on-surface-variant">{artisanHub.giftBoxNote}</p>
            </div>
            <Button href="/contact" className="mt-5 shrink-0 md:mt-0">
              Connect with a maker
            </Button>
          </FadeIn>
        </div>
      </div>

      <BreathSection
        size="sm"
        eyebrow="How it works"
        title="From interest to supplier"
        body="Four steps — we handle the hard part of finding who’s available and ready to supply."
      />

      <StaggerChildren className="mx-auto grid max-w-container-max gap-4 px-margin-mobile pb-16 sm:grid-cols-2 lg:grid-cols-4 md:px-margin-desktop">
        {craftProcess.map((p) => (
          <StaggerItem key={p.step}>
            <div className="overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-low">
              <div className="relative aspect-square">
                <Image src={p.image} alt={p.title} fill className="object-cover" sizes="25vw" />
                <span className="absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                  {p.step}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-secondary">{p.title}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{p.description}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <FullBleedParallax
        src={media.valueGivesBack}
        alt="Community impact"
        eyebrow="Local supply"
        title="The right craft, from the right hands"
        body="When availability is uncertain, we connect you with suppliers in the communities that power TRIS journeys."
        cta={{ href: "/contact", label: "Connect with a maker" }}
        height="lg"
        align="left"
        overlay="left"
        contentClassName="max-w-5xl"
      />
    </div>
  );
}
