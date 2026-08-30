"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ContactDock } from "./ContactDock";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "instant" });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  if (isAdmin) {
    return <div className="min-h-full bg-surface">{children}</div>;
  }

  return (
    <>
      <Header />
      <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      <ContactDock />
    </>
  );
}
