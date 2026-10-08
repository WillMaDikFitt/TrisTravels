"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, LayoutPanelLeft, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { PhotoPlaceholder } from "./PhotoPlaceholder";

type Props = {
  /** First photo is the main one (shown biggest); the rest fill the collage. */
  images: string[];
  alt: string;
  /** Shown above the photos, e.g. breadcrumbs. */
  children?: ReactNode;
  /** Small label pill on the main photo. */
  badge?: string;
};

/** Collage of up to five photos beside a big main one, with a full-screen viewer. */
export function MakerGallery({ images, alt, children, badge }: Props) {
  const [at, setAt] = useState<number | null>(null);
  const open = at !== null;
  const count = images.length;
  const [main, ...rest] = images;
  const tiles = rest.slice(0, 4);
  const hidden = rest.length - tiles.length;

  const close = useCallback(() => setAt(null), []);
  const step = useCallback(
    (dir: number) => setAt((i) => (i === null ? i : (i + dir + count) % count)),
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  // Swipe left / right on touch screens.
  const touchX = useRef<number | null>(null);

  // Tile placement on a 4×2 grid where the main photo takes the left half.
  const tileClass = (i: number) => {
    const n = tiles.length;
    if (n === 1) return "col-span-2 row-span-2";
    if (n === 2) return "col-span-2";
    if (n === 3 && i === 0) return "col-span-2";
    return "";
  };

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile pt-5 pb-6 md:px-margin-desktop md:pt-6 md:pb-8">
      {children}
      <div className="relative mt-4">
        {!main ? (
          <div className="relative h-56 overflow-hidden rounded-3xl md:h-72">
            <PhotoPlaceholder iconSize={48} />
          </div>
        ) : (
          <div className="grid h-[20rem] grid-cols-4 grid-rows-2 gap-2.5 overflow-hidden rounded-3xl md:h-[28rem] lg:h-[34rem]">
            <button
              type="button"
              onClick={() => setAt(0)}
              aria-label="Open photo 1"
              className={cn(
                "group relative col-span-4 row-span-2 overflow-hidden bg-surface-container",
                tiles.length > 0 && "md:col-span-2",
              )}
            >
              <Image
                src={main}
                alt={alt}
                fill
                priority
                className="object-cover transition duration-500 group-hover:scale-[1.02]"
                sizes="(min-width:768px) 50vw, 100vw"
              />
            </button>
            {tiles.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setAt(i + 1)}
                aria-label={`Open photo ${i + 2}`}
                className={cn(
                  "group relative hidden overflow-hidden bg-surface-container md:block",
                  tileClass(i),
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="25vw"
                />
                {hidden > 0 && i === tiles.length - 1 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 font-serif text-3xl text-white">
                    +{hidden}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {badge ? (
          <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.14em] text-secondary uppercase shadow-sm">
            {badge}
          </span>
        ) : null}

        {count > 1 && (
          <button
            type="button"
            onClick={() => setAt(0)}
            className="absolute right-4 bottom-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-secondary shadow-md transition hover:bg-surface-container-lowest"
          >
            <LayoutPanelLeft size={16} aria-hidden />
            View Gallery
          </button>
        )}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photos`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm text-white/80 md:px-6">
            <span>
              {at + 1} / {count}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-full p-2 text-white transition hover:bg-white/10"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              key={images[at]}
              src={images[at]}
              alt={`${alt} — photo ${at + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              quality={90}
              onClick={(e) => e.stopPropagation()}
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/30 md:left-6"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white backdrop-blur transition hover:bg-white/30 md:right-6"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>

          {count > 1 && (
            <div
              className="flex justify-center gap-2 overflow-x-auto px-4 py-3"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setAt(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition",
                    i === at
                      ? "ring-2 ring-white"
                      : "opacity-50 hover:opacity-90",
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
