"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MessageSquare, BookOpen, Clock, Eye } from "lucide-react";
import { useFormattedDate, useFormattedNumber } from "@/lib/useFormatDate";

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

interface ScoreBarProps {
  label: string;
  value: number;
}

function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-widest opacity-40 w-16">{label}</span>
      <div className="flex-1 h-1.5 bg-[#4a5033]/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value * 10}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="h-full ink-bg rounded-full"
        />
      </div>
      <span className="text-[10px] font-black tabular-nums w-6 text-right">{value}</span>
    </div>
  );
}

export function DraftCard({ draft, item }: { draft: SharedDraft; item: any }) {
  const formattedDate = useFormattedDate(draft.created_at);
  const formattedWordCount = useFormattedNumber(draft.word_count || 0);

  return (
    <motion.div variants={item}>
      <GlassCard
        className="p-6 lg:p-8 hover:border-[#4a5033]/30 border-[#4a5033]/10 cursor-pointer group"
        id={`draft-card-${draft.id}`}
      >
        <div className="space-y-5">
          {/* Author + Genre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={draft.author_name} size="sm" />
              <div>
                <p className="text-xs font-bold">{draft.author_name}</p>
                <p className="text-[10px] opacity-40 flex items-center gap-1">
                  <Clock size={10} /> {formattedDate}
                </p>
              </div>
            </div>
            <Badge>{draft.genre}</Badge>
          </div>

          {/* Title + Excerpt */}
          <div className="space-y-3">
            <h3 className="text-xl lg:text-2xl font-serif font-black italic group-hover:underline decoration-2 underline-offset-4">
              {draft.title}
            </h3>
            <p className="text-sm font-serif italic text-[#4a5033]/60 leading-relaxed line-clamp-2">
              &ldquo;{draft.excerpt}&rdquo;
            </p>
          </div>

          {/* AI Scores */}
          {draft.ai_scores ? (
            <div className="space-y-1.5 py-3 border-t border-[#4a5033]/5">
              <ScoreBar label="Plot" value={draft.ai_scores.plot} />
              <ScoreBar label="Pacing" value={draft.ai_scores.pacing} />
              <ScoreBar label="Character" value={draft.ai_scores.character} />
            </div>
          ) : (
            <div className="py-3 border-t border-[#4a5033]/5 text-[10px] opacity-30 italic">
              AI analysis pending...
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest opacity-40">
              <span className="flex items-center gap-1">
                <BookOpen size={12} /> {formattedWordCount} words
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={12} /> {draft.critique_count} critiques
              </span>
            </div>
            <Link href={`/agora/${draft.id}`}>
              <InkButton
                variant="outline"
                className="px-5 py-2 rounded-xl text-[10px]"
                id={`critique-btn-${draft.id}`}
              >
                <Eye size={12} className="mr-1.5" />
                Read & Critique
              </InkButton>
            </Link>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
