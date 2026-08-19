import Image from "next/image";
import { FadeIn } from "@/components/motion/Motion";
import { PageHero } from "@/components/motion/FullBleedParallax";
import { BreathSection } from "@/components/ui/BreathSection";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/ui/CtaBand";
import { RecognitionLogos } from "@/components/brand/BrandLogo";
import { media } from "@/data/media";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="bg-background">
      <PageHero
        src={media.aboutPortrait}
        alt="The heart behind TRIS"
        compact
        eyebrow="About TRIS"
        title="The heart behind TRIS"
        body="A promise carried forward through every homestay, meal, guide, and journey."
        primaryCta={{ href: "/experiences", label: "Explore experiences" }}
        secondaryCta={{ href: "/partner", label: "Partner with us" }}
      />

      <BreathSection
        size="md"
        eyebrow="Our story"
        title="Named for Mei-ieid"
        body="Born in Mairang, she embodied true Khasi hospitality — generous, hard-working, and unconditionally caring. TRIS carries that spirit forward."
      />

      <section className="mx-auto grid max-w-container-max items-center gap-10 px-margin-mobile pb-16 md:grid-cols-2 md:gap-16 md:px-margin-desktop md:pb-24">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Image
            src={media.heroForest}
            alt="Meghalaya landscape"
            fill
            className="object-cover"
            sizes="(max-width:768px) 100vw, 50vw"
            quality={90}
          />
        </div>
        <FadeIn>
          <p className="text-lg leading-relaxed text-on-surface-variant md:text-xl">
            At TRIS Travels, we create immersive journeys beyond sightseeing. Most tours rush you
            through places. We help you go deeper.
          </p>
          <p className="mt-5 leading-relaxed text-on-surface-variant">
            Whether it&apos;s trekking with local guides, listening to folklore, staying in village
            homestays, or supporting skilled artisans — every TRIS journey is powered by the
            community.
          </p>
          <p className="mt-5 leading-relaxed text-on-surface-variant">
            Every trip you book supports local community members and their families, because when we
            grow, we grow together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/experiences">Start exploring</Button>
            <Button href="/craft-my-journey" variant="ghost">
              Craft my journey
            </Button>
          </div>
        </FadeIn>
      </section>

      <BreathSection size="sm" eyebrow="Values" title="What guides every journey" />

      <section className="mx-auto grid max-w-container-max gap-5 px-margin-mobile pb-16 md:grid-cols-3 md:gap-6 md:px-margin-desktop md:pb-20">
        {[
          {
            n: "01",
            t: "Authentic Encounters",
            d: "Real people and places — traditional food, local hosts, immersive village life. No filters, no rush.",
            img: media.valueAuthentic,
          },
          {
            n: "02",
            t: "Community first",
            d: "90% of our services are powered by local partners. Collaboration and shared growth in everything we do.",
            img: media.valueCommunity,
          },
          {
            n: "03",
            t: "Gives back",
            d: "Each booking is a contribution. A majority of value flows back to sustain crafts, traditions, and families.",
            img: media.valueGivesBack,
          },
        ].map((v) => (
          <div key={v.t} className="group relative min-h-[320px] overflow-hidden rounded-[1.75rem] md:min-h-[380px]">
            <Image
              src={v.img}
              alt={v.t}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="font-serif text-3xl text-white/70">{v.n}</span>
              <h3 className="mt-2 font-display text-2xl">{v.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{v.d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="border-y border-outline-variant/20 bg-surface-container-low px-margin-mobile py-14 md:px-margin-desktop md:py-16">
        <div className="mx-auto max-w-container-max text-center">
          <p className="label-caps text-accent">Recognitions</p>
          <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">
            Proudly recognized by
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
            Meghalaya Tourism and NIDHI — affirmation of the work we do with communities across the
            hills.
          </p>
          <RecognitionLogos className="mt-10" />
        </div>
      </section>

      <CtaBand
        eyebrow="Travel with us"
        title="Experience the unseen"
        body="Book a day in the hills — or partner with TRIS if you host, guide, or run a stay."
        primary={{ href: "/experiences", label: "Explore experiences" }}
        secondary={{ href: "/partner", label: "Partner with us" }}
      />
    </div>
  );
}
