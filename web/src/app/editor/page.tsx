"use client";

import { FormEvent, useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";
import { useUserRole } from "@/lib/auth";

type SubmissionStatus = "submitted" | "under_review" | "shortlisted" | "accepted" | "rejected";

interface EditorSubmission {
  id: string;
  status: SubmissionStatus;
  draft_title: string;
  genre: string;
  word_count: number;
  submitter_name: string;
  trust_score: number;
  editor_feedback?: string;
  created_at: string;
}

const statusVariant: Record<SubmissionStatus, "default" | "info" | "warning" | "success" | "danger"> = {
  submitted: "warning",
  under_review: "info",
  shortlisted: "info",
  accepted: "success",
  rejected: "danger",
};

export default function EditorPage() {
  const role = useUserRole();
  const [queue, setQueue] = useState<EditorSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedbackDraft, setFeedbackDraft] = useState<Record<string, string>>({});
  const [savingSubmissionId, setSavingSubmissionId] = useState<string | null>(null);

  const isEditor = role === "editor" || role === "admin";

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<EditorSubmission[]>("/submissions/editor/queue");
      if (res.data) {
        setQueue(res.data);
        const feedbackMap: Record<string, string> = {};
        for (const row of res.data) {
          feedbackMap[row.id] = row.editor_feedback || "";
        }
        setFeedbackDraft(feedbackMap);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load editor queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditor) {
      setLoading(false);
      return;
    }
    void loadQueue();
  }, [isEditor]);

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    setSavingSubmissionId(id);
    setError("");
    try {
      await api.patch(`/submissions/${id}/status`, { status });
      await loadQueue();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingSubmissionId(null);
    }
  };

  const submitFeedback = async (e: FormEvent, id: string) => {
    e.preventDefault();
    const feedback = (feedbackDraft[id] || "").trim();
    if (!feedback) return;

    setSavingSubmissionId(id);
    setError("");
    try {
      await api.patch(`/submissions/${id}/feedback`, { feedback });
      await loadQueue();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save feedback");
    } finally {
      setSavingSubmissionId(null);
    }
  };

  if (!isEditor) {
    return (
      <MainLayout>
        <GlassCard className="p-8 max-w-3xl mx-auto">
          <h1 className="text-3xl font-serif font-black italic">Editor Access Required</h1>
          <p className="mt-2 text-sm opacity-60">
            This page is reserved for editor or admin roles.
          </p>
        </GlassCard>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-4xl font-serif font-black italic">Editor Queue</h1>
          <p className="text-sm opacity-60 uppercase tracking-widest">
            Review submissions, update status, and send decision feedback.
          </p>
        </section>

        {error ? <GlassCard className="p-4 text-sm text-rose-600">{error}</GlassCard> : null}
        {loading ? <div className="py-16 text-center opacity-30">Loading queue...</div> : null}

        {!loading && queue.length === 0 ? (
          <GlassCard className="p-8 text-sm opacity-60">No submissions assigned to your opportunities yet.</GlassCard>
        ) : null}

        <div className="space-y-4">
          {queue.map((sub) => (
            <GlassCard key={sub.id} className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-serif font-black italic">{sub.draft_title}</h2>
                  <p className="text-xs opacity-50">
                    {sub.submitter_name} • {sub.genre || "Uncategorized"} • {sub.word_count.toLocaleString()} words • Trust {Math.round(sub.trust_score)}
                  </p>
                </div>
                <Badge variant={statusVariant[sub.status]}>{sub.status.replace("_", " ")}</Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                <InkButton
                  variant="outline"
                  className="px-3 py-2 rounded-xl text-xs"
                  disabled={savingSubmissionId === sub.id}
                  onClick={() => updateStatus(sub.id, "shortlisted")}
                >
                  Shortlist
                </InkButton>
                <InkButton
                  className="px-3 py-2 rounded-xl text-xs"
                  disabled={savingSubmissionId === sub.id}
                  onClick={() => updateStatus(sub.id, "accepted")}
                >
                  Accept
                </InkButton>
                <InkButton
                  variant="outline"
                  className="px-3 py-2 rounded-xl text-xs"
                  disabled={savingSubmissionId === sub.id}
                  onClick={() => updateStatus(sub.id, "rejected")}
                >
                  Reject
                </InkButton>
              </div>

              <form onSubmit={(e) => submitFeedback(e, sub.id)} className="space-y-2">
                <textarea
                  rows={3}
                  value={feedbackDraft[sub.id] || ""}
                  onChange={(e) => setFeedbackDraft((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                  placeholder="Add editor feedback for the writer..."
                  className="w-full px-3 py-2 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
                />
                <InkButton
                  type="submit"
                  variant="ghost"
                  className="px-3 py-2 rounded-xl text-xs"
                  disabled={savingSubmissionId === sub.id || !(feedbackDraft[sub.id] || "").trim()}
                >
                  Save Feedback
                </InkButton>
              </form>
            </GlassCard>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
