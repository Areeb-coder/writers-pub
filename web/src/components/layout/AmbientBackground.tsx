"use client";

import { motion } from "framer-motion";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#daddc6]">
      {/* Dynamic Ink Orbs */}
      <motion.div
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] bg-[#4a5033] opacity-[0.03] blur-[140px] rounded-full"
      />
      <motion.div
        animate={{
          y: [30, -30, 30],
          x: [20, -20, 20],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-1/4 -left-1/4 w-[70%] h-[70%] bg-[#4a5033] opacity-[0.02] blur-[120px] rounded-full"
      />
      
      {/* Subtle Grain Overly */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
           style={{ backgroundImage: 'radial-gradient(#4a5033 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
    </div>
  );
}
