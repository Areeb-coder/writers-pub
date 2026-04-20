"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { api } from "@/lib/api";

interface AnalyticsData {
  sessions: {
    total_sessions: number;
    avg_session_minutes: number;
    total_session_words: number;
  };
  weekly_words: Array<{ week: string; words: number }>;
  streak: { streak_days: number };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<AnalyticsData>("/analytics/writing");
        if (res.data) setData(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-serif font-black italic">Growth Analytics</h1>
        {error ? <GlassCard className="p-4 text-rose-600 text-sm">{error}</GlassCard> : null}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5"><p className="text-xs opacity-40 uppercase font-bold">Sessions</p><p className="text-2xl font-serif font-black">{data?.sessions.total_sessions ?? 0}</p></GlassCard>
          <GlassCard className="p-5"><p className="text-xs opacity-40 uppercase font-bold">Avg Minutes</p><p className="text-2xl font-serif font-black">{data?.sessions.avg_session_minutes ?? 0}</p></GlassCard>
          <GlassCard className="p-5"><p className="text-xs opacity-40 uppercase font-bold">Total Words</p><p className="text-2xl font-serif font-black">{data?.sessions.total_session_words ?? 0}</p></GlassCard>
        </div>
        <GlassCard className="p-6">
          <h2 className="text-xl font-serif font-black italic mb-4">Last 4 Weeks</h2>
          <div className="space-y-2">
            {data?.weekly_words?.length ? data.weekly_words.map((w) => (
              <div key={w.week} className="flex items-center justify-between text-sm">
                <span>{new Date(w.week).toLocaleDateString()}</span>
                <span className="font-bold">{w.words} words</span>
              </div>
            )) : <p className="text-sm opacity-50">No weekly data yet.</p>}
          </div>
        </GlassCard>
      </div>
    </MainLayout>
  );
}
