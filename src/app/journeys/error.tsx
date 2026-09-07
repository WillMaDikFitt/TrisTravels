"use client";

import { StatusPage } from "@/components/layout/StatusPage";

export default function JourneysError({ reset }: { reset: () => void }) {
  return (
    <StatusPage
      eyebrow="Journeys"
      title="This page couldn’t load"
      body="Something went wrong while loading journeys. Try again, or browse experiences instead."
      onRetry={reset}
      primary={{ href: "/experiences", label: "Browse experiences" }}
      secondary={{ href: "/", label: "Back home" }}
    />
  );
}
