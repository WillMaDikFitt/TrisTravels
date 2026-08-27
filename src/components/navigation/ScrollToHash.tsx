"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Scroll to `#hash` after App Router navigations (Next Link often skips this). */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;

    const scroll = () => {
      const el = document.getElementById(hash);
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
