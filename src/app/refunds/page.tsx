import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalBulletList,
  LegalContactBlock,
  LegalSection,
  LegalShell,
  LegalSubheading,
  LegalTable,
} from "@/components/legal/LegalShell";
import { CURATED_ONLINE_BOOK_DAYS } from "@/data/journey-options";

export const metadata: Metadata = {
  title: "Cancellation & Refunds",
  description:
    "TRIS Travels cancellation and refund policy for package tours, fixed departures, and experiences.",
};

const toc = [
  { id: "how", label: "1. How to cancel" },
  { id: "packages", label: "2. Package & curated journeys" },
  { id: "fixed", label: "3. Fixed departures" },
  { id: "experiences", label: "4. Experiences & day bookings" },
  { id: "timeline", label: "5. Refund timeline" },
  { id: "exceptions", label: "6. Exceptions & force majeure" },
  { id: "contact", label: "7. Contact" },
];

export default function RefundsPage() {
  return (
    <LegalShell
      title="Cancellation & Refunds"
      subtitle="Clear rules for cancelling a booking and receiving a refund"
      effective="Aligned with package terms effective August 2026 / fixed departures June 2025"
      intro={
        <p>
          This page summarises how cancellations and refunds work at TRIS Travels. Full booking
          conditions live in our{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            Package Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/terms/fixed-departures"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Fixed Departure Terms
          </Link>
          .
        </p>
      }
      toc={toc}
      relatedExcludeHref="/refunds"
      footerNote="Refunds are processed to the original payment method where possible."
    >
      <LegalSection id="how" number="01" title="How to cancel">
        <LegalBulletList
          items={[
            "Cancellation requests must be made in writing by email to trissimai03@gmail.com (or reply to your booking confirmation).",
            "Include your booking / payment reference, travel dates, and guest name so we can process the request quickly.",
            "The applicable refund percentage is calculated from the date we receive your written cancellation request, relative to the trip start / arrival date.",
          ]}
        />
      </LegalSection>

      <LegalSection id="packages" number="02" title="Package & curated journeys">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          For private / curated package bookings under the August 2026 package terms:
        </p>
        <LegalTable
          headers={["When you cancel", "Refund", "Retained"]}
          rows={[
            ["25 days or more before the trip", "70%", "30% cancellation fee"],
            ["15–24 days before the trip", "50%", "50% cancellation fee"],
            ["Less than 15 days before the trip", "No refund", "—"],
          ]}
        />
        <LegalBulletList
          items={[
            "A 50% advance is typically required to confirm; balance is usually due at least 20 days before travel unless agreed otherwise in writing.",
            "Online booking for curated journeys is available when travel starts " +
              CURATED_ONLINE_BOOK_DAYS +
              "+ days ahead; closer dates may require enquire / customise instead.",
          ]}
        />
      </LegalSection>

      <LegalSection id="fixed" number="03" title="Fixed departures">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          For fixed departure / group package bookings under the June 2025 terms:
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
          A 30% advance is typically required to confirm; remaining fees are usually cleared at
          least 25 days before the trip start date.
        </p>
      </LegalSection>

      <LegalSection id="experiences" number="04" title="Experiences & day bookings">
        <LegalBulletList
          items={[
            "Day experiences and short bookings are reserved against limited local capacity (guides, vehicles, slots).",
            "To change or cancel an experience booking, email us as soon as possible with your confirmation details. We will confirm what can be rearranged based on supplier commitments.",
            "Where a slot or service has already been committed with partners, refunds may be partial or unavailable — we will explain the outcome in writing.",
            "No refund is ordinarily due for no-shows, late arrivals that miss the meeting window, or unused portions of a booked experience after it has started.",
          ]}
        />
      </LegalSection>

      <LegalSection id="timeline" number="05" title="Refund timeline">
        <LegalBulletList
          items={[
            "Approved refunds are initiated after we confirm the cancellation in writing and calculate the amount due under the applicable schedule.",
            "Refunds are returned to the original payment method (for example via Razorpay) wherever possible.",
            "Once initiated, bank / UPI / card refunds typically reflect in 5–10 business days, depending on your bank or payment provider.",
            "Refunds are subject to applicable supplier and payment processing charges.",
          ]}
        />
      </LegalSection>

      <LegalSection id="exceptions" number="06" title="Exceptions & force majeure">
        <LegalSubheading>Ordinarily no refund for</LegalSubheading>
        <LegalBulletList
          items={[
            "Unused services after the journey has commenced",
            "Early departure, missed transportation, or personal reasons after travel has started",
            "Missed flights or connections arranged by the traveller",
            "External factors such as weather, strikes, bandhs, or other unforeseen situations where services were already committed (see force majeure in the full terms)",
          ]}
        />
        <LegalSubheading>Force majeure</LegalSubheading>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          Where delays or cancellations arise from circumstances beyond our reasonable control
          (severe weather, landslides, road closures, government restrictions, and similar), we
          prioritise safety and will make reasonable efforts to rearrange. Refunds or credits for
          cancelled services depend on amounts actually recoverable from suppliers and services not
          already consumed or committed. Full detail is in our Terms &amp; Conditions.
        </p>
      </LegalSection>

      <LegalSection id="contact" number="07" title="Contact">
        <LegalContactBlock />
      </LegalSection>
    </LegalShell>
  );
}
