"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll to `#hash` after load; also repair doubled fragments like `#share#share`. */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;

    const hashId = raw.split("#").find(Boolean);
    if (!hashId) return;

    // Normalize #share#share → #share
    if (raw !== hashId) {
      window.history.replaceState(null, "", `${pathname}#${hashId}`);
    }

    const scroll = () => {
      const el = document.getElementById(hashId);
      if (!el) return false;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    };

    if (scroll()) return;

    const t = window.setTimeout(scroll, 80);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
