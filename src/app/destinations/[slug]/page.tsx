import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { getDestination, destinations } from "@/data/destinations";
import { getExperience } from "@/data/experiences";
import { getJourney } from "@/data/journeys";
import { media } from "@/data/media";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { ExperienceCard } from "@/components/listings/ExperienceCard";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const dest = getDestination(slug);
  return { title: dest ? `${dest.name} · Destinations` : "Destination" };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) notFound();

  const relatedExperiences = (dest.relatedExperienceSlugs ?? [])
    .map((s) => getExperience(s))
    .filter(Boolean);
  const relatedJourneys = (dest.relatedJourneySlugs ?? [])
    .map((s) => getJourney(s))
    .filter(Boolean);

  return (
    <div className="bg-background">
      <PageHero
        src={dest.image}
        alt={dest.name}
        compact
        eyebrow="Destination"
        title={dest.name}
        body={dest.tagline}
        primaryCta={{ href: "/craft-my-journey", label: "Plan around this place" }}
        secondaryCta={{ href: "/destinations", label: "All destinations" }}
      />

      <div className="border-b border-outline-variant/20 bg-surface-container-low">
        <div className="mx-auto flex max-w-container-max flex-wrap items-center gap-3 px-margin-mobile py-4 md:px-margin-desktop">
          <span className="inline-flex items-center gap-1.5 text-sm text-primary">
            <MapPin size={16} className="text-accent" />
            {dest.region}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-container-max gap-12 px-margin-mobile py-12 md:grid-cols-[1fr_320px] md:gap-14 md:px-margin-desktop md:py-16">
        <div className="space-y-12">
          <FadeIn>
            <p className="text-lg leading-relaxed text-on-surface-variant">{dest.overview}</p>
            {dest.interestingFact && (
              <p className="mt-6 rounded-2xl border border-outline-variant/25 bg-surface-container-low p-5 text-sm text-on-surface-variant">
                <span className="label-caps text-primary">Interesting fact</span>
                <span className="mt-2 block">{dest.interestingFact}</span>
              </p>
            )}
          </FadeIn>

          <FadeIn>
            <h2 className="font-display text-2xl text-primary">Highlights</h2>
            <ul className="mt-5 space-y-3">
              {dest.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-on-surface-variant">
                  <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                  {h}
                </li>
              ))}
            </ul>
          </FadeIn>

          {dest.gallery.length > 0 && (
            <FadeIn>
              <h2 className="font-display text-2xl text-primary">Atmosphere</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {dest.gallery.map((src, i) => (
                  <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={src}
                      alt={`${dest.name} ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </FadeIn>
          )}

          {relatedExperiences.length > 0 && (
            <FadeIn>
              <h2 className="font-display text-2xl text-primary">Experiences nearby</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {relatedExperiences.map(
                  (exp) => exp && <ExperienceCard key={exp.slug} experience={exp} />,
                )}
              </div>
            </FadeIn>
          )}

          {relatedJourneys.length > 0 && (
            <FadeIn>
              <h2 className="font-display text-2xl text-primary">Journeys that pass through</h2>
              <ul className="mt-4 space-y-2">
                {relatedJourneys.map(
                  (j) =>
                    j && (
                      <li key={j.slug}>
                        <Link
                          href={`/journeys/${j.slug}`}
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          {j.name}
                        </Link>
                      </li>
                    ),
                )}
              </ul>
            </FadeIn>
          )}
        </div>

        <aside className="md:self-start">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient">
            <h2 className="font-display text-xl text-primary">Distance</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">From Shillong</dt>
                <dd className="font-medium text-secondary">{dest.distances.shillong}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Guwahati Airport</dt>
                <dd className="font-medium text-secondary">{dest.distances.guwahatiAirport}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-on-surface-variant">Umroi Airport</dt>
                <dd className="font-medium text-secondary">{dest.distances.umroiAirport}</dd>
              </div>
            </dl>
            <Button href="/craft-my-journey" className="mt-6 w-full" size="md">
              Include in my journey
            </Button>
            <p className="mt-3 text-center text-[11px] text-on-surface-variant">
              Sourced from{" "}
              <a
                href={dest.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent underline-offset-2 hover:underline"
              >
                trismeghalaya.com
              </a>
            </p>
          </div>
        </aside>
      </div>

      <FullBleedParallax
        src={media.ride}
        alt="Road through Meghalaya"
        eyebrow="Getting there"
        title="Add a Trusted Local Ride when you book"
        body="Verified drivers from the TRIS partner network — optional at checkout."
        height="md"
        align="center"
      />

      <BreathSection
        size="md"
        eyebrow="Keep exploring"
        title="More destinations across Meghalaya"
        cta={{ href: "/destinations", label: "All destinations" }}
      />
    </div>
  );
}
