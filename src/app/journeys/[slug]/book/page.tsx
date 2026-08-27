import Image from "next/image";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { journeys } from "@/data/journeys";
import { findJourney } from "@/lib/data/repo";
import { CuratedBookFlow } from "@/components/booking/CuratedBookFlow";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journeys.filter((j) => j.type === "curated").map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  if (!journey) return { title: "Book" };
  return { title: `Book · ${journey.name}` };
}

export default async function JourneyBookPage({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  if (!journey) notFound();
  if (journey.type !== "curated") redirect(`/journeys/${slug}/enquire`);

  return (
    <div className="bg-surface">
      <div className="relative min-h-[calc(300px+var(--header-offset))] overflow-hidden pt-header md:min-h-[calc(340px+var(--header-offset))]">
        <Image
          src={journey.image}
          alt={journey.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#364037]/95 via-[#364037]/50 to-black/25" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-margin-mobile pb-16 pt-8 md:px-margin-desktop md:pb-20">
            <div className="mx-auto max-w-container-max">
              <p className="label-caps text-white/75">Book now</p>
              <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">{journey.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                Choose transport and stay — your total updates on the right. 50% to confirm; balance due 20 days
                before travel.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile pt-8 pb-16 md:px-margin-desktop md:pt-10 md:pb-24">
        <Suspense fallback={<p className="text-on-surface-variant">Loading booking…</p>}>
          <CuratedBookFlow journey={journey} />
        </Suspense>
      </div>
    </div>
  );
}
