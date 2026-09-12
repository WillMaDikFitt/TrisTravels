import type { Metadata } from "next";
import { SharedFaqPage } from "@/components/listings/SharedFaqPage";
import { activeSharedFaqs, DEFAULT_HOME_FAQS } from "@/data/shared-faqs";
import { getSettings } from "@/lib/data/repo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FAQs",
  description: "Common questions about travelling with TRIS in Meghalaya — experiences, journeys, booking, and payment.",
};

/** Full list behind the homepage's "Questions before you go" (Studio → FAQs → Home page). */
export default async function FaqsPage() {
  const settings = await getSettings();
  const items = activeSharedFaqs(settings.homeFaqs, DEFAULT_HOME_FAQS);

  return (
    <SharedFaqPage
      eyebrow="Good to know"
      title="Questions before you go"
      intro="Everything travellers usually ask before a trip with TRIS. Experience and journey pages also have their own FAQs for the details specific to them."
      items={items}
      backHref="/"
      backLabel="Back to home"
    />
  );
}
