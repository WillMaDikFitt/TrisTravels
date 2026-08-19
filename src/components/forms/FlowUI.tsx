import { Check, LockKeyhole, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlowSteps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <nav aria-label="Form progress" className="border-b border-outline-variant/25 px-5 py-5 md:px-8">
      <ol className="flex items-start">
        {steps.map((label, index) => {
          const complete = index < current;
          const active = index === current;
          return (
            <li key={label} className="relative flex min-w-0 flex-1 flex-col items-center">
              {index > 0 && (
                <span
                  className={cn(
                    "absolute top-4 right-1/2 h-px w-full",
                    complete || active ? "bg-primary/55" : "bg-outline-variant/60",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid h-8 w-8 place-items-center rounded-full border text-xs font-bold transition",
                  complete && "border-primary bg-primary text-on-primary",
                  active && "border-accent bg-accent text-on-accent ring-4 ring-accent/10",
                  !complete &&
                    !active &&
                    "border-outline-variant bg-surface-container-lowest text-on-surface-variant",
                )}
                aria-current={active ? "step" : undefined}
              >
                {complete ? <Check size={14} strokeWidth={2.5} /> : index + 1}
              </span>
              <span
                className={cn(
                  "mt-2 hidden text-center text-[10px] font-bold tracking-[0.1em] uppercase sm:block",
                  active ? "text-primary" : "text-on-surface-variant/70",
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function FlowShell({
  steps,
  current,
  children,
}: {
  steps: string[];
  current: number;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-outline-variant/25 bg-surface-container-lowest shadow-[0_22px_60px_rgba(42,46,31,0.09)]">
      <FlowSteps steps={steps} current={current} />
      <div className="px-5 py-7 md:px-9 md:py-9">{children}</div>
    </section>
  );
}

export function FlowHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <header className="mb-8">
      <p className="label-caps text-accent">{eyebrow}</p>
      <h1 className="mt-2 max-w-2xl font-display text-2xl leading-tight text-primary md:text-3xl">
        {title}
      </h1>
      {body ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-variant md:text-base">
          {body}
        </p>
      ) : null}
    </header>
  );
}

export function FieldGroup({
  title,
  body,
  children,
}: {
  title: string;
  body?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/55 p-4 md:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {body ? <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{body}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function FlowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 border-t border-outline-variant/25 pt-6 sm:flex-row sm:items-center sm:justify-end">
      {children}
    </div>
  );
}

export function FlowSummary({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <aside className="h-fit overflow-hidden rounded-[1.75rem] border border-outline-variant/25 bg-surface-container-lowest shadow-[0_16px_45px_rgba(42,46,31,0.08)] lg:sticky lg:top-[calc(var(--header-offset)+2rem)]">
      <div className="bg-primary px-6 py-6 text-on-primary">
        <p className="label-caps text-white/65">{eyebrow}</p>
        <h2 className="mt-2 font-display text-xl leading-snug">{title}</h2>
        {subtitle ? <p className="mt-2 text-xs leading-relaxed text-white/65">{subtitle}</p> : null}
      </div>
      <div className="px-6 py-6">
        {children}
        {footer ? <div className="mt-5 border-t border-outline-variant/25 pt-5">{footer}</div> : null}
      </div>
      <div className="flex items-center gap-3 border-t border-outline-variant/20 bg-surface-container-low/70 px-6 py-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary-container text-primary">
          <ShieldCheck size={16} />
        </span>
        <p className="text-[11px] leading-relaxed text-on-surface-variant">
          Your details are only used to arrange this trip.
        </p>
      </div>
    </aside>
  );
}

export function SecureNote({ request }: { request?: boolean }) {
  return (
    <p className="flex items-center gap-2 text-xs text-on-surface-variant">
      <LockKeyhole size={13} className="text-primary" />
      {request ? "No payment is taken until availability is confirmed." : "Secure checkout follows your review."}
    </p>
  );
}
