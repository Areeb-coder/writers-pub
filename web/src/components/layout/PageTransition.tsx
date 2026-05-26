"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
<motion.div
  key={pathname}
  initial={{
    rotateY: -90,
    opacity: 0,
    x: -40,
    transformPerspective: 2000,
    transformOrigin: "left center",
  }}
  animate={{
    rotateY: 0,
    opacity: 1,
    x: 0,
    transformPerspective: 2000,
    transformOrigin: "left center",
  }}
  exit={{
    rotateY: 90,
    opacity: 0,
    x: 40,
    transformPerspective: 2000,
    transformOrigin: "right center",
  }}
  transition={{
    duration: 0.85,
    ease: [0.65, 0, 0.35, 1],
  }}
  className="min-h-screen bg-transparent relative"
  style={{
    transformStyle: "preserve-3d",
  }}
>
  {/* Page shadow */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.12 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/30 to-transparent pointer-events-none z-40"
  />

  {/* Ink spread overlay */}
  <motion.div
    initial={{
      clipPath: "circle(0% at 50% 50%)",
      opacity: 0.15,
    }}
    animate={{
      clipPath: "circle(150% at 50% 50%)",
      opacity: 0,
    }}
    transition={{
      duration: 0.8,
      ease: "easeOut",
    }}
    className="fixed inset-0 pointer-events-none bg-gradient-to-r from-[#3b322c]/40 via-[#8b7355]/20 to-[#3b322c]/40 z-50 mix-blend-multiply"
  />

  {children}
</motion.div>
    </AnimatePresence>
  );
}