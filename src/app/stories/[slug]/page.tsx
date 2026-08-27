import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { stories as staticStories } from "@/data/stories";
import { findStory, listStories } from "@/lib/data/repo";
import { Button } from "@/components/ui/Button";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { StoryCard } from "@/components/listings/StoryCard";
import { CtaBand } from "@/components/ui/CtaBand";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return staticStories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const story = await findStory(slug);
  return { title: story?.title ?? "Story" };
}

function splitDayLead(text: string): { day: string; rest: string } | null {
  const m = text.trim().match(/^(DAY\s+\d+\s*[—–:-].*?)(?:\.|:)(\s+.+)?$/i);
  if (!m) {
    if (/^DAY\s+\d+/i.test(text.trim()) && text.length < 90) {
      return { day: text.trim(), rest: "" };
    }
    return null;
  }
  const day = m[1].trim();
  const rest = (m[2] ?? "").trim();
  // Prefer splitting only when the day label is short and body continues
  if (day.length > 100) return null;
  return { day: rest ? `${day}.` : day, rest };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const story = await findStory(slug);
  if (!story) notFound();

  const all = await listStories().catch(() => staticStories);
  const others = all.filter((s) => s.slug !== slug).slice(0, 3);
  const dateLabel = new Date(story.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [lead, ...rest] = story.body;

  return (
    <article className="bg-surface">
      {/* Image plane — brand of place, title lives below */}
      <header className="relative overflow-hidden pt-header">
        <div className="relative h-[min(52vh,28rem)] w-full md:h-[min(58vh,34rem)]">
          <Image
            src={story.image}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-black/25" />
          <div className="absolute inset-x-0 bottom-0 px-margin-mobile pb-5 md:px-margin-desktop md:pb-6">
            <div className="mx-auto flex max-w-container-max items-end justify-between gap-4">
              <p className="label-caps text-white/90 drop-shadow-sm">Journal</p>
              <p className="label-caps text-white/70 drop-shadow-sm">{story.category}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Title + body — wide editorial spread, not a centered column */}
      <div className="relative px-margin-mobile pt-10 pb-16 md:px-margin-desktop md:pt-14 md:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 10% 0%, rgba(122,163,90,0.1), transparent 40%), radial-gradient(ellipse at 90% 40%, rgba(54,64,55,0.04), transparent 35%)",
          }}
        />

        <div className="relative mx-auto max-w-container-max">
          <FadeIn>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              {/* Meta rail */}
              <aside className="lg:col-span-3">
                <div className="lg:sticky lg:top-[calc(var(--header-offset)+1.5rem)]">
                  <div className="ink-rule" />
                  <dl className="mt-5 space-y-5">
                    <div>
                      <dt className="label-caps text-highlight">Written by</dt>
                      <dd className="mt-1.5 font-[family-name:var(--font-playfair)] text-lg text-primary">
                        {story.author}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-caps text-highlight">Published</dt>
                      <dd className="mt-1.5 text-sm text-on-surface">{dateLabel}</dd>
                    </div>
                    <div>
                      <dt className="label-caps text-highlight">In the journal</dt>
                      <dd className="mt-1.5 text-sm text-on-surface">{story.category}</dd>
                    </div>
                  </dl>
                  <Link
                    href="/stories"
                    className="mt-8 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase transition hover:gap-3"
                  >
                    <ArrowLeft size={14} /> All stories
                  </Link>
                </div>
              </aside>

              {/* Reading column — uses most of the width */}
              <div className="lg:col-span-9">
                <h1 className="max-w-[22ch] font-[family-name:var(--font-playfair)] text-[clamp(2.15rem,4.2vw,3.35rem)] leading-[1.08] text-balance text-primary">
                  {story.title}
                </h1>
                <p className="mt-6 max-w-4xl font-[family-name:var(--font-playfair)] text-xl leading-snug text-primary/80 italic md:text-[1.4rem]">
                  {story.excerpt}
                </p>

                <div className="mt-12 border-t border-outline-variant/30 pt-10">
                  {lead ? (
                    <p className="max-w-4xl font-[family-name:var(--font-playfair)] text-xl leading-[1.55] text-primary md:text-[1.35rem] md:leading-[1.6]">
                      {lead}
                    </p>
                  ) : null}

                  <div className="mt-10 max-w-4xl space-y-7 text-[1.05rem] leading-[1.85] text-on-surface md:text-[1.1rem] md:leading-[1.9]">
                    {rest.map((p) => {
                      const dayBlock = splitDayLead(p);
                      if (dayBlock) {
                        return (
                          <div key={p.slice(0, 48)} className="space-y-4 pt-4">
                            <div>
                              <div className="ink-rule mb-4" />
                              <p className="font-[family-name:var(--font-playfair)] text-lg leading-snug text-primary md:text-xl">
                                {dayBlock.day.replace(/\.$/, "")}
                              </p>
                            </div>
                            {dayBlock.rest ? <p>{dayBlock.rest}</p> : null}
                          </div>
                        );
                      }
                      return <p key={p.slice(0, 48)}>{p}</p>;
                    })}
                  </div>
                </div>

                <div className="mt-14 flex flex-wrap gap-3 border-t border-outline-variant/30 pt-8">
                  <Button href="/stories" variant="ghost">
                    <ArrowLeft size={16} /> All stories
                  </Button>
                  <Button href="/stories#share" variant="secondary">
                    Share yours
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {others.length > 0 ? (
        <section className="relative overflow-hidden border-t border-outline-variant/25 px-margin-mobile py-14 md:px-margin-desktop md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 30%, rgba(122,163,90,0.1), transparent 45%), radial-gradient(ellipse at 80% 70%, rgba(54,64,55,0.05), transparent 40%)",
            }}
          />
          <div className="relative mx-auto max-w-container-max">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-highlight">Keep reading</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-primary md:text-4xl">
                More from the journal
              </h2>
              <Link
                href="/stories"
                className="label-caps mb-1 inline-flex items-center gap-2 text-primary"
              >
                All stories <ArrowRight size={16} />
              </Link>
            </div>
            <StaggerChildren className="mt-12 grid items-stretch gap-8 pt-2 sm:grid-cols-2 sm:gap-10 lg:grid-cols-3 lg:gap-12">
              {others.map((s, i) => (
                <StaggerItem key={s.slug} className="h-full px-1 pt-2">
                  <StoryCard story={s} variant="tile" tiltIndex={i} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      ) : null}

      <CtaBand
        tone="light"
        eyebrow="Ready to write your own?"
        title="Share a Meghalaya moment"
        body="Words and a few photos — we’ll read every one."
        primary={{ href: "/stories#share", label: "Share your story" }}
        secondary={{ href: "/experiences", label: "Browse experiences" }}
      />
    </article>
  );
}
