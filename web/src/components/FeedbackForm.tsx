"use client";

import { FormEvent, useState } from "react";
import { InkButton } from "@/components/ui/InkButton";
import { api } from "@/lib/api";

interface FeedbackFormProps {
  draftId: string;
  onSuccess: () => void;
}

export function FeedbackForm({ draftId, onSuccess }: FeedbackFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    plot: 8,
    characters: 8,
    writing_style: 8,
    written_feedback: "",
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/feedback", {
        draft_id: draftId,
        scores: {
          plot: form.plot,
          characters: form.characters,
          writing_style: form.writing_style,
        },
        written_feedback: form.written_feedback,
      });
      setSuccess("Feedback submitted successfully!");
      onSuccess();
      setForm({ plot: 8, characters: 8, writing_style: 8, written_feedback: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Helper text */}
      <div className="px-4 py-3 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10">
        <p className="text-xs font-semibold opacity-60">Rate each aspect from 1–10</p>
      </div>

      {/* Rating inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plot Quality */}
        <div className="space-y-2">
          <label htmlFor="plot-rating" className="block text-xs font-bold uppercase tracking-widest opacity-60">
            Plot Quality
          </label>
          <div className="flex items-center gap-2">
            <input
              id="plot-rating"
              type="number"
              min={1}
              max={10}
              value={form.plot}
              onChange={(e) => setForm({ ...form, plot: Number(e.target.value) })}
              className="flex-1 px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10 text-center font-bold"
            />
            <span className="text-xs opacity-50 w-4">/10</span>
          </div>
          <p className="text-[10px] opacity-40">How compelling is the story structure?</p>
        </div>

        {/* Character Development */}
        <div className="space-y-2">
          <label htmlFor="char-rating" className="block text-xs font-bold uppercase tracking-widest opacity-60">
            Character Development
          </label>
          <div className="flex items-center gap-2">
            <input
              id="char-rating"
              type="number"
              min={1}
              max={10}
              value={form.characters}
              onChange={(e) => setForm({ ...form, characters: Number(e.target.value) })}
              className="flex-1 px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10 text-center font-bold"
            />
            <span className="text-xs opacity-50 w-4">/10</span>
          </div>
          <p className="text-[10px] opacity-40">Are characters believable and relatable?</p>
        </div>

        {/* Writing Style */}
        <div className="space-y-2">
          <label htmlFor="style-rating" className="block text-xs font-bold uppercase tracking-widest opacity-60">
            Writing Style
          </label>
          <div className="flex items-center gap-2">
            <input
              id="style-rating"
              type="number"
              min={1}
              max={10}
              value={form.writing_style}
              onChange={(e) => setForm({ ...form, writing_style: Number(e.target.value) })}
              className="flex-1 px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10 text-center font-bold"
            />
            <span className="text-xs opacity-50 w-4">/10</span>
          </div>
          <p className="text-[10px] opacity-40">Prose quality, clarity, and flow?</p>
        </div>
      </div>

      {/* Detailed feedback */}
      <div className="space-y-2">
        <label htmlFor="feedback-text" className="block text-xs font-bold uppercase tracking-widest opacity-60">
          Detailed Feedback (Optional)
        </label>
        <textarea
          id="feedback-text"
          rows={4}
          value={form.written_feedback}
          onChange={(e) => setForm({ ...form, written_feedback: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-[#4a5033]/5 border border-[#4a5033]/10 font-serif text-sm leading-relaxed focus:outline-none focus:border-[#4a5033]/30 focus:ring-1 focus:ring-[#4a5033]/10"
          placeholder="Share constructive feedback, specific strengths, or areas for improvement..."
        />
        <p className="text-[10px] opacity-40">{form.written_feedback.length}/1000</p>
      </div>

      {/* Messages */}
      {error ? <p className="text-xs text-rose-600 font-semibold">{error}</p> : null}
      {success ? <p className="text-xs text-emerald-600 font-semibold">{success}</p> : null}

      {/* Submit button */}
      <InkButton type="submit" disabled={submitting} className="w-full px-5 py-3 rounded-xl">
        {submitting ? "Submitting..." : "Submit Feedback"}
      </InkButton>
    </form>
  );
}
