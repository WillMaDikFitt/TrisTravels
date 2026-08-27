import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Package Tours — Terms & Conditions",
  description:
    "TRIS Travels package booking terms & conditions. Effective from August 2026 onwards.",
};

const stayCategories = [
  {
    emoji: "👣",
    title: "Barefoot Stays",
    tagline: "Good value, thoughtfully chosen.",
    body: "Comfortable, thoughtfully chosen stays that offer a genuine local experience while keeping your journey easy on the budget.",
    think: "I want a good, authentic place to stay without paying for extra frills.",
  },
  {
    emoji: "🏡",
    title: "Signature Stays",
    tagline: "More comfort. More character. Thoughtfully selected.",
    body: "Handpicked stays chosen for a memorable feature — heritage or a beautiful view or waterfall nearby or riverside setting or distinctive location.",
    think: "I want a more comfortable stay with something special to remember.",
  },
  {
    emoji: "🌿",
    title: "Offbeat Stays",
    tagline: "Stay away from the crowds.",
    body: "Thoughtfully chosen stays in quieter, less-busy locations — whether in a village, on the edge of a town or slightly outside the main tourist areas. Perfect for peace, space and a slower pace.",
    think: "I want to stay somewhere quieter, experience local life more closely, and enjoy a slower pace.",
  },
] as const;

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
      {items.map((item) => (
        <li key={item.slice(0, 48)} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-header border-t border-outline-variant/25 pt-10">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-2xl text-highlight">{number}</span>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-primary md:text-[1.75rem]">
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function PackageTermsPage() {
  return (
    <div className="bg-surface text-foreground">
      <header className="border-b border-outline-variant/25 bg-primary-container px-margin-mobile pt-[calc(var(--header-offset)+2.5rem)] pb-12 text-on-primary-container md:px-margin-desktop md:pb-14">
        <div className="mx-auto max-w-3xl">
          <p className="label-caps text-highlight">Legal</p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-tight md:text-4xl lg:text-[2.75rem]">
            Terms &amp; Conditions — Package Tours
          </h1>
          <p className="mt-4 text-sm text-on-primary-container/80 md:text-base">
            TRIS Travels – Package Booking Terms &amp; Conditions
          </p>
          <p className="mt-2 text-sm font-medium text-highlight">
            Effective from August 2026 onwards
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
          By confirming a package booking with TRIS Travels, the traveller acknowledges that they
          have read, understood and agreed to these Terms &amp; Conditions. These terms are intended
          to ensure transparency, clarity and a smooth travel experience for both the traveller and
          TRIS Travels.
        </p>
        <p className="mt-4 text-sm text-on-surface-variant">
          Booking a fixed departure group tour?{" "}
          <Link
            href="/terms/fixed-departures"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            See Fixed Departures terms (June 2025)
          </Link>
          .
        </p>

        <nav
          aria-label="Sections"
          className="mt-10 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6"
        >
          <p className="text-[11px] font-bold tracking-[0.14em] text-highlight uppercase">
            On this page
          </p>
          <ol className="mt-3 columns-1 gap-x-8 space-y-1.5 text-sm text-primary sm:columns-2">
            {[
              ["booking", "1. Booking Confirmation & Payment"],
              ["transportation", "2. Transportation"],
              ["accommodation", "3. Accommodation"],
              ["cancellation", "4. Cancellation & Refund Policy"],
              ["duration", "5. Duration & Daily Operating Hours"],
              ["itinerary", "6. Changes to the Itinerary"],
              ["conduct", "7. Driver Conduct & Passenger Behaviour"],
              ["belongings", "8. Passenger Responsibility & Personal Belongings"],
              ["fees", "9. Driver Fees, Fuel & Tolls"],
              ["safety", "10. Safety"],
              ["suppliers", "11. Third-Party Suppliers & Service Arrangements"],
              ["force-majeure", "12. Natural Calamities, Force Majeure & Unforeseen Circumstances"],
              ["insurance", "13. Insurance"],
              ["media", "14. Photography & Media"],
              ["amendments", "15. Special Requests & Booking Amendments"],
              ["health", "16. Traveller Health, Fitness & Suitability"],
              ["disputes", "17. Dispute Resolution"],
              ["acceptance", "18. Acceptance of Terms"],
              ["contact", "19. Contact Information"],
            ].map(([id, label]) => (
              <li key={id} className="break-inside-avoid">
                <a href={`#${id}`} className="hover:underline">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 space-y-12">
          <Section id="booking" number="01" title="Booking Confirmation & Payment">
            <BulletList
              items={[
                "A 50% advance payment of the total booking value is required to confirm a package booking.",
                "The booking is considered confirmed only after the required advance payment has been received and TRIS Travels has issued booking confirmation.",
                "The remaining 50% balance must be paid at least 20 days before the trip start date, unless a different payment schedule has been specifically agreed in writing.",
                "If the balance payment is not received by the due date, TRIS Travels reserves the right to release or cancel pending reservations that have not yet been fully secured.",
                "Certain services, including special accommodation, activities, permits, transportation or other time-sensitive arrangements, may require earlier or full payment. Where applicable, this will be communicated to the traveller before confirmation.",
                "All arrangements are subject to availability until the booking has been confirmed.",
              ]}
            />
          </Section>

          <Section id="transportation" number="02" title="Transportation">
            <p className="text-sm text-on-surface-variant md:text-[0.95rem]">
              Where private transportation is included in the package:
            </p>
            <BulletList
              items={[
                "Transportation will be arranged according to the vehicle category confirmed at the time of booking.",
                "In exceptional circumstances, TRIS Travels may provide an equivalent or upgraded vehicle, subject to availability.",
                "Transportation is provided strictly according to the agreed itinerary and operating schedule.",
                "Any additional vehicle usage, route deviation, additional hours, additional destinations or services not included in the confirmed itinerary may incur additional charges.",
                "Travellers may request reasonable stops along the designated route, subject to road conditions, safety and the agreed daily operating hours.",
                "Stops along the route do not include additional overnight stays unless specifically arranged and confirmed.",
                "Changes or additions to transportation services after booking are subject to availability and may involve additional costs.",
                "TRIS Travels will make reasonable efforts to accommodate requested transportation changes but cannot guarantee availability of a particular vehicle or driver.",
              ]}
            />
          </Section>

          <Section id="accommodation" number="03" title="Accommodation">
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              Accommodation is selected according to the itinerary, package level and traveller
              preferences communicated at the time of booking.
            </p>

            <h3 className="mt-8 text-sm font-semibold tracking-wide text-primary uppercase">
              3.1 Accommodation Categories
            </h3>
            <div className="mt-4 space-y-4">
              {stayCategories.map((stay) => (
                <div
                  key={stay.title}
                  className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5"
                >
                  <p className="font-medium text-primary">
                    <span className="mr-1.5" aria-hidden>
                      {stay.emoji}
                    </span>
                    {stay.title}
                  </p>
                  <p className="mt-1 text-sm font-medium text-highlight">{stay.tagline}</p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{stay.body}</p>
                  <p className="mt-3 font-serif text-sm italic text-primary/80">
                    Think: “{stay.think}”
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-sm font-semibold tracking-wide text-primary uppercase">
              3.2 Accommodation Conditions
            </h3>
            <BulletList
              items={[
                "Accommodation categories describe the general character and style of the stay. The actual property will depend on availability and the itinerary.",
                "Specific room types, views, bed configurations, floor preferences, early check-in, late check-out, extra beds, upgraded amenities and other special requests are subject to availability.",
                "Such requests may involve additional charges and will be confirmed separately where applicable.",
                "Changes to accommodation after booking may result in additional charges, including any supplier cancellation or amendment charges.",
                "Where a confirmed accommodation becomes unavailable due to circumstances beyond TRIS Travels' control, TRIS will make reasonable efforts to arrange an alternative accommodation of a similar range and standard, subject to availability.",
                "In some destinations, particularly rural or community-based locations, accommodation may have fewer facilities than conventional hotels. The accommodation description provided at the time of booking should be considered the reference for what is included.",
              ]}
            />
          </Section>

          <Section id="cancellation" number="04" title="Cancellation & Refund Policy">
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              Cancellation requests must be made in writing to{" "}
              <a
                href="mailto:trissimai03@gmail.com"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                trissimai03@gmail.com
              </a>
              .
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
              <table className="w-full text-left text-sm">
                <thead className="bg-primary-container text-on-primary-container">
                  <tr>
                    <th className="px-4 py-3 font-semibold">When you cancel</th>
                    <th className="px-4 py-3 font-semibold">Refund</th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">Retained</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface-variant">
                  <tr className="border-t border-outline-variant/25">
                    <td className="px-4 py-3">25 days or more before the trip</td>
                    <td className="px-4 py-3 font-medium text-primary">70%</td>
                    <td className="hidden px-4 py-3 sm:table-cell">30% cancellation fee</td>
                  </tr>
                  <tr className="border-t border-outline-variant/25">
                    <td className="px-4 py-3">15–24 days before the trip</td>
                    <td className="px-4 py-3 font-medium text-primary">50%</td>
                    <td className="hidden px-4 py-3 sm:table-cell">50% cancellation fee</td>
                  </tr>
                  <tr className="border-t border-outline-variant/25">
                    <td className="px-4 py-3">Less than 15 days before the trip</td>
                    <td className="px-4 py-3 font-medium text-primary">No refund</td>
                    <td className="hidden px-4 py-3 sm:table-cell">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <BulletList
              items={[
                "Refunds are subject to applicable supplier and payment processing charges. No refund will ordinarily be provided for unused services, early departure, missed transportation, personal reasons or changes made after the journey has commenced.",
                "The retained amount covers cancellation and administrative costs, supplier commitments, reservations, and the time and resources involved in thoughtfully curating and securing community-led experiences, including dates reserved in advance with local hosts and partners.",
              ]}
            />
          </Section>

          <Section id="duration" number="05" title="Duration & Daily Operating Hours">
            <BulletList
              items={[
                "The package is valid for the specific travel dates and itinerary stated in the booking confirmation.",
                "Where private vehicle and driver services are included, the vehicle and driver will ordinarily be available for a maximum of 10 hours per day.",
                "This daily operating limit is intended to support safe and reasonable working conditions for the driver and a comfortable journey for travellers.",
                "Additional vehicle usage beyond the agreed daily operating hours will be charged at ₹500 per additional hour per vehicle, unless a different rate has been communicated in the booking confirmation.",
                "Delays caused by traveller activities, extended meals, shopping, personal stops or other traveller-requested changes may reduce the time available for the remaining itinerary.",
                "TRIS Travels may recommend changes to the day's schedule where necessary for safety, road conditions or practical operating considerations.",
              ]}
            />
          </Section>

          <Section id="itinerary" number="06" title="Changes to the Itinerary">
            <BulletList
              items={[
                "Requests to change the confirmed itinerary should ordinarily be communicated at least 3 days in advance.",
                "All changes are subject to feasibility, availability, road conditions, supplier policies and the agreed travel schedule.",
                "Changes may result in additional charges for transportation, accommodation, activities, meals, permits, guides or other services.",
                "Last-minute changes may not be possible, particularly where reservations or supplier commitments have already been made.",
                "TRIS Travels will make reasonable efforts to accommodate traveller preferences while ensuring that the overall journey remains operationally feasible and safe.",
              ]}
            />
          </Section>

          <Section id="conduct" number="07" title="Driver Conduct & Passenger Behaviour">
            <BulletList
              items={[
                "TRIS Travels expects respectful and appropriate conduct between travellers, drivers, guides, hosts and service partners.",
                "Drivers assigned by TRIS Travels are expected to conduct themselves professionally and respectfully.",
                "Travellers are expected to treat drivers, guides, hosts, staff and local community members with courtesy and respect.",
                "TRIS Travels maintains a zero-tolerance approach towards abusive, threatening, discriminatory, violent or otherwise inappropriate behaviour towards its drivers, staff or service partners.",
                "Deliberate damage to vehicles, accommodation or other property may result in the traveller being responsible for the associated repair or replacement costs.",
                "TRIS Travels may take reasonable steps, including terminating services, where serious misconduct creates a safety risk or materially affects staff, suppliers or other travellers.",
              ]}
            />
          </Section>

          <Section id="belongings" number="08" title="Passenger Responsibility & Personal Belongings">
            <BulletList
              items={[
                "Travellers are responsible for their personal belongings throughout the journey.",
                "TRIS Travels is not responsible for loss, theft or damage to personal belongings unless directly caused by proven negligence or misconduct of TRIS Travels or its personnel.",
                "Travellers should take reasonable care of valuables, passports, money, electronics and other personal items.",
                "Any lost property recovered by TRIS Travels or its service partners will be handled on a reasonable-efforts basis for return to the traveller. Any delivery or courier costs may be borne by the traveller.",
              ]}
            />
          </Section>

          <Section id="fees" number="09" title="Driver Fees, Fuel & Tolls">
            <p className="text-sm text-on-surface-variant md:text-[0.95rem]">
              Where included in the confirmed package:
            </p>
            <BulletList
              items={[
                "Driver charges, driver meals and driver accommodation are included in the agreed transportation/service fee.",
                "Travellers are not required to make additional payments directly to the driver for these included services.",
                "Fuel and applicable toll charges are included unless specifically stated otherwise in the booking confirmation.",
                "Parking fees, permits, entry fees, additional route charges or other government or local charges may be payable separately where not included in the package.",
              ]}
            />
          </Section>

          <Section id="safety" number="10" title="Safety">
            <BulletList
              items={[
                "Seat belts must be worn whenever provided.",
                "Travellers must follow reasonable safety instructions given by the driver, guide, host or TRIS representative.",
                "Drivers may refuse requests that they reasonably believe are unsafe or contrary to applicable traffic or safety regulations.",
                "Travellers are responsible for informing TRIS Travels in advance of any mobility requirements, accessibility needs or other circumstances that may materially affect the safe operation of the itinerary.",
                "Certain experiences may involve uneven terrain, walking, trekking, water crossings, weather exposure, remote locations or other inherent risks. Travellers should consider their own fitness, comfort and suitability before participating.",
              ]}
            />
          </Section>

          <Section id="suppliers" number="11" title="Third-Party Suppliers & Service Arrangements">
            <BulletList
              items={[
                "A TRIS Travels package may include services provided by independent third-party suppliers, including accommodation providers, homestays, transport providers, guides, activity operators, restaurants and other local partners.",
                "TRIS Travels carefully selects and coordinates its service partners and will make reasonable efforts to ensure that confirmed services are delivered as agreed.",
                "Where a supplier is unable to provide a confirmed service, TRIS Travels will make reasonable efforts to arrange a suitable alternative of comparable nature or standard, subject to availability.",
                "Where a third-party supplier's cancellation, amendment or refund conditions apply, those conditions may affect the traveller's entitlement to a refund or change.",
                "TRIS Travels will assist the traveller in communicating with relevant suppliers and resolving service-related issues wherever reasonably possible.",
              ]}
            />
          </Section>

          <Section
            id="force-majeure"
            number="12"
            title="Natural Calamities, Force Majeure & Unforeseen Circumstances"
          >
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              TRIS Travels will not be responsible for delays, changes, interruptions or
              cancellations resulting from circumstances that are beyond its reasonable control.
            </p>
            <p className="mt-4 text-sm font-medium text-primary">Such circumstances may include:</p>
            <BulletList
              items={[
                "Severe weather",
                "Floods, landslides, storms or other natural calamities",
                "Road closures or unsafe road conditions",
                "Accidents or major transportation disruptions",
                "Government restrictions or orders",
                "Strikes, bandhs, civil disturbances or similar disruptions",
                "Unexpected closure of attractions, accommodation or activity providers",
                "Other events that could not reasonably have been anticipated or prevented",
              ]}
            />
            <p className="mt-6 text-sm font-medium text-primary">In such circumstances:</p>
            <BulletList
              items={[
                "Safety and well-being will always take priority.",
                "TRIS Travels will make reasonable efforts to modify, rearrange or substitute affected services where practical.",
                "Alternative arrangements may involve additional costs where the original service cannot be recovered and the alternative costs more.",
                "Refunds, credits or recoveries for cancelled services will depend on the amounts actually recoverable from suppliers and the services that have not already been consumed or committed.",
                "Travellers are encouraged to obtain appropriate travel insurance covering trip interruption, medical emergencies, personal belongings and other unforeseen circumstances.",
              ]}
            />
          </Section>

          <Section id="insurance" number="13" title="Insurance">
            <BulletList
              items={[
                "Travel insurance is not included in the package unless specifically stated in the booking confirmation.",
                "Travellers are strongly encouraged to obtain appropriate travel insurance covering medical emergencies, trip cancellation or interruption, baggage and personal belongings, transportation disruptions and other relevant risks.",
                "Travellers remain responsible for ensuring that their insurance provides adequate coverage for the nature and activities of their trip.",
              ]}
            />
          </Section>

          <Section id="media" number="14" title="Photography & Media">
            <BulletList
              items={[
                "TRIS Travels may document journeys through photographs and videos for internal records, storytelling and promotional purposes.",
                "Travellers may inform TRIS Travels in advance if they do not wish to appear in promotional photographs or videos.",
                "Where a traveller has specifically opted out, TRIS Travels will make reasonable efforts to respect that preference.",
                "Travellers should not photograph or record other guests, local community members, children, hosts or service partners for public use without appropriate consent.",
              ]}
            />
          </Section>

          <Section id="amendments" number="15" title="Special Requests & Booking Amendments">
            <BulletList
              items={[
                "Special requests and amendments to a confirmed booking are welcome, and TRIS Travels will make reasonable efforts to accommodate them, provided they are made well in advance and mutually agreed upon.",
                "Requests such as specific rooms, upgraded accommodation, additional meals, extra beds, special celebrations, early check-in, late check-out, additional activities, vehicle usage or other changes may incur additional charges, including applicable supplier amendment or cancellation fees.",
                "All requests and amendments are subject to availability and are confirmed only once acknowledged by TRIS Travels in writing, along with any applicable charges.",
                "Requests or arrangements made directly with drivers, hotels, hosts or other service providers, including verbal or informal agreements, are not considered approved unless confirmed by TRIS Travels in writing.",
              ]}
            />
          </Section>

          <Section id="health" number="16" title="Traveller Health, Fitness & Suitability">
            <BulletList
              items={[
                "Travellers are responsible for assessing whether the selected journey and activities are suitable for their individual circumstances.",
                "Certain experiences may require walking, trekking, climbing, water crossings, travelling on uneven terrain or spending time in remote areas.",
                "Travellers should disclose relevant mobility or accessibility requirements that may affect the safe delivery of the journey.",
                "TRIS Travels reserves the right to recommend an alternative activity or itinerary where a particular activity presents a reasonable safety concern.",
              ]}
            />
          </Section>

          <Section id="disputes" number="17" title="Dispute Resolution">
            <BulletList
              items={[
                "TRIS Travels and the traveller will first make reasonable efforts to resolve any concern or dispute amicably through direct communication.",
                "Where a dispute cannot be resolved amicably, either party may seek appropriate remedies through the competent legal or consumer forum having jurisdiction under applicable Indian law.",
                "Nothing in these Terms & Conditions is intended to restrict any rights or remedies available to a consumer under applicable law.",
              ]}
            />
          </Section>

          <Section id="acceptance" number="18" title="Acceptance of Terms">
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              By making a payment towards a TRIS Travels package booking, the traveller confirms
              that:
            </p>
            <BulletList
              items={[
                "They have reviewed the itinerary and services included in the booking",
                "They understand the applicable payment and cancellation terms",
                "They understand that accommodation, transportation and experiences are subject to availability and operational conditions",
                "They have provided accurate traveller information required for the booking",
                "They agree to these Package Booking Terms & Conditions",
              ]}
            />
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              These Terms &amp; Conditions should be read together with the traveller&apos;s booking
              confirmation, itinerary and invoice, which together form the basis of the confirmed
              booking.
            </p>
          </Section>

          <Section id="contact" number="19" title="Contact Information">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6">
              <p className="font-[family-name:var(--font-playfair)] text-xl text-primary">
                TRIS Travels
              </p>
              <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
                <li>
                  Email:{" "}
                  <a
                    href="mailto:trissimai03@gmail.com"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    trissimai03@gmail.com
                  </a>
                </li>
                <li>
                  Phone / WhatsApp:{" "}
                  <a
                    href="https://wa.me/917005241197"
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    +91 7005241197
                  </a>
                </li>
                <li>
                  Website:{" "}
                  <Link href="/" className="font-medium text-primary underline-offset-2 hover:underline">
                    TRIS Travels
                  </Link>
                </li>
              </ul>
              <p className="mt-6 font-serif text-sm italic text-primary/80">
                Travel thoughtfully. Experience deeply. Leave something good behind.
              </p>
            </div>
          </Section>
        </div>

        <p className="mt-14 border-t border-outline-variant/25 pt-6 text-center text-xs text-on-surface-variant">
          Effective from August 2026 until further notice.
        </p>
      </div>
    </div>
  );
}
