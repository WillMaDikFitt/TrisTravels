"use client";

import { useEffect } from "react";

/** Enables full-viewport section snap scrolling on the homepage only. */
export function HomeSnapRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("home-snap");
    return () => {
      root.classList.remove("home-snap");
    };
  }, []);

  return <div className="home-snap-root">{children}</div>;
}
