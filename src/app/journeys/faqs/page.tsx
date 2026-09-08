import type { Metadata } from "next";
import { SharedFaqPage } from "@/components/listings/SharedFaqPage";
import {
  activeSharedFaqs,
  DEFAULT_CURATED_JOURNEY_FAQS,
} from "@/data/shared-faqs";
import { getSettings } from "@/lib/data/repo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Curated journey FAQs",
  description: "Common questions about TRIS curated journeys — booking, stays, transport, and pacing.",
};

export default async function CuratedJourneyFaqsPage() {
  const settings = await getSettings();
  const items = activeSharedFaqs(settings.curatedJourneyFaqs, DEFAULT_CURATED_JOURNEY_FAQS);

  return (
    <SharedFaqPage
      eyebrow="Curated journeys"
      title="Frequently Asked Questions"
      intro="Shared answers for all curated journeys. Your journey page still covers the route, pace, and inclusions for that trip."
      items={items}
      backHref="/journeys"
      backLabel="Back to journeys"
    />
  );
}
