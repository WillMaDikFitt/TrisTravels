"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  images: { src: string; alt: string }[];
  priority?: boolean;
  intervalMs?: number;
};

/** Full-bleed parallax hero with soft crossfade slideshow (live-site feel). */
export function ParallaxImage({
  src,
  alt,
  priority,
  overlay = true,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  overlay?: boolean;
}) {
  return (
    <ParallaxSlideshow
      images={[{ src, alt }]}
      priority={priority}
      overlay={overlay}
      intervalMs={999999}
    />
  );
}

export function ParallaxSlideshow({
  images,
  priority,
  intervalMs = 6000,
  overlay = true,
}: Props & { overlay?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.06, reduce ? 1.06 : 1.18]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.35]);

  useEffect(() => {
    if (images.length < 2 || reduce) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs, reduce]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y, scale, opacity }} className="absolute inset-0 h-[125%] w-full">
        <AnimatePresence mode="sync">
          {images.map((img, i) =>
            i === index ? (
              <motion.div
                key={img.src}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  priority={priority && i === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
      </motion.div>
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-surface" />
      )}
    </div>
  );
}
