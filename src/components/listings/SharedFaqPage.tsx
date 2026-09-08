import { FadeIn } from "@/components/motion/Motion";
import type { SharedFaqItem } from "@/data/shared-faqs";
import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";

type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  items: SharedFaqItem[];
  backHref: string;
  backLabel: string;
};

export function SharedFaqPage({ eyebrow, title, intro, items, backHref, backLabel }: Props) {
  return (
    <div className="bg-surface text-foreground">
      <div className="border-b border-outline-variant/25 bg-gradient-to-b from-secondary-container/40 to-surface">
        <div className="mx-auto max-w-3xl px-margin-mobile py-14 md:px-margin-desktop md:py-20">
          <p className="label-caps text-highlight">{eyebrow}</p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl leading-[1.05] text-primary md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">{intro}</p>
          <div className="mt-6">
            <Button href={backHref} variant="ghost">
              ← {backLabel}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-margin-mobile py-10 md:px-margin-desktop md:py-14">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-outline-variant/40 px-5 py-8 text-center text-sm text-on-surface-variant">
            FAQs will appear here once they are published in Studio. Meanwhile, write to us at{" "}
            <a className="font-semibold text-primary underline-offset-2 hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        ) : (
          <FadeIn>
            <div className="space-y-3">
              {items.map((item, index) => (
                <details
                  key={item.id}
                  className="group rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-[0_6px_20px_rgba(54,64,55,0.05)] open:border-highlight/35 open:shadow-[0_10px_28px_rgba(54,64,55,0.08)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:content-none focus-visible:rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:px-6 md:py-5">
                    <span className="flex min-w-0 items-start gap-3 md:gap-4">
                      <span
                        aria-hidden
                        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold tracking-wide text-on-primary"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-lg leading-snug text-primary md:text-xl">
                        {item.q}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-outline-variant/40 text-sm text-on-surface-variant transition group-open:rotate-45 group-open:border-highlight group-open:bg-highlight/10 group-open:text-highlight"
                    >
                      +
                    </span>
                  </summary>
                  <p className="border-t border-outline-variant/20 px-5 pb-5 pt-4 text-sm leading-relaxed text-on-surface-variant md:px-6 md:pb-6 md:pl-[3.75rem] md:text-base">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </FadeIn>
        )}

        <div className="mt-12 rounded-2xl border border-outline-variant/30 bg-secondary-container/35 px-5 py-6 text-center md:px-8">
          <p className="font-display text-xl text-primary">Still unsure?</p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Write to us and we’ll reply like a host — not a call centre script.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button href={`mailto:${site.email}`}>Email TRIS</Button>
            <Button href={site.whatsappUrl} variant="ghost">
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
