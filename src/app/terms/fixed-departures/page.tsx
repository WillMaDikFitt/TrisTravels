import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalBulletList,
  LegalCard,
  LegalContactBlock,
  LegalSection,
  LegalShell,
  LegalSubheading,
  LegalTable,
} from "@/components/legal/LegalShell";

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

const toc = [
  { id: "booking", label: "1. Booking Confirmation" },
  { id: "vehicle", label: "2. Vehicle Availability" },
  { id: "accommodation", label: "3. Accommodation" },
  { id: "cancellation", label: "4. Cancellation & Refund Policy" },
  { id: "duration", label: "5. Duration and Timing" },
  { id: "driver", label: "6. Driver Conduct" },
  { id: "belongings", label: "7. Passenger Responsibility" },
  { id: "fees", label: "8. Drivers fees, Fuel and Tolls" },
  { id: "safety", label: "9. Safety" },
  { id: "itinerary", label: "10. Changes to Itinerary" },
  { id: "force-majeure", label: "11. Natural Calamities and Force Majeure" },
  { id: "disputes", label: "12. Dispute Resolution" },
  { id: "insurance", label: "13. Insurance" },
  { id: "media", label: "14. Use of Photos and Content" },
  { id: "contact", label: "15. Contact Information" },
];

export default function FixedDepartureTermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions — Fixed Departures"
      subtitle="Fixed departures & group package bookings"
      effective="Effective from June 2025 until further notice"
      intro={
        <p>
          By confirming a package booking with TRIS Travels, you agree to the following Terms &amp;
          Conditions. These terms ensure clarity, transparency, and a smooth experience for all
          parties involved.
        </p>
      }
      notice={
        <p>
          Looking for curated / private package terms?{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            See August 2026 package terms
          </Link>
          . For a summary of refunds, see{" "}
          <Link href="/refunds" className="font-semibold text-primary underline-offset-2 hover:underline">
            Cancellation &amp; Refunds
          </Link>
          .
        </p>
      }
      toc={toc}
      relatedExcludeHref="/terms/fixed-departures"
      footerNote="Effective from June 2025 until further notice."
    >
      <LegalSection id="booking" number="01" title="Booking Confirmation">
        <LegalBulletList
          items={[
            "A 30% advance payment is required to confirm your booking.",
            "To ensure smooth processing and secure reservations, the remaining experience and service fees must be cleared at least 25 days prior to the trip's start date. This allows us to finalize all arrangements and provide the best possible service for your travel experience.",
          ]}
        />
      </LegalSection>

      <LegalSection id="vehicle" number="02" title="Vehicle Availability">
        <LegalBulletList
          items={[
            "A vehicle will be provided based on availability at the time of booking.",
            "Last-minute changes may result in an alternative vehicle or potential delays.",
            "Transportation is provided strictly as per the agreed itinerary. Any additional usage or services will incur extra charges.",
            "You may request the driver to stop anywhere along the route, as long as it is within the journey's designated path. Please note, these stops do not include overnight stays.",
            "Any changes or additions to the services after booking are subject to availability and may involve additional costs.",
          ]}
        />
      </LegalSection>

      <LegalSection id="accommodation" number="03" title="Accommodation">
        <LegalBulletList
          items={[
            "Any special accommodation requests (e.g., specific room types, early check-in, late check-out) or added services (e.g., extra beds, upgraded amenities) are subject to availability and will incur additional charges.",
            "Changes to accommodation after booking will also incur additional charges. However, if required we are committed to serving you better and will do our best to arrange alternate accommodation within a similar range and standard, subject to availability.",
          ]}
        />

        <LegalSubheading>Accommodation Categories — Guidelines</LegalSubheading>
        <div className="mt-4 space-y-4">
          {stayCategories.map((stay) => (
            <LegalCard key={stay.title}>
              <p className="font-medium text-primary">{stay.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{stay.body}</p>
            </LegalCard>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="cancellation" number="04" title="Cancellation & Refund Policy">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          To cancel your booking, please email:{" "}
          <a
            href="mailto:trissimai03@gmail.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            trissimai03@gmail.com
          </a>
          . See also our{" "}
          <Link href="/refunds" className="font-medium text-primary underline-offset-2 hover:underline">
            Cancellation &amp; Refunds
          </Link>{" "}
          page.
        </p>
        <p className="mt-3 text-sm text-on-surface-variant">
          Cancellations will be processed as per the schedule below:
        </p>
        <LegalTable
          headers={["When you cancel", "Refund"]}
          rows={[
            ["25 days or more before arrival", "70% of the total booking amount"],
            ["Between 25 and 15 days before arrival", "50% of the total booking amount"],
            ["Less than 15 days before arrival", "No refund"],
          ]}
        />
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
          Note: No refunds for early departures, missed flights, personal issues, or external
          factors like weather, strikes, bandhs, or any unforeseen situation.
        </p>
      </LegalSection>

      <LegalSection id="duration" number="05" title="Duration and Timing">
        <LegalBulletList
          items={[
            "The booking is valid for the specific dates and times mentioned.",
            "Extra charges may apply for delays or early pickups.",
            "For the safety of our clients and our driver, the vehicle and driver will be available for a maximum of 10 hours per day. We kindly request you to plan your day accordingly to ensure a comfortable and safe journey for everyone. Extra hours will be chargeable @ Rs. 500 per hour.",
          ]}
        />
      </LegalSection>

      <LegalSection id="driver" number="06" title="Driver Conduct">
        <LegalBulletList
          items={[
            "The driver assigned to you will be professional, polite, and knowledgeable. We maintain a zero-tolerance policy towards any inappropriate behavior directed at the driver or damage to the vehicle.",
          ]}
        />
      </LegalSection>

      <LegalSection id="belongings" number="07" title="Passenger Responsibility">
        <LegalBulletList
          items={[
            "Passengers are responsible for their personal belongings during the ride. TRIS Travels will not be held liable for any lost or damaged items.",
          ]}
        />
      </LegalSection>

      <LegalSection id="fees" number="08" title="Drivers fees, Fuel and Tolls">
        <LegalBulletList
          items={[
            "The driver's charges, meals, and accommodation are all included in the service fee. No additional payment is required during the trip.",
            "All fuel and toll fees are included unless specified otherwise.",
          ]}
        />
      </LegalSection>

      <LegalSection id="safety" number="09" title="Safety">
        <LegalBulletList
          items={[
            "Seat belts must be worn at all times.",
            "Passengers must adhere to the driver's instructions for safety reasons.",
          ]}
        />
      </LegalSection>

      <LegalSection id="itinerary" number="10" title="Changes to Itinerary">
        <LegalBulletList
          items={[
            "Any changes to the itinerary must be communicated at least 3 days in advance.",
            "Changes may incur additional charges.",
          ]}
        />
      </LegalSection>

      <LegalSection id="force-majeure" number="11" title="Natural Calamities and Force Majeure">
        <LegalBulletList
          items={[
            "TRIS Travels is not liable for delays or cancellations caused by factors outside our control, such as weather, road conditions, accidents, natural calamities (e.g., floods, landslides, storms) or unforeseen circumstances beyond our control.",
            "In case of such events, we will make reasonable efforts to adjust the itinerary, but safety and well-being will always be our priority.",
          ]}
        />
      </LegalSection>

      <LegalSection id="disputes" number="12" title="Dispute Resolution">
        <LegalBulletList
          items={[
            "In case of any issues, both parties will try to resolve matters amicably. If needed, we will proceed to the appropriate legal forums.",
          ]}
        />
      </LegalSection>

      <LegalSection id="insurance" number="13" title="Insurance">
        <LegalBulletList
          items={[
            "The taxi booking does not include insurance for passengers or personal belongings.",
            "Passengers are encouraged to have their own travel insurance to cover any unforeseen circumstances.",
          ]}
        />
      </LegalSection>

      <LegalSection id="media" number="14" title="Use of Photos and Content">
        <LegalBulletList
          items={[
            "During the tour, photos and videos may be taken by TRIS Travels for promotional purposes.",
            "Please notify us in advance if you prefer not to be photographed.",
          ]}
        />
      </LegalSection>

      <LegalSection id="contact" number="15" title="Contact Information">
        <LegalContactBlock />
      </LegalSection>
    </LegalShell>
  );
}
