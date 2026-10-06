import { DEFAULT_CRAFT_PRODUCTS, normalizeCraftProducts, type CraftProduct } from "@/data/artisans";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";

/** Current Studio craft list (defaults until the first save). */
export async function loadCraftProducts(): Promise<CraftProduct[]> {
  const settings = await fetchSettingsAdmin();
  return normalizeCraftProducts(settings.craftProducts, DEFAULT_CRAFT_PRODUCTS);
}

/**
 * Saves the whole craft list. Settings are re-read first so other Studio
 * sections stored in the same document aren't overwritten with stale copies.
 */
export async function saveCraftProducts(
  crafts: CraftProduct[],
): Promise<{ ok: true; crafts: CraftProduct[] } | { ok: false; error: string }> {
  const cleaned = normalizeCraftProducts(crafts, []);
  if (!cleaned.length) {
    return { ok: false, error: "Keep at least one craft with a name. To hide crafts, untick “Show on site”." };
  }
  try {
    const settings = await fetchSettingsAdmin();
    const res = await saveSettings({ ...settings, craftProducts: cleaned });
    return res.ok ? { ok: true, crafts: cleaned } : { ok: false, error: res.error ?? "Could not save." };
  } catch {
    return { ok: false, error: "Could not save. Check your connection and try again." };
  }
}
