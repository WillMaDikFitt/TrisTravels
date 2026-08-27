import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Cta = { href: string; label: string };

export function CtaBand({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  className,
  tone = "dark",
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  primary: Cta;
  secondary?: Cta;
  className?: string;
  /** dark = sage band; light = cream page background */
  tone?: "dark" | "light";
}) {
  return (
    <section
      className={cn(
        "px-margin-mobile py-14 md:px-margin-desktop md:py-20",
        tone === "dark" ? "bg-primary-container" : "bg-surface",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-container-max">
        <div
          className={cn(
            "grid items-center gap-8 rounded-[1.75rem] px-6 py-9 md:grid-cols-[minmax(0,1fr)_auto] md:gap-12 md:px-10 md:py-11",
            tone === "dark"
              ? "bg-surface-container-lowest shadow-[0_18px_50px_rgba(54,64,55,0.12)]"
              : "border border-outline-variant/30 bg-surface-container-lowest shadow-[0_14px_40px_rgba(54,64,55,0.08)]",
          )}
        >
          <div className="min-w-0">
            {eyebrow ? <p className="label-caps text-highlight">{eyebrow}</p> : null}
            <h2
              className={cn(
                "font-[family-name:var(--font-playfair)] text-[1.75rem] leading-tight font-medium text-primary",
                "md:text-[2.15rem] lg:text-[2.35rem]",
                eyebrow ? "mt-3" : "mt-0",
              )}
            >
              {title}
            </h2>
            {body ? (
              <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-on-surface-variant md:text-base md:leading-relaxed">
                {body}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:justify-end">
            <Button href={primary.href} size="lg" className="w-full sm:w-auto">
              {primary.label}
            </Button>
            {secondary ? (
              <Button
                href={secondary.href}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                {secondary.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
