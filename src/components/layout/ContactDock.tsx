"use client";

import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.5l.5-3H14V9z"
        fill="currentColor"
      />
    </svg>
  );
}

const items = [
  { href: "/contact", label: "Contact", Icon: Phone, external: false },
  { href: site.whatsappUrl, label: "WhatsApp", Icon: MessageCircle, external: true },
  { href: `mailto:${site.email}`, label: "Email", Icon: Mail, external: true },
  { href: site.instagramUrl, label: "Instagram", Icon: InstagramIcon, external: true },
  { href: site.facebookUrl, label: "Facebook", Icon: FacebookIcon, external: true },
] as const;

export function ContactDock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed right-2.5 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[60] md:right-4 md:bottom-5",
        className,
      )}
    >
      <nav
        aria-label="Contact and social"
        className="pointer-events-auto flex flex-col gap-1 rounded-full border border-outline-variant/20 bg-surface-container-lowest/80 p-1 shadow-[0_8px_24px_rgba(54,64,55,0.1)] backdrop-blur-md"
      >
        {items.map(({ href, label, Icon, external }) => {
          const itemClass =
            "flex h-9 w-9 items-center justify-center rounded-full text-primary/75 transition hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";
          if (external) {
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={itemClass}
              >
                <Icon size={16} />
              </a>
            );
          }
          return (
            <Link key={label} href={href} aria-label={label} title={label} className={itemClass}>
              <Icon size={16} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
