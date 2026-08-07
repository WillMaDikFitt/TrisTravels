"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type Props = {
  src: string;
  alt: string;
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  cta?: { href: string; label: string };
  align?: "left" | "center" | "right";
  height?: "md" | "lg" | "xl";
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  overlay?: "dark" | "soft" | "left" | "none";
  speed?: number;
};

const heights = {
  md: "min-h-[55vh] h-[55vh]",
  lg: "min-h-[70vh] h-[70vh]",
  xl: "min-h-[85vh] h-[85vh]",
};

/**
 * Edge-to-edge image band with scroll parallax — used between denser content blocks.
 */
export function FullBleedParallax({
  src,
  alt,
  eyebrow,
  title,
  body,
  cta,
  align = "left",
  height = "lg",
  className,
  titleClassName,
  contentClassName,
  children,
  overlay = "dark",
  speed = 0.28,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? ["0%", "0%"] : [`-${speed * 40}%`, `${speed * 40}%`],
  );
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1.12, 1]);

  const alignClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
        ? "items-end text-right"
        : "items-start text-left";

  const overlayClass =
    overlay === "none"
      ? ""
      : overlay === "soft"
        ? "bg-gradient-to-t from-black/55 via-black/20 to-black/10"
        : overlay === "left"
          ? "bg-gradient-to-r from-black/75 via-black/40 to-transparent"
          : "bg-gradient-to-t from-black/75 via-black/35 to-black/20";

  return (
    <section
      ref={ref}
      className={cn("relative w-full overflow-hidden", heights[height], className)}
    >
      <motion.div style={{ y, scale }} className="absolute inset-0 h-[140%] w-full -top-[20%]">
        <Image src={src} alt={alt} fill className="object-cover" sizes="100vw" quality={75} />
      </motion.div>
      {overlay !== "none" && <div className={cn("absolute inset-0", overlayClass)} />}
      <div
        className={cn(
          "relative z-10 flex h-full w-full flex-col justify-end px-margin-mobile py-12 md:px-margin-desktop md:py-16",
          alignClass,
        )}
      >
        <div className={cn("max-w-2xl", align === "center" && "mx-auto", contentClassName)}>
          {eyebrow && (
            <p className="label-caps mb-3 tracking-[0.22em] text-white/75">{eyebrow}</p>
          )}
          <h2
            className={cn(
              "font-display text-3xl leading-tight tracking-tight text-white text-shadow-subtle md:text-5xl",
              titleClassName,
            )}
          >
            {title}
          </h2>
          {body && (
            <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">{body}</p>
          )}
          {cta && (
            <Button href={cta.href} variant="light" className="mt-6">
              {cta.label}
            </Button>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}

/** Page hero — inner pages clear the fixed header; home can underlap. */
export function PageHero({
  src,
  alt,
  eyebrow,
  title,
  body,
  primaryCta,
  secondaryCta,
  compact = false,
}: {
  src: string;
  alt: string;
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  primaryCta?: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  compact?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "24%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, reduce ? 1.05 : 1.18]);

  // Compact = inner pages: start below navbar. Full = home: image underlaps nav.
  const clearHeader = compact;

  return (
    <section
      ref={ref}
      className={cn(
        "relative flex w-full items-end overflow-hidden",
        clearHeader ? "pt-header" : "",
        compact
          ? "min-h-[calc(52vh+var(--header-offset))]"
          : "min-h-[85vh] h-[85vh]",
      )}
    >
      <motion.div
        style={{ y, scale }}
        className={cn(
          "absolute inset-x-0 bottom-0 w-full",
          clearHeader ? "top-0 h-[calc(100%+20%)]" : "inset-0 h-[120%]",
        )}
      >
        <Image src={src} alt={alt} fill priority className="object-cover" sizes="100vw" quality={80} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/25" />
      <div
        className={cn(
          "relative z-10 w-full px-margin-mobile pb-10 md:px-margin-desktop md:pb-14",
          clearHeader ? "pt-8 md:pt-10" : "pt-[var(--header-offset)]",
        )}
      >
        <div className="mx-auto max-w-container-max">
          {eyebrow && (
            <p className="label-caps mb-3 tracking-[0.22em] text-white/75">{eyebrow}</p>
          )}
          <h1
            className={cn(
              "max-w-4xl font-display leading-[1.05] tracking-tight text-white text-shadow-subtle",
              compact ? "text-3xl md:text-5xl" : "text-4xl md:text-6xl",
            )}
          >
            {title}
          </h1>
          {body && (
            <p className="mt-4 max-w-xl text-base text-white/85 md:text-lg">{body}</p>
          )}
          {(primaryCta || secondaryCta) && (
            <div className="mt-7 flex flex-wrap gap-3">
              {primaryCta && (
                <Button href={primaryCta.href} variant="light">
                  {primaryCta.label}
                </Button>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className="inline-flex items-center rounded-full border border-white/40 px-6 py-2.5 text-xs font-bold tracking-[0.12em] text-white uppercase transition hover:bg-white/10"
                >
                  {secondaryCta.label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
