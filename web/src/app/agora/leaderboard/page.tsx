"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Trophy, TrendingUp, Medal, Award, Flame } from "lucide-react";
import { api } from "@/lib/api";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  trust_score: number;
  total_words: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get<LeaderboardUser[]>("/explore/leaderboard");
        if (res.data) setLeaders(res.data);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case 1: return "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";
      case 2: return "text-amber-700 bg-amber-700/10 border-amber-700/20";
      default: return "text-[#4a5033]/60 bg-[#4a5033]/5 border-transparent";
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy size={18} />;
      case 1: return <Medal size={18} />;
      case 2: return <Award size={18} />;
      default: return <span className="font-bold text-sm">#{index + 1}</span>;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <section className="text-center space-y-4 py-8">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-600/10 flex items-center justify-center text-amber-600">
            <Flame size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-black italic tracking-tight text-[#4a5033]">
            Global Leaderboard
          </h1>
          <p className="opacity-50 text-sm font-medium uppercase tracking-widest max-w-lg mx-auto">
            The most prolific and trusted voices in the Writers' Pub community.
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center py-20 opacity-30">Loading the greats...</div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {leaders.map((user, index) => (
              <motion.div key={user.id} variants={item}>
                <GlassCard className="p-4 flex items-center gap-6 hover:bg-[#4a5033]/5 transition-colors border-[#4a5033]/10">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border ${getRankColor(index)}`}>
                    {getRankIcon(index)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-serif font-black truncate text-[#4a5033]">
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-[10px] font-bold uppercase tracking-widest opacity-40">
                      <span className="flex items-center gap-1"><TrendingUp size={12} /> {user.total_words.toLocaleString()} words written</span>
                    </div>
                  </div>

                  {/* Trust Score */}
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#4a5033]">{user.trust_score}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Trust Score</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}

            {leaders.length === 0 && (
              <div className="text-center py-20 opacity-40 italic">
                No leaders found yet. Start writing to claim your spot!
              </div>
            )}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}
