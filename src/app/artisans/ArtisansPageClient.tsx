"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter, Source_Serif_4 } from "next/font/google";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Handshake,
  MapPin,
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

const heroSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
const heroSans = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

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
            className="object-cover object-[70%_center]"
            sizes="100vw"
            quality={85}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent md:via-black/30" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
        <div className="relative mx-auto flex min-h-[520px] max-w-container-max items-center px-margin-mobile pt-10 pb-16 md:min-h-[640px] md:px-margin-desktop md:pt-14 md:pb-24">
          <FadeIn className={cn(heroSans.className, "max-w-xl")}>
            <p className="text-[11px] font-medium tracking-[0.25em] text-white/85 uppercase">
              Local Products
            </p>
            <h1
              className={cn(
                heroSerif.className,
                "mt-5 text-5xl leading-[1.05] font-normal tracking-tight text-white drop-shadow-sm md:text-7xl",
              )}
            >
              {copy.heroTitle}
            </h1>
            <p
              className={cn(
                heroSerif.className,
                "mt-5 max-w-lg text-xl leading-snug text-[#F2DFAE] drop-shadow-sm md:text-2xl",
              )}
            >
              {copy.heroSubtitle}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90 drop-shadow-sm md:text-base">
              {copy.heroBody}
            </p>
            <Link
              href="#hub"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/60 bg-primary/85 px-7 py-3.5 text-xs font-medium tracking-wider text-white uppercase shadow-lg shadow-black/20 backdrop-blur-sm transition hover:border-white hover:bg-primary"
            >
              Meet the makers
              <ArrowRight size={14} aria-hidden />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Makers */}
      <section
        id="hub"
        className={cn(heroSans.className, "scroll-mt-header py-12 md:py-16")}
      >
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <FadeIn>
            <h2
              className={cn(
                heroSerif.className,
                "text-4xl font-medium tracking-tight text-on-surface md:text-5xl",
              )}
            >
              {copy.makersTitle}
            </h2>
            <p
              className={cn(
                heroSerif.className,
                "mt-2 text-lg text-on-surface-variant md:text-xl",
              )}
            >
              {copy.makersSubtitle}
            </p>
          </FadeIn>

          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChip(c)}
                className={cn(
                  "rounded-full border px-5 py-2 text-xs font-medium transition",
                  chip === c
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/60 bg-surface-container-lowest text-on-surface hover:border-primary/50",
                )}
              >
                {c}
              </button>
            ))}
          </div>

          {!makers.length && (
            <p className="mt-6 rounded-xl border border-dashed border-outline-variant/60 p-10 text-center text-sm text-on-surface-variant">
              New makers are being added — check back soon.
            </p>
          )}

          <StaggerChildren key={chip} mode="mount" className="mt-6 space-y-3">
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
  // Three thumbnails: gallery photos first, then craft photos — never repeating the main photo.
  const extras = [
    ...new Set([...maker.gallery, ...maker.crafts.map((c) => c.image)]),
  ].filter((src) => src && src !== maker.image);
  const thumbs = extras.slice(0, 3);
  // Photos past the first three live on the profile; the last thumbnail says how many.
  const more = extras.length - thumbs.length;
  return (
    <article className="grid gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-3 shadow-sm md:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)_minmax(0,1.2fr)] md:gap-5">
      <Link
        href={`/artisans/${maker.slug}`}
        className="relative block aspect-[4/3] overflow-hidden rounded-lg md:aspect-auto md:min-h-[11rem]"
      >
        {maker.image ? (
          <Image
            src={maker.image}
            alt={maker.name}
            fill
            className="object-cover transition duration-500 hover:scale-105"
            sizes="(max-width:768px) 100vw, 30vw"
          />
        ) : (
          <PhotoPlaceholder iconSize={40} />
        )}
      </Link>

      <div className="flex flex-col px-1 md:px-0 md:py-1">
        <h3
          className={cn(
            heroSerif.className,
            "text-2xl font-medium text-on-surface md:text-[1.6rem]",
          )}
        >
          <Link href={`/artisans/${maker.slug}`} className="hover:underline">
            {maker.name}
          </Link>
        </h3>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-on-surface-variant">
          <span className="font-semibold tracking-[0.12em] text-on-surface uppercase">
            {makerCategoryLabels[maker.category]}
          </span>
          <span className="text-outline-variant" aria-hidden>
            |
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} className="text-red-600" aria-hidden />
            {maker.location}
          </span>
        </p>
        <p className="mt-2.5 line-clamp-4 text-[13px] leading-relaxed text-on-surface-variant">
          {maker.story}
        </p>
        {maker.crafts.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-3">
            {maker.crafts.slice(0, 3).map((c) => (
              <span
                key={c.slug}
                className="rounded-full border border-outline-variant/60 px-3 py-1 text-[11px] text-on-surface"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 px-1 pb-1 md:px-0 md:py-1">
        <div className="grid grid-cols-3 gap-2">
          {thumbs.map((src, i) => (
            <Link
              key={src}
              href={`/artisans/${maker.slug}`}
              className="relative aspect-square overflow-hidden rounded-md bg-surface-container"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover transition hover:scale-105"
                sizes="(max-width:768px) 33vw, 120px"
              />
              {more > 0 && i === thumbs.length - 1 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-medium text-white">
                  +{more}
                  <span className="sr-only"> more photos</span>
                </span>
              )}
            </Link>
          ))}
        </div>
        <Link
          href={`/artisans/${maker.slug}`}
          className="inline-flex items-center justify-center gap-2 self-stretch rounded-full bg-primary px-6 py-3 text-[11px] font-semibold tracking-[0.1em] text-on-primary uppercase transition hover:opacity-90 md:self-end"
        >
          Connect with the maker
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </article>
  );
}
