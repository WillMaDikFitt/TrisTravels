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
      <section className="grid min-h-[78vh] pt-header md:grid-cols-2">
        <Link
          href="/journeys?type=curated"
          className={cn(
            "group relative flex min-h-[44vh] flex-col justify-end overflow-hidden p-8 md:min-h-0 md:p-12",
            focus === "small-group" && "md:opacity-60",
          )}
        >
          <Image
            src={media.packages}
            alt="Curated journeys"
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <div className="relative z-10 text-white">
            <p className="font-serif text-4xl text-accent">01</p>
            <p className="label-caps mt-2 text-accent">Enquire · flexible</p>
            <h1 className="mt-3 font-display text-4xl md:text-6xl">Curated Journeys</h1>
            <p className="mt-3 max-w-md text-white/80">
              Multi-day packages you shape — dates, stays, pace. Not an instant checkout.
            </p>
            <span className="mt-5 inline-block text-xs font-bold tracking-widest text-accent uppercase">
              View packages →
            </span>
          </div>
        </Link>
        <Link
          href="/journeys?type=small-group"
          className={cn(
            "group relative flex min-h-[44vh] flex-col justify-end overflow-hidden p-8 md:min-h-0 md:p-12",
            focus === "curated" && "md:opacity-60",
          )}
        >
          <Image
            src={media.departures}
            alt="Small group journeys"
            fill
            className="object-cover transition duration-700 group-hover:scale-110"
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
          <div className="relative z-10 text-white">
            <p className="font-serif text-4xl text-accent">02</p>
            <p className="label-caps mt-2 text-accent">Join a departure</p>
            <h2 className="mt-3 font-display text-4xl md:text-6xl">Small Group</h2>
            <p className="mt-3 max-w-md text-white/80">
              Scheduled dates. Shared energy. Show up with your curiosity.
            </p>
            <span className="mt-5 inline-block text-xs font-bold tracking-widest text-accent uppercase">
              See departures →
            </span>
          </div>
        </Link>
      </section>

      {(!focus || focus === "small-group") && (
        <section id="journeys" className="scroll-mt-header bg-surface py-14 md:py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">Small group</p>
            <h2 className="mt-2 font-display text-3xl text-secondary md:text-5xl">Fixed departures</h2>
            <p className="mt-2 max-w-xl text-on-surface-variant">
              Dates are set. Groups stay small. Enquire to hold a seat.
            </p>
            <div className="mt-10 grid gap-6">
              {small.map((j) => (
                <JourneyCard key={j.slug} journey={j} />
              ))}
            </div>
          </div>
        </section>
      )}

      {(!focus || focus === "curated") && (
        <section className="bg-surface-container-low py-14 md:py-20">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">Curated</p>
            <h2 className="mt-2 font-display text-3xl text-secondary md:text-5xl">Customizable packages</h2>
            <p className="mt-2 max-w-xl text-on-surface-variant">
              Itineraries with flexible choices — prices typically based on a group of 4.
            </p>
            <div className="mt-10 grid gap-6">
              {curated.map((j) => (
                <JourneyCard key={j.slug} journey={j} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand
        eyebrow="Neither quite fits?"
        title="Craft my journey"
        body="Three short steps. We design a route around your dates, pace, and curiosities."
        primary={{ href: "/craft-my-journey", label: "Start a brief" }}
        secondary={{ href: "/experiences", label: "Browse days" }}
      />
    </div>
  );
}
