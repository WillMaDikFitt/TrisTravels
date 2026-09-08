/** Experiences operational costing (TRIS backend cost → margin → GST). */

export const EXPERIENCE_COSTING_GST_PERCENT = 5;

export type ExperienceCapacityComponent = {
  id: string;
  name: string;
  /** Lump-sum cost for one unit of this resource. */
  cost: number;
  /** Guests covered by one unit. */
  capacity: number;
  /** Ops metadata — all listed components are included in the quote. */
  required: boolean;
};

export type ExperienceCosting = {
  /** Consolidated per-adult operational cost (internal). */
  adultOperationalCost: number;
  /** Consolidated per-child operational cost (internal). */
  childOperationalCost: number;
  capacityComponents: ExperienceCapacityComponent[];
  /** Used when the guest books TRIS transport. */
  transport: {
    vehicleCost: number;
    vehicleCapacity: number;
  };
  /** Markup on total operational cost (not on selling price). */
  marginPercent: number;
};

export type ExperienceCostingQuoteInput = {
  adults: number;
  children?: number;
  /** Guest selected TRIS transport (required mode always treats as true). */
  trisTransport: boolean;
};

export type ExperienceCapacityLine = {
  id: string;
  name: string;
  units: number;
  unitCost: number;
  cost: number;
};

export type ExperienceCostingQuote = {
  adults: number;
  children: number;
  totalGuests: number;
  adultOperationalCost: number;
  childOperationalCost: number;
  perPersonOperationalCost: number;
  capacityLines: ExperienceCapacityLine[];
  capacityComponentsCost: number;
  trisTransport: boolean;
  vehicleCount: number;
  vehicleCapacity: number;
  transportCost: number;
  totalOperationalCost: number;
  marginPercent: number;
  marginAmount: number;
  sellingPriceBeforeGst: number;
  gstPercent: number;
  gst: number;
  /** Final amount charged to the guest. */
  grossAmount: number;
};

function unitsForCapacity(guests: number, capacity: number) {
  const cap = Math.max(1, Math.round(capacity) || 1);
  const g = Math.max(0, Math.round(guests));
  if (g <= 0) return 0;
  return Math.ceil(g / cap);
}

export function blankCapacityComponent(index = 0): ExperienceCapacityComponent {
  return {
    id: `comp-${Date.now()}-${index}`,
    name: "Guide",
    cost: 0,
    capacity: 6,
    required: true,
  };
}

export function blankExperienceCosting(): ExperienceCosting {
  return {
    adultOperationalCost: 0,
    childOperationalCost: 0,
    capacityComponents: [],
    transport: { vehicleCost: 0, vehicleCapacity: 6 },
    marginPercent: 35,
  };
}

/** True when Studio has saved an operational costing config for this listing. */
export function hasExperienceCosting(
  experience: { costing?: ExperienceCosting | null } | null | undefined,
): boolean {
  const c = experience?.costing;
  if (!c) return false;
  return (
    Number.isFinite(c.adultOperationalCost) &&
    Number.isFinite(c.childOperationalCost) &&
    Number.isFinite(c.marginPercent)
  );
}

export function normalizeExperienceCosting(
  raw: Partial<ExperienceCosting> | null | undefined,
): ExperienceCosting | undefined {
  if (!raw) return undefined;
  const adult = Number(raw.adultOperationalCost);
  const child = Number(raw.childOperationalCost);
  const margin = Number(raw.marginPercent);
  if (![adult, child, margin].every((n) => Number.isFinite(n))) return undefined;

  const components = Array.isArray(raw.capacityComponents)
    ? raw.capacityComponents
        .map((row, index) => {
          if (!row || typeof row !== "object") return null;
          const cost = Number(row.cost);
          const capacity = Number(row.capacity);
          if (!Number.isFinite(cost) || !Number.isFinite(capacity)) return null;
          const name = String(row.name || "").trim() || `Component ${index + 1}`;
          return {
            id: String(row.id || `comp-${index}`),
            name,
            cost: Math.max(0, Math.round(cost)),
            capacity: Math.max(1, Math.round(capacity) || 1),
            required: row.required !== false,
          } satisfies ExperienceCapacityComponent;
        })
        .filter(Boolean) as ExperienceCapacityComponent[]
    : [];

  const vehicleCost = Number(raw.transport?.vehicleCost);
  const vehicleCapacity = Number(raw.transport?.vehicleCapacity);

  return {
    adultOperationalCost: Math.max(0, Math.round(adult)),
    childOperationalCost: Math.max(0, Math.round(child)),
    capacityComponents: components,
    transport: {
      vehicleCost: Number.isFinite(vehicleCost) ? Math.max(0, Math.round(vehicleCost)) : 0,
      vehicleCapacity: Number.isFinite(vehicleCapacity)
        ? Math.max(1, Math.round(vehicleCapacity) || 1)
        : 6,
    },
    marginPercent: Math.max(0, margin),
  };
}

/**
 * Cost → margin → 5% GST engine for experiences.
 * Guest-facing output is grossAmount only; everything else is internal.
 */
export function quoteExperienceCosting(
  costing: ExperienceCosting,
  input: ExperienceCostingQuoteInput,
): ExperienceCostingQuote {
  const adults = Math.max(0, Math.round(input.adults));
  const children = Math.max(0, Math.round(input.children ?? 0));
  const totalGuests = adults + children;
  const adultOperationalCost = Math.max(0, Math.round(costing.adultOperationalCost));
  const childOperationalCost = Math.max(0, Math.round(costing.childOperationalCost));
  const perPersonOperationalCost =
    adultOperationalCost * adults + childOperationalCost * children;

  const capacityLines: ExperienceCapacityLine[] = (costing.capacityComponents ?? []).map((comp) => {
    const units = unitsForCapacity(totalGuests, comp.capacity);
    const unitCost = Math.max(0, Math.round(comp.cost));
    return {
      id: comp.id,
      name: comp.name,
      units,
      unitCost,
      cost: units * unitCost,
    };
  });
  const capacityComponentsCost = capacityLines.reduce((sum, line) => sum + line.cost, 0);

  const trisTransport = Boolean(input.trisTransport);
  const vehicleCapacity = Math.max(1, Math.round(costing.transport?.vehicleCapacity) || 1);
  const vehicleUnitCost = Math.max(0, Math.round(costing.transport?.vehicleCost ?? 0));
  const vehicleCount = trisTransport ? unitsForCapacity(totalGuests, vehicleCapacity) : 0;
  const transportCost = vehicleCount * vehicleUnitCost;

  const totalOperationalCost = perPersonOperationalCost + capacityComponentsCost + transportCost;
  const marginPercent = Math.max(0, costing.marginPercent);
  const marginAmount = Math.round((totalOperationalCost * marginPercent) / 100);
  const sellingPriceBeforeGst = totalOperationalCost + marginAmount;
  const gstPercent = EXPERIENCE_COSTING_GST_PERCENT;
  const gst = Math.round((sellingPriceBeforeGst * gstPercent) / 100);
  const grossAmount = sellingPriceBeforeGst + gst;

  return {
    adults,
    children,
    totalGuests,
    adultOperationalCost,
    childOperationalCost,
    perPersonOperationalCost,
    capacityLines,
    capacityComponentsCost,
    trisTransport,
    vehicleCount,
    vehicleCapacity,
    transportCost,
    totalOperationalCost,
    marginPercent,
    marginAmount,
    sellingPriceBeforeGst,
    gstPercent,
    gst,
    grossAmount,
  };
}
