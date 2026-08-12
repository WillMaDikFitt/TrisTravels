import Link from "next/link";
import Image from "next/image";
import { journeys } from "@/data/journeys";
import { media } from "@/data/media";
import { JourneyCard } from "@/components/listings/JourneyCard";
import { listJourneys } from "@/lib/data/repo";
import { CtaBand } from "@/components/ui/CtaBand";
import { cn } from "@/lib/utils";

export const metadata = { title: "Journeys" };

type Props = { searchParams: Promise<{ type?: string }> };

export default async function JourneysPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const all = await listJourneys().catch(() => journeys);
  const curated = all.filter((j) => j.type === "curated");
  const small = all.filter((j) => j.type === "small-group");
  const focus = type === "small-group" || type === "curated" ? type : null;

  return (
    <div className="bg-background">
      <section className="border-b border-outline-variant/20 bg-surface pt-header">
        <div className="mx-auto grid max-w-container-max md:grid-cols-2">
          <div className="flex flex-col justify-center px-margin-mobile py-12 md:px-margin-desktop md:py-16">
            <p className="label-caps text-accent">Journeys</p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">
              Multi-day routes, two ways
            </h1>
            <p className="mt-4 max-w-md text-on-surface-variant">
              Curated packages you shape with a planner, or small-group departures with fixed dates.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/journeys?type=curated"
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                  focus === "curated" || !focus
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                )}
              >
                Curated packages
              </Link>
              <Link
                href="/journeys?type=small-group"
                className={cn(
                  "rounded-full border px-5 py-2.5 text-sm font-semibold transition",
                  focus === "small-group"
                    ? "border-primary bg-primary text-on-primary"
                    : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
                )}
              >
                Small group
              </Link>
              <Link
                href="/craft-my-journey"
                className="rounded-full border border-dashed border-outline-variant/50 px-5 py-2.5 text-sm font-semibold text-secondary transition hover:border-accent hover:text-accent"
              >
                Craft my journey
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] md:min-h-0">
            <Image
              src={media.packages}
              alt="Journeys through Meghalaya"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/30" />
          </div>
        </div>
      </section>

      {(!focus || focus === "small-group") && (
        <section id="journeys" className="scroll-mt-header bg-surface py-12 md:py-16">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">Small group</p>
            <h2 className="mt-2 font-display text-3xl text-secondary md:text-4xl">Fixed departures</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Dates are set. Groups stay small. Enquire to hold a seat.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {small.map((j) => (
                <JourneyCard key={j.slug} journey={j} variant="tile" />
              ))}
            </div>
          </div>
        </section>
      )}

      {(!focus || focus === "curated") && (
        <section className="bg-surface-container-low py-12 md:py-16">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">Curated</p>
            <h2 className="mt-2 font-display text-3xl text-secondary md:text-4xl">Customizable packages</h2>
            <p className="mt-2 max-w-xl text-sm text-on-surface-variant">
              Itineraries with flexible choices — prices typically based on a group of 4.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {curated.map((j) => (
                <JourneyCard key={j.slug} journey={j} variant="tile" />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        eyebrow="Neither quite fits?"
        title="Craft my journey"
        body="Send a short brief — dates, guests, and what draws you. We’ll design the route."
        primary={{ href: "/craft-my-journey", label: "Start a brief" }}
        secondary={{ href: "/experiences", label: "Browse days" }}
      />
    </div>
  );
}
