import { notFound } from "next/navigation";
import { getStory, stories } from "@/data/stories";
import { media } from "@/data/media";
import { Button } from "@/components/ui/Button";
import { PageHero, FullBleedParallax } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { FadeIn } from "@/components/motion/Motion";
import { StoryCard } from "@/components/listings/StoryCard";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const story = getStory(slug);
  return { title: story?.title ?? "Story" };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const others = stories.filter((s) => s.slug !== slug).slice(0, 2);
  const dateLabel = new Date(story.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="bg-background">
      <PageHero
        src={story.image}
        alt={story.title}
        compact
        eyebrow={story.category}
        title={story.title}
        body={story.excerpt}
      />

      <div className="border-b border-outline-variant/20 bg-surface-container-low">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-margin-mobile py-5 text-sm text-on-surface-variant md:px-0">
          <span>
            <span className="text-primary">Written by</span> {story.author}
          </span>
          <span aria-hidden>·</span>
          <span>{dateLabel}</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-margin-mobile py-14 md:px-margin-desktop md:py-20">
        <FadeIn>
          <div className="space-y-6 text-lg leading-relaxed text-on-surface-variant md:text-xl">
            {story.body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap gap-3 border-t border-outline-variant/20 pt-8">
            <Button href="/stories" variant="ghost">
              ← All stories
            </Button>
            <Button href="/experiences">Explore experiences</Button>
          </div>
        </FadeIn>
      </div>

      {others.length > 0 && (
        <>
          <BreathSection size="sm" title="Keep reading" />
          <section className="mx-auto grid max-w-container-max gap-5 px-margin-mobile pb-16 md:grid-cols-2 md:gap-6 md:px-margin-desktop md:pb-24">
            {others.map((s) => (
              <StoryCard key={s.slug} story={s} />
            ))}
          </section>
        </>
      )}

      <FullBleedParallax
        src={media.heroMist}
        alt="Meghalaya mist"
        title="Ready to write your own?"
        cta={{ href: "/experiences", label: "Explore experiences" }}
        height="md"
        align="center"
        overlay="soft"
      />
    </article>
  );
}
