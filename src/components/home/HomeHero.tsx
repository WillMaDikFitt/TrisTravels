"use client";

import Image from "next/image";
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
          {reduce ? (
            <Image
              src={media.heroPoster}
              alt="Misty hills and trails in Meghalaya"
              fill
              priority
              className="object-cover"
              sizes="100vw"
              quality={90}
            />
          ) : (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={media.heroPoster}
              aria-label="Scenic film of Meghalaya landscapes"
            >
              <source src={media.heroVideoMp4} type="video/mp4" />
              <source src={media.heroVideoMov} type="video/quicktime" />
            </video>
          )}
        </motion.div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0)_62%)]" />

        <div className="relative z-10 w-full px-margin-mobile pt-[var(--header-offset)] pb-16 md:px-margin-desktop">
          <motion.div
            className="mx-auto flex max-w-4xl flex-col items-center text-center"
            initial={reduce ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { delayChildren: 0.18, staggerChildren: 0.12 } },
            }}
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance text-white text-shadow-subtle"
            >
              Explore the unseen
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-base leading-relaxed text-pretty text-white/85 md:text-lg"
            >
              Community-rooted days in Meghalaya — living bridges, kitchens, mist, and people who host
              like family.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              <Button href="/experiences">Explore experiences</Button>
            </motion.div>
          </motion.div>
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
