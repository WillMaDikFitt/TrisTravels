import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CraftProduct } from "@/data/artisans";

type Props = {
  product: CraftProduct;
  className?: string;
};

/**
 * Crafts — showcase cards.
 * CTA requests help sourcing / connecting with a supplier.
 */
export function CraftCard({ product, className }: Props) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-ambient",
        className,
      )}
    >
      <div className="relative bg-surface-container p-3 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-high">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            quality={80}
          />
        </div>
        {product.bestSeller && (
          <span className="absolute top-5 left-5 w-fit rounded-full bg-[#f7f4ee]/95 px-2.5 py-1 text-[9px] font-bold tracking-[0.12em] text-secondary uppercase">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pt-4 pb-4">
        <p className="text-[10px] font-bold tracking-[0.14em] text-primary uppercase">
          {product.category}
        </p>
        {product.makerNote && (
          <p className="mt-1 text-xs text-on-surface-variant">{product.makerNote}</p>
        )}
        <h3 className="mt-2 font-display text-lg leading-snug text-secondary md:text-xl">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-on-surface-variant">
          {product.blurb}
        </p>

        <div className="mt-4 border-t border-outline-variant/25 pt-3">
          <Link
            href={`/contact?craft=${product.slug}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[11px] font-bold tracking-[0.12em] text-on-accent uppercase"
          >
            <Handshake size={14} aria-hidden />
            Connect with maker
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
