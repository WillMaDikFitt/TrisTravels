import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Route, Star, Check, Timer } from "lucide-react";
import { experiences } from "@/data/experiences";
import { detailImages } from "@/data/media";
import { findExperience } from "@/lib/data/repo";
import { BOOKING_NOTICE_DAYS } from "@/lib/utils";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { FadeIn } from "@/components/motion/Motion";
import { BreathSection } from "@/components/ui/BreathSection";
import { DetailGallery } from "@/components/detail/DetailGallery";
import { ListingFaqCta } from "@/components/listings/ListingFaqCta";

type Props = { params: Promise<{ slug: string }> };

/** Pick up Studio / Firestore edits without waiting for a full redeploy. */
export const revalidate = 60;

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

  const metaItems = [
    { icon: Clock, label: "Duration", value: exp.duration },
    ...(exp.durationHours > 0
      ? [
          {
            icon: Timer,
            label: "Activity duration",
            value: `${exp.durationHours} ${exp.durationHours === 1 ? "hour" : "hours"}`,
          },
        ]
      : []),
    { icon: CalendarDays, label: "Best time to visit", value: exp.bestSeason },
    { icon: MapPin, label: "Location", value: exp.location },
    { icon: Route, label: "Distance from Shillong", value: exp.distanceFromShillong || "On request" },
  ];

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
        <div className="relative z-10 grid gap-6 pb-8 md:grid-cols-[minmax(0,1fr)_340px] md:items-start md:gap-8 md:pb-10">
          <aside className="hidden md:sticky md:top-[calc(var(--header-offset)+0.5rem)] md:col-start-2 md:row-start-1 md:block md:self-start">
            <BookingWidget experience={exp} />
          </aside>

          <div className="space-y-10 md:col-start-1 md:row-start-1">
            {/* gap-px over a tinted ground draws the dividers, so rows can wrap cleanly. */}
            <div
              className={`grid gap-px overflow-hidden rounded-2xl border border-outline-variant/25 bg-outline-variant/20 shadow-[0_12px_35px_rgba(42,46,31,0.06)] sm:grid-cols-2 ${
                metaItems.length > 4 ? "xl:grid-cols-5" : "xl:grid-cols-4"
              }`}
            >
              {metaItems.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={`flex gap-3 bg-surface-container-lowest px-5 py-4 xl:flex-col xl:gap-2 xl:px-4 ${
                    metaItems.length % 2 === 1 ? "sm:last:col-span-2 xl:last:col-span-1" : ""
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] leading-tight font-semibold tracking-[0.12em] text-on-surface-variant/75 uppercase">
                      {label}
                    </p>
                    <p className="mt-1 font-serif text-[15px] leading-snug break-words text-primary">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="md:hidden">
              <BookingWidget experience={exp} />
            </div>

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
            <section className="rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-7 md:p-8">
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
            </section>
          </FadeIn>

          <FadeIn>
            <section>
              <p className="label-caps text-accent">Itinerary</p>
              <h2 className="mt-2 font-display text-3xl text-primary">How the day unfolds</h2>
              <ol className="relative mt-8 space-y-8 border-l border-outline-variant/40 pl-8">
                {exp.itinerary.map((day, index) => (
                  <li key={`${day.title}-${index}`} className="relative">
                    <span className="absolute top-1.5 left-0 h-3 w-3 -translate-x-[calc(2rem+6px)] rounded-full bg-accent" />
                    <h4 className="font-display text-lg text-primary">{day.title}</h4>
                    {day.description?.trim() ? (
                      <p className="mt-2 whitespace-pre-line text-on-surface-variant">{day.description}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          </FadeIn>

          <FadeIn>
            <section className="grid gap-px overflow-hidden rounded-2xl border border-outline-variant/30 bg-outline-variant/30 md:grid-cols-2">
              <div className="bg-surface-container-lowest p-6 md:p-8">
                <p className="label-caps text-highlight">Inclusions</p>
                <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
                  {exp.included.map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 shrink-0 text-highlight" size={16} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-container-lowest p-6 md:p-8">
                <p className="label-caps text-highlight">Exclusions</p>
                {(exp.excluded?.length ?? 0) > 0 ? (
                  <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
                    {exp.excluded!.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-on-surface-variant">
                    Shared when we confirm your booking.
                  </p>
                )}
              </div>
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
                      `${BOOKING_NOTICE_DAYS}+ days ahead: book online`,
                      `Under ${BOOKING_NOTICE_DAYS} days: request booking`,
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

          <FadeIn>
            <ListingFaqCta
              href="/experiences/faqs"
              body="Common questions about booking, transport, children, and how TRIS experiences usually work — one shared guide for every day outing."
            />
          </FadeIn>
        </div>
        </div>
      </div>

      <BreathSection
        size="sm"
        className="!py-10 md:!py-12"
        eyebrow="Keep exploring"
        title="More experiences across Meghalaya"
        cta={{ href: "/experiences", label: "Browse all" }}
      />
    </div>
  );
}
