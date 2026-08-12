"use client";

import { Heart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function WishlistButton({ slug, className }: { slug: string; className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, toggleWishlist, configured } = useAuth();
  const active = Boolean(profile?.wishlist.includes(slug));

  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur-sm",
        active && "border-accent bg-accent text-on-accent",
        className,
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!configured || !user) {
          router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
          return;
        }
        toggleWishlist(slug);
      }}
    >
      <Heart size={15} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
