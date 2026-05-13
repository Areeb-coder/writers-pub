"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { 
  ChevronLeft, 
  Send, 
  FileText, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  publisher_name: string;
  publisher_verified: boolean;
  word_limit_max: number;
}

interface Draft {
  id: string;
  title: string;
  word_count: number;
  genre: string;
}

export default function SubmitToOpportunity() {
  const { id } = useParams();
  const router = useRouter();
  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oppRes, draftsRes] = await Promise.all([
          api.get<Opportunity>(`/opportunities/${id}`),
          api.get<{ drafts: Draft[] }>("/drafts?limit=50")
        ]);
        
        if (oppRes.data) setOpp(oppRes.data);
        if (draftsRes.data) setDrafts(draftsRes.data.drafts);
      } catch (err) {
        console.error("Failed to load submission data:", err);
        setError("Opportunity not found or session expired.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    if (!selectedDraftId) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/submissions", {
        opportunity_id: id,
        draft_id: selectedDraftId
      });
      setSuccess(true);
      setTimeout(() => router.push("/submissions"), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId);
  const isOverWordLimit = !!(opp && selectedDraft && selectedDraft.word_count > opp.word_limit_max);

  if (loading) return <MainLayout><div className="py-24 text-center opacity-20">Preparing the printing press...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
          <ChevronLeft size={14} /> Back to Exchange
        </Link>

        <section className="space-y-4">
          <h1 className="text-4xl font-serif font-black italic tracking-tight text-[#4a5033]">
            Submit Manuscript
          </h1>
          <p className="opacity-50 text-sm font-medium uppercase tracking-widest leading-relaxed">
            Send your work to the editors. Ensure your draft meets the required word count.
          </p>
        </section>

        {opp && (
          <GlassCard className="p-8 border-[#4a5033]/20 bg-[#4a5033]/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <Avatar name={opp.publisher_name} size="sm" />
              <div>
                <p className="text-xs font-bold flex items-center gap-1">
                  {opp.publisher_name}
                  {opp.publisher_verified && <CheckCircle size={10} className="text-sky-500" />}
                </p>
                <h2 className="text-xl font-serif font-black italic">{opp.title}</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Select Draft to Submit
                </label>
                <div className="grid gap-3">
                  {drafts.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-[#4a5033]/10 rounded-2xl opacity-40">
                      No drafts found. Go to Studio to create one!
                    </div>
                  ) : (
                    drafts.map((draft) => (
                      <button
                        key={draft.id}
                        onClick={() => setSelectedDraftId(draft.id)}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                          selectedDraftId === draft.id
                            ? "border-[#4a5033] bg-[#4a5033]/5 ring-1 ring-[#4a5033]"
                            : "border-[#4a5033]/10 hover:border-[#4a5033]/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedDraftId === draft.id ? "ink-bg text-[#daddc6]" : "bg-[#4a5033]/5 opacity-40"}`}>
                            <FileText size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{draft.title}</p>
                            <p className="text-[10px] opacity-40 font-medium">{draft.word_count} words • {draft.genre}</p>
                          </div>
                        </div>
                        {draft.word_count > opp.word_limit_max && (
                          <Badge variant="danger" className="text-[8px]">Too Long</Badge>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-3">
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}

              {success && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-serif font-black italic">Submission Received</h3>
                  <p className="text-sm opacity-50">Your manuscript has been safely delivered to the editors.</p>
                </motion.div>
              )}

              {!success && (
                <InkButton
                  className="w-full py-5 rounded-2xl justify-center flex items-center gap-2 text-md"
                  disabled={!selectedDraftId || submitting || isOverWordLimit}
                  onClick={handleSubmit}
                >
                  {submitting ? "Delivering..." : "Deliver Manuscript"} <Send size={18} />
                </InkButton>
              )}
            </div>
          </GlassCard>
        )}
      </div>
    </MainLayout>
  );
}
