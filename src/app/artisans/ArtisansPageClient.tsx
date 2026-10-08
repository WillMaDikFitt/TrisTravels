"use client";

import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { Fragment, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Handshake,
  MapPin,
  Star,
  Truck,
} from "lucide-react";
import {
  makerCategoryLabels,
  type CraftsPageCopy,
  type ResolvedCraftMaker,
} from "@/data/artisans";
import { cn } from "@/lib/utils";
import {
  FadeIn,
  StaggerChildren,
  StaggerItem,
} from "@/components/motion/Motion";
import { PhotoPlaceholder } from "@/components/listings/PhotoPlaceholder";

const script = Caveat({ subsets: ["latin"], weight: ["500"], display: "swap" });

const connectorIcons = [Truck, CalendarDays, CreditCard];

export function ArtisansPageClient({
  makers,
  copy,
}: {
  makers: ResolvedCraftMaker[];
  copy: CraftsPageCopy;
}) {
  const chips = useMemo(
    () => [
      "All",
      ...new Set(makers.map((m) => makerCategoryLabels[m.category])),
    ],
    [makers],
  );
  const [chip, setChip] = useState("All");

  const filtered =
    chip === "All"
      ? makers
      : makers.filter((m) => makerCategoryLabels[m.category] === chip);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-container pt-header">
        {copy.heroImage && (
          <Image
            src={copy.heroImage}
            alt={copy.heroTitle}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={85}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative mx-auto grid max-w-container-max gap-8 px-margin-mobile pt-6 pb-14 md:grid-cols-[1.4fr_1fr] md:px-margin-desktop md:pt-8 md:pb-20">
          <div>
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-xs text-white/75"
            >
              <Link href="/" className="hover:text-white">
                Home
              </Link>
              <ChevronRight size={12} aria-hidden />
              <span>Local Products</span>
              <ChevronRight size={12} aria-hidden />
              <span className="text-white">{copy.heroTitle}</span>
            </nav>
            <h1 className="mt-6 max-w-xl font-serif text-5xl leading-[1.02] text-white md:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-5 max-w-lg font-serif text-xl leading-snug text-white/95 md:text-2xl">
              {copy.heroSubtitle}
            </p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              {copy.heroBody}
            </p>
          </div>
          <p
            className={cn(
              script.className,
              "hidden -rotate-6 self-center justify-self-center text-4xl leading-tight text-white/90 md:block lg:text-5xl",
            )}
            aria-hidden
          >
            {copy.heroScript.split("\n").map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                <span className={i % 2 ? "pl-4" : undefined}>{line}</span>
              </Fragment>
            ))}
          </p>
        </div>
      </section>

      {/* Makers */}
      <section id="hub" className="scroll-mt-header py-12 md:py-16">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-12">
            <div>
              <h2 className="font-serif text-4xl text-secondary md:text-5xl">
                {copy.makersTitle}
              </h2>
              <p className="mt-2 font-serif text-lg text-on-surface-variant md:text-xl">
                {copy.makersSubtitle}
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-on-surface-variant">
              {copy.makersNote}
            </p>
          </FadeIn>

          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={cn(
                  "rounded-full border px-5 py-2 text-[11px] font-bold tracking-wider uppercase transition",
                  chip === c
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/50 bg-surface-container-lowest text-secondary hover:border-secondary/50",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <StaggerChildren key={chip} mode="mount" className="mt-8 space-y-5">
            {filtered.map((m) => (
              <StaggerItem key={m.slug}>
                <MakerCard maker={m} />
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* Connector, not seller */}
          <FadeIn className="mt-10 grid gap-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 md:grid-cols-[1.6fr_repeat(3,1fr)] md:items-center md:gap-0 md:p-7">
            <div className="flex items-center gap-4 md:pr-6">
              <Handshake
                size={40}
                strokeWidth={1.25}
                className="shrink-0 text-secondary"
                aria-hidden
              />
              <div>
                <p className="font-serif text-xl text-secondary">
                  {copy.connectorTitle}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {copy.connectorBody}
                </p>
              </div>
            </div>
            {copy.connectorNotes.map(({ title, detail }, i) => {
              const Icon = connectorIcons[i] ?? Truck;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 border-outline-variant/30 text-sm text-secondary md:flex-col md:gap-1.5 md:border-l md:px-4 md:text-center"
                >
                  <Icon size={24} strokeWidth={1.5} aria-hidden />
                  <p>
                    {title}
                    <span className="block text-xs text-on-surface-variant">
                      {detail}
                    </span>
                  </p>
                </div>
              );
            })}
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

function MakerCard({ maker }: { maker: ResolvedCraftMaker }) {
  // Four thumbnails: gallery photos first, then craft photos — never repeating the main photo.
  const thumbs = [
    ...new Set([...maker.gallery, ...maker.crafts.map((c) => c.image)]),
  ]
    .filter((src) => src && src !== maker.image)
    .slice(0, 4);
  return (
    <article className="grid overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest md:grid-cols-[2fr_3fr]">
      <Link
        href={`/artisans/${maker.slug}`}
        className="relative block aspect-[4/3] md:aspect-auto md:min-h-[17rem]"
      >
        {maker.image ? (
          <Image
            src={maker.image}
            alt={maker.name}
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 40vw"
          />
        ) : (
          <PhotoPlaceholder iconSize={40} />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest/95 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-secondary uppercase">
          <Star size={11} className="fill-current" aria-hidden />
          TRIS curated
        </span>
      </Link>

      <div className="flex flex-col p-5 md:p-7">
        <p className="text-[11px] font-bold tracking-[0.14em] text-secondary uppercase">
          {makerCategoryLabels[maker.category]}
        </p>
        <h3 className="mt-1.5 font-serif text-2xl text-secondary md:text-3xl">
          <Link href={`/artisans/${maker.slug}`} className="hover:underline">
            {maker.name}
          </Link>
        </h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-on-surface-variant">
          <MapPin size={14} className="text-secondary" aria-hidden />
          {maker.location}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          {maker.story}
        </p>

        <div
          className={cn(
            "mt-4 border-t border-outline-variant/30 pt-3",
            !maker.crafts.length && "hidden",
          )}
        >
          <p className="text-[11px] font-bold tracking-[0.14em] text-secondary uppercase">
            What they make
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {maker.crafts.map((c) => (
              <span
                key={c.slug}
                className="rounded-full bg-surface-container-low px-3 py-1 text-xs text-on-surface-variant"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {thumbs.map((src) => (
              <Link
                key={src}
                href={`/artisans/${maker.slug}`}
                className="relative h-16 w-20 overflow-hidden rounded-lg bg-surface-container md:h-[4.5rem] md:w-24"
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition hover:scale-105"
                  sizes="96px"
                />
              </Link>
            ))}
          </div>
          <Link
            href={`/artisans/${maker.slug}`}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-6 py-3 text-[11px] font-bold tracking-[0.12em] text-on-primary uppercase transition hover:opacity-90 lg:self-auto"
          >
            Connect with maker
            <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
