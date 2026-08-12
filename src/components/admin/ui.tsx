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
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow && <p className="text-[11px] font-semibold tracking-[0.16em] text-[#6b734f] uppercase">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-2xl text-[#2a2e1f] md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-[#5c6350]">{description}</p>}
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
    <div className="rounded-2xl border border-[#e4dfd4] bg-white p-5 shadow-[0_1px_2px_rgba(42,46,31,0.04)]">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#6b734f] uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl text-[#2a2e1f]">{value}</p>
      {hint && <p className="mt-1 text-xs text-[#8a917c]">{hint}</p>}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#e4dfd4] bg-white p-5 shadow-[0_1px_2px_rgba(42,46,31,0.04)] md:p-6",
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
    neutral: "bg-[#f3efe8] text-[#5c6350]",
    olive: "bg-[#e4e8d4] text-[#3d4a28]",
    amber: "bg-amber-50 text-amber-800",
    green: "bg-emerald-50 text-emerald-800",
    red: "bg-rose-50 text-rose-800",
    slate: "bg-slate-100 text-slate-600",
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
    primary: "bg-[#4a5a28] text-[#f7f4ee] hover:bg-[#3d4a22]",
    ghost: "border border-[#d4cec0] bg-white text-[#2a2e1f] hover:bg-[#f3efe8]",
    danger: "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
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
    <label className="block text-sm font-medium text-[#2a2e1f]">
      {label}
      {hint && <span className="ml-2 text-xs font-normal text-[#8a917c]">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[#d4cec0] bg-[#f7f4ee] px-3 py-2.5 text-sm text-[#2a2e1f] outline-none transition placeholder:text-[#8a917c] focus:border-[#4a5a28] focus:bg-white focus:ring-2 focus:ring-[#4a5a28]/15";

export function Notice({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "ok" | "warn" }) {
  const tones = {
    info: "bg-[#f3efe8] text-[#5c6350]",
    ok: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-900",
  };
  return <p className={cn("rounded-xl px-4 py-3 text-sm", tones[tone])}>{children}</p>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d4cec0] px-6 py-14 text-center">
      <p className="font-display text-lg text-[#2a2e1f]">{title}</p>
      <p className="mt-1 text-sm text-[#5c6350]">{body}</p>
    </div>
  );
}

export function bookingTone(status: string): "olive" | "amber" | "green" | "red" | "slate" {
  if (status === "confirmed") return "green";
  if (status === "requested" || status === "hold") return "amber";
  if (status === "cancelled" || status === "expired") return "red";
  return "slate";
}
