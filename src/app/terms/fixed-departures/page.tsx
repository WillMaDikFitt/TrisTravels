import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fixed Departures — Terms & Conditions",
  description:
    "TRIS Travels package tour terms & conditions for fixed departure journeys. Effective from June 2025 until further notice.",
};

const stayCategories = [
  {
    title: "Budget Stay",
    body: "Basic and affordable accommodations with essential amenities. Suitable for travelers who prioritize exploring over comfort. Rooms are clean and functional, typically with shared or minimal services. Ideal for backpackers or budget-conscious guests.",
  },
  {
    title: "Homestay",
    body: "A local, culturally immersive experience where you stay with a host family or in a locally run guesthouse. Homestays offer clean & hygienic rooms, simple comfort, home-cooked meals, private bathroom and a chance to connect with local traditions and lifestyle. Great for travelers seeking authenticity and community connection.",
  },
  {
    title: "Standard Stay",
    body: "Comfortable and clean accommodations with standard facilities such as private bathrooms, hot water, and room service. Suitable for most travelers looking for a balance of comfort and cost. These may include budget hotels or well-rated guesthouses.",
  },
  {
    title: "Premium Stay",
    body: "Higher-end accommodations with better quality amenities, stylish interiors, and added services like in-house dining, parking, or scenic views. Perfect for guests who want more comfort, convenience, and aesthetics without going fully luxury.",
  },
  {
    title: "Luxury Stay",
    body: "Upscale accommodations offering top-notch comfort, premium locations, personalized service, fine dining, and modern amenities. Ideal for those seeking a lavish and relaxing travel experience.",
  },
  {
    title: "I'm Flexible",
    body: "You're open to any type of accommodation based on availability, value, and location. This option allows us to recommend the best available stay that fits your overall travel style and budget.",
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

export default function FixedDepartureTermsPage() {
  return (
    <div className="bg-surface text-foreground">
      <header className="border-b border-outline-variant/25 bg-primary-container px-margin-mobile pt-[calc(var(--header-offset)+2.5rem)] pb-12 text-on-primary-container md:px-margin-desktop md:pb-14">
        <div className="mx-auto max-w-3xl">
          <p className="label-caps text-highlight">Legal</p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-3xl leading-tight md:text-4xl lg:text-[2.75rem]">
            Terms &amp; Conditions — Package Tours
          </h1>
          <p className="mt-4 text-sm text-on-primary-container/80 md:text-base">
            Fixed departures &amp; group package bookings
          </p>
          <p className="mt-2 text-sm font-medium text-highlight">
            Effective from June 2025 until further notice
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        <p className="text-base leading-relaxed text-on-surface-variant md:text-lg">
          By confirming a package booking with TRIS Travels, you agree to the following Terms &amp;
          Conditions. These terms ensure clarity, transparency, and a smooth experience for all
          parties involved.
        </p>
        <p className="mt-4 text-sm text-on-surface-variant">
          Looking for curated / private package terms?{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            See August 2026 package terms
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
              ["booking", "1. Booking Confirmation"],
              ["vehicle", "2. Vehicle Availability"],
              ["accommodation", "3. Accommodation"],
              ["cancellation", "4. Cancellation & Refund Policy"],
              ["duration", "5. Duration and Timing"],
              ["driver", "6. Driver Conduct"],
              ["belongings", "7. Passenger Responsibility"],
              ["fees", "8. Drivers fees, Fuel and Tolls"],
              ["safety", "9. Safety"],
              ["itinerary", "10. Changes to Itinerary"],
              ["force-majeure", "11. Natural Calamities and Force Majeure"],
              ["disputes", "12. Dispute Resolution"],
              ["insurance", "13. Insurance"],
              ["media", "14. Use of Photos and Content"],
              ["contact", "15. Contact Information"],
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
          <Section id="booking" number="01" title="Booking Confirmation">
            <BulletList
              items={[
                "A 30% advance payment is required to confirm your booking.",
                "To ensure smooth processing and secure reservations, the remaining experience and service fees must be cleared at least 25 days prior to the trip's start date. This allows us to finalize all arrangements and provide the best possible service for your travel experience.",
              ]}
            />
          </Section>

          <Section id="vehicle" number="02" title="Vehicle Availability">
            <BulletList
              items={[
                "A vehicle will be provided based on availability at the time of booking.",
                "Last-minute changes may result in an alternative vehicle or potential delays.",
                "Transportation is provided strictly as per the agreed itinerary. Any additional usage or services will incur extra charges.",
                "You may request the driver to stop anywhere along the route, as long as it is within the journey's designated path. Please note, these stops do not include overnight stays.",
                "Any changes or additions to the services after booking are subject to availability and may involve additional costs.",
              ]}
            />
          </Section>

          <Section id="accommodation" number="03" title="Accommodation">
            <BulletList
              items={[
                "Any special accommodation requests (e.g., specific room types, early check-in, late check-out) or added services (e.g., extra beds, upgraded amenities) are subject to availability and will incur additional charges.",
                "Changes to accommodation after booking will also incur additional charges. However, if required we are committed to serving you better and will do our best to arrange alternate accommodation within a similar range and standard, subject to availability.",
              ]}
            />

            <h3 className="mt-8 text-sm font-semibold tracking-wide text-primary uppercase">
              Accommodation Categories — Guidelines
            </h3>
            <div className="mt-4 space-y-4">
              {stayCategories.map((stay) => (
                <div
                  key={stay.title}
                  className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5"
                >
                  <p className="font-medium text-primary">{stay.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{stay.body}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section id="cancellation" number="04" title="Cancellation & Refund Policy">
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
              To cancel your booking, please email:{" "}
              <a
                href="mailto:trissimai03@gmail.com"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                trissimai03@gmail.com
              </a>
            </p>
            <p className="mt-3 text-sm text-on-surface-variant">
              Cancellations will be processed as per the schedule below:
            </p>
            <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
              <table className="w-full text-left text-sm">
                <thead className="bg-primary-container text-on-primary-container">
                  <tr>
                    <th className="px-4 py-3 font-semibold">When you cancel</th>
                    <th className="px-4 py-3 font-semibold">Refund</th>
                  </tr>
                </thead>
                <tbody className="text-on-surface-variant">
                  <tr className="border-t border-outline-variant/25">
                    <td className="px-4 py-3">25 days or more before arrival</td>
                    <td className="px-4 py-3 font-medium text-primary">
                      70% of the total booking amount
                    </td>
                  </tr>
                  <tr className="border-t border-outline-variant/25">
                    <td className="px-4 py-3">Between 25 and 15 days before arrival</td>
                    <td className="px-4 py-3 font-medium text-primary">
                      50% of the total booking amount
                    </td>
                  </tr>
                  <tr className="border-t border-outline-variant/25">
                    <td className="px-4 py-3">Less than 15 days before arrival</td>
                    <td className="px-4 py-3 font-medium text-primary">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
              Note: No refunds for early departures, missed flights, personal issues, or external
              factors like weather, strikes, bandhs, or any unforeseen situation.
            </p>
          </Section>

          <Section id="duration" number="05" title="Duration and Timing">
            <BulletList
              items={[
                "The booking is valid for the specific dates and times mentioned.",
                "Extra charges may apply for delays or early pickups.",
                "For the safety of our clients and our driver, the vehicle and driver will be available for a maximum of 10 hours per day. We kindly request you to plan your day accordingly to ensure a comfortable and safe journey for everyone. Extra hours will be chargeable @ Rs. 500 per hour.",
              ]}
            />
          </Section>

          <Section id="driver" number="06" title="Driver Conduct">
            <BulletList
              items={[
                "The driver assigned to you will be professional, polite, and knowledgeable. We maintain a zero-tolerance policy towards any inappropriate behavior directed at the driver or damage to the vehicle.",
              ]}
            />
          </Section>

          <Section id="belongings" number="07" title="Passenger Responsibility">
            <BulletList
              items={[
                "Passengers are responsible for their personal belongings during the ride. TRIS Travels will not be held liable for any lost or damaged items.",
              ]}
            />
          </Section>

          <Section id="fees" number="08" title="Drivers fees, Fuel and Tolls">
            <BulletList
              items={[
                "The driver's charges, meals, and accommodation are all included in the service fee. No additional payment is required during the trip.",
                "All fuel and toll fees are included unless specified otherwise.",
              ]}
            />
          </Section>

          <Section id="safety" number="09" title="Safety">
            <BulletList
              items={[
                "Seat belts must be worn at all times.",
                "Passengers must adhere to the driver's instructions for safety reasons.",
              ]}
            />
          </Section>

          <Section id="itinerary" number="10" title="Changes to Itinerary">
            <BulletList
              items={[
                "Any changes to the itinerary must be communicated at least 3 days in advance.",
                "Changes may incur additional charges.",
              ]}
            />
          </Section>

          <Section id="force-majeure" number="11" title="Natural Calamities and Force Majeure">
            <BulletList
              items={[
                "TRIS Travels is not liable for delays or cancellations caused by factors outside our control, such as weather, road conditions, accidents, natural calamities (e.g., floods, landslides, storms) or unforeseen circumstances beyond our control.",
                "In case of such events, we will make reasonable efforts to adjust the itinerary, but safety and well-being will always be our priority.",
              ]}
            />
          </Section>

          <Section id="disputes" number="12" title="Dispute Resolution">
            <BulletList
              items={[
                "In case of any issues, both parties will try to resolve matters amicably. If needed, we will proceed to the appropriate legal forums.",
              ]}
            />
          </Section>

          <Section id="insurance" number="13" title="Insurance">
            <BulletList
              items={[
                "The taxi booking does not include insurance for passengers or personal belongings.",
                "Passengers are encouraged to have their own travel insurance to cover any unforeseen circumstances.",
              ]}
            />
          </Section>

          <Section id="media" number="14" title="Use of Photos and Content">
            <BulletList
              items={[
                "During the tour, photos and videos may be taken by TRIS Travels for promotional purposes.",
                "Please notify us in advance if you prefer not to be photographed.",
              ]}
            />
          </Section>

          <Section id="contact" number="15" title="Contact Information">
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 text-sm text-on-surface-variant md:p-6">
              <p className="font-semibold text-primary">TRIS Travels</p>
              <p className="mt-3">
                Email:{" "}
                <a
                  href="mailto:trissimai03@gmail.com"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  trissimai03@gmail.com
                </a>
              </p>
              <p className="mt-1">
                Phone/WhatsApp:{" "}
                <a
                  href="https://wa.me/917005241197"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  +91-7005241197
                </a>
              </p>
              <p className="mt-1">
                Website:{" "}
                <a
                  href="https://www.trismeghalaya.com"
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  www.trismeghalaya.com
                </a>
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
