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

export function quoteExperience(
  experience: Experience,
  guests: number,
  settings: PlatformSettings = DEFAULT_SETTINGS,
) {
  const exp = experience as Experience & {
    priceAdult?: number;
    priceChild?: number;
    staffRules?: StaffRule[];
  };
  const base = (exp.priceAdult ?? experience.priceFrom) * guests;
  const rules = exp.staffRules ?? [];
  const rule = rules.find((r) => guests >= r.minGuests && guests <= r.maxGuests);
  const staffCost = rule ? rule.quantity * rule.costPerStaff : 0;
  const serviceFee = Math.round(((base + staffCost) * settings.serviceFeePercent) / 100);
  const gst = Math.round((serviceFee * settings.gstPercent) / 100);
  const customerTotal = base + staffCost + serviceFee + gst;
  return {
    customerTotal,
    internal: { base, staffCost, serviceFee, gst },
  };
}
