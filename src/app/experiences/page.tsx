import { Suspense } from "react";
import { experiences as staticExperiences } from "@/data/experiences";
import { listExperiences } from "@/lib/data/repo";
import { ExperiencesBrowser } from "./ExperiencesBrowser";

export const metadata = { title: "Experiences" };
export const revalidate = 60;

export default async function ExperiencesPage() {
  const items = await listExperiences().catch(() => staticExperiences);
  return (
    <Suspense fallback={<div className="pt-header p-12 text-on-surface-variant">Loading experiences…</div>}>
      <ExperiencesBrowser experiences={items} />
    </Suspense>
  );
}
