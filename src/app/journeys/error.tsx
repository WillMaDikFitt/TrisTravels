"use client";

import Link from "next/link";

export default function JourneysError({ reset }: { reset: () => void }) {
  return (
    <div className="bg-background pt-header">
      <div className="mx-auto max-w-xl px-margin-mobile py-20 md:px-margin-desktop">
        <p className="label-caps text-accent">Journeys</p>
        <h1 className="mt-3 font-display text-3xl text-primary">This page couldn’t load</h1>
        <p className="mt-3 text-on-surface-variant">
          Something went wrong while loading journeys. Try again, or browse experiences instead.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
          >
            Try again
          </button>
          <Link
            href="/experiences"
            className="rounded-full border border-outline-variant/40 px-5 py-2.5 text-sm font-semibold text-secondary"
          >
            Browse experiences
          </Link>
        </div>
      </div>
    </div>
  );
}
