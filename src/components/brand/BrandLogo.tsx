import Image from "next/image";
import { cn } from "@/lib/utils";

/** Cache-bust so browsers pick up the white NIDHI mark */
const NIDHI_SRC = "/brand/nidhi-white.png?v=3";
const MEGHALAYA_SRC = "/brand/meghalaya-tourism.png?v=2";
const TRIS_SRC = "/brand/tris-logo.png?v=2";

export function BrandLogo({
  className,
  priority,
  size = "md",
}: {
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims = {
    sm: { w: 72, h: 72 },
    md: { w: 96, h: 96 },
    lg: { w: 140, h: 140 },
  }[size];

  return (
    <Image
      src={TRIS_SRC}
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
      <div className={cn("relative", compact ? "h-14 w-40" : "h-20 w-52")}>
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
