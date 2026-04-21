"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useFormattedDate } from "@/lib/useFormatDate";
import { FeedbackForm } from "@/components/FeedbackForm";
import { FeedbackList } from "@/components/FeedbackList";
import { FeedbackItemSkeleton } from "@/components/SkeletonLoaders";
import { Sparkles, AlertCircle } from "lucide-react";

interface DraftDetail {
  id: string;
  title: string;
  genre: string;
  content_text: string;
  word_count: number;
  created_at: string;
  ai_critique?: {
    scores: {
      plot: number;
      pacing: number;
      character: number;
    };
    suggestions: Array<{ title: string; desc: string }>;
    analyzed_at: string;
  };
}

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

export default function AgoraDraftDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const draftDateFormatted = useFormattedDate("");
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [critiqueError, setCritiqueError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [draftRes, feedbackRes] = await Promise.all([
          api.get<DraftDetail>(`/drafts/${id}`),
          api.get<FeedbackItem[]>(`/feedback/draft/${id}`),
        ]);
        if (draftRes.data) setDraft(draftRes.data);
        if (feedbackRes.data) setFeedback(feedbackRes.data);
      } catch (err: unknown) {
        console.error("Failed to load draft:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleRequestCritique = async () => {
    setCritiqueLoading(true);
    setCritiqueError("");
    try {
      const res = await api.post(`/drafts/${id}/critique`);
      if (res.data?.success) {
        // Refresh draft to get updated critique if available
        const draftRes = await api.get<DraftDetail>(`/drafts/${id}`);
        if (draftRes.data) setDraft(draftRes.data);
      }
    } catch (err: unknown) {
      setCritiqueError(err instanceof Error ? err.message : "Failed to request AI critique");
    } finally {
      setCritiqueLoading(false);
    }
  };

  const handleFeedbackSuccess = async () => {
    // Refresh feedback list after successful submission
    try {
      const res = await api.get<FeedbackItem[]>(`/feedback/draft/${id}`);
      if (res.data) setFeedback(res.data);
    } catch (err) {
      console.error("Failed to refresh feedback:", err);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center opacity-30">
          <p className="text-sm font-serif italic">Loading story...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back link */}
        <Link
          href="/agora"
          className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
        >
          ← Back to Agora
        </Link>

        {/* Draft content */}
        {draft ? (
          <GlassCard className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-serif font-black italic">{draft.title}</h1>
              <Badge>{draft.genre}</Badge>
            </div>

            {/* Meta info */}
            <DraftMetaInfo draft={draft} />

            {/* Content */}
            <div className="border-t border-[#4a5033]/10 pt-6">
              <p className="leading-relaxed whitespace-pre-wrap font-serif text-[#4a5033]">
                {draft.content_text || "No text available."}
              </p>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-8 text-center text-sm opacity-50">
            Story unavailable.
          </GlassCard>
        )}

        {/* AI Critique Section */}
        {draft && (
          <GlassCard className="p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-black italic flex items-center gap-2">
                <Sparkles size={20} />
                AI Literary Critique
              </h2>
            </div>

            {draft.ai_critique ? (
              <AIClitiqueDisplay critique={draft.ai_critique} />
            ) : (
              <div className="space-y-3">
                <p className="text-sm opacity-60">
                  Get AI-powered analysis of plot, pacing, and character development.
                </p>
                <InkButton
                  onClick={handleRequestCritique}
                  disabled={critiqueLoading}
                  className="px-5 py-2 rounded-lg"
                >
                  {critiqueLoading ? "Analyzing..." : "Request AI Critique"}
                </InkButton>
                {critiqueError && (
                  <div className="flex gap-2 items-start p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                    <AlertCircle size={16} className="text-rose-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-rose-600">{critiqueError}</p>
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        )}

        {/* Feedback Form */}
        {draft && (
          <GlassCard className="p-8 space-y-6">
            <h2 className="text-xl font-serif font-black italic">Share Your Feedback</h2>
            <FeedbackForm draftId={id} onSuccess={handleFeedbackSuccess} />
          </GlassCard>
        )}

        {/* Community Feedback */}
        {draft && (
          <GlassCard className="p-8 space-y-4">
            <h2 className="text-xl font-serif font-black italic">Community Feedback</h2>
            <FeedbackList feedback={feedback} />
          </GlassCard>
        )}
      </div>
    </MainLayout>
  );
}

function DraftMetaInfo({ draft }: { draft: DraftDetail }) {
  const formattedDate = useFormattedDate(draft.created_at);

  return (
    <div className="flex items-center justify-between text-xs opacity-50">
      <span>{formattedDate}</span>
      <span>{draft.word_count?.toLocaleString()} words</span>
    </div>
  );
}

interface AICritique {
  scores: {
    plot: number;
    pacing: number;
    character: number;
  };
  suggestions: Array<{ title: string; desc: string }>;
  analyzed_at: string;
}

function AIClitiqueDisplay({ critique }: { critique: AICritique }) {
  const avgScore = Math.round(
    (critique.scores.plot + critique.scores.pacing + critique.scores.character) / 3
  );

  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard label="Plot" score={critique.scores.plot} />
        <ScoreCard label="Pacing" score={critique.scores.pacing} />
        <ScoreCard label="Character" score={critique.scores.character} />
      </div>

      {/* Overall */}
      <div className="p-4 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10">
        <p className="text-xs opacity-50 mb-1">Overall Score</p>
        <p className="text-2xl font-black">{avgScore}/10</p>
      </div>

      {/* Suggestions */}
      {critique.suggestions && critique.suggestions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#4a5033]/10">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60">Suggestions</p>
          {critique.suggestions.map((s, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#4a5033]/[0.03] border border-[#4a5033]/10">
              <p className="text-xs font-bold mb-1">{s.title}</p>
              <p className="text-xs opacity-70 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Metadata */}
      <p className="text-[10px] opacity-30 text-right">
        Analyzed on {new Date(critique.analyzed_at).toLocaleDateString()}
      </p>
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const percentage = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-emerald-500/20 border-emerald-500/30" : score >= 6 ? "bg-amber-500/20 border-amber-500/30" : "bg-rose-500/20 border-rose-500/30";

  return (
    <div className={`p-3 rounded-lg border ${color}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <p className="text-xl font-black mb-2">{score}</p>
      <div className="w-full h-1 bg-[#4a5033]/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-rose-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

