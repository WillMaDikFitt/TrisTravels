"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { media } from "@/data/media";

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);

  return (
    <section ref={ref} className="home-snap-section relative">
      <div className="relative flex h-[100svh] min-h-[640px] w-full items-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 h-[118%] w-full">
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
              preload="auto"
              poster={media.heroPoster}
              aria-label="Scenic film of Meghalaya landscapes"
            >
              <source src={media.heroVideoMp4} type="video/mp4" />
            </video>
          )}
        </motion.div>
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

        <div className="relative z-10 w-full px-margin-mobile pt-[var(--header-offset)] pb-20 md:px-margin-desktop md:pb-24">
          <motion.div
            className="mx-auto flex w-full max-w-4xl flex-col items-center text-center"
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
              className="font-display whitespace-nowrap text-[clamp(2rem,6.5vw,5rem)] leading-[1.02] font-bold tracking-[-0.025em] text-white text-shadow-subtle"
            >
              Experience the unseen.
            </motion.h1>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 font-[family-name:var(--font-playfair)] text-[clamp(1.25rem,2.8vw,1.85rem)] leading-snug text-white/95"
            >
              Travel your way, with us.
            </motion.p>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 max-w-xl text-sm leading-relaxed text-pretty text-white/85 md:text-base"
            >
              Community-rooted, authentic, and deeply personal journeys in Meghalaya.
              <br />
              Travel that feels like coming home — and leaves communities stronger.
            </motion.p>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                href="/craft-my-journey"
                size="lg"
                className="bg-white text-primary shadow-sm hover:bg-white/95 hover:brightness-100 hover:shadow-md"
              >
                Craft my journey
              </Button>
              <Button
                href="/experiences"
                size="lg"
                variant="ghost"
                className="border-white/70 text-white hover:border-white hover:bg-white/10"
              >
                Explore experiences
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
