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
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  primary: Cta;
  secondary?: Cta;
  className?: string;
}) {
  return (
    <section className={cn("bg-primary-container px-margin-mobile py-14 md:px-margin-desktop md:py-20", className)}>
      <div className="mx-auto max-w-container-max">
        <div className="grid items-center gap-8 rounded-[1.75rem] bg-[#f7f4ee] px-6 py-8 shadow-[0_18px_50px_rgba(42,46,31,0.12)] md:grid-cols-[1fr_auto] md:gap-12 md:px-10 md:py-10">
          <div>
            {eyebrow && <p className="label-caps text-accent">{eyebrow}</p>}
            <h2 className="mt-2 font-display text-3xl text-secondary md:text-4xl">{title}</h2>
            {body && <p className="mt-3 max-w-xl text-on-surface-variant">{body}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Button href={primary.href}>{primary.label}</Button>
            {secondary && (
              <Button href={secondary.href} variant="ghost">
                {secondary.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
