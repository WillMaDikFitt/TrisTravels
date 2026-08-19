"use client";

import { Button } from "@/components/ui/Button";

export function JourneyEnquire({
  journeySlug,
  fixed = false,
}: {
  journeyName?: string;
  journeySlug: string;
  fixed?: boolean;
  departureDates?: string[];
}) {
  return (
    <div id="enquire" className="scroll-mt-header">
      <Button className="mt-6 w-full" href={`/journeys/${journeySlug}/enquire`}>
        {fixed ? "Book now" : "Enquire about this journey"}
      </Button>
    </div>
  );
}
