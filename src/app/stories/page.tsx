import { ArrowRight } from "lucide-react";
import { stories as staticStories } from "@/data/stories";
import { listStories } from "@/lib/data/repo";
import { StoryCard } from "@/components/listings/StoryCard";
import { ShareStoryForm } from "@/components/stories/ShareStoryForm";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";
import { ScrollToHash } from "@/components/navigation/ScrollToHash";

export const metadata = { title: "Your Stories" };
export const revalidate = 60;

export default async function StoriesPage() {
  const stories = await listStories().catch(() => staticStories);

  return (
    <div className="bg-surface text-foreground">
      <ScrollToHash />

      <section
        id="stories"
        className="relative scroll-mt-header overflow-hidden px-margin-mobile pt-[calc(var(--header-offset)+1rem)] pb-12 md:px-margin-desktop md:pb-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 30%, rgba(122,163,90,0.12), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(54,64,55,0.06), transparent 40%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(54,64,55,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(54,64,55,0.04) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative mx-auto max-w-container-max">
          <FadeIn>
            <div className="ink-rule" />
            <p className="label-caps mt-2 text-highlight">Journal</p>
            <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight text-primary">
              Stories from the hills
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
              Notes pinned from travellers, guides and friends — an open journal of Meghalaya
              moments that inspire the next journey.
            </p>

            <div className="mt-7 max-w-xl border-t border-outline-variant/30 pt-6">
              <p className="font-[family-name:var(--font-playfair)] text-lg leading-snug text-primary md:text-xl">
                Have a story from Meghalaya?
              </p>
              <a
                href="#share"
                className="mt-3 inline-flex items-center gap-2 font-[family-name:var(--font-manrope)] text-[12px] font-semibold tracking-[0.16em] text-primary uppercase transition hover:gap-3"
              >
                Share yours <ArrowRight size={16} strokeWidth={2.25} />
              </a>
            </div>
          </FadeIn>

          {stories.length > 0 ? (
            <StaggerChildren className="mt-6 grid items-stretch gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-8 lg:grid-cols-3 lg:gap-8">
              {stories.map((story, i) => (
                <StaggerItem key={story.slug} className="h-full px-0.5 pt-1">
                  <StoryCard story={story} variant="tile" tiltIndex={i} compact />
                </StaggerItem>
              ))}
            </StaggerChildren>
          ) : (
            <p className="py-12 text-center text-on-surface-variant">No stories yet — be the first.</p>
          )}
        </div>
      </section>

      <section id="share" className="scroll-mt-header bg-primary-container py-12 md:py-16">
        <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
          <div className="mx-auto max-w-2xl text-center">
            <div className="ink-rule mx-auto" />
            <p className="label-caps mt-3 text-highlight">Share yours</p>
            <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl text-on-primary-container md:text-3xl">
              Have a story from Meghalaya?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-on-primary-container/80 md:text-base">
              Send it here — words and a few photos. We&apos;ll read every one, and some become part
              of the journal.
            </p>
          </div>
          <div className="mx-auto mt-8 max-w-5xl rounded-[1.75rem] bg-surface-container-lowest p-6 md:mt-10 md:p-8 lg:p-10">
            <ShareStoryForm />
          </div>
        </div>
      </section>

      <CtaBand
        tone="light"
        className="py-8 md:py-10"
        eyebrow="Feel like going"
        title="Turn a story into a journey"
        body="Browse experiences, join a fixed departure, or craft a route around what moved you."
        primary={{ href: "/experiences", label: "Browse experiences" }}
        secondary={{ href: "/craft-my-journey", label: "Craft my journey" }}
      />
    </div>
  );
}
