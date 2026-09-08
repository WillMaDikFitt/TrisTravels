import type { Experience } from "@/data/experiences";
import {
  hasExperienceCosting,
  quoteExperienceCosting,
  type ExperienceCostingQuote,
} from "@/data/experience-costing";
import type { Journey } from "@/data/journeys";
import {
  normalizePackageTransportId,
  packageTransportMeta,
  toLegacyTransportId,
  type PackageTransportId,
} from "@/data/journey-options";
import type { TransportVehicleId } from "@/data/transport";
import {
  DEFAULT_PACKAGE_GST_PERCENT,
  DEFAULT_TRIS_SERVICE_PERCENT,
  minVehiclesForGuests,
  resolvePackageStays,
  resolvePackageVehicles,
  type StayPreferenceId,
} from "@/data/package-pricing";
import { DEFAULT_SETTINGS } from "@/lib/catalog";
import type { PlatformSettings } from "@/lib/types";

export type { ExperienceCostingQuote };
export { hasExperienceCosting, quoteExperienceCosting } from "@/data/experience-costing";

/** Day-rate multipliers vs the legacy tempo rate for larger vehicle options. */
const PACKAGE_TRANSPORT_RATE_SCALE: Record<string, number> = {
  sedan: 1,
  suv: 1,
  innova: 1,
  tempo10: 0.92,
  tempo12: 1,
  tempo15: 1.12,
  urbania10: 1.18,
  urbania12: 1.32,
};

type StaffRule = {
  minGuests: number;
  maxGuests: number;
  staffType: string;
  quantity: number;
  costPerStaff: number;
};

export function adultRate(experience: Experience) {
  return experience.priceAdult ?? experience.priceFrom;
}

export function childRate(experience: Experience) {
  if (experience.priceChild != null) return experience.priceChild;
  return Math.round(adultRate(experience) * 0.7);
}

export type ExperienceQuoteOptions = {
  /** Guest booked TRIS transport (costing engine + legacy add-on). */
  trisTransport?: boolean;
  /** Legacy multi-vehicle transfer fee (ignored when costing is configured). */
  transportFee?: number;
  /** Legacy vehicle count stored on the booking when transport is selected. */
  vehicleCount?: number;
};

export type ExperienceQuote = {
  engine: "costing" | "legacy";
  customerTotal: number;
  base: number;
  adults: number;
  children: number;
  transportCost: number;
  vehicleCount: number;
  costing?: ExperienceCostingQuote;
  internal: {
    base: number;
    staffCost: number;
    serviceFee: number;
    gst: number;
    /** Present when engine === "costing" */
    costing?: ExperienceCostingQuote;
  };
};

/**
 * Experiences quote.
 * Prefer operational costing (adult/child op cost + capacity components + transport + margin + 5% GST)
 * when Studio has saved `experience.costing`; otherwise fall back to legacy selling rates.
 */
export function quoteExperience(
  experience: Experience,
  guestsOrAdults: number,
  settings: PlatformSettings = DEFAULT_SETTINGS,
  children = 0,
  options: ExperienceQuoteOptions = {},
): ExperienceQuote {
  const adults = Math.max(0, guestsOrAdults);
  const kids = Math.max(0, children);
  const trisTransport = Boolean(options.trisTransport);

  if (hasExperienceCosting(experience) && experience.costing) {
    const costing = quoteExperienceCosting(experience.costing, {
      adults,
      children: kids,
      trisTransport,
    });
    return {
      engine: "costing",
      customerTotal: costing.grossAmount,
      base: costing.perPersonOperationalCost,
      adults,
      children: kids,
      transportCost: costing.transportCost,
      vehicleCount: costing.vehicleCount,
      costing,
      internal: {
        base: costing.perPersonOperationalCost,
        staffCost: costing.capacityComponentsCost,
        serviceFee: costing.marginAmount,
        gst: costing.gst,
        costing,
      },
    };
  }

  const totalGuests = adults + kids;
  const exp = experience as Experience & { staffRules?: StaffRule[] };
  const base = adultRate(experience) * adults + childRate(experience) * kids;
  const rules = exp.staffRules ?? [];
  const rule = rules.find((r) => totalGuests >= r.minGuests && totalGuests <= r.maxGuests);
  const staffCost = rule ? rule.quantity * rule.costPerStaff : 0;
  const serviceFee = Math.round(((base + staffCost) * settings.serviceFeePercent) / 100);
  const gst = Math.round((serviceFee * settings.gstPercent) / 100);
  const transportFee = Math.max(0, Math.round(options.transportFee ?? 0));
  const vehicleCount =
    transportFee > 0 ? Math.max(1, Math.min(10, Math.round(options.vehicleCount ?? 1))) : 0;
  const customerTotal = base + staffCost + serviceFee + gst + transportFee;
  return {
    engine: "legacy",
    customerTotal,
    base,
    adults,
    children: kids,
    transportCost: transportFee,
    vehicleCount,
    internal: { base, staffCost, serviceFee, gst },
  };
}

export type CuratedQuoteInput = {
  vehicleId: PackageTransportId | TransportVehicleId;
  vehicleCount: number;
  stayPreference: StayPreferenceId;
  rooms: number;
  extraMattresses: number;
  adults: number;
  children?: number;
};

