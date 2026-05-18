"use client";

import { motion } from "framer-motion";
import {
  PenTool,
  MessageSquare,
  ChevronRight,
  Sparkles,
  BookOpen,
  Layers,
} from "lucide-react";
import Link from "next/link";
import TypewriterText from "@/components/TypewriterText";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LandingPage() {
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [eyeMode, setEyeMode] = useState(false);

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
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  // ✅ Restore scroll position
  useEffect(() => {
    const saved = localStorage.getItem(
      `reading-position-${window.location.pathname}`
    );

    if (saved) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: parseInt(saved),
          behavior: "smooth",
        });
      });
    }
  }, []);

  // ✅ Scroll tracking + save progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const scrollTop = window.scrollY;

      setProgress((scrollTop / totalHeight) * 100);

      localStorage.setItem(
        `reading-position-${window.location.pathname}`,
        scrollTop.toString()
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-24 overflow-hidden"
      style={{
        backgroundColor: eyeMode ? "#f4ecd8" : undefined,
        color: eyeMode ? "#5b4636" : undefined,
      }}
    >
      {/* Progress Bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "5px",
          width: `${progress}%`,
          backgroundColor: "#2563eb",
          zIndex: 9999,
        }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-6xl w-full z-10 space-y-12"
      >
        {/* NAVBAR */}
        <motion.nav
          variants={item}
          className="flex justify-between items-center glass-card px-8 py-4 rounded-3xl mb-12"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 ink-bg rounded-xl flex items-center justify-center">
              <PenTool size={20} className="text-[#daddc6]" />
            </div>
            <span className="text-xl font-bold font-serif italic">
              Writers&apos; Pub
            </span>
          </div>

          <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest">
            <Link href="/studio">Studio</Link>
            <Link href="/agora">Agora</Link>
            <Link href="/marketplace">Marketplace</Link>
          </div>

          <Link href="/login">
            <InkButton className="px-6 py-2.5 rounded-full">
              Sign In
            </InkButton>
          </Link>
        </motion.nav>

        {/* HERO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div variants={item} className="inline-flex gap-2 text-xs">
              <Sparkles />
              Writing Ecosystem
            </motion.div>

            <motion.h1
              variants={item}
              className="text-5xl md:text-7xl font-serif italic font-black"
            >
              <TypewriterText text="Craft Your" speed={65} />
              <br />
              <TypewriterText text="Masterpiece." speed={65} delay={650} />
            </motion.h1>

            <motion.p variants={item} className="opacity-70 max-w-xl">
              A premium writing ecosystem with readers, writers, and editors.
            </motion.p>

            {/* TOOLBAR */}
            <motion.div
              variants={item}
              className="flex flex-wrap gap-3 pt-4 items-center"
            >
              {/* Top */}
              <button
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="px-4 py-2 rounded-lg border"
              >
                Top
              </button>

              {/* Eye Mode */}
              <button
  onClick={() => setEyeMode(!eyeMode)}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  {eyeMode ? <EyeOff size={18} /> : <Eye size={18} />}
</button>

              {/* Font Controls */}
              <button
                onClick={() =>
                  setFontSize((prev) => Math.max(12, prev - 2))
                }
                className="px-4 py-2 rounded-lg border"
              >
                Size-
              </button>

              <button
                onClick={() =>
                  setFontSize((prev) => Math.min(32, prev + 2))
                }
                className="px-4 py-2 rounded-lg border"
              >
                Size+
              </button>

              <Link href="/studio/new">
                <InkButton className="px-6 py-3 rounded-xl flex items-center gap-2">
                  Start Writing <ChevronRight />
                </InkButton>
              </Link>
            </motion.div>
          </div>

          {/* ARTICLE PREVIEW */}
          <motion.div variants={item} className="lg:col-span-5">
            <GlassCard className="p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">
                The Obsidian Inkwell
              </h2>

              <p
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: "1.7",
                }}
                className="opacity-80 transition-all"
              >
                The parchment felt warm beneath my fingertips, a stark contrast
                to the cold October air that seeped through the cracks of the
                Writers&apos; Pub. Every drop of ink was a promise, every
                sentence a battle won against silence...
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* FEATURES */}
        <motion.div
          variants={item}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12"
        >
          {[
            {
              icon: BookOpen,
              title: "Studio",
              desc: "Write freely",
            },
            {
              icon: MessageSquare,
              title: "Agora",
              desc: "Get feedback",
            },
            {
              icon: Layers,
              title: "Exchange",
              desc: "Publish works",
            },
          ].map((f, i) => (
            <GlassCard key={i} className="p-6">
              <f.icon />
              <h3 className="font-bold mt-2">{f.title}</h3>
              <p className="opacity-70">{f.desc}</p>
            </GlassCard>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}