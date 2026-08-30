import Image from "next/image";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { journeys } from "@/data/journeys";
import { findJourney } from "@/lib/data/repo";
import { JourneyEnquireFlow } from "@/components/enquiries/JourneyEnquireFlow";
import {
  FixedCustomiseForm,
  FixedRegisterForm,
} from "@/components/enquiries/FixedDepartureForms";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export function generateStaticParams() {
  return journeys.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const journey = await findJourney(slug);
  if (!journey) return { title: "Enquire" };
  if (journey.type === "small-group") {
    return {
      title: mode === "customise" ? `Customise · ${journey.name}` : `Register · ${journey.name}`,
    };
  }
  return { title: `Customise · ${journey.name}` };
}

export default async function JourneyEnquirePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const journey = await findJourney(slug);
  if (!journey) notFound();
  const fixed = journey.type === "small-group";
  const customise = fixed && mode === "customise";

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#364037]/95 via-[#364037]/45 to-black/25" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-margin-mobile pb-16 pt-8 md:px-margin-desktop md:pb-20">
            <div className="mx-auto max-w-container-max">
              <p className="label-caps text-white/75">
                {fixed ? (customise ? "Customise" : "Reserve my seat") : "Customise"}
              </p>
              <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">{journey.name}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                {fixed
                  ? customise
                    ? "Tell us what you’re dreaming of — we’ll tailor it just for you."
                    : "Limited spots. Reserve your seat provisionally — we’ll confirm availability and payment next."
                  : "Tell us how you’d like to shape this journey — dates, pace, stays, and anything special."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-container-max px-margin-mobile py-10 pb-16 md:px-margin-desktop md:pb-24">
        <Suspense fallback={<p className="text-on-surface-variant">Loading form…</p>}>
          {fixed ? (
            customise ? (
              <FixedCustomiseForm journey={journey} />
            ) : (
              <FixedRegisterForm journey={journey} />
            )
          ) : (
            <JourneyEnquireFlow journey={journey} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
