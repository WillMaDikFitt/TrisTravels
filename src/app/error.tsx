"use client";

import { useEffect } from "react";
import { StatusPage } from "@/components/layout/StatusPage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="500"
      eyebrow="A rough patch"
      title="Something went wrong"
      body="We couldn’t load this page cleanly. Try again — if it keeps happening, write to us and we’ll sort it."
      onRetry={reset}
      primary={{ href: "/", label: "Back home" }}
      secondary={{ href: "/contact", label: "Contact TRIS" }}
    />
  );
}
