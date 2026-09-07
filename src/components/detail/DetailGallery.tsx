"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Grid2x2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isPortrait, isWide } from "@/data/image-meta";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
  children?: React.ReactNode;
};

type Tile = { src: string; index: number; tall: boolean };

/**
 * The supplied photo library mixes tall phone shots with ultrawide panoramas, so the
 * mosaic is built around each photo instead of forcing everything into one crop:
 * a wide photo anchors the feature tile and portraits fill full-height columns.
 */
function buildMosaic(slides: string[]) {
  const wideIndex = slides.findIndex((src) => isWide(src));

  // No wide photo in the set: stand the portraits side by side instead of cropping them.
  if (wideIndex === -1) {
    return {
      mode: "portraits" as const,
      tiles: slides.slice(0, 3).map((src, index) => ({ src, index, tall: true })),
    };
  }

  const feature = { src: slides[wideIndex], index: wideIndex };

  // Two columns of two rows remain beside the feature tile; portraits take a whole column.
  let capacity = 4;
  const tiles: Tile[] = [];
  slides.forEach((src, index) => {
    if (index === wideIndex || capacity <= 0) return;
    const tall = isPortrait(src);
    const cost = tall ? 2 : 1;
    if (cost > capacity) return;
    capacity -= cost;
    tiles.push({ src, index, tall });
  });

  return { mode: "mosaic" as const, feature, tiles, filled: capacity === 0 };
}

export function DetailGallery({ images, alt, children }: Props) {
  const slides = useMemo(() => images.filter(Boolean), [images]);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const open = lightboxAt !== null;

  const close = useCallback(() => setLightboxAt(null), []);
  const step = useCallback(
    (direction: number) =>
      setLightboxAt((current) =>
        current === null ? current : (current + direction + slides.length) % slides.length,
      ),
    [slides.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close, step]);

  const mosaic = useMemo(() => (slides.length ? buildMosaic(slides) : null), [slides]);

  return (
    <section className={cn("bg-background pt-header", children ? "pb-6 md:pb-8" : "pb-4 md:pb-6")}>
      <div className="mx-auto max-w-container-max px-margin-mobile pt-6 md:px-margin-desktop md:pt-8">
        <div className="relative">
          {!mosaic ? (
            <div className="flex min-h-[16rem] items-center justify-center rounded-3xl border border-outline-variant/30 bg-surface-container px-8 py-16 text-center md:min-h-[20rem]">
              <div className="max-w-sm">
                <p className="font-display text-2xl text-primary">Photos coming soon</p>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  We’re still gathering images for {alt}. The rest of this page has the full details.
                </p>
              </div>
            </div>
          ) : mosaic.mode === "portraits" ? (
            <div className="grid h-[24rem] grid-cols-1 gap-2 overflow-hidden rounded-3xl md:h-[32rem] md:grid-cols-3">
              {mosaic.tiles.map((tile, position) => (
                <button
                  key={`${tile.src}-${tile.index}`}
                  type="button"
                  onClick={() => setLightboxAt(tile.index)}
                  aria-label={`Open photo ${tile.index + 1}`}
                  className={cn(
                    "group relative overflow-hidden bg-surface-container",
                    position > 0 && "hidden md:block",
                  )}
                >
                  <Image
                    src={tile.src}
                    alt={position === 0 ? alt : ""}
                    fill
                    priority={position === 0}
                    className="object-cover transition duration-500 group-hover:brightness-95"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="grid h-[20rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:h-[27rem] lg:h-[31rem]">
              <button
                type="button"
                onClick={() => setLightboxAt(mosaic.feature.index)}
                aria-label="Open photo gallery"
                className={cn(
                  "group relative col-span-4 row-span-2 overflow-hidden bg-surface-container",
                  mosaic.tiles.length > 0 && "md:col-span-2",
                )}
              >
                <Image
                  src={mosaic.feature.src}
                  alt={alt}
                  fill
                  priority
                  className="object-cover transition duration-500 group-hover:brightness-95"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </button>

              {mosaic.tiles.map((tile) => (
                <button
                  key={`${tile.src}-${tile.index}`}
                  type="button"
                  onClick={() => setLightboxAt(tile.index)}
                  aria-label={`Open photo ${tile.index + 1}`}
                  className={cn(
                    "group relative hidden overflow-hidden bg-surface-container md:block",
                    tile.tall ? "row-span-2" : "row-span-1",
                    // A single companion photo stretches across both remaining columns.
                    !mosaic.filled && mosaic.tiles.length === 1 && "md:col-span-2",
                  )}
                >
                  <Image
                    src={tile.src}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:brightness-95"
                    sizes="25vw"
                  />
                </button>
              ))}
            </div>
          )}

          {mosaic && slides.length > 1 && (
            <button
              type="button"
              onClick={() => setLightboxAt(0)}
              className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-outline-variant/40 bg-white/95 px-4 py-2.5 text-xs font-semibold text-primary shadow-sm transition hover:bg-white"
            >
              <Grid2x2 size={15} />
              Show all {slides.length} photos
            </button>
          )}
        </div>

        {children ? <div className="mt-6 md:mt-7">{children}</div> : null}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photo gallery`}
          className="fixed inset-0 z-[100] flex flex-col bg-primary/97 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-4 py-4 text-white md:px-8">
            <p className="text-sm text-white/70">
              {(lightboxAt ?? 0) + 1} / {slides.length}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="grid h-10 w-10 place-items-center rounded-full text-white transition hover:bg-white/15"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 md:px-16">
            <div className="relative h-full w-full max-w-5xl">
              <Image
                key={slides[lightboxAt ?? 0]}
                src={slides[lightboxAt ?? 0]}
                alt={alt}
                fill
                className="object-contain"
                sizes="100vw"
                quality={90}
              />
            </div>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 md:left-6"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 md:right-6"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>

          {slides.length > 1 && (
            <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-6">
              {slides.map((src, index) => (
                <button
                  key={`thumb-${src}-${index}`}
                  type="button"
                  onClick={() => setLightboxAt(index)}
                  aria-label={`Show photo ${index + 1}`}
                  className={cn(
                    "relative aspect-[4/3] w-16 shrink-0 overflow-hidden rounded-md transition md:w-20",
                    index === lightboxAt ? "opacity-100 ring-2 ring-accent" : "opacity-50 hover:opacity-90",
                  )}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
