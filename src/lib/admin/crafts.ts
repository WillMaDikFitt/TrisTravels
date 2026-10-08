import {
  DEFAULT_CRAFT_MAKERS,
  DEFAULT_CRAFT_PRODUCTS,
  normalizeCraftMakers,
  normalizeCraftProducts,
  normalizeCraftsPage,
  type CraftMaker,
  type CraftProduct,
  type CraftsPageCopy,
} from "@/data/artisans";
import { fetchSettingsAdmin } from "@/lib/actions/content-read";
import { saveSettings } from "@/lib/actions/cms";
import type { PlatformSettings } from "@/lib/types";

/** Current Studio craft list (defaults until the first save). */
export async function loadCraftProducts(): Promise<CraftProduct[]> {
  const settings = await fetchSettingsAdmin();
  return normalizeCraftProducts(settings.craftProducts, DEFAULT_CRAFT_PRODUCTS);
}

/**
 * Settings are re-read before every save so other Studio sections stored in
 * the same document aren't overwritten with stale copies.
 */
async function patchSettings(
  patch: Partial<PlatformSettings>,
): Promise<string | null> {
  try {
    const settings = await fetchSettingsAdmin();
    const res = await saveSettings({ ...settings, ...patch });
    return res.ok ? null : (res.error ?? "Could not save.");
  } catch {
    return "Could not save. Check your connection and try again.";
  }
}

/** Saves the whole craft list. */
export async function saveCraftProducts(
  crafts: CraftProduct[],
): Promise<
  { ok: true; crafts: CraftProduct[] } | { ok: false; error: string }
> {
  const cleaned = normalizeCraftProducts(crafts, []);
  if (!cleaned.length) {
    return {
      ok: false,
      error:
        "Keep at least one craft with a name. To hide crafts, untick “Show on site”.",
    };
  }
  const error = await patchSettings({ craftProducts: cleaned });
  return error ? { ok: false, error } : { ok: true, crafts: cleaned };
}

/** Current Studio maker list (defaults until the first save). */
export async function loadCraftMakers(): Promise<CraftMaker[]> {
  const settings = await fetchSettingsAdmin();
  return normalizeCraftMakers(settings.craftMakers, DEFAULT_CRAFT_MAKERS);
}

/** Saves the whole maker list. */
export async function saveCraftMakers(
  makers: CraftMaker[],
): Promise<{ ok: true; makers: CraftMaker[] } | { ok: false; error: string }> {
  const cleaned = normalizeCraftMakers(makers, []);
  if (!cleaned.length) {
    return {
      ok: false,
      error:
        "Keep at least one maker with a name. To hide makers, untick “Show on site”.",
    };
  }
  const error = await patchSettings({ craftMakers: cleaned });
  return error ? { ok: false, error } : { ok: true, makers: cleaned };
}

/** Page text + hero image for /artisans and the maker profiles. */
export async function loadCraftsPage(): Promise<CraftsPageCopy> {
  const settings = await fetchSettingsAdmin();
  return normalizeCraftsPage(settings.craftsPage);
}

export async function saveCraftsPage(
  copy: CraftsPageCopy,
): Promise<{ ok: true; copy: CraftsPageCopy } | { ok: false; error: string }> {
  const cleaned = normalizeCraftsPage(copy);
  const error = await patchSettings({ craftsPage: cleaned });
  return error ? { ok: false, error } : { ok: true, copy: cleaned };
}
