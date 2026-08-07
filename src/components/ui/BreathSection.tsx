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
      <FadeIn className="mx-auto max-w-2xl px-margin-mobile text-center md:px-margin-desktop">
        {eyebrow && <p className="label-caps text-accent">{eyebrow}</p>}
        <h2 className="mt-3 font-display text-3xl tracking-tight text-primary md:text-4xl">
          {title}
        </h2>
        {body && (
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            {body}
          </p>
        )}
        {cta && (
          <Button href={cta.href} variant="ghost" className="mt-8">
            {cta.label}
          </Button>
        )}
      </FadeIn>
    </section>
  );
}
