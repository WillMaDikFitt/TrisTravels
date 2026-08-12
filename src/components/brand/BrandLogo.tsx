import Image from "next/image";
import { cn } from "@/lib/utils";

/** Dark wordmark on cream — no plate behind it */
const NIDHI_SRC = "/brand/nidhi.png?v=1";
const MEGHALAYA_SRC = "/brand/meghalaya-tourism.png?v=2";
/** Cream mark on dark fields (hero overlay). */
export const TRIS_LOGO_ON_DARK = "/brand/tris-logo.png?v=2";
/** Dark line-art mark on cream / white surfaces. */
export const TRIS_LOGO_ON_LIGHT = "/brand/tris-logo-on-light.png?v=1";

export function BrandLogo({
  className,
  priority,
  size = "md",
  on = "light",
}: {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
  /** `light` = dark logo for cream backgrounds; `dark` = cream logo for photos/olive bands */
  on?: "light" | "dark";
}) {
  const dims = {
    sm: { w: 72, h: 72 },
    md: { w: 96, h: 96 },
    lg: { w: 140, h: 140 },
  }[size];

  return (
    <Image
      src={on === "dark" ? TRIS_LOGO_ON_DARK : TRIS_LOGO_ON_LIGHT}
      alt="TRIS Travels"
      width={dims.w}
      height={dims.h}
      priority={priority}
      unoptimized
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}

export function RecognitionLogos({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-8 md:gap-14",
        className,
      )}
    >
      <div className={cn("relative", compact ? "h-12 w-40" : "h-16 w-52")}>
        <Image
          src={MEGHALAYA_SRC}
          alt="Meghalaya Tourism"
          fill
          unoptimized
          className="object-contain"
          sizes="220px"
        />
      </div>
      <div className={cn("relative", compact ? "h-14 w-36" : "h-[4.5rem] w-48")}>
        <Image
          src={NIDHI_SRC}
          alt="NIDHI — National Integrated Database of Hospitality Industry"
          fill
          unoptimized
          className="object-contain"
          sizes="220px"
        />
      </div>
    </div>
  );
}
