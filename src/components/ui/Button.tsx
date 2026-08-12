import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
};

const variants = {
  primary: "bg-accent text-on-accent hover:brightness-110 shadow-sm",
  secondary: "bg-secondary text-on-secondary hover:brightness-95",
  ghost: "border border-secondary/30 text-secondary hover:bg-secondary/10",
  light: "bg-secondary text-on-secondary hover:brightness-95",
};

const sizes = {
  sm: "h-9 px-4 text-xs",
  md: "h-10 px-6 text-xs",
  lg: "h-12 px-8 text-sm",
};

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  onClick,
  disabled,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-bold uppercase tracking-[0.12em] transition active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
