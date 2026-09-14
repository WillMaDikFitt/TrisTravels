import Image from "next/image";
import { Backpack, HandHeart, Hammer, Heart, Home, Leaf, Music, Sprout, Users } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";
import { ImpactSection } from "@/components/sections/ImpactSection";
import { media } from "@/data/media";
import { getSettings } from "@/lib/data/repo";
import { cn } from "@/lib/utils";

export const metadata = { title: "About" };

const serif = "font-[family-name:var(--font-playfair)]";

const storyMoments = [
  {
    image: media.kitchen,
    alt: "Hospitality by the fire in Meghalaya",
    lead: "Born in Mairang, Mei-ieid embodied true Khasi hospitality — generous, hard-working, and unconditionally caring.",
    body: "She never spoke the language of business, but she understood the importance of hospitality — welcoming every guest with an open heart and genuine care.",
    flip: false,
  },
  {
    image: media.craft,
    alt: "Shared meals and local hospitality",
    lead: null as string | null,
    body: "TRIS is more than a name. It is a promise to carry her spirit forward — through every homestay, every meal, every guide, and every journey we craft for you.",
    flip: true,
  },
  {
    image: media.heroRoots,
    alt: "Travellers on a living root bridge trail",
    lead: "At TRIS Travels, we create immersive journeys that go beyond sightseeing.",
    body: "While conventional tours can rush you through places, we believe in slowing travel down so you can connect more deeply with the people, culture, and landscapes of Meghalaya.",
    flip: false,
  },
];

const communityWays = [
  { label: "Trekking with local guides", Icon: Backpack },
  { label: "Listening to folklore and traditional music", Icon: Music },
  { label: "Staying in welcoming village homestays", Icon: Home },
  { label: "Learning to braid a living root bridge", Icon: Sprout },
  { label: "Supporting skilled local artisans", Icon: Hammer },
];

const heartbeat = [
  {
    text: "Because we believe travel should benefit the traveller while uplifting the host.",
    Icon: HandHeart,
  },
  {
    text: "To us, the community is not an afterthought.",
    emphasis: "It is the heartbeat of everything we do.",
    Icon: Heart,
  },
  {
    text: "When we grow, we grow together.",
    Icon: Sprout,
  },
] as const;

const values = [
  {
    n: "01",
    title: "Authentic Encounters",
    tagline: "Real people. Real places. Real connection.",
    body: "We seek out experiences that bring you closer to local life — from traditional food and village stays to stories, crafts, music, and the landscapes that shape Meghalaya.",
    image: media.valueAuthentic,
    Icon: Users,
  },
  {
    n: "02",
    title: "Community First",
    tagline: "Travel with the people who call Meghalaya home.",
    body: "We work with local hosts, guides, experience providers, artisans, and small businesses so that the people who share their homes, skills, stories, and places can be part of the journey — and benefit from it.",
    image: media.valueCommunity,
    Icon: Home,
  },
  {
    n: "03",
    title: "Slow & Thoughtful Travel",
    tagline: "Go deeper, not faster.",
    body: "We believe the best journeys leave room to pause, listen, explore, and connect. We thoughtfully bring experiences, stays, people, and places together rather than simply moving you from one attraction to another.",
    image: media.valueSlow,
    Icon: Leaf,
  },
] as const;


