"use client";

import { motion, useReducedMotion } from "framer-motion";

function Butterfly({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="absolute text-monarch-orange/20"
      style={{ left: `${x}%`, top: "20%" }}
      initial={{ y: 0, opacity: 0, rotate: -10 }}
      animate={{
        y: [0, -30, -15, -45, -20],
        x: [0, 15, -10, 20, 5],
        opacity: [0, 0.6, 0.4, 0.6, 0],
        rotate: [-10, 5, -5, 8, -3],
      }}
      transition={{
        duration: 12 + delay * 2,
        delay: delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeInOut",
      }}
    >
      <motion.g
        animate={{ scaleX: [1, 0.7, 1] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M50 50 C30 20, 5 25, 15 55 C20 70, 35 75, 50 50Z" fill="currentColor" />
        <path d="M50 50 C70 20, 95 25, 85 55 C80 70, 65 75, 50 50Z" fill="currentColor" />
        <path d="M50 50 C35 60, 20 85, 40 80 C48 78, 50 65, 50 50Z" fill="currentColor" opacity="0.8" />
        <path d="M50 50 C65 60, 80 85, 60 80 C52 78, 50 65, 50 50Z" fill="currentColor" opacity="0.8" />
        <ellipse cx="50" cy="52" rx="2" ry="12" fill="currentColor" />
      </motion.g>
    </motion.svg>
  );
}

export function ButterflyParticles() {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) return null;

  const butterflies = [
    { delay: 0, x: 10, size: 40 },
    { delay: 2, x: 30, size: 30 },
    { delay: 4, x: 55, size: 35 },
    { delay: 1, x: 75, size: 28 },
    { delay: 3, x: 90, size: 32 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {butterflies.map((b, i) => (
        <Butterfly key={i} {...b} />
      ))}
    </div>
  );
}
