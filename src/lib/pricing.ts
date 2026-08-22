import type { Experience } from "@/data/experiences";
import type { Journey } from "@/data/journeys";
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

export function quoteExperience(
  experience: Experience,
  guestsOrAdults: number,
  settings: PlatformSettings = DEFAULT_SETTINGS,
  children = 0,
) {
  const adults = Math.max(0, guestsOrAdults);
  const kids = Math.max(0, children);
  const totalGuests = adults + kids;
  const exp = experience as Experience & { staffRules?: StaffRule[] };
  const base = adultRate(experience) * adults + childRate(experience) * kids;
  const rules = exp.staffRules ?? [];
  const rule = rules.find((r) => totalGuests >= r.minGuests && totalGuests <= r.maxGuests);
  const staffCost = rule ? rule.quantity * rule.costPerStaff : 0;
  const serviceFee = Math.round(((base + staffCost) * settings.serviceFeePercent) / 100);
  const gst = Math.round((serviceFee * settings.gstPercent) / 100);
  const customerTotal = base + staffCost + serviceFee + gst;
  return {
    customerTotal,
    base,
    adults,
    children: kids,
    internal: { base, staffCost, serviceFee, gst },
  };
}

export type CuratedQuoteInput = {
  vehicleId: TransportVehicleId;
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
  vehicleId: TransportVehicleId;
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
  /** B — (stay cost × rooms) + (extra mattress × per-person stay cost) */
  roomCost: number;
  /** C — guests × activity cost per guest */
  activityCost: number;
  /** D — TRIS services % of (A+B+C) */
  trisService: number;
  /** E — GST % of D */
  gst: number;
  subtotalABC: number;
  total: number;
  perPerson: number;
  trisServicePercent: number;
  gstPercent: number;
  activityCostPerGuest: number;
};

/**
 * Curated package quote:
 * A = vehicle/day × vehicles × days
 * B = (stay preference cost × rooms) + (extra mattresses × mattress cost)
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
  const vehicle = vehicles[input.vehicleId] ?? vehicles.sedan;
  const stay = stays[input.stayPreference] ?? stays.homestay;
  const vehicleCount = Math.max(1, Math.round(input.vehicleCount));
  const rooms = Math.max(1, Math.round(input.rooms));
  const extraMattresses = Math.max(0, Math.round(input.extraMattresses));
  const capacity = Math.max(1, vehicle.capacity);
  const minVehiclesRequired = minVehiclesForGuests(totalGuests, capacity);
  const capacityOk = totalGuests <= capacity * vehicleCount;

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

  const vehicleCost = Math.round(vehicle.costPerDay * vehicleCount * days);
  const roomCost = Math.round(stay.roomCost * rooms + stay.extraMattressPerPerson * extraMattresses);
  const activityCost = Math.round(activityCostPerGuest * totalGuests);
  const subtotalABC = vehicleCost + roomCost + activityCost;
  const trisService = Math.round((subtotalABC * trisServicePercent) / 100);
  const gst = Math.round((trisService * gstPercent) / 100);
  const total = vehicleCost + roomCost + activityCost + trisService + gst;
  const perPerson = totalGuests > 0 ? Math.round(total / totalGuests) : total;

  const vehicleLabels: Record<TransportVehicleId, string> = {
    sedan: "Sedan",
    suv: "SUV",
    innova: "Innova / Crystal",
    tempo: "Tempo traveller",
  };

  return {
    adults,
    children,
    totalGuests,
    days,
    nights,
    vehicleId: input.vehicleId,
    vehicleLabel: vehicleLabels[input.vehicleId] ?? input.vehicleId,
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
    perPerson,
    trisServicePercent,
    gstPercent,
    activityCostPerGuest,
  };
}
