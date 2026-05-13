"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { InkButton } from "@/components/ui/InkButton";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  Save,
  Sparkles,
  BookOpen,
  Clock,
  AlignLeft,
  PanelRightOpen,
  PanelRightClose,
  Share2,
  RefreshCcw,
} from "lucide-react";

interface Suggestion {
  title: string;
  desc: string;
}

interface Critique {
  scores: { plot: number; pacing: number; character: number };
  suggestions: Suggestion[];
}

interface DraftDetail {
  id: string;
  title: string;
  content_text: string;
  content: unknown;
  tags?: string[];
  visibility: "private" | "editors_only" | "public";
  genre: string;
  word_count: number;
  ai_critique: Critique | null;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-50">{label}</span>
        <span className="text-xs font-black">{value?.toFixed?.(1) ?? value}</span>
      </div>
      <div className="w-full h-1.5 bg-[#4a5033]/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, (value || 0) * 10))}%` }}
          transition={{ duration: 0.8 }}
          className="h-full ink-bg rounded-full"
        />
      </div>
    </div>
  );
}

export default function StudioEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [dirty, setDirty] = useState(false);

  const fetchDraft = useCallback(async () => {
    try {
      const res = await api.get<DraftDetail>(`/drafts/${id}`);
      if (!res.data) throw new Error("Draft not found");
      setDraft(res.data);
      setTitle(res.data.title || "");
      setContent(res.data.content_text || "");
      setTags((res.data.tags || []).join(", "));
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load draft");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDraft();
  }, [fetchDraft]);

  useEffect(() => {
    if (!dirty || !draft) return;
    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await api.put<DraftDetail>(`/drafts/${id}`, {
          title,
          content,
          progress: Math.min(100, Math.max(1, Math.floor((content.length / 5000) * 100))),
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 12),
        });
        if (res.data) setDraft(res.data);
        setSavedAt(new Date());
        setDirty(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Auto-save failed");
      } finally {
        setSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [content, title, tags, dirty, id, draft]);

  const triggerAI = async () => {
    try {
      await api.post(`/drafts/${id}/critique`, {});
      setTimeout(fetchDraft, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to trigger AI critique");
    }
  };

  const toggleVisibility = async () => {
    if (!draft) return;
    const nextVisibility = draft.visibility === "public" ? "private" : "public";
    try {
      await api.post(`/drafts/${id}/share`, { visibility: nextVisibility });
      setDraft({ ...draft, visibility: nextVisibility });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  };

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);
  const charCount = content.length;
  const paragraphCount = content.split(/\n\n+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 250));

  if (loading) return <div className="min-h-screen flex items-center justify-center opacity-30">Loading editor...</div>;

  return (
    <div className="min-h-screen flex flex-col text-[#4a5033]">
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 glass-card border-b border-[#4a5033]/5 px-6 py-3 flex items-center gap-4"
      >
        <Link href="/studio" className="opacity-40 hover:opacity-100 transition-opacity" id="back-to-studio">
          <ArrowLeft size={18} />
        </Link>

        <div className="flex-1 min-w-0 space-y-1">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            className="w-full bg-transparent text-lg font-serif font-black italic truncate outline-none"
          />
          <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest opacity-40">
            <span>{draft?.genre || "Uncategorized"}</span>
            <span>{wordCount.toLocaleString()} words</span>
            <span className={`${saving ? "text-amber-600" : "text-emerald-600"} flex items-center gap-1`}>
              <Save size={9} /> {saving ? "Saving..." : savedAt ? "Saved" : "Not saved"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <InkButton variant="ghost" className="p-2 rounded-lg" id="share-btn" onClick={toggleVisibility}>
            <Share2 size={16} />
          </InkButton>
          <InkButton variant="ghost" className="p-2 rounded-lg" id="reanalyze-btn" onClick={triggerAI}>
            <RefreshCcw size={16} />
          </InkButton>
          <button
            id="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg opacity-40 hover:opacity-100 transition-opacity"
          >
            {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
        </div>
      </motion.header>

      <div className="flex-1 flex">
        <main className="flex-1 flex justify-center px-6 py-10">
          <div className="w-full max-w-[820px] space-y-3">
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
              }}
              className="w-full min-h-[70vh] bg-transparent font-serif text-lg leading-[1.9] outline-none resize-none"
              placeholder="Start writing..."
            />
            {error ? <p className="text-sm text-rose-600 font-semibold">{error}</p> : null}
          </div>
        </main>

        {sidebarOpen && (
          <aside className="w-80 lg:w-96 border-l border-[#4a5033]/5 glass-card overflow-y-auto shrink-0 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Sparkles size={12} /> AI Critique
              </p>
              <Badge variant={draft?.visibility === "public" ? "success" : "default"}>
                {draft?.visibility === "public" ? "Public" : "Private"}
              </Badge>
            </div>

            {draft?.ai_critique?.scores ? (
              <div className="space-y-3">
                <ScoreBar label="Plot" value={draft.ai_critique.scores.plot} />
                <ScoreBar label="Pacing" value={draft.ai_critique.scores.pacing} />
                <ScoreBar label="Character" value={draft.ai_critique.scores.character} />
              </div>
            ) : (
              <p className="text-xs opacity-50 italic">No AI critique yet. Click refresh to analyze.</p>
            )}

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Suggestions</p>
              {draft?.ai_critique?.suggestions?.length ? draft.ai_critique.suggestions.map((s, index) => (
                <div key={`${s.title}-${index}`} className="p-3 rounded-xl bg-[#4a5033]/[0.03]">
                  <p className="text-xs font-bold">{s.title}</p>
                  <p className="text-[11px] opacity-60">{s.desc}</p>
                </div>
              )) : <p className="text-xs opacity-50">Suggestions will appear after analysis.</p>}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Document Stats</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#4a5033]/[0.03]"><BookOpen size={12} className="mb-1 opacity-40" />{wordCount.toLocaleString()} words</div>
                <div className="p-3 rounded-xl bg-[#4a5033]/[0.03]"><AlignLeft size={12} className="mb-1 opacity-40" />{paragraphCount} paragraphs</div>
                <div className="p-3 rounded-xl bg-[#4a5033]/[0.03]"><Clock size={12} className="mb-1 opacity-40" />{readingTime} min read</div>
                <div className="p-3 rounded-xl bg-[#4a5033]/[0.03]"><Save size={12} className="mb-1 opacity-40" />{charCount.toLocaleString()} chars</div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Tags</p>
              <input
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  setDirty(true);
                }}
                placeholder="comma-separated tags"
                className="w-full px-3 py-2 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10 text-xs"
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
