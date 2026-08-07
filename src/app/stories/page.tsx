import { stories } from "@/data/stories";
import { media } from "@/data/media";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { StoryCard } from "@/components/listings/StoryCard";

export const metadata = { title: "Stories" };

export default function StoriesPage() {
  const [featured, ...rest] = stories;

  return (
    <div className="bg-background">
      <PageHero
        src={media.rain}
        alt="Stories from Meghalaya"
        compact
        eyebrow="Journal"
        title="Your Stories"
        body="An open journal for travellers, guides, hosts & friends — moments that stay long after the mist lifts."
        primaryCta={{ href: "#stories", label: "Read stories" }}
        secondaryCta={{ href: "/contact", label: "Share yours" }}
      />

      <BreathSection
        size="sm"
        eyebrow="The TRIS Journal"
        title="Stories that stay with you"
        body="Not itineraries — encounters. Rain, root bridges, kitchens, and the people who host them."
      />

      <section
        id="stories"
        className="scroll-mt-header bg-surface px-margin-mobile pb-16 md:px-margin-desktop md:pb-24"
      >
        <div className="mx-auto max-w-container-max">
          {featured && (
            <div className="mb-10 md:mb-14">
              <StoryCard story={featured} featured />
            </div>
          )}

          <StaggerChildren className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {rest.map((s) => (
              <StaggerItem key={s.slug}>
                <StoryCard story={s} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <FullBleedParallax
        src={media.canopy}
        alt="Forest canopy"
        title="Have a story from Meghalaya?"
        body="Share your journey with TRIS — guest voices help future travellers travel with care."
        cta={{ href: "/contact", label: "Share your story" }}
        height="md"
        align="center"
      />
    </div>
  );
}
