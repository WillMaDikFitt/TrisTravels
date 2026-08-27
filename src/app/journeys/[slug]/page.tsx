import { notFound } from "next/navigation";
import Link from "next/link";
import { journeys } from "@/data/journeys";
import { findJourney } from "@/lib/data/repo";
import { detailImages } from "@/data/media";
import { formatINR, cn } from "@/lib/utils";
import { FadeIn } from "@/components/motion/Motion";
import { DetailGallery } from "@/components/detail/DetailGallery";
import { Button } from "@/components/ui/Button";
import { CtaBand } from "@/components/ui/CtaBand";
import { Check, Clock3 } from "lucide-react";
import { JourneyEnquire } from "@/components/enquiries/JourneyEnquire";
import { AccordionItem } from "@/components/ui/Accordion";
import { CURATED_ONLINE_BOOK_DAYS } from "@/data/journey-options";
import { FIXED_DEPARTURE_PATCHES } from "@/data/fixed-departures";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journeys.map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  return { title: journey?.name ?? "Journey" };
}

export default async function JourneyDetailPage({ params }: Props) {
  const { slug } = await params;
  const journey = await findJourney(slug);
  if (!journey) notFound();

  const isFixed = journey.type === "small-group";
  const fixedMeta = isFixed ? FIXED_DEPARTURE_PATCHES[journey.slug] : undefined;
  const departureList =
    journey.departureSeats?.map((d) =>
      new Date(`${d.date}T12:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    ) ?? [];
  const glance = [
    { label: "Duration", value: `${journey.days} Days / ${journey.nights} Nights` },
    { label: "From price", value: formatINR(journey.priceFrom) },
    ...(isFixed && journey.startingPoint
      ? [{ label: "Starting point", value: journey.startingPoint }]
      : [{ label: "Best time to travel", value: journey.season }]),
    {
      label: isFixed ? "Group size" : "Style",
      value: isFixed
        ? journey.groupSize || "—"
        : journey.style?.slice(0, 2).join(" · ") || journey.groupSize || "—",
    },
    ...(journey.notSuitableFor?.length && !isFixed
      ? [{ label: "Not suitable for", value: journey.notSuitableFor.join(", ") }]
      : isFixed && journey.season
        ? [{ label: "Season", value: journey.season }]
        : []),
  ];

  return (
    <div className="bg-surface text-foreground">
      <DetailGallery images={detailImages(journey.image, journey.gallery)} alt={journey.name}>
        <p className="label-caps text-highlight">
          {isFixed
            ? journey.idCode
              ? `Fixed departure · ${journey.idCode}`
              : "Fixed departure"
            : "Curated Journey"}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-4xl leading-[1.05] text-balance text-primary md:text-5xl lg:text-[3.35rem]">
          {journey.name}
        </h1>
        <p className="mt-3 text-base text-on-surface-variant md:text-lg">{journey.tagline}</p>
      </DetailGallery>

      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(54,64,55,0.06)] md:p-8">
          <p className="label-caps text-highlight">Journey at a glance</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {glance.map((item) => (
              <div key={item.label}>
                <p className="text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-medium text-primary md:text-[0.95rem]">{item.value}</p>
              </div>
            ))}
          </div>
          {journey.route ? (
            <p className="mt-5 border-t border-outline-variant/25 pt-4 text-sm text-on-surface-variant">
              <span className="font-semibold text-primary">Route:</span> {journey.route}
            </p>
          ) : null}
          {isFixed && departureList.length > 0 ? (
            <p className="mt-3 text-sm text-on-surface-variant">
              <span className="font-semibold text-primary">Departure dates:</span>{" "}
              {departureList.join(" · ")}
            </p>
          ) : null}
          {!isFixed && (
            <p className={`${journey.route ? "mt-3" : "mt-6 border-t border-outline-variant/25 pt-4"} text-sm text-on-surface-variant`}>
              <span className="font-semibold text-primary">{CURATED_ONLINE_BOOK_DAYS}+ days ahead:</span> Book
              online
              <span className="mx-2 text-outline">·</span>
              <span className="font-semibold text-primary">Within {CURATED_ONLINE_BOOK_DAYS} days:</span> Enquire
              or customise
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-container-max gap-12 px-margin-mobile py-12 md:grid-cols-[minmax(0,1fr)_320px] md:px-margin-desktop md:py-16 lg:gap-14">
        <div className="min-w-0 space-y-14">
          {isFixed ? (
            <FadeIn>
              <section>
                <p className="label-caps text-highlight">{journey.whyTitle || "Why this journey?"}</p>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-on-surface-variant whitespace-pre-line">
                  {journey.overview}
                </div>
                <p className="mt-6 font-serif text-lg italic text-primary">
                  Stop waiting. Start living — this is your adventure.
                </p>
              </section>
            </FadeIn>
          ) : null}

          {(journey.tourHighlights ?? journey.highlights)?.length ? (
            <FadeIn>
              <section>
                <p className="label-caps text-highlight">
                  {isFixed ? "Tour highlights" : "Highlights"}
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl text-primary md:text-3xl">
                  {isFixed ? "What you’ll love" : "What makes this journey special"}
                </h2>
                <ul className="mt-6 space-y-3">
                  {(journey.tourHighlights ?? journey.highlights).map((h) => (
                    <li key={h} className="flex gap-3 text-on-surface-variant">
                      <Check className="mt-0.5 shrink-0 text-highlight" size={18} />
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </FadeIn>
          ) : null}

          <FadeIn>
            <section>
              <p className="label-caps text-highlight">Day by day</p>
              <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl text-primary md:text-3xl">
                Your itinerary
              </h2>
              {isFixed ? (
                <div className="mt-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-5 md:px-6">
                  {journey.itinerary.map((day, index) => (
                    <AccordionItem
                      key={day.day}
                      title={`Day ${day.day}: ${day.title}`}
                      defaultOpen={index === 0}
                    >
                      {day.activities ? (
                        <p className="mb-2 font-medium text-primary/85">
                          Visits / activities:{" "}
                          <span className="font-normal text-on-surface-variant">{day.activities}</span>
                        </p>
                      ) : null}
                      <p>{day.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                        {day.trekDifficulty ? (
                          <span>
                            <span className="text-primary">Trek:</span> {day.trekDifficulty}
                          </span>
                        ) : null}
                        {day.meals ? (
                          <span>
                            <span className="text-primary">Meals:</span> {day.meals}
                          </span>
                        ) : null}
                        {day.overnight ? (
                          <span>
                            <span className="text-primary">Overnight:</span> {day.overnight}
                          </span>
                        ) : null}
                      </div>
                    </AccordionItem>
                  ))}
                </div>
              ) : (
                <ol className="relative mt-8 border-l border-outline-variant/40">
                  {journey.itinerary.map((day, index) => (
                    <li
                      key={day.day}
                      className={cn(
                        "relative border-b border-outline-variant/20 py-6 pl-8 last:border-b-0",
                        index === 0 && "pt-0",
                      )}
                    >
                      <span className="absolute top-7 left-0 h-2.5 w-2.5 -translate-x-[5.5px] rounded-full bg-primary first:top-1" />
                      <p className="text-[11px] font-bold tracking-[0.14em] text-highlight uppercase">
                        Day {String(day.day).padStart(2, "0")}
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-xl text-primary">
                        {day.title}
                      </h3>
                      {day.activities ? (
                        <p className="mt-2 text-sm font-medium text-primary/85">
                          Visits / activities:{" "}
                          <span className="font-normal text-on-surface-variant">{day.activities}</span>
                        </p>
                      ) : null}
                      <p className="mt-2 leading-relaxed text-on-surface-variant">{day.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-on-surface-variant">
                        {day.trekDifficulty ? (
                          <span>
                            <span className="text-primary">Trek:</span> {day.trekDifficulty}
                          </span>
                        ) : null}
                        {day.meals ? (
                          <span>
                            <span className="text-primary">Meals:</span> {day.meals}
                          </span>
                        ) : null}
                        {day.overnight ? (
                          <span>
                            <span className="text-primary">Overnight:</span> {day.overnight}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </FadeIn>

          <FadeIn>
            {isFixed ? (
              <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest px-5 md:px-6">
                <AccordionItem title="Read more — what’s included & excluded" defaultOpen={false}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-primary">Inclusions</p>
                      <ul className="mt-3 space-y-2">
                        {journey.inclusions.map((item) => (
                          <li key={item} className="flex gap-2">
                            <Check className="mt-0.5 shrink-0 text-highlight" size={16} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Exclusions</p>
                      {(journey.exclusions?.length ?? 0) > 0 ? (
                        <ul className="mt-3 space-y-2">
                          {journey.exclusions!.map((item) => (
                            <li key={item} className="flex gap-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-3">Shared when we confirm your journey.</p>
                      )}
                    </div>
                  </div>
                </AccordionItem>
              </section>
            ) : (
              <section className="grid gap-px overflow-hidden rounded-2xl border border-outline-variant/30 bg-outline-variant/30 md:grid-cols-2">
                <div className="bg-surface-container-lowest p-6 md:p-8">
                  <p className="label-caps text-highlight">Inclusions</p>
                  <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
                    {journey.inclusions.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 shrink-0 text-highlight" size={16} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-surface-container-lowest p-6 md:p-8">
                  <p className="label-caps text-highlight">Exclusions</p>
                  {(journey.exclusions?.length ?? 0) > 0 ? (
                    <ul className="mt-4 space-y-2.5 text-sm text-on-surface-variant">
                      {journey.exclusions!.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-on-surface-variant" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-on-surface-variant">
                      Shared when we confirm your journey.
                    </p>
                  )}
                </div>
              </section>
            )}
          </FadeIn>

          {!isFixed ? (
            <FadeIn>
              <section className="rounded-2xl border border-outline-variant/25 bg-surface-container-lowest/80 px-5 py-5 md:px-6">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Clock3 size={16} className="text-highlight" />
                  Note on timing in Meghalaya
                </p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  In Meghalaya, the day begins and ends earlier than in many other parts of India. Sunrise can be
                  around 5:00 AM, while sunset can be as early as 4:45 PM–5:30 PM, especially in winter. To make
                  the most of your journey and natural daylight, we recommend starting your days early.
                </p>
              </section>
            </FadeIn>
          ) : null}

          <FadeIn>
            <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-7 md:p-9">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-primary md:text-3xl">
                {isFixed
                  ? fixedMeta?.ctaCustomise || "Still have questions or want to customize?"
                  : "Want the full day-wise itinerary?"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-base">
                {isFixed
                  ? "Let us know what you’re dreaming of — fill out a short form and we’ll tailor it just for you."
                  : "We've thoughtfully crafted this journey using our local knowledge to make it meaningful, memorable and well paced for you. Once you confirm your interest, we'll share the full itinerary, including:"}
              </p>
              {!isFixed ? (
                <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
                  <li className="flex gap-2">
                    <Check size={16} className="mt-0.5 text-highlight" /> Detailed day-wise plan
                  </li>
                  <li className="flex gap-2">
                    <Check size={16} className="mt-0.5 text-highlight" /> Stay suggestions
                  </li>
                  <li className="flex gap-2">
                    <Check size={16} className="mt-0.5 text-highlight" /> Packing tips tailored to
                    your route and activities
                  </li>
                </ul>
              ) : null}
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  href={
                    isFixed
                      ? `/journeys/${journey.slug}/enquire`
                      : `/journeys/${journey.slug}/book`
                  }
                >
                  {isFixed ? "Register now" : "Let the adventure begin"}
                </Button>
                {isFixed ? (
                  <Button
                    variant="ghost"
                    href={`/journeys/${journey.slug}/enquire?mode=customise`}
                  >
                    Customise your journey
                  </Button>
                ) : null}
              </div>
              {isFixed ? (
                <p className="mt-4 text-xs text-on-surface-variant">
                  Limited spots available.{" "}
                  <Link
                    href="/terms/fixed-departures"
                    className="font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Terms &amp; conditions
                  </Link>
                </p>
              ) : null}
            </section>
          </FadeIn>
        </div>

        <aside className="order-first h-fit rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-[0_14px_40px_rgba(54,64,55,0.08)] md:order-none md:sticky md:top-[calc(var(--header-offset)+1.5rem)] md:self-start">
          <p className="label-caps text-highlight">{isFixed ? "Limited spots" : "Start booking"}</p>
          <p className="mt-4 text-sm text-on-surface-variant">From</p>
          <p className="font-[family-name:var(--font-playfair)] text-3xl text-primary">
            {formatINR(journey.priceFrom)}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">per person</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            {journey.days} Days / {journey.nights} Nights
            {journey.groupSize ? ` · ${journey.groupSize}` : ""}
          </p>
          {journey.nextDeparture ? (
            <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-sm text-primary">
              {isFixed ? "Departures: " : "Next departure: "}
              {journey.nextDeparture}
            </p>
          ) : null}
          <JourneyEnquire
            journeyName={journey.name}
            journeySlug={journey.slug}
            fixed={isFixed}
            departureDates={journey.departureSeats?.map((d) => d.date) ?? []}
          />
          <p className="mt-4 text-center text-xs leading-relaxed text-on-surface-variant">
            {isFixed
              ? "Your seat is held provisionally while we confirm availability and advance payment."
              : "50% to confirm. 50% before you travel."}
          </p>
        </aside>
      </div>

      <CtaBand
        tone="light"
        eyebrow="Keep exploring"
        title="Browse more journeys"
        primary={{
          href: isFixed ? "/journeys?type=small-group" : "/journeys?type=curated",
          label: isFixed ? "All fixed departures" : "All curated journeys",
        }}
      />
    </div>
  );
}
