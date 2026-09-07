import Image from "next/image";
import { cn } from "@/lib/utils";

/** Shared empty media state for listing cards / detail heroes. */
export function MediaEmptyState({
  label = "Photos coming soon",
  className,
  tone = "light",
}: {
  label?: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center px-8 py-10 text-center",
        tone === "light" ? "bg-surface-container text-on-surface-variant" : "bg-primary/90 text-white/75",
        className,
      )}
    >
      <p className="max-w-[14rem] text-sm leading-relaxed font-medium tracking-wide">{label}</p>
    </div>
  );
}

export function listingImageSrc(value: unknown, gallery?: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(gallery)) {
    for (const item of gallery) {
      if (typeof item === "string" && item.trim()) return item.trim();
    }
  }
  return null;
}

/** Fill-parent media for listing cards. */
export function ListingCardMedia({
  src,
  alt,
  sizes,
  quality = 85,
  className,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  quality?: number;
  className?: string;
}) {
  if (!src) {
    return <MediaEmptyState className="absolute inset-0" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={cn(
        "object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,_1,_0.36,_1)] group-hover:scale-[1.04]",
        className,
      )}
      sizes={sizes}
      quality={quality}
    />
  );
}
