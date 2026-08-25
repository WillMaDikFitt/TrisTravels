import { cn } from "@/lib/utils";

export function FilterPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.id === "all" ? !value : value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id === "all" ? null : option.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ListingShell({
  eyebrow,
  title,
  description,
  sidebar,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <section className="bg-surface px-margin-mobile pt-[calc(var(--header-offset)+2rem)] pb-10 md:px-margin-desktop md:pt-[calc(var(--header-offset)+2.5rem)] md:pb-14">
        <div className="mx-auto max-w-container-max">
          <p className="label-caps text-accent">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl text-primary md:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">{description}</p>
          ) : null}
          <div className="mt-8 grid items-start gap-8 lg:grid-cols-[16rem_1fr]">
            <aside className="h-fit rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 lg:sticky lg:top-[calc(var(--header-offset)+1rem)]">
              {sidebar}
            </aside>
            <div className="min-w-0">
              {children}
              {footer}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
