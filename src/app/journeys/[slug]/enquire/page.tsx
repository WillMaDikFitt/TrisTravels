import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { journeys } from "@/data/journeys";
import { findJourney } from "@/lib/data/repo";
import { JourneyEnquireFlow } from "@/components/enquiries/JourneyEnquireFlow";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journeys.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  if (!journey) return { title: "Enquire" };
  return {
    title:
      journey.type === "small-group"
        ? `Book · ${journey.name}`
        : `Enquire · ${journey.name}`,
  };
}

export default async function JourneyEnquirePage({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  if (!journey) notFound();
  const fixed = journey.type === "small-group";

  return (
    <div className="bg-background">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/25" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-margin-mobile pb-16 pt-8 md:px-margin-desktop md:pb-20">
            <div className="mx-auto max-w-container-max">
              <p className="label-caps text-white/75">{fixed ? "Reservation" : "Enquiry"}</p>
              <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">{journey.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                {fixed
                  ? "Choose your departure, travellers, stay, and transport preferences."
                  : "Share your preferred dates and travel needs. We’ll shape the right journey with you."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-8 max-w-container-max px-margin-mobile pb-16 md:-mt-10 md:px-margin-desktop md:pb-24">
        <Suspense fallback={<p className="text-on-surface-variant">Loading form…</p>}>
          <JourneyEnquireFlow journey={journey} />
        </Suspense>
      </div>
    </div>
  );
}
