"use client";

import { useFormattedDate } from "@/lib/useFormatDate";
import { FeedbackItemSkeleton } from "./SkeletonLoaders";

interface FeedbackItem {
  id: string;
  reviewer_name: string;
  written_feedback?: string;
  scores: {
    plot: number;
    pacing: number;
    character: number;
  };
  created_at: string;
}

export function FeedbackList({ feedback, loading = false }: { feedback: FeedbackItem[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-3">
        <FeedbackItemSkeleton />
        <FeedbackItemSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback.length ? (
        feedback.map((item) => <FeedbackItemComponent key={item.id} item={item} />)
      ) : (
        <p className="text-sm opacity-50">No feedback yet.</p>
      )}
    </div>
  );
}

function FeedbackItemComponent({ item }: { item: FeedbackItem }) {
  const formattedDate = useFormattedDate(item.created_at);

  return (
    <div className="p-4 rounded-xl bg-[#4a5033]/[0.03] border border-[#4a5033]/10">
      <p className="font-bold text-sm">{item.reviewer_name}</p>
      <p className="text-xs opacity-50 mb-2">{formattedDate}</p>
      <p className="text-xs mb-2">
        Plot {item.scores?.plot} • Pacing {item.scores?.pacing} • Character {item.scores?.character}
      </p>
      <p className="text-sm opacity-80">{item.written_feedback || "No written feedback."}</p>
    </div>
  );
}
