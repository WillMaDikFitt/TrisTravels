import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, Mountain, MapPin, Users, Star, Check } from "lucide-react";
import { experiences } from "@/data/experiences";
import { detailImages } from "@/data/media";
import { findExperience } from "@/lib/data/repo";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { FadeIn } from "@/components/motion/Motion";
import { BreathSection } from "@/components/ui/BreathSection";
import { DetailGallery } from "@/components/detail/DetailGallery";

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
      <DetailGallery images={detailImages(exp.image, exp.gallery)} alt={exp.name}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-caps text-accent">{exp.category}</span>
          {exp.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="label-caps border-l border-outline-variant/40 pl-3 text-on-surface-variant"
            >
              {t}
            </span>
          ))}
        </div>
        <h1 className="mt-4 font-display text-4xl leading-[1.02] text-balance text-primary md:text-5xl lg:text-6xl">
          {exp.name}
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-relaxed text-pretty text-on-surface-variant md:text-lg">
          {exp.tagline}
        </p>
      </DetailGallery>

      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="grid overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface-container-lowest shadow-[0_12px_35px_rgba(42,46,31,0.06)] md:grid-cols-4">
          {[
            { icon: Clock, label: "Duration", value: exp.duration },
            { icon: Mountain, label: "Difficulty", value: exp.difficulty },
            { icon: MapPin, label: "Location", value: exp.location },
            { icon: Users, label: "Group size", value: `Max ${exp.maxGuests}` },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex gap-3 border-b border-outline-variant/20 p-5 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
            >
              <Icon className="mt-0.5 shrink-0 text-accent" size={18} />
              <div>
                <p className="label-caps text-[10px] text-on-surface-variant">{label}</p>
                <p className="mt-1 font-medium text-primary">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-container-max px-margin-mobile pt-6 md:hidden">
        <BookingWidget experience={exp} compact />
      </div>

      <div className="mx-auto grid max-w-container-max gap-12 px-margin-mobile py-12 md:grid-cols-[minmax(0,1fr)_360px] md:px-margin-desktop md:py-16 lg:gap-16">
        <div className="space-y-16">
          <FadeIn>
            <section className="border-l-2 border-accent pl-6 md:pl-8">
              <p className="label-caps text-accent">The experience</p>
              <h2 className="mt-3 font-display text-3xl text-primary md:text-4xl">A day rooted in place</h2>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-on-surface-variant">{exp.overview}</p>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="rounded-3xl bg-primary p-7 text-white md:p-10">
              <p className="label-caps text-white/65">Why TRIS chose it</p>
              <h2 className="mt-3 font-display text-3xl text-white">The story behind the journey</h2>
              <p className="mt-5 text-lg leading-8 text-white/70">{exp.trisStory}</p>
              {exp.guideQuote && (
                <blockquote className="mt-8 flex gap-4 border-t border-white/15 pt-6">
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
                    <p className="text-lg italic text-white/90">
                      &ldquo;{exp.guideQuote.quote}&rdquo;
                    </p>
                    <p className="mt-2 text-sm text-white/55">
                      {exp.guideQuote.name} · {exp.guideQuote.role}
                    </p>
                  </div>
                </blockquote>
              )}
            </section>
          </FadeIn>

          <FadeIn>
            <div className="grid overflow-hidden rounded-3xl border border-outline-variant/25 md:grid-cols-2">
              <div className="p-7 md:p-8">
                <p className="label-caps text-accent">What stands out</p>
                <h3 className="mt-2 font-display text-2xl text-primary">Highlights</h3>
                <ul className="mt-4 space-y-3">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-on-surface-variant">
                      <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-outline-variant/25 bg-surface-container-low p-7 md:border-t-0 md:border-l md:p-8">
                <p className="label-caps text-accent">Taken care of</p>
                <h3 className="mt-2 font-display text-2xl text-primary">What&apos;s included</h3>
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
              <p className="label-caps text-accent">Step by step</p>
              <h2 className="mt-2 font-display text-3xl text-primary">How the day unfolds</h2>
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
              <p className="label-caps text-accent">Before you go</p>
              <h2 className="mt-2 font-display text-2xl text-primary md:text-3xl">Essential information</h2>
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {[
                  { title: "What to bring", eyebrow: "Pack list", items: exp.whatToBring },
                  { title: "Suitable for", eyebrow: "Who it fits", items: exp.suitableFor },
                  {
                    title: "Before you book",
                    eyebrow: "Good to know",
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
                    className="flex flex-col rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(42,46,31,0.05)]"
                  >
                    <p className="label-caps text-[10px] text-accent">{card.eyebrow}</p>
                    <h3 className="mt-2 font-display text-xl text-primary">{card.title}</h3>
                    <ul className="mt-5 flex-1 space-y-3">
                      {card.items.map((item) => (
                        <li key={item} className="flex gap-3 text-sm leading-relaxed text-on-surface-variant">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{item}</span>
                        </li>
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

        <aside className="hidden md:block md:self-start md:sticky md:top-[calc(var(--header-offset)+2.5rem)]">
          <BookingWidget experience={exp} />
        </aside>
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
