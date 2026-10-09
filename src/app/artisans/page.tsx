import {
  activeCraftProducts,
  DEFAULT_CRAFT_PRODUCTS,
  normalizeCraftsPage,
  resolveCraftMakers,
} from "@/data/artisans";
import { getSettings } from "@/lib/data/repo";
import { ArtisansPageClient } from "./ArtisansPageClient";
import { CraftsComingSoon } from "./CraftsComingSoon";

export const metadata = { title: "Meet Meghalaya’s Makers" };

/** Pick up Studio → Crafts edits without waiting for a full redeploy. */
export const revalidate = 60;

export default async function ArtisansPage() {
  const settings = await getSettings().catch(() => null);
  const copy = normalizeCraftsPage(settings?.craftsPage);
  // On until switched off in Studio → Crafts; also on if settings can't be read.
  if (settings?.craftsComingSoon !== false) return <CraftsComingSoon copy={copy} />;
  const products = activeCraftProducts(
    settings?.craftProducts,
    DEFAULT_CRAFT_PRODUCTS,
  );
  return (
    <ArtisansPageClient
      makers={resolveCraftMakers(settings?.craftMakers, products)}
      copy={copy}
    />
  );
}
