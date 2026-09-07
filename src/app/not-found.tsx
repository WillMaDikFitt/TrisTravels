import { StatusPage } from "@/components/layout/StatusPage";

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      eyebrow="Lost in the hills"
      title="This page isn’t on the map"
      body="The link may be outdated, or the listing was hidden. Head home or browse what’s open right now."
      primary={{ href: "/", label: "Back home" }}
      secondary={{ href: "/experiences", label: "Browse experiences" }}
    />
  );
}
