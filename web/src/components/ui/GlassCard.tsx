"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "ink";
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
  const variants = {
    default: "glass-card",
    muted: "bg-[#4a5033]/5 border-[#4a5033]/10 backdrop-blur-md",
    ink: "ink-bg shadow-2xl shadow-[#4a5033]/20",
  };

  return (
    <div
      className={cn(
        "rounded-[32px] p-6 lg:p-8 transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