export default async function AboutPage() {
  const settings = await getSettings();
  const impact = settings.impact?.length ? settings.impact : [];

  return (
    <div className="bg-surface text-foreground">
      {/* Hero */}
      <section className="relative min-h-[min(62vh,32rem)] overflow-hidden pt-header md:min-h-[min(68vh,36rem)]">
        <div className="absolute inset-0">
          <Image
            src={media.aboutHero}
            alt="Mei-ieid — the heart behind TRIS"
            fill
            priority
            className="object-cover object-[72%_center]"
            sizes="100vw"
            quality={92}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--surface-container-lowest) 0%, var(--surface) 18%, var(--surface) 34%, color-mix(in srgb, var(--surface) 90%, transparent) 42%, color-mix(in srgb, var(--surface) 62%, transparent) 50%, color-mix(in srgb, var(--surface) 28%, transparent) 56%, transparent 62%)",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[min(62vh,32rem)] w-full max-w-container-max items-end justify-start px-margin-mobile pb-12 md:min-h-[min(68vh,36rem)] md:pl-8 md:pr-margin-desktop lg:pl-10 md:pb-16">
          <FadeIn className="relative max-w-lg md:max-w-xl">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-5 -right-[24%] -bottom-6 -left-8 -z-10 rounded-r-3xl md:-left-12 md:-right-[28%]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--surface) 0%, var(--surface) 72%, color-mix(in srgb, var(--surface) 94%, transparent) 84%, color-mix(in srgb, var(--surface) 55%, transparent) 94%, transparent 100%)",
              }}
            />
            <p className="label-caps text-highlight">Our story</p>
            <h1
              className={cn(
                serif,
                "mt-3 text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.08] font-medium text-balance text-primary",
              )}
            >
              At the soul of TRIS Travels{" "}
              <span className="italic text-primary/80">is Mei-ieid, my grandmother.</span>
            </h1>
            <Leaf
              aria-hidden
              className="mt-5 h-5 w-5 text-highlight"
              strokeWidth={1.5}
            />
          </FadeIn>
        </div>
      </section>

      {/* Story narrative — small photos and tight spacing so all three moments read on one screen */}
      <section className="mx-auto w-full max-w-container-max space-y-6 px-margin-mobile py-10 md:space-y-8 md:px-margin-desktop md:py-12">
        {storyMoments.map((moment) => (
          <div
            key={moment.alt}
            className={cn(
              "grid items-center gap-5 md:grid-cols-12 md:gap-8",
              moment.flip && "md:[&>*:first-child]:order-2",
            )}
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl md:col-span-5 md:aspect-[2/1]">
              <Image
                src={moment.image}
                alt={moment.alt}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 40vw"
              />
            </div>
            <FadeIn className="md:col-span-7">
              <Leaf aria-hidden className="mb-2.5 h-4 w-4 text-highlight" strokeWidth={1.5} />
              {moment.lead ? (
                <p className={cn(serif, "text-[1.05rem] leading-snug text-primary md:text-[1.25rem]")}>
                  {moment.lead}
                </p>
              ) : null}
              <p
                className={cn(
                  "leading-[1.7] text-on-surface-variant",
                  moment.lead
                    ? "mt-2.5 text-sm md:text-[0.95rem]"
                    : cn(serif, "text-[1.05rem] leading-snug text-primary md:text-[1.25rem]"),
                )}
              >
                {moment.body}
              </p>
            </FadeIn>
          </div>
        ))}
      </section>

      {/* Ways to travel with the community, the line that ties them together, then why it matters.
          Kept on the same surface as the story above so it reads as one continuous piece. */}
      <section className="px-margin-mobile pb-14 md:px-margin-desktop md:pb-16">
        <div className="mx-auto w-full max-w-container-max">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {communityWays.map(({ label, Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/70 px-4 py-3.5 text-sm leading-snug text-on-surface-variant lg:flex-col lg:gap-2.5 lg:px-3 lg:py-5 lg:text-center"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 text-highlight">
                  <Icon aria-hidden className="h-4 w-4" strokeWidth={1.5} />
                </span>
                {label}
              </li>
            ))}
          </ul>

          <div className="my-10 flex items-center gap-4 md:my-12">
            <span aria-hidden className="h-px flex-1 bg-outline-variant/40" />
            <p
              className={cn(
                serif,
                "max-w-2xl text-center text-[clamp(1.35rem,2.4vw,1.85rem)] leading-snug text-primary",
              )}
            >
              Every TRIS journey is shaped by the community.
            </p>
            <span aria-hidden className="h-px flex-1 bg-outline-variant/40" />
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {heartbeat.map(({ text, Icon, ...rest }) => (
              <div
                key={text}
                className="flex items-start gap-4 rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/70 px-5 py-5 shadow-[0_8px_24px_rgba(54,64,55,0.04)]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-highlight">
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <p className="text-[0.95rem] leading-relaxed text-on-surface-variant">
                  {text}
                  {"emphasis" in rest && rest.emphasis ? (
                    <>
                      {" "}
                      <span className={cn(serif, "text-primary italic")}>{rest.emphasis}</span>
                    </>
                  ) : null}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values + impact in one viewport: smaller photos and compact stats. */}
      <section className="relative overflow-hidden py-8 md:py-9">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 10% 0%, rgba(122,163,90,0.1), transparent 40%), radial-gradient(ellipse at 90% 100%, rgba(54,64,55,0.05), transparent 45%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-container-max px-margin-mobile md:px-margin-desktop">
          <p className="label-caps text-highlight">Our values & impact</p>
          <h2
            className={cn(
              serif,
              "mt-3 max-w-xl text-[clamp(1.9rem,3.5vw,2.85rem)] leading-tight font-medium text-primary",
            )}
          >
            What guides the way we travel
          </h2>

          <StaggerChildren className="mt-6 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-6">
            {values.map((value) => (
              <StaggerItem key={value.n}>
                <article className="relative flex h-full flex-col">
                  <div className="relative">
                    <div className="relative aspect-[2/1] overflow-hidden rounded-2xl">
                      <Image
                        src={value.image}
                        alt={value.title}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 33vw"
                        quality={88}
                      />
                    </div>
                    <span className="absolute bottom-0 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-full bg-primary text-[11px] font-bold tracking-wide text-white">
                      {value.n}
                    </span>
                  </div>
                  <div className="mt-8 flex flex-1 flex-col px-1 text-center">
                    <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-highlight">
                      <value.Icon aria-hidden className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <h3
                      className={cn(
                        serif,
                        "mt-3 text-[1.3rem] leading-tight text-primary md:text-[1.45rem]",
                      )}
                    >
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-snug text-highlight italic md:text-[0.95rem]">
                      {value.tagline}
                    </p>
                    <p className="mt-2.5 text-sm leading-relaxed text-on-surface-variant">
                      {value.body}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>

        <ImpactSection
          impact={impact}
          compact
          backgroundImage={settings.impactImage}
        />
      </section>

      <CtaBand
        tone="light"
        className="py-12 md:py-14"
        eyebrow="Travel with us"
        title="Experience the unseen"
        body="Book a day in the hills — or partner with TRIS if you host, guide, or run a stay."
        primary={{ href: "/experiences", label: "Explore experiences" }}
        secondary={{ href: "/partner", label: "Partner with us" }}
      />
    </div>
  );
}
