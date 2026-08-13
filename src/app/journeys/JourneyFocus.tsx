"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

function useJourneyFocus() {
  const type = useSearchParams().get("type");
  return type === "small-group" || type === "curated" ? type : null;
}

export function JourneyTypeTabs() {
  const focus = useJourneyFocus();

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Link
        href="/journeys?type=curated"
        className={cn(
          "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
          focus === "curated" || !focus
            ? "border-primary bg-primary text-on-primary"
            : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
        )}
      >
        Curated packages
      </Link>
      <Link
        href="/journeys?type=small-group"
        className={cn(
          "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
          focus === "small-group"
            ? "border-primary bg-primary text-on-primary"
            : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
        )}
      >
        Small group
      </Link>
      <Link
        href="/craft-my-journey"
        className="rounded-full border border-dashed border-outline-variant/50 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:border-accent hover:text-accent"
      >
        Craft my journey
      </Link>
    </div>
  );
}

export function JourneyFocusSections({
  small,
  curated,
}: {
  small: React.ReactNode;
  curated: React.ReactNode;
}) {
  const focus = useJourneyFocus();
  return (
    <>
      {(!focus || focus === "small-group") && small}
      {(!focus || focus === "curated") && curated}
    </>
  );
}
