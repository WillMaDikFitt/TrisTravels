import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  code?: string;
  eyebrow: string;
  title: string;
  body: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  onRetry?: () => void;
  className?: string;
};

/** Shared branded empty / error surface used by 404 and runtime error pages. */
export function StatusPage({
  code,
  eyebrow,
  title,
  body,
  primary,
  secondary,
  onRetry,
  className,
}: Props) {
  return (
    <div className={cn("relative isolate overflow-hidden bg-background pt-header", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(54,64,55,0.12),_transparent_55%),linear-gradient(180deg,#f8f6f1_0%,#eef0e3_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-80 w-80 rounded-full bg-highlight/15 blur-3xl"
      />

      <section className="relative mx-auto flex min-h-[70svh] max-w-container-max flex-col justify-center px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="max-w-2xl">
          {code ? (
            <p className="font-[family-name:var(--font-playfair)] text-[4.5rem] leading-none text-primary/15 md:text-[6.5rem]">
              {code}
            </p>
          ) : null}
          <p className="label-caps mt-2 text-accent">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl leading-tight text-primary md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            {body}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            {onRetry ? (
              <Button type="button" size="lg" onClick={onRetry}>
                Try again
              </Button>
            ) : null}
            {primary ? (
              <Button href={primary.href} size="lg">
                {primary.label}
              </Button>
            ) : null}
            {secondary ? (
              <Button href={secondary.href} variant="ghost" size="lg">
                {secondary.label}
              </Button>
            ) : null}
          </div>
          <p className="mt-10 text-sm text-on-surface-variant">
            Or explore{" "}
            <Link href="/journeys" className="font-medium text-primary underline-offset-2 hover:underline">
              journeys
            </Link>
            ,{" "}
            <Link
              href="/experiences"
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              experiences
            </Link>
            , or{" "}
            <Link href="/contact" className="font-medium text-primary underline-offset-2 hover:underline">
              contact us
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
