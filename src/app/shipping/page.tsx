import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalBulletList,
  LegalContactBlock,
  LegalSection,
  LegalShell,
} from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Shipping & Service Delivery",
  description:
    "How TRIS Travels delivers travel services and craft products within Shillong.",
};

const toc = [
  { id: "travel", label: "1. Travel services" },
  { id: "crafts", label: "2. Artisan & craft products" },
  { id: "issues", label: "3. Damaged or missing orders" },
  { id: "contact", label: "4. Contact" },
];

export default function ShippingPage() {
  return (
    <LegalShell
      title="Shipping & Service Delivery"
      subtitle="How we fulfil bookings and local craft orders"
      effective="Last updated September 2026"
      intro={
        <p>
          TRIS Travels primarily sells travel experiences and journeys (services), not
          nationwide parcel shipping. This page explains how those services are delivered, and the
          delivery rules that apply when you order local craft products for delivery in Shillong.
        </p>
      }
      toc={toc}
      relatedExcludeHref="/shipping"
    >
      <LegalSection id="travel" number="01" title="Travel services">
        <LegalBulletList
          items={[
            "Experiences, curated journeys, fixed departures, and craft-my-journey packages are services — there is no physical product dispatched by courier for the trip itself.",
            "After payment or confirmed booking, we send confirmation details by email (and WhatsApp where relevant), including dates, meeting points, and inclusions.",
            "Fulfilment happens on the ground in Meghalaya on the confirmed travel dates — with guides, hosts, transport, and stays as described in your itinerary.",
            "Any change to dates, guests, or logistics should follow the process in our Cancellation & Refunds and Terms pages.",
          ]}
        />
        <p className="mt-4 text-sm text-on-surface-variant">
          See{" "}
          <Link href="/refunds" className="font-semibold text-primary underline-offset-2 hover:underline">
            Cancellation &amp; Refunds
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            Package Terms
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="crafts" number="02" title="Artisan & craft products">
        <p className="text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
          When you order products from Artisan&apos;s Hub / local craft listings:
        </p>
        <LegalBulletList
          items={[
            "Delivery is within Shillong only.",
            "Minimum order value: ₹1,000.",
            "Please place orders at least 60 hours in advance so we can prepare and schedule delivery.",
            "We will confirm delivery timing after your order is accepted. Status updates are shared by email or phone / WhatsApp.",
            "We do not currently offer pan-India courier shipping for craft products unless separately agreed in writing.",
          ]}
        />
        <p className="mt-4 text-sm text-on-surface-variant">
          Browse crafts on{" "}
          <Link href="/artisans" className="font-semibold text-primary underline-offset-2 hover:underline">
            /artisans
          </Link>{" "}
          or enquire via{" "}
          <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
            Contact
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="issues" number="03" title="Damaged or missing orders">
        <LegalBulletList
          items={[
            "If a craft order arrives damaged or incomplete, contact us within 48 hours of delivery with your order details and photos where possible.",
            "We will arrange a replacement, repair, or refund for the affected items as appropriate.",
            "Travel booking issues (missed pickups, wrong dates on confirmation, etc.) should be raised immediately so we can correct fulfilment before travel.",
          ]}
        />
      </LegalSection>

      <LegalSection id="contact" number="04" title="Contact">
        <LegalContactBlock />
      </LegalSection>
    </LegalShell>
  );
}
