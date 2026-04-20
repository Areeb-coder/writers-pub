"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  const variants = {
    default: "bg-[#4a5033]/10 text-[#4a5033]",
    outline: "border border-[#4a5033]/20 text-[#4a5033]/70",
    success: "bg-emerald-600/10 text-emerald-700 border border-emerald-600/20",
    warning: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
    info: "bg-sky-500/10 text-sky-700 border border-sky-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
