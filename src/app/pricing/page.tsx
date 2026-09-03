import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  LegalBulletList,
  LegalCard,
  LegalContactBlock,
  LegalSection,
  LegalShell,
} from "@/components/legal/LegalShell";
import { CURATED_ONLINE_BOOK_DAYS } from "@/data/journey-options";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "How TRIS Travels prices experiences and journeys in Meghalaya — from prices, inclusions, and payment.",
};

const toc = [
  { id: "how", label: "1. How pricing works" },
  { id: "currency", label: "2. Currency & what is included" },
  { id: "booking", label: "3. Booking & payment windows" },
  { id: "checkout", label: "4. At checkout" },
  { id: "browse", label: "5. Browse current prices" },
  { id: "contact", label: "6. Contact" },
];

export default function PricingPage() {
  return (
    <LegalShell
      title="Pricing details"
      subtitle="Transparent “from” prices for experiences and journeys"
      effective="Prices shown on product pages; last policy update September 2026"
      intro={
        <p>
          TRIS Travels publishes clear starting prices on each experience and journey page. Final
          totals depend on dates, guest count, stay and vehicle choices, and any add-ons confirmed
          before payment.
        </p>
      }
      toc={toc}
      relatedExcludeHref="/pricing"
    >
      <LegalSection id="how" number="01" title="How pricing works">
        <LegalBulletList
          items={[
            "Experiences show a from-price for the standard guest configuration described on the listing.",
            "Curated and fixed journeys show from-prices based on the published package level; rooming, vehicle type, and optional upgrades can change the total.",
            "Craft My Journey and custom requests are quoted after you share dates and preferences — we send a clear breakdown before you pay.",
            "We do not invent a separate price list here; live amounts always appear on the product page and at checkout / on your invoice.",
          ]}
        />
      </LegalSection>

      <LegalSection id="currency" number="02" title="Currency & what is included">
        <LegalBulletList
          items={[
            "All prices are in Indian Rupees (INR) unless stated otherwise.",
            "Inclusions and exclusions are listed on each product page and in your booking confirmation.",
            "Entry fees, permits, personal expenses, or optional activities may be extra when not listed as included.",
            "Taxes and fees applicable at the time of booking are shown at checkout or on the invoice.",
          ]}
        />
      </LegalSection>

      <LegalSection id="booking" number="03" title="Booking & payment windows">
        <LegalBulletList
          items={[
            `Curated journeys: online booking is available when travel starts ${CURATED_ONLINE_BOOK_DAYS}+ days ahead; within ${CURATED_ONLINE_BOOK_DAYS} days, please enquire or customise.`,
            "Package bookings typically require an advance to confirm, with balance due before travel as stated in Terms (often 20–25 days ahead depending on product type).",
            "Fixed departures follow the payment schedule in Fixed Departure Terms (commonly 30% advance; balance cleared ~25 days before start).",
            "Cancellation and refund percentages are summarised on Cancellation & Refunds.",
          ]}
        />
        <p className="mt-4 text-sm text-on-surface-variant">
          See{" "}
          <Link href="/refunds" className="font-semibold text-primary underline-offset-2 hover:underline">
            /refunds
          </Link>
          ,{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            /terms
          </Link>
          , and{" "}
          <Link
            href="/terms/fixed-departures"
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            /terms/fixed-departures
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="checkout" number="04" title="At checkout">
        <LegalBulletList
          items={[
            "Eligible online bookings can be paid securely via Razorpay (cards, UPI, and other methods enabled on our account).",
            "You will see the payable amount before confirming payment.",
            "A confirmation email / invoice follows successful payment or confirmed booking.",
            "Login is not required to complete many payments; where an account helps (wishlist, past bookings), it is optional.",
          ]}
        />
      </LegalSection>

      <LegalSection id="browse" number="05" title="Browse current prices">
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {[
            { href: "/experiences", label: "Experiences", body: "Day trips & local experiences" },
            { href: "/journeys", label: "Journeys", body: "Curated & fixed departures" },
            { href: "/craft-my-journey", label: "Craft My Journey", body: "Get a custom quote" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <LegalCard className="h-full transition group-hover:border-primary/35">
                <p className="font-semibold text-primary">{item.label}</p>
                <p className="mt-1 text-sm text-on-surface-variant">{item.body}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold tracking-wider text-primary uppercase">
                  View <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
                </span>
              </LegalCard>
            </Link>
          ))}
        </div>
      </LegalSection>

      <LegalSection id="contact" number="06" title="Contact">
        <LegalContactBlock />
      </LegalSection>
    </LegalShell>
  );
}
