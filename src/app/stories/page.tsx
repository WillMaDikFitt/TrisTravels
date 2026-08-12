import Image from "next/image";
import { stories as staticStories } from "@/data/stories";
import { listStories } from "@/lib/data/repo";
import { media } from "@/data/media";
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
      <section className="border-b border-outline-variant/20 bg-surface pt-header">
        <div className="mx-auto grid max-w-container-max md:grid-cols-2">
          <div className="flex flex-col justify-center px-margin-mobile py-12 md:px-margin-desktop md:py-16">
            <p className="label-caps text-accent">Journal</p>
            <h1 className="mt-3 font-display text-4xl text-primary md:text-5xl">Your stories</h1>
            <p className="mt-4 max-w-md text-on-surface-variant">
              Travellers, guides, hosts & friends — moments that stay long after the mist lifts.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#stories"
                className="inline-flex h-10 items-center rounded-full bg-primary px-6 text-xs font-bold tracking-[0.12em] text-on-primary uppercase transition hover:bg-primary/90"
              >
                Read stories
              </a>
              <a
                href="#share"
                className="inline-flex h-10 items-center rounded-full border border-outline-variant/40 px-6 text-xs font-bold tracking-[0.12em] text-secondary uppercase transition hover:border-primary/40"
              >
                Share yours
              </a>
            </div>
          </div>
          <div className="relative min-h-[280px] md:min-h-0">
            <Image
              src={media.rain}
              alt="Stories from Meghalaya"
              fill
              className="object-cover"
              sizes="50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/25" />
          </div>
        </div>
      </section>

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

          <StaggerChildren className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-5">
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
