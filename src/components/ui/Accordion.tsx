"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-outline-variant/25 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-[family-name:var(--font-playfair)] text-lg text-primary md:text-xl">
          {title}
        </span>
        <ChevronDown
          size={18}
          className={cn("shrink-0 text-primary transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? <div className="pb-5 text-sm leading-relaxed text-on-surface-variant">{children}</div> : null}
    </div>
  );
}
