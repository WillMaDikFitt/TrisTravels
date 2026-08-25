"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  className?: string;
  /** on-dark sits on photos; on-light sits on pale panels / bright photos with a light chip */
  tone?: "on-dark" | "on-light";
};

export function WishlistButton({ slug, className, tone = "on-dark" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, toggleWishlist, configured } = useAuth();
  const active = Boolean(profile?.wishlist.includes(slug));

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition",
        active
          ? "border-accent bg-accent text-on-accent"
          : tone === "on-light"
            ? "border-primary/20 bg-white text-primary shadow-sm hover:border-primary/40"
            : "border-white/30 bg-black/40 text-white hover:bg-black/55",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!configured || !user) {
          router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
          return;
        }
        void toggleWishlist(slug);
      }}
    >
      <Heart size={15} strokeWidth={2} fill={active ? "currentColor" : "none"} className="shrink-0" />
    </button>
  );
}
