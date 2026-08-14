"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Compass, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { media } from "@/data/media";

const stats = [
  {
    icon: Compass,
    title: "Curated experiences",
    detail: "Six immersive styles—adventure, nature, food, culture, wellness, and craft.",
  },
  {
    icon: Heart,
    title: "Warm hospitality",
    detail: "Shared meals, open homes, and genuine, heartfelt care.",
  },
  {
    icon: Users,
    title: "Local Khasi guides",
    detail: "Community-led days with guides who know the trails, villages, and stories.",
  },
];

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, reduce ? 1.06 : 1.2]);

  return (
    <section ref={ref} className="relative">
      <div className="relative flex h-[88vh] min-h-[600px] w-full items-center overflow-hidden">
        <motion.div style={{ y, scale }} className="absolute inset-0 h-[120%] w-full">
          <Image
            src={media.heroMeghalaya}
            alt="Living root bridge trail in the Khasi Hills, Meghalaya"
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={80}
          />
        </motion.div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
        <p className="absolute top-1/2 right-5 hidden -translate-y-1/2 text-[11px] font-bold tracking-[0.35em] text-white/70 uppercase [writing-mode:vertical-rl] md:block">
          Khasi Hills · Meghalaya
        </p>

        <div className="relative z-10 w-full px-margin-mobile pt-[var(--header-offset)] pb-16 md:px-margin-desktop md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <p className="label-caps mb-4 tracking-[0.22em] text-accent">TRIS · The unseen North East</p>
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-white text-shadow-subtle md:text-7xl lg:text-[5rem]">
              Experience the unseen.
            </h1>
            <p className="mx-auto mt-5 max-w-lg font-serif text-2xl text-white/95 italic md:text-3xl">
              Travel your way with us.
            </p>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/85 md:text-lg">
              Community-rooted days in Meghalaya — living bridges, kitchens, mist, and people who host
              like family.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="/experiences" variant="light">
                Explore experiences
              </Button>
              <Link
                href="/journeys"
                className="inline-flex h-10 items-center rounded-full border border-white/45 px-6 text-xs font-bold tracking-[0.12em] text-white uppercase transition hover:bg-white/10"
              >
                See journeys
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-10 max-w-container-max px-margin-mobile md:-mt-12 md:px-margin-desktop">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#e4dfd4] bg-[#f7f4ee] shadow-[0_18px_50px_rgba(42,46,31,0.12)] sm:grid-cols-3">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.title}
                className={`flex flex-col justify-center px-5 py-5 md:px-7 md:py-6 ${i > 0 ? "border-t border-[#e4dfd4] sm:border-t-0 sm:border-l" : ""}`}
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={18} strokeWidth={1.75} aria-hidden />
                </div>
                <p className="font-display text-xl leading-snug text-primary md:text-2xl">{s.title}</p>
                <p className="mt-2 min-h-[2.5rem] text-xs leading-snug text-on-surface-variant md:min-h-[2.75rem] md:text-sm">
                  {s.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
