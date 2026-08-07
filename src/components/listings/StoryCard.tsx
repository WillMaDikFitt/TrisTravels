import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Story } from "@/data/stories";
import { cn } from "@/lib/utils";

type Props = {
  story: Story;
  featured?: boolean;
  className?: string;
};

/**
 * Stories — journal / editorial cards.
 */
export function StoryCard({ story, featured, className }: Props) {
  const dateLabel = new Date(story.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link
        href={`/stories/${story.slug}`}
        className={cn("group relative block overflow-hidden rounded-2xl", className)}
      >
        <div className="relative aspect-[16/10] md:aspect-[21/9]">
          <Image
            src={story.image}
            alt={story.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
              <span>Featured</span>
              <span className="h-px w-8 bg-primary" />
              <span className="text-secondary/70">{story.category}</span>
            </div>
            <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-secondary md:text-5xl">
              {story.title}
            </h2>
            <p className="mt-3 max-w-2xl text-base text-secondary/75 md:text-lg">{story.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-secondary/65">
                {story.author} · {dateLabel}
              </p>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase">
                Read story <ArrowUpRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/stories/${story.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest transition duration-300",
        "hover:-translate-y-1 hover:border-primary/40 hover:shadow-ambient",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={story.image}
          alt={story.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
          quality={75}
        />
        <div className="absolute top-3 left-3 rounded-md bg-background/75 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-secondary uppercase backdrop-blur-sm">
          {story.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 h-px w-10 bg-primary" />
        <h3 className="font-display text-xl leading-snug text-secondary transition group-hover:text-primary">
          {story.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-on-surface-variant">
          {story.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant/20 pt-4 text-xs text-on-surface-variant">
          <span>
            {story.author}
            <span className="mx-1.5 text-outline-variant">·</span>
            {dateLabel}
          </span>
          <ArrowUpRight
            size={14}
            className="text-primary transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
