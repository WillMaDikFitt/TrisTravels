import Image from "next/image";
import Link from "next/link";
import { ArrowRight, HandHeart, Leaf, Users } from "lucide-react";
import { FadeIn, SlideIn } from "@/components/motion/Motion";
import { media } from "@/data/media";
import { cn } from "@/lib/utils";

const serif = "font-[family-name:var(--font-playfair)]";

const MARKERS = [
  { label: "Community first", Icon: Users },
  { label: "Slow travel", Icon: Leaf },
  { label: "Gives back", Icon: HandHeart },
];

/**
 * "The heart behind TRIS" — warm cream panel with the portrait framed on the left.
 * Swap the photo by pointing media.aboutHomePortrait at a new file.
 */
export function HomeStory() {
  return (
    <section className="home-snap-section relative flex min-h-[100svh] items-center overflow-hidden bg-[#f7f2e9] py-12 md:py-16">
      {/* Warm light from the top-right, so the cream isn't flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 70% at 78% 22%, rgba(255,252,245,0.95) 0%, transparent 70%), radial-gradient(ellipse 55% 60% at 10% 85%, rgba(226,214,193,0.45) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-container-max items-center gap-10 px-margin-mobile md:grid-cols-12 md:gap-12 md:px-margin-desktop lg:gap-16">
        <SlideIn from="left" className="md:col-span-6">
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            {/* Thin outline offset behind the photo for a framed, album-like feel */}
            <span
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-[1.75rem] border border-primary/15 md:-inset-4"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] shadow-[0_24px_60px_rgba(54,64,55,0.16)]">
              <Image
                src={media.aboutHomePortrait}
                alt="Mei-ieid with her granddaughter — the heart behind TRIS"
                fill
                className="object-cover object-[center_35%]"
                sizes="(max-width: 768px) 92vw, 48vw"
              />
            </div>
          </div>
        </SlideIn>

        <FadeIn className="md:col-span-6">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-on-surface-variant uppercase">
              Our story
            </p>
            <span className="mt-1.5 block h-px w-10 bg-on-surface-variant/50" />
          </div>

          <h2
            className={cn(
              serif,
              "mt-5 text-[clamp(2.4rem,5vw,4rem)] leading-[1.02] font-medium text-balance text-primary",
            )}
          >
            The heart behind{" "}
            <span className="relative whitespace-nowrap">
              TRIS
              <Leaf
                aria-hidden
                className="ml-2 inline-block h-6 w-6 -translate-y-2 text-highlight md:h-7 md:w-7"
                strokeWidth={1.5}
              />
            </span>
          </h2>

          <p
            className={cn(
              serif,
              "mt-5 max-w-2xl text-[1.05rem] leading-snug text-highlight italic md:text-[1.35rem]",
            )}
          >
            Mei-ieid embodied true Khasi hospitality — generous, hard-working, and unconditionally
            caring.
          </p>

          <div className="mt-5 max-w-2xl space-y-3.5 text-sm leading-relaxed text-on-surface md:text-base md:leading-[1.75]">
            <p>
              Born in Mairang, she didn&apos;t speak the language of business.{" "}
              <span className="font-semibold text-primary">
                TRIS is our promise to carry her spirit forward
              </span>{" "}
              through every homestay, meal, guide and journey we craft.
            </p>
            <p>
              We create journeys that go beyond sightseeing — connecting you more deeply with the
              people, culture and landscapes of Meghalaya.
            </p>
          </div>

          <div className="mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-4">
            {MARKERS.map(({ label, Icon }) => (
              <div
                key={label}
                className="flex flex-1 items-center gap-2.5 rounded-2xl border border-primary/12 bg-white/70 px-4 py-3 sm:flex-col sm:justify-center sm:gap-2 sm:text-center"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-container text-primary">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                <span className="text-xs font-medium text-primary md:text-sm">{label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/about"
            className="group mt-8 inline-flex w-fit items-center gap-2.5 rounded-lg bg-cta px-6 py-3 text-xs font-bold tracking-[0.14em] text-on-cta uppercase transition hover:brightness-110"
          >
            Read our story
            <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
