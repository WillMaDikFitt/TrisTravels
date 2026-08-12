import Image from "next/image";
import { notFound } from "next/navigation";
import { journeys } from "@/data/journeys";
import { findJourney } from "@/lib/data/repo";
import { media } from "@/data/media";
import { formatINR } from "@/lib/utils";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { Check } from "lucide-react";
import { JourneyEnquire } from "@/components/enquiries/JourneyEnquire";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journeys.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  return { title: journey?.name ?? "Journey" };
}

export default async function JourneyDetailPage({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  if (!journey) notFound();

  return (
    <div className="bg-background">
      <PageHero
        src={journey.image}
        alt={journey.name}
        compact
        eyebrow={journey.type === "small-group" ? "Small Group Journey" : "Curated Journey"}
        title={journey.name}
        body={journey.tagline}
        primaryCta={{ href: "#enquire", label: "Enquire" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Craft My Journey" }}
      />

      <div className="border-b border-outline-variant/20 bg-surface-container-low">
        <div className="mx-auto grid max-w-container-max grid-cols-2 gap-0 md:grid-cols-4">
          {[
            {
              label: "Duration",
              value: `${journey.days} Days / ${journey.nights} Nights`,
            },
            { label: "From", value: formatINR(journey.priceFrom) },
            { label: "Season", value: journey.season },
            {
              label: journey.groupSize ? "Group" : "Style",
              value: journey.groupSize ?? journey.style[0],
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border-b border-outline-variant/20 p-5 md:border-r md:border-b-0 md:last:border-r-0"
            >
              <p className="text-xs text-on-surface-variant">{item.label}</p>
              <p className="mt-1 font-medium text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-container-max gap-12 px-margin-mobile py-14 md:grid-cols-[1fr_340px] md:gap-14 md:px-margin-desktop md:py-20">
        <div className="space-y-14">
          <FadeIn>
            <p className="text-xl leading-relaxed text-on-surface-variant">{journey.overview}</p>
            {journey.route && (
              <p className="mt-4 text-sm text-on-surface-variant">
                <span className="font-medium text-primary">Route: </span>
                {journey.route}
              </p>
            )}
          </FadeIn>

          <FadeIn>
            <h2 className="font-display text-2xl text-primary">Highlights</h2>
            <ul className="mt-5 space-y-3">
              {journey.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-on-surface-variant">
                  <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                  {h}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn>
            <h2 className="font-display text-2xl text-primary">Itinerary</h2>
            <ol className="mt-6 space-y-4">
              {journey.itinerary.map((day) => (
                <li key={day.day} className="rounded-2xl bg-surface-container-low p-5 md:p-6">
                  <p className="label-caps text-accent">Day {day.day}</p>
                  <h3 className="mt-1 font-display text-xl text-primary">{day.title}</h3>
                  <p className="mt-2 text-on-surface-variant">{day.summary}</p>
                </li>
              ))}
            </ol>
          </FadeIn>

          <FadeIn>
            <h2 className="font-display text-2xl text-primary">Stay varieties</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Sample stay styles for this journey — final properties confirmed on enquiry.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {journey.stays.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-outline-variant/40 px-4 py-2 text-sm text-on-surface-variant"
                >
                  {s}
                </span>
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <h2 className="font-display text-2xl text-primary">Inclusions</h2>
            <ul className="mt-4 space-y-2 text-on-surface-variant">
              {journey.inclusions.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <aside className="h-fit rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-ambient md:sticky md:top-36">
          <p className="text-sm text-on-surface-variant">From</p>
          <p className="font-display text-3xl text-primary">{formatINR(journey.priceFrom)}</p>
          {journey.priceNote && (
            <p className="mt-1 text-xs text-on-surface-variant">{journey.priceNote}</p>
          )}
          <p className="mt-2 text-sm text-on-surface-variant">
            {journey.days} Days / {journey.nights} Nights · {journey.season}
            {journey.groupSize ? ` · ${journey.groupSize}` : ""}
          </p>
          {journey.nextDeparture && (
            <p className="mt-3 rounded-lg bg-accent/10 px-3 py-2 text-sm text-accent">
              Next departure: {journey.nextDeparture}
            </p>
          )}
          <JourneyEnquire journeyName={journey.name} journeySlug={journey.slug} />
          <p className="mt-3 text-center text-xs text-on-surface-variant">
            Journeys are enquiry-led — not instant checkout.
          </p>
        </aside>
      </div>

      <FullBleedParallax
        src={media.familyWaterfall}
        alt="Travellers in Meghalaya"
        title="Travel deeper. Travel together. Travel local."
        height="md"
        align="center"
        overlay="soft"
      />

      <BreathSection
        size="md"
        eyebrow="Keep exploring"
        title="Browse more journeys"
        cta={{ href: "/journeys", label: "All journeys" }}
      />
    </div>
  );
}
