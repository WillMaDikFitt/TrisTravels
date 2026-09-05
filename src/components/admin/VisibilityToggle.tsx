"use client";

import { useState } from "react";
import { setListingVisibility } from "@/lib/actions/cms";
import { cn } from "@/lib/utils";

type Collection = "experiences" | "journeys" | "destinations" | "stories";

export function VisibilityToggle({
  collection,
  id,
  status,
  onChange,
}: {
  collection: Collection;
  id: string;
  status?: string;
  onChange?: (nextStatus: "active" | "hidden") => void;
}) {
  const visible = status !== "hidden" && status !== "draft";
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      title={visible ? "Hide from the public site" : "Show on the public site"}
      onClick={async () => {
        setBusy(true);
        const nextVisible = !visible;
        const res = await setListingVisibility(collection, id, nextVisible);
        setBusy(false);
        if (!res.ok) {
          alert(res.error ?? "Could not update visibility");
          return;
        }
        onChange?.(nextVisible ? "active" : "hidden");
      }}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase transition disabled:opacity-50",
        visible
          ? "bg-[#e7efe3] text-[#2f4a38] ring-1 ring-[#b7c9b0]"
          : "bg-[#eee8df] text-[#6a6358] ring-1 ring-[#d5cdc0]",
      )}
    >
      {busy ? "…" : visible ? "Visible" : "Hidden"}
    </button>
  );
}
