import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/data/stories";
import { cn } from "@/lib/utils";

type Props = {
  story: Story;
  /** featured = large journal lead; list = journal rows; tile = postcard / sticky-note */
  variant?: "featured" | "list" | "tile";
  /** @deprecated use variant="featured" */
  featured?: boolean;
  /** For tile variant: stagger postcard tilt / tape position */
  tiltIndex?: number;
  /** Denser postcard — for viewport-fit home section */
  compact?: boolean;
  className?: string;
};

export function StoryCard({ story, featured, variant, tiltIndex = 0, compact = false, className }: Props) {
  const mode = variant ?? (featured ? "featured" : "list");

  if (mode === "featured") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-[1.75rem] border border-outline-variant/25 bg-surface-container-lowest",
          className,
        )}
      >
        <Link href={`/stories/${story.slug}`} className="group block md:grid md:grid-cols-2">
          <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[22rem]">
            <Image
              src={story.image}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.02]"
              sizes="(max-width:768px) 100vw, 50vw"
              quality={90}
              priority
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-12">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-highlight uppercase">
              Written by
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">{story.author}</p>
            <h2 className="mt-5 font-[family-name:var(--font-playfair)] text-2xl leading-snug text-primary md:text-3xl lg:text-[2.15rem]">
              {story.title}
            </h2>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-on-surface-variant md:text-base">
              {story.excerpt}
            </p>
            <span className="mt-8 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase transition group-hover:gap-3">
              Read story <span aria-hidden>→</span>
            </span>
          </div>
        </Link>
      </article>
    );
  }

  if (mode === "tile") {
    const tilts = [
      "-rotate-[1.75deg] hover:rotate-0",
      "rotate-[1.5deg] hover:rotate-0",
      "-rotate-[0.75deg] hover:rotate-0",
    ] as const;
    const tapes = [
      "left-1/2 -translate-x-1/2 rotate-[-2deg] bg-outline-variant/80",
      "left-[18%] rotate-[6deg] bg-highlight/35",
      "right-[16%] left-auto rotate-[-5deg] bg-secondary-container/90",
    ] as const;
    const tilt = tilts[Math.abs(tiltIndex) % tilts.length];
    const tape = tapes[Math.abs(tiltIndex) % tapes.length];

    return (
      <article
        className={cn(
          "relative h-full origin-center transition duration-500 ease-out",
          tilt,
          className,
        )}
      >
        {/* Washi / masking tape */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-2 z-20 h-7 w-[4.5rem] rounded-[1px] shadow-sm",
            tape,
          )}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.18) 6px, rgba(255,255,255,0.18) 7px)",
          }}
        />

        <Link
          href={`/stories/${story.slug}`}
          className={cn(
            "group relative flex h-full flex-col rounded-[4px] border border-outline-variant/50 bg-surface-container-lowest shadow-[0_12px_28px_rgba(54,64,55,0.12),0_2px_6px_rgba(54,64,55,0.06)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(54,64,55,0.16)]",
            compact ? "p-2.5 pb-3" : "p-3 pb-4",
          )}
        >
          {/* Soft paper grain */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[4px] opacity-[0.35] mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(54,64,55,0.04) 0.6px, transparent 0.7px), radial-gradient(circle at 80% 60%, rgba(54,64,55,0.03) 0.5px, transparent 0.6px)",
              backgroundSize: "7px 7px, 9px 9px",
            }}
          />

          <div
            className={cn(
              "relative overflow-hidden rounded-[2px] border border-outline-variant/40 bg-surface-container shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4)]",
              compact ? "aspect-[2/1]" : "aspect-[5/4]",
            )}
          >
            <Image
              src={story.image}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.04]"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
              quality={80}
            />
          </div>

          <div className={cn("relative flex flex-1 flex-col px-1.5", compact ? "mt-2.5" : "mt-4")}>
            <p
              className={cn(
                "font-[family-name:var(--font-playfair)] italic text-primary/80",
                compact ? "text-[0.85rem]" : "text-[0.95rem]",
              )}
            >
              {story.author}
            </p>
            <h3
              className={cn(
                "font-[family-name:var(--font-playfair)] leading-snug text-primary",
                compact
                  ? "mt-1 line-clamp-2 text-[1.05rem] md:text-[1.1rem]"
                  : "mt-2 text-[1.2rem] md:text-[1.3rem]",
              )}
            >
              {story.title}
            </h3>
            <p
              className={cn(
                "flex-1 text-[0.82rem] leading-relaxed text-on-surface-variant",
                compact ? "mt-1.5 line-clamp-2" : "mt-2 line-clamp-3",
              )}
            >
              {story.excerpt}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 border-b border-primary/30 pb-0.5 text-[11px] font-bold tracking-[0.14em] text-primary uppercase transition group-hover:border-primary group-hover:gap-2.5",
                compact ? "mt-2.5" : "mt-4",
              )}
            >
              Read story <span aria-hidden>→</span>
            </span>
          </div>

          {/* Folded corner */}
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 h-0 w-0 border-b-[18px] border-l-[18px] border-b-transparent border-l-outline-variant/60 opacity-80"
          />
        </Link>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "border-b border-outline-variant/30 py-8 last:border-b-0 md:py-10",
        className,
      )}
    >
      <Link
        href={`/stories/${story.slug}`}
        className="group grid gap-6 md:grid-cols-[minmax(0,1fr)_14rem] md:items-start md:gap-10"
      >
        <div className="order-2 min-w-0 md:order-1">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-highlight uppercase">
            Written by
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">{story.author}</p>
          <h3 className="mt-4 font-[family-name:var(--font-playfair)] text-xl leading-snug text-primary transition group-hover:text-primary/85 md:text-2xl">
            {story.title}
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
            {story.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-primary uppercase transition group-hover:gap-3">
            Read story <span aria-hidden>→</span>
          </span>
        </div>
        <div className="relative order-1 aspect-[16/10] overflow-hidden rounded-2xl md:order-2 md:aspect-[5/4]">
          <Image
            src={story.image}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, 224px"
            quality={80}
          />
        </div>
      </Link>
    </article>
  );
}
