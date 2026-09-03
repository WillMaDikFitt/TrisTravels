import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LegalTocItem = { id: string; label: string };

export type LegalRelatedLink = { href: string; label: string };

const DEFAULT_RELATED: LegalRelatedLink[] = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Cancellation & Refunds" },
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/pricing", label: "Pricing" },
  { href: "/terms", label: "Package Terms" },
  { href: "/terms/fixed-departures", label: "Fixed Departure Terms" },
  { href: "/contact", label: "Contact" },
];

export function LegalBulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-on-surface-variant md:text-[0.95rem]">
      {items.map((item) => (
        <li key={item.slice(0, 64)} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-highlight" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-header border-t border-outline-variant/25 pt-10">
      <div className="flex items-baseline gap-3">
        {number ? <span className="font-display text-2xl text-highlight">{number}</span> : null}
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-primary md:text-[1.75rem]">
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function LegalSubheading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-8 text-sm font-semibold tracking-wide text-primary uppercase">{children}</h3>
  );
}

export function LegalCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
      <table className="w-full text-left text-sm">
        <thead className="bg-primary-container text-on-primary-container">
          <tr>
            {headers.map((h, i) => (
              <th
                key={h}
                className={cn("px-4 py-3 font-semibold", i > 1 && "hidden sm:table-cell")}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-on-surface-variant">
          {rows.map((row) => (
            <tr key={row.join("-")} className="border-t border-outline-variant/25">
              {row.map((cell, i) => (
                <td
                  key={`${row[0]}-${i}`}
                  className={cn(
                    "px-4 py-3",
                    i === 1 && "font-medium text-primary",
                    i > 1 && "hidden sm:table-cell",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalShell({
  title,
  subtitle,
  effective,
  intro,
  notice,
  toc,
  related = DEFAULT_RELATED,
  relatedExcludeHref,
  children,
  footerNote,
}: {
  title: string;
  subtitle?: string;
  effective: string;
  intro?: ReactNode;
  notice?: ReactNode;
  toc?: LegalTocItem[];
  related?: LegalRelatedLink[];
  relatedExcludeHref?: string;
  children: ReactNode;
  footerNote?: string;
}) {
  const relatedLinks = related.filter((l) => l.href !== relatedExcludeHref);

  return (
    <div className="bg-surface text-foreground">
      <header className="border-b border-outline-variant/25 bg-primary-container px-margin-mobile pt-[calc(var(--header-offset)+2.5rem)] pb-12 text-on-primary-container md:px-margin-desktop md:pb-14">
        <div className="mx-auto max-w-container-max">
          <p className="label-caps text-highlight">Legal</p>
          <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-playfair)] text-3xl leading-tight md:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-4 max-w-3xl text-sm text-on-primary-container/80 md:text-base">{subtitle}</p>
          ) : null}
          <p className="mt-2 text-sm font-medium text-highlight">{effective}</p>
        </div>
      </header>

      <div className="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
        {intro ? (
          <div className="text-base leading-relaxed text-on-surface-variant md:max-w-4xl md:text-lg">{intro}</div>
        ) : null}
        {notice ? <div className="mt-4 text-sm text-on-surface-variant md:max-w-4xl">{notice}</div> : null}

        {toc && toc.length > 0 ? (
          <nav
            aria-label="Sections"
            className="mt-10 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 md:p-6"
          >
            <p className="text-[11px] font-bold tracking-[0.14em] text-highlight uppercase">
              On this page
            </p>
            <ol className="mt-3 columns-1 gap-x-10 space-y-1.5 text-sm text-primary sm:columns-2 lg:columns-3">
              {toc.map((item) => (
                <li key={item.id} className="break-inside-avoid">
                  <a href={`#${item.id}`} className="hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className={cn(toc?.length || intro || notice ? "mt-12" : "mt-0", "space-y-12")}>
          {children}
        </div>

        <div className="mt-14 border-t border-outline-variant/25 pt-8">
          <p className="label-caps text-highlight">Related policies</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-outline-variant/40 bg-surface-container-lowest px-3.5 py-1.5 text-xs font-semibold tracking-wide text-primary transition hover:border-primary/40 hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-on-surface-variant">
            Questions?{" "}
            <Link href="/contact" className="font-semibold text-primary underline-offset-2 hover:underline">
              Contact us
            </Link>{" "}
            or email{" "}
            <a
              href="mailto:trissimai03@gmail.com"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              trissimai03@gmail.com
            </a>
            .
          </p>
        </div>

        {footerNote ? (
          <p className="mt-10 text-center text-xs text-on-surface-variant">{footerNote}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LegalContactBlock() {
  return (
    <LegalCard>
      <p className="font-[family-name:var(--font-playfair)] text-xl text-primary">TRIS Travels</p>
      <p className="mt-1 text-sm text-on-surface-variant">TRIS Meghalaya Travels · Shillong, Meghalaya, India</p>
      <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
        <li>
          Email:{" "}
          <a
            href="mailto:trissimai03@gmail.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            trissimai03@gmail.com
          </a>
        </li>
        <li>
          Bookings:{" "}
          <a
            href="mailto:tristravelbookings@gmail.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            tristravelbookings@gmail.com
          </a>
        </li>
        <li>
          Phone / WhatsApp:{" "}
          <a
            href="https://wa.me/917005241197"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            +91 70052 41197
          </a>
        </li>
        <li>
          Website:{" "}
          <a
            href="https://www.trismeghalaya.com"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            www.trismeghalaya.com
          </a>
        </li>
      </ul>
      <p className="mt-6 font-serif text-sm italic text-primary/80">
        Travel thoughtfully. Experience deeply. Leave something good behind.
      </p>
    </LegalCard>
  );
}
