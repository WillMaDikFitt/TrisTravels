import Image from "next/image";
import { media } from "@/data/media";

const faqs = [
  {
    q: "What’s the difference between an experience and a journey?",
    a: "An experience is a few hours to a full day — a trek, a kitchen, a village stay. A journey is longer: a curated package we shape with you, or a small-group departure with a set date.",
  },
  {
    q: "How far ahead should I book?",
    a: "For day experiences, booking about ten days ahead lets us confirm hosts and keep the day unhurried. Closer dates are still welcome — send a request and we’ll see what’s possible.",
  },
  {
    q: "Who will I travel with?",
    a: "Khasi hosts and local guides. Days are community-led — you eat, walk, and rest with people who live here, not a generic tour group.",
  },
  {
    q: "Can you plan something just for us?",
    a: "Yes. Send a brief through Craft my journey — dates, pace, who you’re travelling with — and we’ll shape the week around you.",
  },
  {
    q: "What’s usually included?",
    a: "Each page lists what’s in and what’s extra. Day experiences typically cover the host or guide, the activity, and often a meal. Journeys add stays and transfers as described.",
  },
  {
    q: "How do I pay?",
    a: "Day experiences can be booked online. Journeys and last-minute requests are confirmed by our team first, then we share how to pay.",
  },
];

export function HomeFaq() {
  return (
    <section className="relative flex h-full min-h-0 flex-1 flex-col justify-center overflow-hidden py-5 md:py-6">
      <Image
        src={media.faqSectionBg}
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        quality={90}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#e8ebdd]/62" />

      <div className="relative mx-auto flex w-full max-w-container-max flex-col px-margin-mobile md:px-margin-desktop">
        <div className="mx-auto max-w-2xl shrink-0 text-center">
          <div className="ink-rule mx-auto" />
          <p className="label-caps mt-2.5 text-highlight">Good to know</p>
          <h2 className="mt-2 font-[family-name:var(--font-playfair)] text-[clamp(1.65rem,3vw,2.35rem)] leading-tight text-primary">
            Questions before you go
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant md:text-sm">
            Tap a question to open the answer. Need more? Write to us and we&apos;ll reply like a host.
          </p>
        </div>

        <div className="mx-auto mt-4 w-full max-w-3xl space-y-2 md:mt-5 md:space-y-2.5">
          {faqs.map((item, index) => (
            <details
              key={item.q}
              className="group rounded-xl border border-outline-variant/30 bg-surface-container-lowest/95 shadow-[0_4px_14px_rgba(54,64,55,0.05)] backdrop-blur-[2px] transition open:border-highlight/35 open:shadow-[0_8px_22px_rgba(54,64,55,0.08)] md:rounded-2xl"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-2.5 marker:content-none focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:gap-4 md:px-5 md:py-3">
                <span className="flex min-w-0 items-center gap-2.5 text-left md:gap-3">
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold tracking-wide text-white md:h-7 md:w-7 md:text-[11px]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[0.9rem] leading-snug text-primary md:text-base">
                    {item.q}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 text-xs text-on-surface-variant transition group-open:rotate-45 group-open:border-highlight group-open:bg-highlight/10 group-open:text-highlight md:h-7 md:w-7 md:text-sm"
                >
                  +
                </span>
              </summary>
              <div className="border-t border-outline-variant/20 px-3.5 pb-3 pt-2 md:px-5 md:pb-4 md:pt-3">
                <p className="pl-8 text-xs leading-relaxed text-on-surface-variant md:pl-10 md:text-sm">
                  {item.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
