import { journeys } from "@/data/journeys";
import { media } from "@/data/media";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { JourneyCard } from "@/components/listings/JourneyCard";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";

export const metadata = { title: "Journeys" };

export default function JourneysPage() {
  const curated = journeys.filter((j) => j.type === "curated");
  const small = journeys.filter((j) => j.type === "small-group");

  return (
    <div className="bg-background">
      <PageHero
        src={media.peaks}
        alt="Meghalaya mountain journey"
        compact
        eyebrow="Journeys"
        title="Travel deeper across Meghalaya"
        body="Customizable packages and fixed departures from TRIS Meghalaya — curated for depth, scheduled for connection."
        primaryCta={{ href: "#journeys", label: "View journeys" }}
        secondaryCta={{ href: "/craft-my-journey", label: "Craft my own" }}
      />

      <BreathSection
        size="sm"
        eyebrow="From trismeghalaya.com"
        title="Join a departure — or customise a package"
        body="Fixed departures share dates with like-hearted travellers. Customizable packages let you shape dates, stays, rides, and add-ons."
      />

      <div id="journeys" className="scroll-mt-header">
        <section className="bg-surface py-12 md:py-16">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <h2 className="font-display text-2xl text-primary md:text-3xl">Fixed Departures</h2>
            <p className="mt-2 max-w-xl text-on-surface-variant">
              Scheduled small-group journeys — just show up with your curiosity.
            </p>
            <StaggerChildren className="mt-8 grid gap-5">
              {small.map((j) => (
                <StaggerItem key={j.slug}>
                  <JourneyCard journey={j} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>

        <FullBleedParallax
          src={media.heroRoots}
          alt="Forest path"
          eyebrow="Travel together"
          title="Small groups. Deep connection."
          body="Shared transport and stays keep it personal, affordable, and respectful to the land."
          height="md"
          align="center"
        />

        <section className="bg-surface py-12 md:py-16">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <h2 className="font-display text-2xl text-primary md:text-3xl">Customizable Packages</h2>
            <p className="mt-2 max-w-xl text-on-surface-variant">
              Itineraries with flexible choices — prices based on a group of 4, customise dates and
              stays.
            </p>
            <StaggerChildren className="mt-8 grid gap-5 lg:grid-cols-1 xl:gap-6">
              {curated.map((j) => (
                <StaggerItem key={j.slug}>
                  <JourneyCard journey={j} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      </div>

      <BreathSection
        size="md"
        eyebrow="Personalised"
        title="Need something entirely yours?"
        body="Tell us your dates, interests, and budget — we craft a Meghalaya itinerary around you."
        cta={{ href: "/craft-my-journey", label: "Craft My Journey" }}
      />

      <FullBleedParallax
        src={media.heroMist}
        alt="Misty hills"
        title="The hills keep their own calendar."
        height="md"
        align="center"
        overlay="soft"
      />
    </div>
  );
}
