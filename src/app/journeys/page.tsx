import { Suspense } from "react";
import { journeys } from "@/data/journeys";
import { listJourneys } from "@/lib/data/repo";
import { JourneysBrowser } from "./JourneysBrowser";

export const metadata = { title: "Journeys" };
export const revalidate = 60;

export default async function JourneysPage() {
  const all = await listJourneys().catch(() => journeys);
  return (
    <Suspense fallback={<div className="pt-header p-12 text-on-surface-variant">Loading journeys…</div>}>
      <JourneysBrowser journeys={all} />
    </Suspense>
  );
}
