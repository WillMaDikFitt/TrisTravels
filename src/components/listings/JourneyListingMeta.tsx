import type { Journey } from "@/data/journeys";
import { formatINR, cn } from "@/lib/utils";

type Props = {
  journey: Journey;
  className?: string;
};

function formatNotSuitableFor(items: string[]) {
  const first = items.find((item) => item.trim())?.trim() ?? "";
  return first.split(/\s+/).slice(0, 3).join(" ");
}

export function journeyListingMetaItems(journey: Journey) {
  const duration = `${journey.days} days · ${journey.nights} nights`;
  const style = journey.style?.filter(Boolean).join(" · ") || "—";

  return [
    { label: "Duration", value: duration },
    { label: "From price", value: formatINR(journey.priceFrom) },
    { label: "Best time to travel", value: journey.season || "—" },
    { label: "Style", value: style },
    ...(journey.notSuitableFor?.length
      ? [{ label: "Not suitable for", value: formatNotSuitableFor(journey.notSuitableFor) }]
      : []),
  ];
}

export function JourneyListingMeta({ journey, className }: Props) {
  const items = journeyListingMetaItems(journey);

  return (
    <dl
      className={cn(
        "grid gap-x-4 gap-y-3 border-t border-outline-variant/25 pt-4 sm:grid-cols-2",
        className,
      )}
    >
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-[10px] font-semibold tracking-[0.14em] text-on-surface-variant uppercase">
            {label}
          </dt>
          <dd className="mt-1 font-sans text-[13px] leading-snug text-primary">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
