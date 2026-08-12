import { destinations as staticDestinations } from "@/data/destinations";
import { listDestinations } from "@/lib/data/repo";
import { DestinationsPageClient } from "./DestinationsPageClient";

export const metadata = { title: "Destinations" };
export const revalidate = 60;

export default async function DestinationsPage() {
  const items = await listDestinations().catch(() => staticDestinations);
  return <DestinationsPageClient items={items} />;
}
