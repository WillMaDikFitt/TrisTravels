"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminButton, PageHeader } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { ComingSoonSwitch } from "./_components/ComingSoonSwitch";
import { CraftsTab } from "./_components/CraftsTab";
import { MakersTab } from "./_components/MakersTab";
import { PageTextTab } from "./_components/PageTextTab";

const tabs = [
  { id: "makers", label: "Makers" },
  { id: "crafts", label: "Crafts" },
  { id: "page", label: "Page text" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function CraftsAdminPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#4a5a50]">Loading…</p>}>
      <CraftsAdmin />
    </Suspense>
  );
}

function CraftsAdmin() {
  // The tab lives in ?tab= so editors can send people back to the right one.
  const passed = useSearchParams().get("tab");
  const tab: TabId = tabs.find((t) => t.id === passed)?.id ?? "makers";

  const choose = (id: TabId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    url.searchParams.delete("note");
    window.history.replaceState(null, "", url.pathname + url.search);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Crafts"
        description="Everything on the makers pages — maker profiles and contacts, the pieces they make, and the page text."
        actions={
          <Link href="/artisans" target="_blank">
            <AdminButton variant="ghost">View page</AdminButton>
          </Link>
        }
      />

      <ComingSoonSwitch />

      <div className="mb-5 flex flex-wrap gap-2" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => choose(t.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              tab === t.id
                ? "border-[#364037] bg-[#364037] text-white"
                : "border-[#c5cbb8] text-[#364037] hover:bg-[#eef1e6]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "makers" && <MakersTab />}
      {tab === "crafts" && <CraftsTab />}
      {tab === "page" && <PageTextTab />}
    </div>
  );
}
