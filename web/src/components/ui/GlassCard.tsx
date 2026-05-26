"use client";

import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "ink" | "dialog";
}

export function GlassCard({ children, className, variant = "default", ...props }: GlassCardProps) {
  const variants = {
    default: "glass-card",
    muted: "bg-[#4a5033]/5 border-[#4a5033]/10 backdrop-blur-md",
    ink: "ink-bg shadow-2xl shadow-[#4a5033]/20",
    // Vellum-style: thin translucent manuscript paper for dialogs and auth cards.
    // More opaque than ambient glass-card so floating surfaces read clearly
    // against any background, maintaining ink-on-parchment contrast.
    dialog: "vellum-dialog",
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

