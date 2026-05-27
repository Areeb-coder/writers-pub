"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface InkButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function InkButton({ children, className, variant = "primary", ...props }: InkButtonProps) {
  const variants = {
    primary: "ink-bg text-primary-foreground hover:scale-105 shadow-xl shadow-primary/20",
    secondary: "glass-card text-primary hover:bg-primary/5",
    outline: "border border-primary/20 text-primary hover:bg-primary/5",
    ghost: "text-primary/70 hover:text-primary hover:bg-primary/5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-widest transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
