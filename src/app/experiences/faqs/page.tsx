import type { Metadata } from "next";
import { SharedFaqPage } from "@/components/listings/SharedFaqPage";
import {
  activeSharedFaqs,
  DEFAULT_EXPERIENCE_FAQS,
} from "@/data/shared-faqs";
import { getSettings } from "@/lib/data/repo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Experience FAQs",
  description: "Common questions about booking and joining TRIS day experiences in Meghalaya.",
};

export default async function ExperienceFaqsPage() {
  const settings = await getSettings();
  const items = activeSharedFaqs(settings.experienceFaqs, DEFAULT_EXPERIENCE_FAQS);

  return (
    <SharedFaqPage
      eyebrow="Experiences"
      title="Frequently Asked Questions"
      intro="General questions about booking and joining TRIS experiences. Each experience page still has the details that are specific to that day."
      items={items}
      backHref="/experiences"
      backLabel="Back to experiences"
    />
  );
}
