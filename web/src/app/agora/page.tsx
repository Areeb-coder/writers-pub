"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  MessageSquare,
  BookOpen,
  Clock,
  Flame,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  Eye,
  Star,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useFormattedDate, useFormattedNumber } from "@/lib/useFormatDate";
import { DraftCard } from "@/components/DraftCard";
import { DraftCardSkeleton } from "@/components/SkeletonLoaders";

const genres = ["All", "Fiction", "Non-Fiction", "Poetry", "Sci-Fi", "Fantasy", "Memoir", "Thriller"];

const sortOptionsMap: Record<string, string> = {
  "Recent": "recent",
  "Most Discussed": "most_discussed",
  "Highest Rated": "highest_rated",
  "AI Picks": "ai_picks"
};

interface SharedDraft {
  id: string;
  title: string;
  author_name: string;
  genre: string;
  excerpt: string;
  word_count: number;
  created_at: string;
  critique_count: number;
  ai_scores: { plot: number; pacing: number; character: number } | null;
}

interface LeaderboardUser {
  id: string;
  display_name: string;
  avatar_url: string;
  trust_score: number;
  reviews_given: number;
}

export default function AgoraPage() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [activeSort, setActiveSort] = useState("Recent");
  const [drafts, setDrafts] = useState<SharedDraft[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [trending, setTrending] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sortKey = sortOptionsMap[activeSort];
        const genreParam = activeGenre !== "All" ? `&genre=${activeGenre}` : "";
        
        const [draftsRes, leadersRes, trendingRes] = await Promise.all([
          api.get<SharedDraft[]>(`/explore?sort=${sortKey}${genreParam}`),
          api.get<LeaderboardUser[]>("/users/leaderboard"),
          api.get<string[]>("/explore/trending")
        ]);

        if (draftsRes.data) setDrafts(draftsRes.data);
        if (leadersRes.data) setLeaderboard(leadersRes.data);
        if (trendingRes.data) setTrending(trendingRes.data);
      } catch (err) {
        console.error("Failed to fetch Agora data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeGenre, activeSort]);

  const filteredDrafts = drafts;

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
        {/* Page Header */}
        <section className="space-y-6">
          <motion.div variants={item} className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-serif font-black italic tracking-tight text-[#4a5033]">
              The Agora
            </h1>
            <p className="opacity-50 text-sm font-medium uppercase tracking-widest">
              Where stories find their first readers and honest ink flows freely.
            </p>
          </motion.div>

          {/* Genre Filter Pills */}
          <motion.div variants={item} className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <button
                key={genre}
                id={`genre-filter-${genre.toLowerCase()}`}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeGenre === genre
                    ? "ink-bg"
                    : "bg-[#4a5033]/5 text-[#4a5033]/60 hover:bg-[#4a5033]/10 hover:text-[#4a5033]"
                }`}
              >
                {genre}
              </button>
            ))}
          </motion.div>

          {/* Sort Bar */}
          <motion.div variants={item} className="flex items-center gap-4">
            <ArrowUpDown size={14} className="opacity-30" />
            <div className="flex gap-3">
              {Object.keys(sortOptionsMap).map((opt) => (
                <button
                  key={opt}
                  id={`sort-${opt.toLowerCase().replace(/\s/g, "-")}`}
                  onClick={() => setActiveSort(opt)}
                  className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${
                    activeSort === opt ? "opacity-100" : "opacity-30 hover:opacity-70"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Discovery Feed */}
          <div className="lg:col-span-8 space-y-5">
            {loading ? (
              <>
                <DraftCardSkeleton />
                <DraftCardSkeleton />
                <DraftCardSkeleton />
              </>
            ) : filteredDrafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} item={item} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Share CTA */}
            <motion.div variants={item}>
              <GlassCard variant="ink" className="p-8 text-center space-y-4">
                <Sparkles size={28} className="text-[#daddc6] mx-auto opacity-60" />
                <div className="space-y-2">
                  <h3 className="text-lg font-serif font-black italic text-[#daddc6]">
                    Share Your Work
                  </h3>
                  <p className="text-[11px] text-[#daddc6]/60 italic leading-relaxed">
                    Put your draft before trusted eyes and receive structured, honest feedback.
                  </p>
                </div>
                <Link href="/studio/new">
                  <InkButton
                    variant="secondary"
                    className="px-6 py-3 rounded-xl text-[10px] bg-[#daddc6] text-[#4a5033] hover:bg-[#daddc6]/90"
                    id="share-draft-cta"
                  >
                    Share a Chapter
                  </InkButton>
                </Link>
              </GlassCard>
            </motion.div>

            {/* Trending Topics */}
            <motion.section variants={item} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">
                <Flame size={12} className="inline mr-1.5" />
                Trending This Week
              </h2>
              <GlassCard className="p-5 space-y-3 border-none shadow-none bg-[#4a5033]/[0.03]">
                {trending.length > 0 ? trending.map((topic, i) => (
                    <div
                      key={topic}
                      className="flex items-center gap-3 group cursor-pointer"
                    >
                      <span className="text-[10px] font-black opacity-20 w-4">
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold group-hover:underline underline-offset-2">
                        {topic}
                      </span>
                    </div>
                )) : (
                  <div className="text-[10px] opacity-20 italic">No trending topics yet...</div>
                )}
              </GlassCard>
            </motion.section>

            {/* Top Reviewers */}
            <motion.section variants={item} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">
                <Star size={12} className="inline mr-1.5" />
                Top Reviewers
              </h2>
              <div className="space-y-2">
                {leaderboard.map((reviewer, i) => (
                  <GlassCard
                    key={reviewer.id}
                    className="p-4 flex items-center gap-3 border-none shadow-none bg-[#4a5033]/[0.03] hover:bg-[#4a5033]/[0.06]"
                  >
                    <div className="w-7 h-7 rounded-full ink-bg flex items-center justify-center text-[10px] font-black text-[#daddc6]">
                      {i + 1}
                    </div>
                    <Avatar name={reviewer.display_name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{reviewer.display_name}</p>
                      <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">
                        {reviewer.reviews_given} reviews
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp size={10} className="text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-600">
                        {Math.round(reviewer.trust_score)}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
