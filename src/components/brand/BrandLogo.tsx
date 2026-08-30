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
      className={cn("object-contain", className)}
    />
  );
}

export function RecognitionLogos({
  className,
  compact,
  align = "center",
}: {
  className?: string;
  compact?: boolean;
  /** Footer uses end alignment so both marks share a baseline */
  align?: "center" | "end";
}) {
  const logoHeight = compact ? "h-10" : "h-16";
  const meghalayaWidth = compact ? "w-[7.5rem] md:w-32 lg:w-36" : "w-52";
  const nidhiWidth = compact ? "w-[5.5rem] md:w-24 lg:w-28" : "w-48";

  return (
    <div
      className={cn(
        "flex flex-nowrap items-end gap-5 md:gap-6",
        align === "end" ? "justify-end" : "justify-center",
        className,
      )}
    >
      <div className={cn("relative shrink-0", logoHeight, meghalayaWidth)}>
        <Image
          src={MEGHALAYA_SRC}
          alt="Meghalaya Tourism"
          fill
          unoptimized
          className="object-contain object-bottom"
          sizes="220px"
        />
      </div>
      <div className={cn("relative shrink-0", logoHeight, nidhiWidth)}>
        <Image
          src={NIDHI_SRC}
          alt="NIDHI — National Integrated Database of Hospitality Industry"
          fill
          unoptimized
          className="object-contain object-bottom"
          sizes="220px"
        />
      </div>
    </div>
  );
}
