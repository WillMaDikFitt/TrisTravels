import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  cta?: string;
  className?: string;
};

export function ListingFaqCta({
  href,
  eyebrow = "Good to know",
  title = "Frequently Asked Questions",
  body = "Answers about booking, participation, and how TRIS days usually work — kept in one place so this page stays focused on the experience itself.",
  cta = "View FAQs",
  className,
}: Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-outline-variant/30 bg-gradient-to-br from-secondary-container/70 via-surface-container-lowest to-surface-container-lowest px-6 py-8 shadow-[0_18px_48px_rgba(42,46,31,0.08)] md:px-10 md:py-11",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-highlight/15 blur-2xl"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary">
              <CircleHelp size={20} strokeWidth={2.25} />
            </span>
            <p className="label-caps text-highlight">{eyebrow}</p>
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.08] text-primary">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant md:text-base">{body}</p>
        </div>
        <div className="shrink-0">
          <Button href={href} size="lg" className="gap-2">
            {cta}
            <ArrowRight size={16} />
          </Button>
          <p className="mt-2 text-center text-xs text-on-surface-variant md:text-left">
            Or{" "}
            <Link href={href} className="font-semibold text-primary underline-offset-2 hover:underline">
              open the full FAQ page
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
