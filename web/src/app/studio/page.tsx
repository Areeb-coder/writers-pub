"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import {
  PenTool,
  BookOpen,
  Clock,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  Share2,
  MoreHorizontal,
  FileText,
  TrendingUp,
  Timer,
  Search,
} from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";
import { useEffect } from "react";

type DraftStatus = "draft" | "shared" | "under_review" | "published";

interface Draft {
  id: string;
  title: string;
  genre: string;
  status: DraftStatus;
  updated_at: string;
  word_count: number;
  progress: number;
}

interface Stats {
  total_drafts: number;
  total_words: number;
  avg_session_minutes: number;
  weekly_growth_pct: number;
}

const statusConfig: Record<DraftStatus, { label: string; variant: "default" | "info" | "warning" | "success" }> = {
  draft: { label: "Draft", variant: "default" },
  shared: { label: "Shared", variant: "info" },
  under_review: { label: "Under Review", variant: "warning" },
  published: { label: "Published", variant: "success" },
};

export default function StudioPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [draftsRes, statsRes] = await Promise.all([
          api.get<Draft[]>(`/drafts?search=${searchQuery}`),
          api.get<Stats>("/drafts/stats")
        ]);
        if (draftsRes.data) setDrafts(draftsRes.data);
        if (statsRes.data) setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch studio data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchQuery]);

  const filteredDrafts = drafts; // Search is now handled server-side

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div variants={item} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-black italic tracking-tight text-[#4a5033]">
              The Studio
            </h1>
            <p className="opacity-50 text-sm font-medium uppercase tracking-widest">
              Your private atelier. Every masterpiece begins here.
            </p>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/studio/new">
              <InkButton className="px-6 py-4 rounded-xl flex items-center gap-2 shadow-none" id="new-draft-btn">
                <Plus size={18} /> New Draft
              </InkButton>
            </Link>
          </motion.div>
        </section>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Drafts", value: stats?.total_drafts || 0, icon: FileText },
            { label: "Words Written", value: (stats?.total_words || 0).toLocaleString(), icon: BookOpen },
            { label: "Avg. Session", value: `${stats?.avg_session_minutes || 0} min`, icon: Timer },
            { label: "Weekly Growth", value: `${stats?.weekly_growth_pct || 0}%`, icon: TrendingUp },
          ].map((stat) => (
            <GlassCard
              key={stat.label}
              className="p-4 border-none shadow-none bg-[#4a5033]/[0.03] flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#4a5033]/5 flex items-center justify-center">
                <stat.icon size={16} />
              </div>
              <div>
                <p className="text-lg font-serif font-black">{stat.value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                  {stat.label}
                </p>
              </div>
            </GlassCard>
          ))}
        </motion.div>

        {/* Toolbar */}
        <motion.div variants={item} className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              id="studio-search"
              type="text"
              placeholder="Search drafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10 text-sm placeholder:opacity-30 focus:outline-none focus:border-[#4a5033]/30 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#4a5033]/5 rounded-xl p-1">
            <button
              id="view-grid"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "ink-bg" : "opacity-40 hover:opacity-100"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              id="view-list"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "ink-bg" : "opacity-40 hover:opacity-100"}`}
            >
              <List size={16} />
            </button>
          </div>
        </motion.div>

        {/* Drafts Grid */}
        {loading ? (
             <div className="flex justify-center py-24 opacity-20">Loading your atelier...</div>
        ) : filteredDrafts.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                : "space-y-3"
            }
          >
            {filteredDrafts.map((draft) => {
              const status = statusConfig[draft.status];

              return viewMode === "grid" ? (
                <motion.div key={draft.id} variants={item}>
                  <Link href={`/studio/${draft.id}`}>
                    <GlassCard
                      className="p-6 border-[#4a5033]/10 hover:border-[#4a5033]/25 group cursor-pointer h-full flex flex-col"
                      id={`draft-${draft.id}`}
                    >
                      <div className="flex-1 space-y-4">
                        {/* Status + Genre */}
                        <div className="flex items-center justify-between">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <Badge variant="outline">{draft.genre}</Badge>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-serif font-black italic leading-snug group-hover:underline decoration-2 underline-offset-4">
                          {draft.title}
                        </h3>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {new Date(draft.updated_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen size={10} /> {draft.word_count.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mt-5 pt-4 border-t border-[#4a5033]/5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                          <span>Progress</span>
                          <span>{draft.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#4a5033]/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${draft.progress}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="h-full ink-bg rounded-full"
                          />
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 flex items-center gap-2">
                        <InkButton
                          variant="ghost"
                          className="p-2 rounded-lg text-[10px]"
                          onClick={(e) => e.preventDefault()}
                        >
                          <PenTool size={14} />
                        </InkButton>
                        <InkButton
                          variant="ghost"
                          className="p-2 rounded-lg text-[10px]"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Share2 size={14} />
                        </InkButton>
                        <InkButton
                          variant="ghost"
                          className="p-2 rounded-lg text-[10px]"
                          onClick={(e) => e.preventDefault()}
                        >
                          <Sparkles size={14} />
                        </InkButton>
                        <div className="flex-1" />
                        <InkButton
                          variant="ghost"
                          className="p-2 rounded-lg text-[10px]"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal size={14} />
                        </InkButton>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ) : (
                <motion.div key={draft.id} variants={item}>
                  <Link href={`/studio/${draft.id}`}>
                    <GlassCard
                      className="p-5 border-[#4a5033]/10 hover:border-[#4a5033]/25 group cursor-pointer flex items-center gap-6"
                      id={`draft-list-${draft.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-serif font-black italic truncate group-hover:underline decoration-1 underline-offset-4">
                            {draft.title}
                          </h3>
                          <Badge variant={status.variant} className="shrink-0">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[10px] font-bold uppercase tracking-widest opacity-40">
                          <span>{draft.genre}</span>
                          <span>{draft.word_count.toLocaleString()} words</span>
                          <span>{new Date(draft.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="w-full h-1.5 bg-[#4a5033]/5 rounded-full overflow-hidden">
                          <div
                            className="h-full ink-bg rounded-full"
                            style={{ width: `${draft.progress}%` }}
                          />
                        </div>
                        <p className="text-[9px] font-bold text-right mt-1 opacity-40">
                          {draft.progress}%
                        </p>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div variants={item}>
            <GlassCard
              variant="muted"
              className="border-dashed border-2 flex flex-col items-center justify-center p-16 text-center space-y-5"
            >
              <PenTool size={40} className="opacity-15" />
              <div className="space-y-2">
                <p className="font-serif font-black italic text-2xl opacity-80">
                  The Page Awaits
                </p>
                <p className="text-sm opacity-50 italic max-w-sm mx-auto text-balance">
                  Your studio is empty. Every great opus begins with a single word. Take the first
                  step and let the ink flow.
                </p>
              </div>
              <Link href="/studio/new">
                <InkButton className="px-8 py-4 rounded-xl flex items-center gap-2">
                  <Plus size={18} /> Create First Draft
                </InkButton>
              </Link>
            </GlassCard>
          </motion.div>
        )}
      </motion.div>
    </MainLayout>
  );
}
