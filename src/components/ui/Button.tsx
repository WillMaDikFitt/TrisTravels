"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const variants = {
  primary:
    "bg-cta text-on-cta shadow-sm hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md",
  secondary:
    "border border-primary bg-surface-container-lowest text-primary hover:-translate-y-0.5 hover:bg-surface-container-lowest/90 hover:shadow-md",
  ghost:
    "border border-primary/35 bg-transparent text-primary hover:-translate-y-0.5 hover:bg-primary/5",
  text: "bg-transparent text-primary hover:text-highlight",
};

const sizes = {
  sm: "h-9 min-h-9 px-4 text-[11px] tracking-[0.12em]",
  md: "h-11 min-h-11 px-6 text-[12px] tracking-[0.12em]",
  lg: "h-12 min-h-12 px-7 text-[12px] tracking-[0.14em] md:px-8",
};

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold uppercase tracking-[0.12em] transition-[transform,background-color,color,filter,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-0 active:scale-[0.98] disabled:opacity-50 motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    const hashIndex = href.indexOf("#");
    const hash = hashIndex >= 0 ? href.slice(hashIndex + 1) : "";
    const pathOnly = hashIndex >= 0 ? href.slice(0, hashIndex) : href;

    return (
      <Link
        href={href}
        className={classes}
        onClick={(e) => {
          onClick?.();
          if (!hash || typeof window === "undefined") return;

          const current = window.location.pathname;
          const samePage = !pathOnly || pathOnly === current;

          if (samePage) {
            e.preventDefault();
            window.history.pushState(null, "", `#${hash}`);
            scrollToHash(hash);
            return;
          }

          // After client navigation to another route with a hash
          window.setTimeout(() => scrollToHash(hash), 150);
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
