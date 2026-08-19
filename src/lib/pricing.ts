import type { Experience } from "@/data/experiences";
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
