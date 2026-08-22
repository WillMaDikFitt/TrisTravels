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
  if (fixed) {
    return (
      <div id="enquire" className="scroll-mt-header">
        <Button className="mt-6 w-full" href={`/journeys/${journeySlug}/enquire`}>
          Book now
        </Button>
      </div>
    );
  }

  return (
    <div id="enquire" className="mt-6 scroll-mt-header space-y-3">
      <Button className="w-full" href={`/journeys/${journeySlug}/book`}>
        Book now
      </Button>
      <Button
        className="w-full bg-primary text-on-primary shadow-sm hover:bg-primary hover:brightness-110"
        href={`/journeys/${journeySlug}/enquire`}
      >
        Customise
      </Button>
    </div>
  );
}
