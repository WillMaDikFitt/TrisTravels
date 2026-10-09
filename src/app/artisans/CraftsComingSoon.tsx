import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CraftsPageCopy } from "@/data/artisans";

const script = Caveat({ subsets: ["latin"], weight: ["500"], display: "swap" });

/** Shown in place of /artisans and the maker profiles while Studio → Crafts → "Coming soon" is on. */
export function CraftsComingSoon({ copy }: { copy: CraftsPageCopy }) {
  return (
    <section className="relative flex min-h-[calc(100svh-var(--header-offset))] items-center overflow-hidden bg-primary-container pt-header">
      {copy.heroImage ? (
        <Image
          src={copy.heroImage}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={80}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />

      <div className="relative mx-auto w-full max-w-container-max px-margin-mobile py-20 text-center md:px-margin-desktop md:py-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] text-white uppercase backdrop-blur">
          <Sparkles size={13} aria-hidden />
          Coming soon
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-serif text-4xl leading-[1.05] text-white md:text-6xl">
          {copy.comingSoonTitle}
        </h1>
        <p
          className={`${script.className} mt-5 text-3xl text-white/85 md:text-4xl`}
        >
          {copy.heroTitle}
        </p>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
          {copy.comingSoonBody}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/experiences"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold tracking-[0.12em] text-secondary uppercase transition hover:bg-white/90"
          >
            Explore experiences
            <ArrowRight size={14} aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/50 px-6 py-3 text-xs font-bold tracking-[0.12em] text-white uppercase transition hover:bg-white/10"
          >
            Get in touch
          </Link>
        </div>
      </div>
    </section>
  );
}
