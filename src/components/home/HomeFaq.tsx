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
    <section className="bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="ink-rule" />
            <p className="label-caps mt-4 text-highlight">Good to know</p>
            <h2 className="mt-3 font-display text-3xl text-primary md:text-5xl">
              Questions before you go
            </h2>
            <p className="mt-4 max-w-sm text-on-surface-variant">
              A few practical answers. If you need more, write to us — we’ll reply like a host, not a
              helpdesk.
            </p>
          </div>
          <div className="divide-y divide-[#e4dfd4] lg:col-span-8">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg text-secondary marker:content-none focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-xl">
                  <span>{item.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#d4cec0] text-sm text-[#6b734f] transition group-open:rotate-45 group-open:border-accent group-open:text-accent"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-on-surface-variant">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
