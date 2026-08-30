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
      <div className="relative flex h-[100svh] min-h-[640px] w-full items-center">
        {/* Video scaled down from the top-left — cream overlays below stay as-is */}
        <div className="absolute inset-0 overflow-hidden bg-[#2a332c]">
          <motion.div
            style={{ y }}
            className="absolute top-[9%] left-[16%] right-0 bottom-0 md:top-[10%] md:left-[20%]"
          >
            {reduce ? (
              <Image
                src={media.heroPoster}
                alt="Misty hills and trails in Meghalaya"
                fill
                priority
                className="object-cover object-center"
                sizes="100vw"
                quality={90}
              />
            ) : (
              <video
                className="h-full w-full object-cover object-center"
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

          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[min(100%,58rem)] bg-gradient-to-r from-[#E8EBDD] from-0% via-[#E8EBDD] via-42% to-transparent to-100%"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[min(100%,44rem)] bg-gradient-to-r from-[#F5F6F0] via-[#E8EBDD]/90 to-transparent"
          />
          {/* Top wash so navbar + headline sit on clear cream */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[min(42%,22rem)] bg-gradient-to-b from-[#E8EBDD] via-[#E8EBDD]/85 to-transparent"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[min(28%,14rem)] bg-gradient-to-b from-[#F5F6F0]/95 to-transparent"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        </div>

        <div className="relative z-10 w-full px-6 pt-[var(--header-offset)] pb-16 sm:px-8 md:px-12 lg:px-16 md:pb-20">
          <div className="mx-auto w-full max-w-container-max">
            <motion.div
              className="flex w-full max-w-[36rem] flex-col items-start text-left md:max-w-[40rem]"
              initial={reduce ? false : "hidden"}
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { delayChildren: 0.18, staggerChildren: 0.1 } },
              }}
            >
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-[family-name:var(--font-playfair)] text-[clamp(2.85rem,6.5vw,5.5rem)] leading-[1.08] font-medium tracking-[-0.015em] text-primary"
              >
                Experience
                <br />
                the unseen.
              </motion.h1>

              <motion.div
                aria-hidden
                variants={{
                  hidden: { opacity: 0, scaleX: 0.6 },
                  visible: { opacity: 1, scaleX: 1 },
                }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 h-px w-14 origin-left bg-primary/70 md:mt-6 md:w-16"
              />

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 font-[family-name:var(--font-manrope)] text-[1.35rem] leading-snug font-semibold tracking-[-0.01em] text-primary md:mt-6 md:text-[1.5rem]"
              >
                Travel your way, with us.
              </motion.p>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 max-w-[26rem] font-[family-name:var(--font-manrope)] text-[1.0625rem] leading-[1.65] font-normal text-pretty text-primary/80 md:max-w-[28rem] md:text-[1.125rem]"
              >
                Community-rooted, authentic, and deeply personal journeys in Meghalaya. Travel that
                feels like coming home — and leaves communities stronger.
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 flex flex-wrap items-center gap-3 md:mt-9"
              >
                <Button
                  href="/craft-my-journey"
                  size="lg"
                  className="h-12 min-h-12 px-7 text-[12px] font-semibold tracking-[0.14em] uppercase md:h-[3.15rem] md:min-h-[3.15rem] md:px-8 md:text-[13px]"
                >
                  Craft my journey →
                </Button>
                <Button
                  href="/experiences"
                  size="lg"
                  variant="ghost"
                  className="h-12 min-h-12 border-primary/55 px-7 text-[12px] font-semibold tracking-[0.14em] text-primary uppercase hover:border-primary hover:bg-primary/5 md:h-[3.15rem] md:min-h-[3.15rem] md:px-8 md:text-[13px]"
                >
                  Explore experiences →
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
