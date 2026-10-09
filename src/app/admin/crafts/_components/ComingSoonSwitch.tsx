"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { loadCraftsComingSoon, saveCraftsComingSoon } from "@/lib/admin/crafts";

/** Studio → Crafts: hide the public makers pages behind a "coming soon" page. Saves straight away. */
export function ComingSoonSwitch() {
  const [on, setOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadCraftsComingSoon()
      .then((value) => {
        if (!cancelled) setOn(value);
      })
      .catch(() => {
        if (!cancelled)
          setError("Couldn’t load this setting. Refresh to try again.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async () => {
    if (on === null) return;
    const next = !on;
    setBusy(true);
    setError("");
    const res = await saveCraftsComingSoon(next);
    setBusy(false);
    if (res.ok) setOn(next);
    else setError(res.error);
  };

  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 md:p-5",
        on ? "border-[#e4c9a8] bg-[#fbf3e8]" : "border-[#c5d8c0] bg-[#eef5ea]",
      )}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-[#1f2a24]">
          {on === null
            ? "Coming soon page"
            : on
              ? "Coming soon page is ON — guests can’t see the makers pages"
              : "Coming soon page is OFF — the makers pages are live"}
        </p>
        <p className="mt-1 text-sm text-[#4a5a50]">
          While on, the makers page and every maker profile show a “Something
          exciting is on its way” page. Turn it off to publish them. You can
          keep editing makers and crafts either way. Changes reach the site
          within a minute.
        </p>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={on === true}
        aria-label="Show coming soon page"
        disabled={on === null || busy}
        onClick={() => void toggle()}
        className="flex items-center gap-3 disabled:opacity-60"
      >
        <span className="text-sm font-semibold text-[#26352b]">
          {busy ? "Saving…" : on ? "On" : "Off"}
        </span>
        <span
          className={cn(
            "relative h-7 w-12 rounded-full transition",
            on ? "bg-[#c96a3d]" : "bg-[#9aa79c]",
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
              on && "translate-x-5",
            )}
          />
        </span>
      </button>
    </div>
  );
}
