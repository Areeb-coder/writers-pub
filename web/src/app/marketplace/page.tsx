"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import {
  Briefcase,
  Calendar,
  DollarSign,
  BookOpen,
  Search,
  Filter,
  ChevronRight,
  Award,
  FileText,
  CheckCircle,
  Zap,
} from "lucide-react";

import { api } from "@/lib/api";
import Link from "next/link";

const genres = ["All", "Fiction", "Non-Fiction", "Poetry", "Sci-Fi", "Fantasy", "Memoir", "Thriller"];

interface Opportunity {
  id: string;
  title: string;
  description: string;
  genres: string[];
  deadline: string;
  word_limit_max: number;
  is_paid: boolean;
  payment_details: string;
  is_featured: boolean;
  publisher_name: string;
  publisher_avatar: string;
  publisher_verified: boolean;
  submission_count: number;
  matchScore?: number; // Calculated on frontend or placeholder
}

interface MarketStats {
  open_calls: number;
  total_submissions: number;
  acceptance_rate: number;
  avg_match: number;
}

function formatDeadline(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
}

export default function MarketplacePage() {
  const [activeGenre, setActiveGenre] = useState("All");
  const [paidOnly, setPaidOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [featured, setFeatured] = useState<Opportunity | null>(null);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const genreParam = activeGenre !== "All" ? `&genre=${activeGenre}` : "";
        const paidParam = paidOnly ? "&isPaid=true" : "";
        
        const [oppsRes, featuredRes, statsRes] = await Promise.all([
          api.get<{ opportunities: Opportunity[] }>(`/opportunities?search=${searchQuery}${genreParam}${paidParam}`),
          api.get<Opportunity>("/opportunities/featured"),
          api.get<MarketStats>("/opportunities/stats")
        ]);

        if (oppsRes.data) setOpportunities(oppsRes.data.opportunities);
        if (featuredRes.data) setFeatured(featuredRes.data);
        if (statsRes.data) setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch marketplace data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeGenre, paidOnly, searchQuery]);

  const filtered = opportunities.filter((o) => !o.is_featured);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <MainLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Header */}
        <section className="space-y-6">
          <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif font-black italic tracking-tight text-[#4a5033]">
                The Exchange
              </h1>
              <p className="opacity-50 text-sm font-medium uppercase tracking-widest">
                Where ink meets opportunity. Discover calls for submissions from publishers worldwide.
              </p>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Open Calls", value: stats?.open_calls || 0, icon: Briefcase },
              { label: "Total Submissions", value: (stats?.total_submissions || 0).toLocaleString(), icon: FileText },
              { label: "Acceptance Rate", value: `${stats?.acceptance_rate || 0}%`, icon: CheckCircle },
              { label: "Avg Match", value: `${stats?.avg_match || 0}%`, icon: Zap },
            ].map((stat) => (
              <GlassCard
                key={stat.label}
                className="p-4 border-none shadow-none bg-[#4a5033]/[0.03] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#4a5033]/5 flex items-center justify-center">
                  <stat.icon size={16} className="text-[#4a5033]" />
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
        </section>

        {/* Filter Bar */}
        <motion.div variants={item} className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#4a5033]/5 border border-[#4a5033]/10 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-[#4a5033]/5 px-2 py-1">
              <Filter size={12} className="opacity-40" />
              <select
                value={activeGenre}
                onChange={(e) => setActiveGenre(e.target.value)}
                className="bg-transparent text-xs font-bold uppercase tracking-widest"
              >
                {genres.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <button
              onClick={() => setPaidOnly((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${paidOnly ? "ink-bg" : "bg-[#4a5033]/5"}`}
              id="toggle-paid"
            >
              Paid Only
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        {loading ? (
             <div className="flex justify-center py-24 opacity-20">Scanning the press...</div>
        ) : (
          <>
            {/* Featured Opportunity */}
            {featured && (
              <motion.div variants={item} className="mb-8">
                <GlassCard
                  className="p-8 lg:p-10 border-[#4a5033]/20 bg-gradient-to-br from-[#4a5033]/[0.06] to-transparent relative overflow-hidden"
                  id={`opp-card-${featured.id}`}
                >
                  <div className="absolute top-4 right-4">
                    <Badge variant="warning">
                      <Award size={10} className="mr-0.5" />
                      Featured
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div className="lg:col-span-8 space-y-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={featured.publisher_name} size="md" />
                        <div>
                          <p className="text-sm font-bold flex items-center gap-1.5">
                            {featured.publisher_name}
                            {featured.publisher_verified && (
                              <CheckCircle size={12} className="text-sky-500" />
                            )}
                          </p>
                        </div>
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-serif font-black italic">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-[#4a5033]/60 leading-relaxed italic">
                        {featured.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {featured.genres.map((g) => (
                          <Badge key={g}>{g}</Badge>
                        ))}
                        {featured.is_paid && (
                          <Badge variant="success">
                            <DollarSign size={10} />
                            {featured.payment_details}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest opacity-40">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} /> {formatDeadline(featured.deadline)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={12} /> Max {(featured.word_limit_max || 0).toLocaleString()} words
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText size={12} /> {featured.submission_count} submissions
                        </span>
                      </div>
                    </div>
                    <div className="lg:col-span-4 flex flex-col items-center gap-5">
                      <ProgressRing value={85} size={100} strokeWidth={6} label="Match" />
                      <Link href={`/marketplace/submit/${featured.id}`} className="w-full">
                        <InkButton className="px-8 py-4 rounded-2xl w-full justify-center flex items-center gap-2" id={`submit-${featured.id}`}>
                          Submit Draft <ChevronRight size={16} />
                        </InkButton>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Opportunities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((opp) => {
                 const daysLeft = getDaysLeft(opp.deadline);
                 return (
                <motion.div key={opp.id} variants={item}>
                  <GlassCard
                    className="p-6 border-[#4a5033]/10 hover:border-[#4a5033]/25 h-full flex flex-col group"
                    id={`opp-card-${opp.id}`}
                  >
                    <div className="flex-1 space-y-4">
                      {/* Publisher */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar name={opp.publisher_name} size="sm" />
                          <p className="text-[11px] font-bold flex items-center gap-1">
                            {opp.publisher_name}
                            {opp.publisher_verified && <CheckCircle size={10} className="text-sky-500" />}
                          </p>
                        </div>
                        <ProgressRing value={75} size={40} strokeWidth={3} />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-serif font-black italic leading-snug group-hover:underline decoration-1 underline-offset-4">
                        {opp.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-[#4a5033]/50 leading-relaxed italic line-clamp-2">
                        {opp.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {opp.genres.map((g) => (
                          <Badge key={g} variant="outline" className="text-[8px]">
                            {g}
                          </Badge>
                        ))}
                        {opp.is_paid && (
                          <Badge variant="success" className="text-[8px]">
                            <DollarSign size={8} /> Paid
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 pt-4 border-t border-[#4a5033]/5 space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={10} />
                          {opp.word_limit_max >= 10000
                            ? `${(opp.word_limit_max / 1000).toFixed(0)}k`
                            : (opp.word_limit_max || 0).toLocaleString()}{" "}
                          words
                        </span>
                      </div>

                      {/* Deadline Progress */}
                      <div className="w-full h-1 bg-[#4a5033]/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${Math.max(5, Math.min(100, (30 - daysLeft) * 3.3))}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            daysLeft <= 7 ? "bg-amber-500" : "ink-bg"
                          }`}
                        />
                      </div>

                      <Link href={`/marketplace/submit/${opp.id}`}>
                        <InkButton
                          variant="outline"
                          className="w-full py-2.5 rounded-xl text-[10px] justify-center flex items-center gap-1.5"
                          id={`submit-${opp.id}`}
                        >
                          Submit Draft <ChevronRight size={12} />
                        </InkButton>
                      </Link>
                    </div>
                  </GlassCard>
                </motion.div>
              )})}
            </div>
          </>
        )}
      </motion.div>
    </MainLayout>
  );
}
