import { notFound } from "next/navigation";
import { journeys } from "@/data/journeys";
import { findJourney } from "@/lib/data/repo";
import { detailImages, media } from "@/data/media";
import { formatINR } from "@/lib/utils";
import { FadeIn } from "@/components/motion/Motion";
import { FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { DetailGallery } from "@/components/detail/DetailGallery";
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
      <DetailGallery images={detailImages(journey.image, journey.gallery)} alt={journey.name}>
        <p className="label-caps text-accent">
          {journey.type === "small-group" ? "Fixed Journey" : "Curated Journey"}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-[1.02] text-balance text-primary md:text-5xl lg:text-6xl">
          {journey.name}
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-pretty text-on-surface-variant md:text-lg">
          {journey.tagline}
        </p>
      </DetailGallery>

      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="grid overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_12px_35px_rgba(42,46,31,0.06)] md:grid-cols-4">
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
              <p className="label-caps text-[10px] text-on-surface-variant">{item.label}</p>
              <p className="mt-1 font-medium text-primary">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-container-max gap-12 px-margin-mobile py-12 md:grid-cols-[minmax(0,1fr)_360px] md:px-margin-desktop md:py-16 lg:gap-16">
        <div className="space-y-16">
          <FadeIn>
            <section className="border-l-2 border-accent pl-6 md:pl-8">
              <p className="label-caps text-accent">The journey</p>
              <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
                Made for travelling deeper
              </h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-on-surface-variant">{journey.overview}</p>
              {journey.route && (
                <p className="mt-6 rounded-xl bg-surface-container-low px-4 py-3 text-sm leading-relaxed text-on-surface-variant">
                  <span className="font-semibold text-primary">Route · </span>
                  {journey.route}
                </p>
              )}
            </section>
          </FadeIn>

          <FadeIn>
            <section className="rounded-3xl bg-primary p-7 text-white md:p-10">
              <p className="label-caps text-white/65">Why this route</p>
              <h2 className="mt-3 font-display text-3xl text-white">Journey highlights</h2>
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {journey.highlights.map((h) => (
                  <li key={h} className="flex gap-3 rounded-xl bg-white/[0.06] p-4 text-white/75">
                    <Check className="mt-0.5 shrink-0 text-white/70" size={18} />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <FadeIn>
            <section>
              <p className="label-caps text-accent">Day by day</p>
              <h2 className="mt-2 font-display text-3xl text-primary">Your itinerary</h2>
              <ol className="relative mt-8 space-y-0 border-l border-outline-variant/40">
                {journey.itinerary.map((day) => (
                  <li key={day.day} className="relative border-b border-outline-variant/25 py-6 pl-8 first:pt-0">
                    <span className="absolute top-7 left-0 h-3 w-3 -translate-x-[6.5px] rounded-full border-2 border-background bg-accent first:top-1" />
                    <p className="label-caps text-accent">Day {String(day.day).padStart(2, "0")}</p>
                    <h3 className="mt-1 font-display text-xl text-primary">{day.title}</h3>
                    <p className="mt-2 text-on-surface-variant">{day.summary}</p>
                  </li>
                ))}
              </ol>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="grid overflow-hidden rounded-3xl border border-outline-variant/25 md:grid-cols-2">
              <div className="p-7 md:p-8">
                <p className="label-caps text-accent">Rest well</p>
                <h2 className="mt-2 font-display text-2xl text-primary">Stay varieties</h2>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  Hand-picked stay styles; final properties are confirmed when we shape your journey.
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
              </div>
              <div className="border-t border-outline-variant/25 bg-surface-container-low p-7 md:border-t-0 md:border-l md:p-8">
                <p className="label-caps text-accent">Taken care of</p>
                <h2 className="mt-2 font-display text-2xl text-primary">Inclusions</h2>
                <ul className="mt-5 space-y-3 text-on-surface-variant">
                  {journey.inclusions.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </FadeIn>

          {(journey.exclusions?.length ?? 0) > 0 && (
            <FadeIn>
              <section>
                <p className="label-caps text-accent">Not included</p>
                <h2 className="mt-2 font-display text-3xl text-primary">Exclusions</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {journey.exclusions!.map((item) => (
                    <li
                      key={item}
                      className="rounded-xl border border-outline-variant/25 bg-surface-container-low/50 px-4 py-3 text-sm text-on-surface-variant"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </FadeIn>
          )}
        </div>

        <aside className="order-first h-fit rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-7 shadow-[0_18px_50px_rgba(42,46,31,0.10)] md:order-none md:self-start md:sticky md:top-[calc(var(--header-offset)+2.5rem)]">
          <p className="label-caps text-accent">
            {journey.type === "small-group" ? "Reserve your place" : "Book or customise"}
          </p>
          <p className="mt-5 text-sm text-on-surface-variant">From</p>
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
          <JourneyEnquire
            journeyName={journey.name}
            journeySlug={journey.slug}
            fixed={journey.type === "small-group"}
            departureDates={journey.departureSeats?.map((departure) => departure.date) ?? []}
          />
          <p className="mt-3 text-center text-xs text-on-surface-variant">
            {journey.type === "small-group"
              ? "Your seat is held provisionally while we confirm availability and payment."
              : "Book now for an instant calculated quote, or customise if you want to reshape the journey."}
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
