"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import {
  CheckCircle,
  Clock,
  XCircle,
  Star,
  ChevronRight,
  Briefcase,
  Calendar,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { api } from "@/lib/api";
import { useEffect, useState } from "react";

type SubmissionStatus = "submitted" | "shortlisted" | "accepted" | "rejected";

interface Submission {
  id: string;
  draft_title: string;
  opportunity_title: string;
  publisher_name: string;
  publisher_avatar: string;
  status: SubmissionStatus;
  created_at: string;
  editor_feedback?: string;
}

interface SubmissionCounts {
  submitted: number;
  shortlisted: number;
  accepted: number;
  rejected: number;
}

const statusConfig: Record<
  SubmissionStatus,
  { label: string; variant: "warning" | "info" | "success" | "danger"; icon: typeof Clock }
> = {
  submitted: { label: "Submitted", variant: "warning", icon: Clock },
  shortlisted: { label: "Shortlisted", variant: "info", icon: Star },
  accepted: { label: "Accepted", variant: "success", icon: CheckCircle },
  rejected: { label: "Rejected", variant: "danger", icon: XCircle },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [counts, setCounts] = useState<SubmissionCounts>({
    submitted: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [subsRes, countsRes] = await Promise.all([
          api.get<Submission[]>("/submissions/me"),
          api.get<SubmissionCounts>("/submissions/counts")
        ]);

        if (subsRes.data) setSubmissions(subsRes.data);
        if (countsRes.data) setCounts(countsRes.data);
      } catch (err) {
        console.error("Failed to fetch submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              Submissions
            </h1>
            <p className="opacity-50 text-sm font-medium uppercase tracking-widest">
              Track every manuscript you&apos;ve sent into the world.
            </p>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/marketplace">
              <InkButton
                className="px-6 py-4 rounded-xl flex items-center gap-2 shadow-none"
                id="browse-opportunities"
              >
                <Briefcase size={18} /> Browse Opportunities
              </InkButton>
            </Link>
          </motion.div>
        </section>

        {/* Overview Cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(
            [
              { status: "submitted" as SubmissionStatus, icon: Clock, accent: "text-amber-600 bg-amber-500/10" },
              { status: "shortlisted" as SubmissionStatus, icon: Star, accent: "text-sky-600 bg-sky-500/10" },
              { status: "accepted" as SubmissionStatus, icon: CheckCircle, accent: "text-emerald-600 bg-emerald-500/10" },
              { status: "rejected" as SubmissionStatus, icon: XCircle, accent: "text-rose-500 bg-rose-500/10" },
            ] as const
          ).map(({ status, icon: Icon, accent }) => (
            <GlassCard
              key={status}
              className="p-5 border-none shadow-none bg-[#4a5033]/[0.03] text-center space-y-2"
            >
              <div
                className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center ${accent}`}
              >
                <Icon size={20} />
              </div>
              <p className="text-2xl font-serif font-black">{counts[status]}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                {statusConfig[status].label}
              </p>
            </GlassCard>
          ))}
        </motion.div>

        {/* Pipeline */}
        <motion.div variants={item} className="flex items-center justify-center gap-2 py-2">
          {["Submitted", "Shortlisted", "Accepted"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#4a5033]/5 px-3 py-1.5 rounded-full">
                <span className="w-4 h-4 rounded-full ink-bg flex items-center justify-center text-[8px] text-[#daddc6] font-black">
                  {i + 1}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest">{step}</span>
              </div>
              {i < 2 && <ArrowRight size={12} className="opacity-20" />}
            </div>
          ))}
        </motion.div>

        {/* Submissions List */}
        {loading ? (
          <div className="py-16 text-center opacity-30">Loading submissions...</div>
        ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const config = statusConfig[sub.status];
            const StatusIcon = config.icon;

            return (
              <motion.div key={sub.id} variants={item}>
                <GlassCard
                  className="p-6 border-[#4a5033]/10 hover:border-[#4a5033]/25 space-y-4"
                  id={`submission-${sub.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Draft → Opportunity */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-serif font-black italic">
                          {sub.draft_title}
                        </h3>
                        <ChevronRight size={14} className="opacity-20 shrink-0" />
                        <span className="text-sm text-[#4a5033]/60 italic truncate">
                          {sub.opportunity_title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        <span className="flex items-center gap-1">
                          <Avatar name={sub.publisher_name} src={sub.publisher_avatar} size="sm" className="w-4 h-4 text-[6px]" />
                          {sub.publisher_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(sub.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge variant={config.variant} className="shrink-0 flex items-center gap-1">
                      <StatusIcon size={10} />
                      {config.label}
                    </Badge>
                  </div>

                  {/* Feedback */}
                  {sub.editor_feedback && (
                    <div className="bg-[#4a5033]/[0.03] rounded-2xl p-4 border border-[#4a5033]/5">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={12} className="opacity-40" />
                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                          Editor Feedback
                        </span>
                      </div>
                      <p className="text-sm text-[#4a5033]/70 italic leading-relaxed">
                        &ldquo;{sub.editor_feedback}&rdquo;
                      </p>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
        )}
      </motion.div>
    </MainLayout>
  );
}
