import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { destinations } from "@/data/destinations";
import { findDestination, findExperience, findJourney } from "@/lib/data/repo";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/motion/Motion";
import { BreathSection } from "@/components/ui/BreathSection";
import { ExperienceCard } from "@/components/listings/ExperienceCard";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const serif = "font-[family-name:var(--font-playfair)]";

/** Pick up Studio / Firestore edits without waiting for a full redeploy. */
export const revalidate = 60;

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const dest = await findDestination(slug);
  return { title: dest ? `${dest.name} · Destinations` : "Destination" };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const dest = await findDestination(slug);
  if (!dest) notFound();

  const relatedExperiences = (
    await Promise.all((dest.relatedExperienceSlugs ?? []).map((s) => findExperience(s)))
  ).filter((e): e is NonNullable<typeof e> => Boolean(e));
  const relatedJourneys = (
    await Promise.all((dest.relatedJourneySlugs ?? []).map((s) => findJourney(s)))
  ).filter((j): j is NonNullable<typeof j> => Boolean(j));

  const storyImage = dest.image;

  return (
    <div className="bg-surface text-foreground">
      {/* Title only — no top hero image / no top CTA */}
      <header className="border-b border-outline-variant/20 px-margin-mobile pt-[calc(var(--header-offset)+2.5rem)] pb-10 md:px-margin-desktop md:pb-12">
        <div className="mx-auto max-w-container-max">
          <FadeIn>
            <p className="label-caps text-highlight">Destination</p>
            <h1
              className={cn(
                serif,
                "mt-3 max-w-3xl text-[clamp(2.35rem,5vw,3.75rem)] leading-[1.08] font-medium text-primary",
              )}
            >
              {dest.name}
            </h1>
            <p className={cn(serif, "mt-3 max-w-2xl text-xl leading-snug text-primary/75 italic md:text-2xl")}>
              {dest.tagline}
            </p>
            <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-on-surface-variant">
              <MapPin size={15} className="text-highlight" />
              {dest.region}
            </p>
          </FadeIn>
        </div>
      </header>

      {/* Wider story */}
      <section className="px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <div className="mx-auto max-w-container-max">
          <FadeIn>
            <p className="mx-auto max-w-3xl text-lg leading-[1.8] text-on-surface-variant md:max-w-4xl md:text-xl md:leading-[1.75]">
              {dest.overview}
            </p>
            {dest.interestingFact ? (
              <p className="mx-auto mt-8 max-w-3xl border-l-2 border-highlight/70 pl-5 text-base leading-relaxed text-primary md:max-w-4xl md:pl-6 md:text-lg">
                <span className="label-caps text-highlight">Interesting fact</span>
                <span className="mt-2 block font-semibold italic text-primary">
                  {dest.interestingFact}
                </span>
              </p>
            ) : null}
          </FadeIn>
        </div>
      </section>

      {/* Highlights + CTAs (formerly sidebar) */}
      <section className="border-y border-outline-variant/20 bg-surface-container-low/40 px-margin-mobile py-12 md:px-margin-desktop md:py-14">
        <div className="mx-auto max-w-container-max">
          <FadeIn>
            <h2 className={cn(serif, "text-2xl text-primary md:text-3xl")}>Highlights</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:gap-x-10">
              {dest.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-on-surface-variant md:text-[1.05rem]">
                  <Check className="mt-1 shrink-0 text-highlight" size={18} />
                  <span className="leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-6 border-t border-outline-variant/30 pt-8 lg:flex-row lg:items-end lg:justify-between">
              <dl className="grid flex-1 gap-4 sm:grid-cols-3 sm:gap-6">
                <div>
                  <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
                    From Shillong
                  </dt>
                  <dd className={cn(serif, "mt-1 text-xl text-primary")}>{dest.distances.shillong}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
                    Guwahati Airport
                  </dt>
                  <dd className={cn(serif, "mt-1 text-xl text-primary")}>
                    {dest.distances.guwahatiAirport}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
                    Umroi Airport
                  </dt>
                  <dd className={cn(serif, "mt-1 text-xl text-primary")}>
                    {dest.distances.umroiAirport}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-3">
                <Button href="/craft-my-journey" size="lg">
                  Include in my journey
                </Button>
                <Button href="/destinations" size="lg" variant="ghost">
                  Keep exploring
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Large fuller image after highlights */}
      <section className="px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        <div className="mx-auto max-w-container-max">
          <FadeIn>
            <div className="relative min-h-[70svh] overflow-hidden rounded-2xl md:min-h-[85svh] md:rounded-3xl">
              <Image
                src={storyImage}
                alt={dest.name}
                fill
                className="object-cover"
                sizes="100vw"
                quality={90}
                priority
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {(relatedExperiences.length > 0 || relatedJourneys.length > 0) && (
        <div className="mx-auto max-w-container-max space-y-14 px-margin-mobile pb-14 md:space-y-16 md:px-margin-desktop md:pb-16">
          {relatedExperiences.length > 0 && (
            <FadeIn>
              <h2 className={cn(serif, "text-2xl text-primary md:text-3xl")}>Experiences nearby</h2>
              <div className="mt-6 grid items-stretch gap-5 sm:grid-cols-2">
                {relatedExperiences.map(
                  (exp) => exp && <ExperienceCard key={exp.slug} experience={exp} />,
                )}
              </div>
            </FadeIn>
          )}

          {relatedJourneys.length > 0 && (
            <FadeIn>
              <h2 className={cn(serif, "text-2xl text-primary md:text-3xl")}>
                Journeys that pass through
              </h2>
              <ul className="mt-5 space-y-3">
                {relatedJourneys.map(
                  (j) =>
                    j && (
                      <li key={j.slug}>
                        <Link
                          href={`/journeys/${j.slug}`}
                          className="text-lg text-primary underline-offset-4 hover:underline"
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
      )}

      <BreathSection
        size="sm"
        eyebrow="Keep exploring"
        title="More destinations across Meghalaya"
        cta={{ href: "/destinations", label: "All destinations" }}
      />
    </div>
  );
}
