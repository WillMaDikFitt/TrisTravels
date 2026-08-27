import { ArrowRight } from "lucide-react";
import { stories as staticStories } from "@/data/stories";
import { listStories } from "@/lib/data/repo";
import { StoryCard } from "@/components/listings/StoryCard";
import { ShareStoryForm } from "@/components/stories/ShareStoryForm";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";

export const metadata = { title: "Your Stories" };
export const revalidate = 60;

export default async function StoriesPage() {
  const stories = await listStories().catch(() => staticStories);

  return (
    <div className="bg-surface text-foreground">
      <section className="relative overflow-hidden px-margin-mobile pt-[calc(var(--header-offset)+2.5rem)] pb-12 md:px-margin-desktop md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 30%, rgba(122,163,90,0.12), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(54,64,55,0.06), transparent 40%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.2]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(54,64,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(54,64,55,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-container-max">
          <FadeIn>
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-highlight">Journal</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <h1 className="max-w-3xl font-[family-name:var(--font-playfair)] text-4xl tracking-tight text-primary md:text-5xl lg:text-[3.5rem]">
                Stories from the hills
              </h1>
              <a
                href="#share"
                className="label-caps mb-1 inline-flex items-center gap-2 text-primary"
              >
                Share yours <ArrowRight size={16} />
              </a>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
              Notes pinned from travellers, guides and friends — an open journal of Meghalaya
              moments that inspire the next journey.
            </p>
          </FadeIn>
        </div>
      </section>

      <section
        id="stories"
        className="relative scroll-mt-header overflow-hidden px-margin-mobile pb-16 md:px-margin-desktop md:pb-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 15% 20%, rgba(122,163,90,0.1), transparent 40%), radial-gradient(ellipse at 85% 60%, rgba(54,64,55,0.05), transparent 35%)",
          }}
        />
        <div className="relative mx-auto max-w-container-max">
          {stories.length > 0 ? (
            <StaggerChildren className="grid items-stretch gap-8 pt-2 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
              {stories.map((story, i) => (
                <StaggerItem key={story.slug} className="h-full px-1 pt-2">
                  <StoryCard story={story} variant="tile" tiltIndex={i} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <p className="py-16 text-center text-on-surface-variant">No stories yet — be the first.</p>
          )}
        </div>
      </section>

      <section id="share" className="scroll-mt-header bg-primary-container py-16 md:py-24">
        <div className="mx-auto grid max-w-container-max gap-10 px-margin-mobile md:grid-cols-12 md:px-margin-desktop">
          <div className="md:col-span-4">
            <p className="label-caps text-highlight">Share yours</p>
            <h2 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl text-on-primary-container md:text-4xl">
              Have a story from Meghalaya?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-on-primary-container/80 md:text-base">
              Send it here — words and a few photos. We&apos;ll read every one, and some become part
              of the journal.
            </p>
          </div>
          <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 md:col-span-8 md:p-8">
            <ShareStoryForm />
          </div>
        </div>
      </section>

      <CtaBand
        tone="light"
        eyebrow="Feel like going"
        title="Turn a story into a journey"
        body="Browse experiences, join a fixed departure, or craft a route around what moved you."
        primary={{ href: "/experiences", label: "Browse experiences" }}
        secondary={{ href: "/craft-my-journey", label: "Craft my journey" }}
      />
    </div>
  );
}
