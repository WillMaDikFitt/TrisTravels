import { cn } from "@/lib/utils";

const fieldClass =
  "mt-2 w-full rounded-xl border border-outline-variant/35 bg-surface-container-low px-4 py-3 text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus:border-accent focus:ring-2 focus:ring-accent/20";

export function FieldLabel({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium text-primary">
        {children}
      </label>
      {hint ? <span className="text-xs text-on-surface-variant">{hint}</span> : null}
    </div>
  );
}

export function FormInput({
  label,
  name,
  type = "text",
  required,
  min,
  max,
  step,
  defaultValue,
  placeholder,
  value,
  onChange,
  className,
  autoComplete,
  inputMode,
  enterKeyHint,
  autoFocus,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  defaultValue?: string | number;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  enterKeyHint?: React.HTMLAttributes<HTMLInputElement>["enterKeyHint"];
  autoFocus?: boolean;
  hint?: string;
}) {
  const id = name;
  return (
    <div className={cn("block", className)}>
      <FieldLabel htmlFor={id} hint={required ? undefined : hint}>
        {label}
        {required ? <span className="text-accent"> *</span> : null}
        {!required && !hint ? (
          <span className="ml-1.5 text-xs font-normal text-on-surface-variant">(optional)</span>
        ) : null}
      </FieldLabel>
      {hint && required ? (
        <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>
      ) : null}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        enterKeyHint={enterKeyHint}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={fieldClass}
      />
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  required,
  rows = 4,
  placeholder,
  defaultValue,
  value,
  onChange,
  className,
}: {
  label: string;
  name: string;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const id = name;
  return (
    <div className={cn("block", className)}>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </FieldLabel>
      <textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(fieldClass, "resize-y")}
      />
    </div>
  );
}

export function FormSelect({
  label,
  name,
  required,
  options,
  placeholder,
  defaultValue = "",
  value,
  onChange,
  className,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[] | string[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const id = name;
  const opts = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  return (
    <div className={cn("block", className)}>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </FieldLabel>
      <select
        id={id}
        name={name}
        required={required}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={fieldClass}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {opts.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormChipGroup({
  label,
  name,
  options,
  selected,
  onToggle,
  hint,
}: {
  label: string;
  name: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-primary">{label}</legend>
      {hint ? <p className="mt-1 text-xs text-on-surface-variant">{hint}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold tracking-wider uppercase transition",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-outline-variant/40 text-on-surface-variant hover:border-primary/40 hover:text-primary",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
      {selected.map((s) => (
        <input key={s} type="hidden" name={name} value={s} />
      ))}
    </fieldset>
  );
}

export function FormCard({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-6 shadow-ambient md:p-8",
        className,
      )}
    >
      {title ? (
        <div className="mb-6 border-b border-outline-variant/20 pb-5">
          <h2 className="font-display text-2xl text-primary">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm text-on-surface-variant">{subtitle}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function FormSuccess({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-margin-mobile pt-header pb-20">
      <div className="w-full max-w-md rounded-3xl border border-outline-variant/25 bg-surface-container-lowest p-8 text-center shadow-ambient md:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary-container">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-3xl text-primary">{title}</h1>
        <p className="mt-3 text-on-surface-variant">{body}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  );
}
