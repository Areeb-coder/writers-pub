"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface DraftDetail {
  id: string;
  title: string;
  genre: string;
  content_text: string;
  word_count: number;
  created_at: string;
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
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ plot: 8, characters: 8, writing_style: 8, written_feedback: "" });

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
        setError(err instanceof Error ? err.message : "Failed to load draft");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/feedback", {
        draft_id: id,
        scores: {
          plot: form.plot,
          characters: form.characters,
          writing_style: form.writing_style,
        },
        written_feedback: form.written_feedback,
      });
      setSuccess("Feedback submitted successfully.");
      const feedbackRes = await api.get<FeedbackItem[]>(`/feedback/draft/${id}`);
      if (feedbackRes.data) setFeedback(feedbackRes.data);
      setForm((prev) => ({ ...prev, written_feedback: "" }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <MainLayout><div className="py-20 text-center opacity-30">Loading draft...</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/agora" className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100">
          Back to Agora
        </Link>
        {draft ? (
          <GlassCard className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-serif font-black italic">{draft.title}</h1>
              <Badge>{draft.genre}</Badge>
            </div>
            <p className="text-xs opacity-50">{new Date(draft.created_at).toLocaleDateString()} • {draft.word_count} words</p>
            <p className="leading-relaxed whitespace-pre-wrap">{draft.content_text || "No text available."}</p>
          </GlassCard>
        ) : (
          <GlassCard className="p-8">Draft unavailable.</GlassCard>
        )}

        <GlassCard className="p-8 space-y-4">
          <h2 className="text-xl font-serif font-black italic">Submit Feedback</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input type="number" min={1} max={10} value={form.plot} onChange={(e) => setForm({ ...form, plot: Number(e.target.value) })} className="px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10" placeholder="Plot" />
              <input type="number" min={1} max={10} value={form.characters} onChange={(e) => setForm({ ...form, characters: Number(e.target.value) })} className="px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10" placeholder="Characters" />
              <input type="number" min={1} max={10} value={form.writing_style} onChange={(e) => setForm({ ...form, writing_style: Number(e.target.value) })} className="px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10" placeholder="Writing Style" />
            </div>
            <textarea rows={4} value={form.written_feedback} onChange={(e) => setForm({ ...form, written_feedback: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10" placeholder="Your detailed feedback..." />
            {error ? <p className="text-xs text-rose-600 font-semibold">{error}</p> : null}
            {success ? <p className="text-xs text-emerald-600 font-semibold">{success}</p> : null}
            <InkButton type="submit" disabled={submitting} className="px-5 py-3 rounded-xl">
              {submitting ? "Submitting..." : "Submit Feedback"}
            </InkButton>
          </form>
        </GlassCard>

        <GlassCard className="p-8 space-y-3">
          <h2 className="text-xl font-serif font-black italic">Community Feedback</h2>
          {feedback.length ? feedback.map((item) => (
            <div key={item.id} className="p-4 rounded-xl bg-[#4a5033]/[0.03] border border-[#4a5033]/10">
              <p className="font-bold text-sm">{item.reviewer_name}</p>
              <p className="text-xs opacity-50 mb-2">{new Date(item.created_at).toLocaleDateString()}</p>
              <p className="text-xs mb-2">Plot {item.scores?.plot} • Pacing {item.scores?.pacing} • Character {item.scores?.character}</p>
              <p className="text-sm opacity-80">{item.written_feedback || "No written feedback."}</p>
            </div>
          )) : <p className="text-sm opacity-50">No feedback yet.</p>}
        </GlassCard>
      </div>
    </MainLayout>
  );
}
