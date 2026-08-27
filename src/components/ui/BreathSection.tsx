"use client";

import { FadeIn } from "@/components/motion/Motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/** Intentional white-space / editorial pause between dense image bands. */
export function BreathSection({
  eyebrow,
  title,
  body,
  cta,
  className,
  size = "md",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  body?: string;
  cta?: { href: string; label: string };
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const padding =
    size === "sm" ? "py-16 md:py-20" : size === "lg" ? "py-24 md:py-32" : "py-20 md:py-28";

  return (
    <section className={cn("bg-surface", padding, className)}>
      <FadeIn className="mx-auto max-w-3xl px-margin-mobile text-center md:px-margin-desktop">
        {eyebrow ? <p className="label-caps text-highlight">{eyebrow}</p> : null}
        <h2
          className={cn(
            "font-[family-name:var(--font-playfair)] text-[1.75rem] leading-tight font-medium text-pretty text-primary",
            "md:text-[2.15rem] lg:text-[2.35rem]",
            eyebrow ? "mt-3" : "mt-0",
          )}
        >
          {title}
        </h2>
        {body ? (
          <p className="mx-auto mt-3 max-w-xl text-[0.95rem] leading-relaxed text-on-surface-variant md:text-base">
            {body}
          </p>
        ) : null}
        {cta ? (
          <Button href={cta.href} size="lg" className="mt-8">
            {cta.label}
          </Button>
        ) : null}
      </FadeIn>
    </section>
  );
}
