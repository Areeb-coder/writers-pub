"use client";

import { motion } from "framer-motion";

export function DraftCardSkeleton() {
  const shimmer = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: { duration: 1, repeat: Infinity, repeatType: "reverse" as const },
  };

  return (
    <motion.div {...shimmer} className="p-6 lg:p-8 rounded-2xl border border-[#4a5033]/10 bg-[#4a5033]/5 space-y-5">
      {/* Author + Genre */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4a5033]/10" />
          <div className="space-y-2">
            <div className="h-3 w-32 bg-[#4a5033]/10 rounded" />
            <div className="h-2 w-24 bg-[#4a5033]/10 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-[#4a5033]/10 rounded-full" />
      </div>

      {/* Title + Excerpt */}
      <div className="space-y-3">
        <div className="h-6 w-3/4 bg-[#4a5033]/10 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-[#4a5033]/10 rounded" />
          <div className="h-3 w-5/6 bg-[#4a5033]/10 rounded" />
        </div>
      </div>

      {/* AI Scores */}
      <div className="space-y-2 py-3 border-t border-[#4a5033]/5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-12 bg-[#4a5033]/10 rounded" />
            <div className="flex-1 h-1.5 bg-[#4a5033]/10 rounded-full" />
            <div className="h-3 w-6 bg-[#4a5033]/10 rounded" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-4">
          <div className="h-2 w-20 bg-[#4a5033]/10 rounded" />
          <div className="h-2 w-20 bg-[#4a5033]/10 rounded" />
        </div>
        <div className="h-8 w-32 bg-[#4a5033]/10 rounded-lg" />
      </div>
    </motion.div>
  );
}

export function FeedbackItemSkeleton() {
  const shimmer = {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: { duration: 1, repeat: Infinity, repeatType: "reverse" as const },
  };

  return (
    <motion.div {...shimmer} className="p-4 rounded-xl bg-[#4a5033]/[0.03] border border-[#4a5033]/10 space-y-2">
      <div className="h-4 w-32 bg-[#4a5033]/10 rounded" />
      <div className="h-3 w-24 bg-[#4a5033]/10 rounded" />
      <div className="h-3 w-40 bg-[#4a5033]/10 rounded" />
      <div className="space-y-1 mt-3">
        <div className="h-3 w-full bg-[#4a5033]/10 rounded" />
        <div className="h-3 w-5/6 bg-[#4a5033]/10 rounded" />
      </div>
    </motion.div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="h-6 w-32 bg-[#4a5033]/10 rounded animate-pulse" />
      <div className="space-y-5">
        {[1, 2, 3].map((i) => (
          <DraftCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
