"use client";

import { motion } from "framer-motion";
import { PenTool, MessageSquare, ChevronRight, Sparkles, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl w-full z-10 space-y-12"
      >
        {/* Navigation / Logo Header */}
        <motion.nav variants={item} className="flex justify-between items-center glass-card px-8 py-4 rounded-3xl mb-12">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 ink-bg rounded-xl flex items-center justify-center">
                <PenTool size={20} className="text-[#daddc6]" />
             </div>
             <span className="text-xl font-bold font-serif tracking-tight ink-text italic">
                Writers&apos; Pub
             </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium ink-text/70 uppercase tracking-widest">
             <Link href="/studio" className="hover:text-[#4a5033] transition-colors">Studio</Link>
             <Link href="/agora" className="hover:text-[#4a5033] transition-colors">The Agora</Link>
             <Link href="/marketplace" className="hover:text-[#4a5033] transition-colors">Marketplace</Link>
          </div>
          <Link href="/login">
            <InkButton className="px-6 py-2.5 shadow-none rounded-full">
               Sign In
            </InkButton>
          </Link>
        </motion.nav>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
             <motion.div variants={item} className="inline-flex items-center gap-2 glass-border px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest ink-text/60 bg-[#4a5033]/5">
                <Sparkles size={12} className="text-[#4a5033]" />
                The First Complete Writing Ecosystem
             </motion.div>
             
             <motion.h1 variants={item} className="text-5xl md:text-7xl font-serif text-[#4a5033] leading-[1.1] tracking-tight font-black italic">
                Craft Your Masterpiece. <br />
                <span className="opacity-60 italic font-medium">Earn Your Ink.</span>
             </motion.h1>
             
             <motion.p variants={item} className="text-lg md:text-xl text-[#4a5033]/70 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                A premium space where writers write, readers critique, and editors select the future of publishing. 
                Experience distraction-free writing empowered by AI and human connection.
             </motion.p>
             
             <motion.div variants={item} className="flex flex-wrap gap-4 pt-4 justify-center lg:justify-start">
                <Link href="/studio/new">
                  <InkButton className="px-8 py-5 rounded-2xl flex items-center gap-3 text-lg hover:gap-5">
                     Start Writing <ChevronRight size={20} />
                  </InkButton>
                </Link>
                <Link href="/agora">
                   <button className="glass-card px-8 py-5 rounded-2xl text-lg font-bold ink-text border-[#4a5033]/10 hover:bg-[#4a5033]/5 transition-all">
                      Explore The Agora
                   </button>
                </Link>
             </motion.div>
          </div>

          <motion.div variants={item} className="lg:col-span-5 relative">
             <GlassCard className="aspect-[4/5] flex flex-col relative overflow-hidden p-8 border-[#4a5033]/20 shadow-2xl shadow-[#4a5033]/5">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#4a5033]/20" />
                      <div className="w-3 h-3 rounded-full bg-[#4a5033]/20" />
                      <div className="w-3 h-3 rounded-full bg-[#4a5033]/20" />
                   </div>
                   <div className="text-[10px] uppercase font-bold tracking-widest opacity-40">Chapter 1 — Draft</div>
                </div>
                
                <div className="font-serif text-[#4a5033] space-y-6 leading-relaxed flex-1 italic">
                   <p className="text-2xl font-black opacity-80 mb-8">The Obsidian Inkwell</p>
                   <p className="opacity-70">The parchment felt warm beneath my fingertips, a stark contrast to the cold October air that seeped through the cracks of the Writers&apos; Pub. Here, every drop of ink was a promise, and every sentence a battle won against the silence of the blank page...</p>
                </div>

                <div className="mt-auto pt-8 border-t border-[#4a5033]/10 flex justify-between items-center">
                   <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                         <div key={i} className="w-10 h-10 rounded-full border-4 border-[#daddc6] bg-[#4a5033]/10 flex items-center justify-center text-[10px] font-bold">ED</div>
                      ))}
                   </div>
                   <div className="glass-border px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#4a5033]/5">
                      3 Active Critiques
                   </div>
                </div>
             </GlassCard>
             
             {/* Abstract Floating Elements */}
             <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -top-10 -right-6 w-24 h-24 glass-card rounded-3xl flex items-center justify-center shadow-xl shadow-[#4a5033]/10 border-[#4a5033]/20"
             >
                <PenTool size={32} className="text-[#4a5033]" />
             </motion.div>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
              { icon: BookOpen, title: "The Studio", desc: "A zen, distraction-free environment for pure creative flow." },
              { icon: MessageSquare, title: "The Agora", desc: "Share drafts for high-quality, structured human feedback." },
              { icon: Layers, title: "The Exchange", desc: "A marketplace matching writers with publishers." },
            ].map((feature, idx) => (
              <GlassCard key={idx} className="group hover:scale-105 border-[#4a5033]/10 hover:border-[#4a5033]/30">
                <div className="w-12 h-12 rounded-2xl bg-[#4a5033]/5 flex items-center justify-center mb-6">
                   <feature.icon size={24} className="text-[#4a5033]" />
                </div>
                <h3 className="text-xl font-serif font-black mb-2 italic">{feature.title}</h3>
                <p className="text-sm text-[#4a5033]/60 leading-relaxed italic">{feature.desc}</p>
              </GlassCard>
            ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
