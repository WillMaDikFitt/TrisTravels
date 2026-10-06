import { activeCraftProducts, DEFAULT_CRAFT_PRODUCTS } from "@/data/artisans";
import { getSettings } from "@/lib/data/repo";
import { ArtisansPageClient } from "./ArtisansPageClient";

export const metadata = { title: "Crafts" };

/** Pick up Studio → Crafts edits without waiting for a full redeploy. */
export const revalidate = 60;

export default async function ArtisansPage() {
  const settings = await getSettings().catch(() => null);
  return (
    <ArtisansPageClient
      products={activeCraftProducts(settings?.craftProducts, DEFAULT_CRAFT_PRODUCTS)}
    />
  );
}
