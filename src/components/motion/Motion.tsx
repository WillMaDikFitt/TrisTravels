"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const easings = {
  soft: [0.22, 1, 0.36, 1] as const,
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0 },
};

const floatIn: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0 },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0 },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0 },
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 },
};

type MotionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

function useMotionGate() {
  return useReducedMotion();
}

export function FadeIn({ children, className, delay = 0 }: MotionProps) {
  const reduce = useMotionGate();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={fadeUp}
      transition={{ duration: 0.85, ease: easings.soft, delay }}
    >
      {children}
    </motion.div>
  );
}

export function FloatIn({ children, className, delay = 0 }: MotionProps) {
  const reduce = useMotionGate();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-12% 0px" }}
      variants={floatIn}
      transition={{ duration: 1, ease: easings.soft, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SlideIn({
  children,
  className,
  delay = 0,
  from = "left",
}: MotionProps & { from?: "left" | "right" }) {
  const reduce = useMotionGate();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={from === "left" ? slideInLeft : slideInRight}
      transition={{ duration: 0.9, ease: easings.soft, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ZoomIn({ children, className, delay = 0 }: MotionProps) {
  const reduce = useMotionGate();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={zoomIn}
      transition={{ duration: 0.9, ease: easings.soft, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChildren({
  children,
  className,
  stagger = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useMotionGate();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      transition={{ duration: 0.75, ease: easings.soft }}
    >
      {children}
    </motion.div>
  );
}

/** Parallax layer that moves slower/faster than scroll — live-site style. */
export function ParallaxLayer({
  children,
  className,
  speed = 0.25,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useMotionGate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`${-speed * 100}%`, `${speed * 100}%`]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Image reveal with clip-path expansion on scroll. */
export function RevealImage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useMotionGate();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={cn("overflow-hidden", className)}
      initial={{ clipPath: "inset(12% 12% 12% 12% round 1.5rem)" }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 1.5rem)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 1.1, ease: easings.soft }}
    >
      <motion.div
        initial={{ scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.3, ease: easings.soft }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Marquee({
  children,
  className,
  duration = 28,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  const reduce = useMotionGate();
  const content = (
    <div className="flex shrink-0 items-center gap-10 whitespace-nowrap px-5">{children}</div>
  );

  if (reduce) {
    return <div className={cn("overflow-hidden", className)}>{content}</div>;
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {content}
        {content}
      </motion.div>
    </div>
  );
}
