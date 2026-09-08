import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 rounded-3xl border border-surface-container-lowest/80 bg-surface-container-lowest/75 px-6 py-6 shadow-[0_16px_45px_rgba(54,64,55,0.06)] backdrop-blur md:px-8">
      <div>
        {eyebrow && <p className="label-caps text-on-surface-variant">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-3xl text-foreground md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface-container-lowest bg-surface-container-lowest p-5 shadow-[0_14px_36px_rgba(54,64,55,0.08)] before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-terracotta">
      <p className="label-caps text-on-surface-variant">{label}</p>
      <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "w-full min-w-0 max-w-none rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-[0_14px_36px_rgba(54,64,55,0.07)] md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "olive" | "amber" | "green" | "red" | "slate";
}) {
  const tones = {
    neutral: "bg-surface-container text-on-surface-variant",
    olive: "bg-secondary-container text-primary",
    amber: "bg-terracotta/10 text-terracotta",
    green: "bg-highlight/15 text-primary",
    red: "bg-terracotta/12 text-terracotta",
    slate: "bg-surface-container-high text-on-surface-variant",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize", tones[tone])}>
      {children}
    </span>
  );
}

export function AdminButton({
  children,
  variant = "primary",
  type = "button",
  className,
  disabled,
  onClick,
}: {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const variants = {
    primary: "bg-cta text-on-cta hover:brightness-110",
    ghost: "border border-outline-variant bg-surface-container-lowest text-foreground hover:bg-surface-container",
    danger: "border border-terracotta/25 bg-terracotta/10 text-terracotta hover:bg-terracotta/15",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.08em] uppercase transition disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      <span className="block">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs font-normal text-on-surface-variant">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-outline-variant bg-surface-container px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-on-surface-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/15";

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "ok" | "warn" }) {
  const tones = {
    info: "bg-surface-container text-on-surface-variant",
    ok: "bg-highlight/12 text-primary",
    warn: "bg-terracotta/10 text-terracotta",
  };
  return <p className={cn("rounded-xl px-4 py-3 text-sm", tones[tone])}>{children}</p>;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest px-6 py-14 text-center">
      <p className="text-sm text-on-surface-variant">{label}</p>
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-outline-variant px-6 py-14 text-center">
      <p className="font-display text-lg text-foreground">{title}</p>
      <p className="mt-1 text-sm text-on-surface-variant">{body}</p>
    </div>
  );
}

export function bookingTone(status: string): "olive" | "amber" | "green" | "red" | "slate" {
  if (status === "confirmed") return "green";
  if (status === "requested" || status === "hold") return "amber";
  if (status === "cancelled" || status === "expired") return "red";
  return "slate";
}
