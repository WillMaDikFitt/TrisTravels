import { getSettings } from "@/lib/data/repo";
import type { DiscountCode } from "@/lib/types";

export async function resolveDiscountCode(raw: string): Promise<DiscountCode | null> {
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  const settings = await getSettings();
  const match = (settings.discountCodes ?? []).find(
    (d) => d.active && d.code.trim().toUpperCase() === code && d.percent > 0,
  );
  return match ?? null;
}

export function applyDiscountPercent(amount: number, percent: number) {
  const p = Math.min(100, Math.max(0, percent));
  const discounted = Math.round(amount * (1 - p / 100));
  return {
    discounted,
    saved: Math.max(0, amount - discounted),
  };
}
