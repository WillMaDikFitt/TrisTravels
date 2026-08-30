import Image from "next/image";
import { HandHeart, Heart, Sprout } from "lucide-react";
import { FadeIn, StaggerChildren, StaggerItem } from "@/components/motion/Motion";
import { CtaBand } from "@/components/ui/CtaBand";
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
  "Trekking with local guides",
  "Listening to folklore and traditional music",
  "Staying in welcoming village homestays",
  "Learning to braid a living root bridge",
  "Supporting skilled local artisans",
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
  },
  {
    n: "02",
    title: "Community First",
    tagline: "Travel with the people who call Meghalaya home.",
    body: "We work with local hosts, guides, experience providers, artisans, and small businesses so that the people who share their homes, skills, stories, and places can be part of the journey — and benefit from it.",
    image: media.valueCommunity,
  },
  {
    n: "03",
    title: "Slow & Thoughtful Travel",
    tagline: "Go deeper, not faster.",
    body: "We believe the best journeys leave room to pause, listen, explore, and connect. We thoughtfully bring experiences, stays, people, and places together rather than simply moving you from one attraction to another.",
    image: media.cliffs,
  },
] as const;

export default async function AboutPage() {
  const settings = await getSettings();
  const impact = settings.impact?.length ? settings.impact : [];

  return (
    <div className="bg-surface text-foreground">
      {/* Hero — shorter, left fade only */}
      <section className="relative min-h-[min(58vh,28rem)] overflow-hidden pt-header md:min-h-[min(62vh,32rem)]">
        <Image
          src={media.aboutPortrait}
          alt="Mei-ieid — the heart behind TRIS"
          fill
          priority
          className="rounded-none object-cover object-[center_28%] md:rounded-none"
          sizes="100vw"
          quality={92}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#364037]/88 via-[#364037]/45 to-transparent"
        />

        <div className="relative mx-auto flex min-h-[min(58vh,28rem)] w-full max-w-container-max items-end px-margin-mobile pb-10 md:min-h-[min(62vh,32rem)] md:px-margin-desktop md:pb-14">
          <FadeIn className="max-w-xl text-white">
            <p className="label-caps text-highlight">Our story</p>
            <h1
              className={cn(
                serif,
                "mt-3 text-[clamp(2.25rem,4.5vw,3.75rem)] leading-[1.05] font-medium text-balance",
              )}
            >
              At the soul of TRIS Travels
            </h1>
            <p
              className={cn(
                serif,
                "mt-3 text-[clamp(1.15rem,2.2vw,1.55rem)] leading-snug text-white/85 italic",
              )}
            >
              is Mei-ieid, my grandmother.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Story narrative — tighter gaps, rounded images */}
      <section className="mx-auto w-full max-w-container-max space-y-12 px-margin-mobile py-12 md:space-y-16 md:px-margin-desktop md:py-16">
        {storyMoments.map((moment) => (
          <div
            key={moment.alt}
            className={cn(
              "grid items-center gap-6 md:grid-cols-12 md:gap-10 lg:gap-12",
              moment.flip && "md:[&>*:first-child]:order-2",
            )}
          >
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl md:col-span-7">
              <Image
                src={moment.image}
                alt={moment.alt}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 58vw"
              />
            </div>
            <FadeIn className="md:col-span-5">
              {moment.lead ? (
                <p
                  className={cn(
                    serif,
                    "text-[1.2rem] leading-snug text-primary md:text-[1.35rem]",
                  )}
                >
                  {moment.lead}
                </p>
              ) : null}
              <p
                className={cn(
                  "leading-[1.75] text-on-surface-variant",
                  moment.lead
                    ? "mt-4 text-[0.95rem] md:text-base"
                    : cn(serif, "text-[1.2rem] leading-snug text-primary md:text-[1.35rem]"),
                )}
              >
                {moment.body}
              </p>
            </FadeIn>
          </div>
        ))}
      </section>

      {/* Ways we travel */}
      <section className="border-y border-outline-variant/25 bg-surface-container-lowest/60 px-margin-mobile py-14 md:px-margin-desktop md:py-16">
        <div className="mx-auto w-full max-w-container-max">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-14">
            <div className="lg:col-span-5">
              <p className="label-caps text-highlight">How we travel</p>
              <p
                className={cn(
                  serif,
                  "mt-4 text-[clamp(1.5rem,2.8vw,2.15rem)] leading-snug text-primary",
                )}
              >
                Every TRIS journey is shaped by the community.
              </p>
            </div>
            <ul className="divide-y divide-outline-variant/30 border-t border-b border-outline-variant/30 lg:col-span-7">
              {communityWays.map((label) => (
                <li
                  key={label}
                  className="py-4 text-base leading-snug text-foreground md:text-lg"
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 grid gap-10 border-t border-outline-variant/30 pt-10 md:grid-cols-3 md:gap-8">
            {heartbeat.map(({ text, Icon, ...rest }) => (
              <div
                key={text}
                className="mx-auto flex max-w-xs flex-col items-center text-center"
              >
                <Icon
                  aria-hidden
                  className="h-7 w-7 text-highlight"
                  strokeWidth={1.5}
                />
                <p className="mt-4 text-[0.95rem] leading-relaxed text-on-surface-variant md:text-base">
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

      {/* Our values — one connected composition */}
      <section className="relative overflow-hidden px-margin-mobile py-14 md:px-margin-desktop md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 15% 20%, rgba(122,163,90,0.12), transparent 42%), radial-gradient(ellipse at 85% 80%, rgba(54,64,55,0.06), transparent 40%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-container-max">
          <div className="ink-rule" />
          <div className="mt-5 max-w-2xl">
            <p className="label-caps text-highlight">Our values</p>
            <h2
              className={cn(
                serif,
                "mt-3 text-[clamp(1.9rem,3.5vw,2.85rem)] leading-tight font-medium text-primary",
              )}
            >
              What guides the way we travel
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">
              Three commitments we return to on every route — read as one guide, not three separate cards.
            </p>
          </div>

          <StaggerChildren className="mt-10 overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_12px_36px_rgba(54,64,55,0.06)] md:mt-12">
            {values.map((value, index) => (
              <StaggerItem key={value.n}>
                <article
                  className={cn(
                    "grid gap-0 md:grid-cols-12",
                    index > 0 && "border-t border-outline-variant/25",
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden md:col-span-5 md:aspect-auto md:min-h-[14rem]">
                    <Image
                      src={value.image}
                      alt={value.title}
                      fill
                      className="object-cover"
                      sizes="(max-width:768px) 100vw, 42vw"
                      quality={88}
                    />
                    <p
                      className={cn(
                        serif,
                        "absolute bottom-3 left-3 text-4xl leading-none text-white/35 md:bottom-4 md:left-4",
                      )}
                      aria-hidden
                    >
                      {value.n}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center px-5 py-5 md:col-span-7 md:px-8 md:py-7">
                    <p className="text-[11px] font-bold tracking-[0.16em] text-highlight uppercase">
                      {value.n}
                    </p>
                    <h3
                      className={cn(
                        serif,
                        "mt-2 text-[1.35rem] leading-tight text-primary md:text-[1.55rem]",
                      )}
                    >
                      {value.title}
                    </h3>
                    <p className={cn(serif, "mt-1.5 text-[0.95rem] leading-snug text-primary/75 italic")}>
                      {value.tagline}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
                      {value.body}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {impact.length > 0 ? (
        <section className="border-t border-outline-variant/25 bg-primary-container px-margin-mobile py-14 text-on-primary-container md:px-margin-desktop md:py-16">
          <div className="mx-auto w-full max-w-container-max">
            <p className="label-caps text-highlight">Our impact</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2
                className={cn(
                  serif,
                  "max-w-md text-[clamp(1.9rem,3.5vw,2.75rem)] leading-tight font-medium",
                )}
              >
                The impact you make.
              </h2>
              <p className="max-w-sm text-sm leading-relaxed text-on-primary-container/75 md:text-right">
                Every journey creates ripples beyond the traveller. When we grow, we grow together.
              </p>
            </div>

            <dl className="mt-10 grid gap-x-8 gap-y-8 border-t border-on-primary-container/15 pt-8 sm:grid-cols-2 lg:grid-cols-5">
              {impact.map((stat) => (
                <div key={stat.id}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <p className={cn(serif, "text-[2.35rem] leading-none text-highlight md:text-[2.6rem]")}>
                      {stat.value}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-on-primary-container">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-on-primary-container/70">
                      {stat.description}
                    </p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <CtaBand
        tone="light"
        className="py-10 md:py-12"
        eyebrow="Travel with us"
        title="Experience the unseen"
        body="Book a day in the hills — or partner with TRIS if you host, guide, or run a stay."
        primary={{ href: "/experiences", label: "Explore experiences" }}
        secondary={{ href: "/partner", label: "Partner with us" }}
      />
    </div>
  );
}
