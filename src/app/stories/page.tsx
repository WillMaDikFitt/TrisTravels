import { stories as staticStories } from "@/data/stories";
import { listStories } from "@/lib/data/repo";
import { media } from "@/data/media";
import { PageHero } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { StoryCard } from "@/components/listings/StoryCard";
import { ShareStoryForm } from "@/components/stories/ShareStoryForm";

export const metadata = { title: "Stories" };
export const revalidate = 60;

export default async function StoriesPage() {
  const stories = await listStories().catch(() => staticStories);
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
        secondaryCta={{ href: "#share", label: "Share yours" }}
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

          <StaggerChildren className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {rest.map((s) => (
              <StaggerItem key={s.slug} className="h-full">
                <StoryCard story={s} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      <section id="share" className="scroll-mt-header bg-primary-container py-16 md:py-24">
        <div className="mx-auto grid max-w-container-max gap-10 px-margin-mobile md:grid-cols-12 md:px-margin-desktop">
          <div className="md:col-span-4">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-accent">Share yours</p>
            <h2 className="mt-3 font-display text-3xl text-primary-fixed md:text-4xl">
              Have a story from Meghalaya?
            </h2>
            <p className="mt-4 text-primary-fixed/80">
              Send it here — words and a few photos. We’ll read every one, and some become part of
              the journal.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-[#f7f4ee] p-6 md:col-span-8 md:p-8">
            <ShareStoryForm />
          </div>
        </div>
      </section>
    </div>
  );
}
