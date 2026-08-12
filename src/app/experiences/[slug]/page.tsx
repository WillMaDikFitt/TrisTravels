import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Mountain, MapPin, Users, Star, Check } from "lucide-react";
import { experiences } from "@/data/experiences";
import { findExperience } from "@/lib/data/repo";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { FadeIn } from "@/components/motion/Motion";
import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { BreathSection } from "@/components/ui/BreathSection";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const exp = await findExperience(slug);
  return { title: exp?.seo?.title ?? exp?.name ?? "Experience" };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const exp = await findExperience(slug);
  if (!exp) notFound();

  return (
    <div className="bg-background">
      <section className="relative h-[68vh] min-h-[calc(420px+var(--header-offset))] w-full overflow-hidden pt-header">
        <ParallaxImage src={exp.image} alt={exp.name} priority overlay={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/20" />
        <div className="absolute inset-0 z-10 flex items-end">
          <div className="w-full px-margin-mobile pb-10 pt-8 md:px-margin-desktop md:pb-14">
            <div className="mx-auto max-w-container-max">
              <div className="flex flex-wrap gap-2">
                <span className="label-caps rounded-full bg-accent px-3 py-1 text-on-accent">
                  {exp.category}
                </span>
                {exp.tags.slice(0, 2).map((t) => (
                  <span
                    key={t}
                    className="label-caps rounded-full bg-white/15 px-3 py-1 text-white/90 backdrop-blur-sm"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[0.98] text-white text-shadow-subtle md:text-6xl">
                {exp.name}
              </h1>
              <p className="mt-3 max-w-xl text-white/85">{exp.tagline}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid border-b border-outline-variant/20 md:grid-cols-4">
        {[
          { icon: Clock, label: "Duration", value: exp.duration },
          { icon: Mountain, label: "Difficulty", value: exp.difficulty },
          { icon: MapPin, label: "Location", value: exp.location },
          { icon: Users, label: "Group size", value: `Max ${exp.maxGuests}` },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex gap-3 border-b border-outline-variant/20 p-5 md:border-r md:border-b-0 md:last:border-r-0"
          >
            <Icon className="mt-0.5 shrink-0 text-accent" size={18} />
            <div>
              <p className="text-xs text-on-surface-variant">{label}</p>
              <p className="font-medium text-primary">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-container-max px-margin-mobile pt-6 md:hidden">
        <BookingWidget experience={exp} compact />
      </div>

      <div className="mx-auto grid max-w-container-max gap-10 px-margin-mobile py-10 md:grid-cols-[1fr_360px] md:px-margin-desktop md:py-12">
        <div className="space-y-12">

          <FadeIn>
            <section>
              <h2 className="font-display text-2xl text-primary">Overview</h2>
              <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{exp.overview}</p>
            </section>
          </FadeIn>

          <FadeIn>
            <section>
              <h2 className="font-display text-2xl text-primary">The TRIS Story</h2>
              <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{exp.trisStory}</p>
              {exp.guideQuote && (
                <blockquote className="mt-8 flex gap-4 rounded-2xl bg-surface-container p-6">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={exp.guideQuote.avatar}
                      alt={exp.guideQuote.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <p className="text-lg italic text-on-surface">
                      &ldquo;{exp.guideQuote.quote}&rdquo;
                    </p>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {exp.guideQuote.name} · {exp.guideQuote.role}
                    </p>
                  </div>
                </blockquote>
              )}
            </section>
          </FadeIn>

          {exp.gallery.length > 0 && (
            <FadeIn>
              <div className="grid gap-3 md:grid-cols-3">
                {exp.gallery.map((src) => (
                  <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image src={src} alt={`${exp.name} gallery`} fill className="object-cover" sizes="33vw" />
                  </div>
                ))}
              </div>
            </FadeIn>
          )}

          <FadeIn>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="font-display text-xl text-primary">Highlights</h3>
                <ul className="mt-4 space-y-3">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-on-surface-variant">
                      <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-display text-xl text-primary">What&apos;s included</h3>
                <ul className="mt-4 space-y-3">
                  {exp.included.map((h) => (
                    <li key={h} className="flex gap-2 text-on-surface-variant">
                      <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          <FadeIn>
            <section>
              <h2 className="font-display text-2xl text-primary">The Journey</h2>
              <ol className="relative mt-8 space-y-8 border-l border-outline-variant/40 pl-8">
                {exp.itinerary.map((step) => (
                  <li key={step.time} className="relative">
                    <span className="absolute top-1.5 left-0 h-3 w-3 -translate-x-[calc(2rem+6px)] rounded-full bg-accent" />
                    <p className="label-caps text-accent">{step.time}</p>
                    <h4 className="mt-1 font-display text-lg text-primary">{step.title}</h4>
                    <p className="mt-1 text-on-surface-variant">{step.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          </FadeIn>

          <FadeIn>
            <section>
              <h2 className="font-display text-2xl text-primary">Essential information</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  { title: "What to bring", items: exp.whatToBring },
                  { title: "Suitable for", items: exp.suitableFor },
                  {
                    title: "Before you book",
                    items: [
                      `Best season: ${exp.bestSeason}`,
                      `Meeting point: ${exp.meetingPoint}`,
                      "10+ days ahead: book online",
                      "Under 10 days: request booking",
                    ],
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5"
                  >
                    <h3 className="font-display text-lg text-primary">{card.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-on-surface-variant">
                      {card.items.map((item) => (
                        <li key={item}>· {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          {exp.reviews.length > 0 && (
            <FadeIn>
              <section>
                <h2 className="font-display text-2xl text-primary">Traveller perspectives</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {exp.reviews.map((r) => (
                    <div
                      key={r.name}
                      className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest p-5"
                    >
                      <div className="flex gap-0.5 text-accent">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <p className="mt-3 text-on-surface-variant italic">&ldquo;{r.quote}&rdquo;</p>
                      <p className="mt-3 text-sm font-medium text-primary">
                        {r.name} · {r.place}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </FadeIn>
          )}

          {exp.faqs.length > 0 && (
            <FadeIn>
              <section className="pb-4">
                <h2 className="font-display text-2xl text-primary">FAQ</h2>
                <div className="mt-6 divide-y divide-outline-variant/30">
                  {exp.faqs.map((f) => (
                    <details key={f.q} className="group py-4">
                      <summary className="cursor-pointer list-none font-medium text-primary marker:content-none focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        {f.q}
                      </summary>
                      <p className="mt-2 text-on-surface-variant">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </FadeIn>
          )}
        </div>

        <div className="hidden md:block md:self-start">
          <BookingWidget experience={exp} />
        </div>
      </div>

      <BreathSection
        size="md"
        eyebrow="Keep exploring"
        title="More experiences across Meghalaya"
        cta={{ href: "/experiences", label: "Browse all" }}
      />
    </div>
  );
}
