"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/lib/api";

interface ProfileData {
  id: string;
  display_name: string;
  bio: string;
  role: string;
  genres: string[];
  trust_score: number;
  streak_days: number;
  stats: {
    reviews_given: number;
    feedback_received: number;
    avg_rating: number;
    drafts_published: number;
    total_words: number;
    rank: number;
  };
}

interface DraftHistory {
  id: string;
  title: string;
  genre: string;
  status: string;
  word_count: number;
  feedback_count: number;
  updated_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<DraftHistory[]>([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  useEffect(() => {
    const load = async () => {
      const [profileRes, historyRes] = await Promise.all([
        api.get<ProfileData>("/users/me/profile"),
        api.get<DraftHistory[]>("/users/me/history"),
      ]);
      if (profileRes.data) {
        setProfile(profileRes.data);
        setBio(profileRes.data.bio || "");
      }
      if (historyRes.data) setHistory(historyRes.data);
    };
    load().catch(console.error);
  }, []);

  const saveBio = async () => {
    await api.patch("/users/me", { bio });
    setProfile((prev) => prev ? { ...prev, bio } : prev);
    setEditing(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <GlassCard className="p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-black italic">{profile?.display_name || "Profile"}</h1>
              <p className="text-xs uppercase font-bold tracking-widest opacity-40">{profile?.role || "writer"}</p>
            </div>
            <Badge variant="info">Trust {Math.round(profile?.trust_score || 0)}</Badge>
          </div>
          {editing ? (
            <div className="space-y-3">
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10"
              />
              <InkButton className="px-4 py-2 rounded-xl" onClick={saveBio}>Save</InkButton>
            </div>
          ) : (
            <p className="text-sm opacity-70">{profile?.bio || "No bio yet."}</p>
          )}
          {!editing ? (
            <InkButton variant="outline" className="px-4 py-2 rounded-xl text-xs" onClick={() => setEditing(true)}>
              Edit Profile
            </InkButton>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {(profile?.genres || []).map((g) => <Badge key={g} variant="outline">{g}</Badge>)}
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <GlassCard className="p-4"><p className="text-[9px] uppercase font-bold opacity-40">Drafts Published</p><p className="text-2xl font-serif font-black">{profile?.stats.drafts_published ?? 0}</p></GlassCard>
          <GlassCard className="p-4"><p className="text-[9px] uppercase font-bold opacity-40">Feedback Received</p><p className="text-2xl font-serif font-black">{profile?.stats.feedback_received ?? 0}</p></GlassCard>
          <GlassCard className="p-4"><p className="text-[9px] uppercase font-bold opacity-40">Average Rating</p><p className="text-2xl font-serif font-black">{profile?.stats.avg_rating ?? 0}</p></GlassCard>
          <GlassCard className="p-4"><p className="text-[9px] uppercase font-bold opacity-40">Total Words</p><p className="text-2xl font-serif font-black">{profile?.stats.total_words ?? 0}</p></GlassCard>
          <GlassCard className="p-4"><p className="text-[9px] uppercase font-bold opacity-40">Reviews Given</p><p className="text-2xl font-serif font-black">{profile?.stats.reviews_given ?? 0}</p></GlassCard>
          <GlassCard className="p-4"><p className="text-[9px] uppercase font-bold opacity-40">Rank</p><p className="text-2xl font-serif font-black">#{profile?.stats.rank ?? 0}</p></GlassCard>
        </div>

        <GlassCard className="p-6 space-y-3">
          <h2 className="text-xl font-serif font-black italic">Draft History</h2>
          {history.length ? history.map((d) => (
            <div key={d.id} className="p-4 rounded-xl bg-[#4a5033]/[0.03] flex items-center justify-between gap-3">
              <div>
                <p className="font-bold">{d.title}</p>
                <p className="text-xs opacity-50">{d.genre} • {d.word_count} words • {d.feedback_count} feedback</p>
              </div>
              <div className="text-right">
                <Badge>{d.status}</Badge>
                <p className="text-[10px] opacity-40 mt-1">{new Date(d.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          )) : <p className="text-sm opacity-50">No drafts yet.</p>}
        </GlassCard>
      </div>
    </MainLayout>
  );
}