export type CuratedQuote = {
  adults: number;
  children: number;
  totalGuests: number;
  days: number;
  nights: number;
  vehicleId: PackageTransportId;
  vehicleLabel: string;
  vehicleCount: number;
  vehicleCapacity: number;
  capacityOk: boolean;
  minVehiclesRequired: number;
  stayPreference: StayPreferenceId;
  rooms: number;
  extraMattresses: number;
  /** A — vehicle type × vehicles × days */
  vehicleCost: number;
  /** B — (stay cost × rooms) + (extra mattress × per-person-per-night × nights) */
  roomCost: number;
  /** C — guests × activity cost per guest */
  activityCost: number;
  /** D — TRIS services % of (A+B+C) */
  trisService: number;
  /** E — GST % of D */
  gst: number;
  subtotalABC: number;
  total: number;
  /** 50% advance payable at booking */
  advanceAmount: number;
  /** Remaining 50% due before travel */
  balanceAmount: number;
  perPerson: number;
  trisServicePercent: number;
  gstPercent: number;
  activityCostPerGuest: number;
};

/**
 * Curated package quote:
 * A = vehicle/day × vehicles × days
 * B = (stay preference cost × rooms) + (extra mattresses × mattress/night × nights)
 * C = guests × activity cost per guest
 * D = TRIS % of (A+B+C)
 * E = GST % of D
 * Total = A+B+C+D+E
 */
export function quoteCuratedPackage(journey: Journey, input: CuratedQuoteInput): CuratedQuote {
  const adults = Math.max(1, Math.round(input.adults));
  const children = Math.max(0, Math.round(input.children ?? 0));
  const totalGuests = adults + children;
  const days = Math.max(1, journey.days);
  const nights = Math.max(0, journey.nights);
  const pricing = journey.packagePricing ?? {};
  const vehicles = resolvePackageVehicles(pricing.vehicles);
  const stays = resolvePackageStays(pricing.stays);
  const packageVehicleId = normalizePackageTransportId(input.vehicleId);
  const transportMeta = packageTransportMeta(packageVehicleId);
  const legacyVehicleId = toLegacyTransportId(packageVehicleId);
  const vehicle = vehicles[legacyVehicleId] ?? vehicles.sedan;
  const stay = stays[input.stayPreference] ?? stays.barefoot ?? stays.homestay;
  const vehicleCount = Math.max(1, Math.round(input.vehicleCount));
  const rooms = Math.max(1, Math.round(input.rooms));
  const extraMattresses = Math.max(0, Math.round(input.extraMattresses));
  const capacity = Math.max(1, vehicle.capacity || transportMeta.maxGuests);
  const minVehiclesRequired = minVehiclesForGuests(totalGuests, capacity);
  const capacityOk = totalGuests <= capacity * vehicleCount;
  const dayRate = Math.round(
    vehicle.costPerDay * (PACKAGE_TRANSPORT_RATE_SCALE[packageVehicleId] ?? 1),
  );

  const activityCostPerGuest =
    pricing.activityCostPerGuest != null && Number.isFinite(pricing.activityCostPerGuest)
      ? Math.max(0, Math.round(pricing.activityCostPerGuest))
      : Math.max(0, Math.round(journey.priceFrom * 0.55));

  const trisServicePercent =
    pricing.trisServicePercent != null && Number.isFinite(pricing.trisServicePercent)
      ? Math.max(0, pricing.trisServicePercent)
      : DEFAULT_TRIS_SERVICE_PERCENT;

  const gstPercent =
    pricing.gstPercent != null && Number.isFinite(pricing.gstPercent)
      ? Math.max(0, pricing.gstPercent)
      : DEFAULT_PACKAGE_GST_PERCENT;

  const mattressNights = Math.max(1, nights || days - 1 || 1);
  const vehicleCost = Math.round(dayRate * vehicleCount * days);
  const roomCost = Math.round(
    stay.roomCost * rooms + stay.extraMattressPerPerson * extraMattresses * mattressNights,
  );
  const activityCost = Math.round(activityCostPerGuest * totalGuests);
  const subtotalABC = vehicleCost + roomCost + activityCost;
  const trisService = Math.round((subtotalABC * trisServicePercent) / 100);
  const gst = Math.round((trisService * gstPercent) / 100);
  const total = vehicleCost + roomCost + activityCost + trisService + gst;
  const advanceAmount = Math.round(total * 0.5);
  const balanceAmount = total - advanceAmount;
  const perPerson = totalGuests > 0 ? Math.round(total / totalGuests) : total;

  return {
    adults,
    children,
    totalGuests,
    days,
    nights,
    vehicleId: packageVehicleId,
    vehicleLabel: `${transportMeta.label} (Max ${capacity})`,
    vehicleCount,
    vehicleCapacity: capacity,
    capacityOk,
    minVehiclesRequired,
    stayPreference: input.stayPreference,
    rooms,
    extraMattresses,
    vehicleCost,
    roomCost,
    activityCost,
    trisService,
    gst,
    subtotalABC,
    total,
    advanceAmount,
    balanceAmount,
    perPerson,
    trisServicePercent,
    gstPercent,
    activityCostPerGuest,
  };
}
