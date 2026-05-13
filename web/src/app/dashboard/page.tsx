"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { PenTool, MessageSquare, TrendingUp, Sparkles, BookOpen, Clock, ChevronRight, Search, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { useUserRole } from "@/lib/auth";

const recentDrafts = [
  { id: 1, title: "The Obsidian Inkwell", lastEdited: "2 hours ago", progress: 65, words: 1240 },
  { id: 2, title: "Echoes of the Agora", lastEdited: "Yesterday", progress: 20, words: 450 },
  { id: 3, title: "Zen and the Art of Editing", lastEdited: "3 days ago", progress: 95, words: 3800 },
];

export default function Dashboard() {
  const role = useUserRole();
  const isEditor = role === "editor" || role === "admin";
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Welcome Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <motion.div variants={item} className="space-y-2">
              <h1 className="text-4xl font-serif font-black italic tracking-tight text-[#4a5033]">
                 Welcome back, Scribe.
              </h1>
              <p className="opacity-60 text-sm font-medium uppercase tracking-widest leading-relaxed">
                 The ink is fresh and the parchment awaits your command.
              </p>
           </motion.div>
           
           <motion.div variants={item} className="flex gap-4">
              <Link href="/studio/new">
                 <InkButton className="px-6 py-4 rounded-xl flex items-center gap-2 text-sm shadow-none">
                    <PenTool size={18} />
                    New Draft
                 </InkButton>
              </Link>
           </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Main Column */}
           <div className="lg:col-span-8 space-y-8">
              {/* Recent Drafts */}
              <motion.section variants={item} className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Recent Masterpieces</h2>
                    <Link href="/studio" className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1">
                       View All <ChevronRight size={12} />
                    </Link>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-4">
                    {recentDrafts.map((draft) => (
                       <GlassCard key={draft.id} className="p-6 hover:translate-x-1 border-[#4a5033]/10 hover:border-[#4a5033]/30 cursor-pointer group">
                          <div className="flex items-start justify-between">
                             <div className="space-y-2">
                                <h3 className="text-xl font-serif font-black italic group-hover:underline decoration-2 underline-offset-4">{draft.title}</h3>
                                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40">
                                   <span className="flex items-center gap-1"><Clock size={12} /> {draft.lastEdited}</span>
                                   <span className="flex items-center gap-1"><BookOpen size={12} /> {draft.words} Words</span>
                                </div>
                             </div>
                             <div className="w-12 h-12 rounded-full border-2 border-[#4a5033]/5 flex items-center justify-center text-[10px] font-black">
                                {draft.progress}%
                             </div>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="mt-6 w-full h-1 bg-[#4a5033]/5 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${draft.progress}%` }}
                               transition={{ duration: 1, delay: 0.5 }}
                               className="h-full ink-bg" 
                             />
                          </div>
                       </GlassCard>
                    ))}
                 </div>
              </motion.section>

              {/* Community Activity (The Agora) */}
              <motion.section variants={item} className="space-y-4">
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">The Agora Activity</h2>
                 <GlassCard variant="muted" className="border-dashed border-2 flex flex-col items-center justify-center p-12 text-center space-y-4">
                    <MessageSquare size={32} className="opacity-20" />
                    <div className="space-y-2">
                       <p className="font-serif font-black italic text-lg opacity-80">Silent Waters</p>
                       <p className="text-sm opacity-50 italic max-w-xs mx-auto text-balance">
                          You haven&apos;t shared anything for feedback yet. Great stories are born in the ink, but they live in the eyes of others.
                       </p>
                    </div>
                    <Link href="/studio/new">
                      <InkButton variant="outline" className="px-6 py-3 rounded-xl">
                         Share First Chapter
                      </InkButton>
                    </Link>
                 </GlassCard>
              </motion.section>
           </div>

           {/* Sidebar */}
           <div className="lg:col-span-4 space-y-8">
              {/* Profile Card / Trust Score */}
              <motion.section variants={item}>
                 <GlassCard variant="ink" className="text-center p-10 space-y-6">
                    <div className="w-20 h-20 rounded-full mx-auto bg-[#daddc6]/20 p-1">
                       <div className="w-full h-full rounded-full bg-[#daddc6] flex items-center justify-center">
                          <User size={32} className="text-[#4a5033]" />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl font-serif font-black italic text-[#daddc6]">Grand Master</h3>
                       <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-[#daddc6]">Mastery of the Inkwell</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-[#daddc6]/10 pt-6">
                       <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#daddc6]/60 mb-1">Impact</p>
                          <p className="text-xl font-serif font-black text-[#daddc6]">1.2k</p>
                       </div>
                       <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#daddc6]/60 mb-1">Rank</p>
                          <p className="text-xl font-serif font-black text-[#daddc6]">#42</p>
                       </div>
                    </div>
                 </GlassCard>
              </motion.section>

              {/* Quick Actions */}
              <motion.section variants={item} className="space-y-4">
                 <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Action Center</h2>
                 <div className="grid grid-cols-1 gap-3">
                    {[
                       { label: "The Agora Feed", icon: Search, href: "/agora" },
                       isEditor
                         ? { label: "Editor Queue", icon: Briefcase, href: "/editor" }
                         : { label: "Active Submissions", icon: Briefcase, href: "/submissions" },
                       { label: "Growth Analytics", icon: TrendingUp, href: "/analytics" },
                    ].map((action, idx) => (
                       <Link key={idx} href={action.href}>
                          <GlassCard className="p-4 flex items-center gap-4 hover:bg-[#4a5033]/5 border-none shadow-none group">
                             <div className="w-10 h-10 rounded-xl bg-[#4a5033]/5 flex items-center justify-center group-hover:scale-110 transition-all">
                                <action.icon size={18} />
                             </div>
                             <span className="text-sm font-bold uppercase tracking-widest opacity-70 group-hover:opacity-100">{action.label}</span>
                          </GlassCard>
                       </Link>
                    ))}
                 </div>
              </motion.section>

              {/* Active Streak */}
              <motion.section variants={item}>
                 <GlassCard className="bg-emerald-600/5 border-emerald-600/20 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <TrendingUp className="text-emerald-600" size={20} />
                       <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">7 Day Writing Streak</span>
                    </div>
                    <Sparkles className="text-emerald-600/40" size={16} />
                 </GlassCard>
              </motion.section>
           </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}
