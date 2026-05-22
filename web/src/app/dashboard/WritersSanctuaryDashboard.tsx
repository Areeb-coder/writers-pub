"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Feather,
  Play,
  Pause,
  Plus,
  Compass,
  Award,
  Sparkles,
  Coffee,
  RotateCcw,
  BookOpen,
  Volume2,
  CheckCircle,
  TrendingUp,
  Flame,
  Music
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  genre: string;
  words: number;
  target: number;
  updatedAt: string;
}

interface Candle {
  id: number;
  dayName: string;
  shortName: string;
  isLit: boolean;
  meltLevel: number;
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    title: "The Lost Kingdom",
    genre: "High Fantasy",
    words: 12450,
    target: 20000,
    updatedAt: "Just now",
  },
  {
    id: "2",
    title: "Echoes of Silence",
    genre: "Sci-Fi Thriller",
    words: 4200,
    target: 10000,
    updatedAt: "Yesterday",
  },
  {
    id: "3",
    title: "Stardust Cafe",
    genre: "Cozy Romance",
    words: 7800,
    target: 15000,
    updatedAt: "3 days ago",
  },
];

const INITIAL_CANDLES: Candle[] = [
  { id: 1, dayName: "Monday", shortName: "M", isLit: true, meltLevel: 1 },
  { id: 2, dayName: "Tuesday", shortName: "T", isLit: true, meltLevel: 2 },
  { id: 3, dayName: "Wednesday", shortName: "W", isLit: true, meltLevel: 1 },
  { id: 4, dayName: "Thursday", shortName: "T", isLit: true, meltLevel: 0 },
  { id: 5, dayName: "Friday", shortName: "F", isLit: true, meltLevel: 2 },
  { id: 6, dayName: "Saturday", shortName: "S", isLit: false, meltLevel: 0 },
  { id: 7, dayName: "Sunday", shortName: "S", isLit: false, meltLevel: 0 },
];

const MAGICAL_PROMPTS = [
  "Choose a quiet scent of nostalgia and begin your chapter.",
  "Under the glow of old candles, forgotten worlds return.",
  "Your words are stardust falling upon warm, empty pages.",
  "Let the crackle of your fire outpace the whisper of your doubts.",
  "A single droplet of ink can start a wildfire of imagination.",
];

export function WritersSanctuaryDashboard() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>("1");
  const [candles, setCandles] = useState<Candle[]>(INITIAL_CANDLES);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [ambientTrack, setAmbientTrack] = useState<"Forest Rain" | "Fireplace Sounds">("Forest Rain");
  const [volume, setVolume] = useState<number>(65);
  const [promptIndex, setPromptIndex] = useState<number>(0);
  const [logWordAmount, setLogWordAmount] = useState<string>("250");
  const [newProjectTitle, setNewProjectTitle] = useState<string>("");
  const [newProjectGenre, setNewProjectGenre] = useState<string>("Epic Fantasy");
  const [newProjectTarget, setNewProjectTarget] = useState<string>("15000");
  const [showAddProject, setShowAddProject] = useState<boolean>(false);
  const [inkwellNote, setInkwellNote] = useState<string>(
    "Protagonist hears an echo inside the stone pillar. Underneath, a brass dial turning..."
  );

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % MAGICAL_PROMPTS.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const totalWords = projects.reduce((acc, p) => acc + p.words, 0);
  const totalActiveProjects = projects.length;
  const streakCount = candles.filter((c) => c.isLit).length;
  const dailyAverageWords = Math.round((totalWords / 45) + (streakCount * 12));

  const toggleCandle = (id: number) => {
    setCandles((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextIsLit = !c.isLit;
          const nextMeltLevel = nextIsLit ? (c.meltLevel + 1) % 4 : c.meltLevel;
          return { ...c, isLit: nextIsLit, meltLevel: nextMeltLevel };
        }
        return c;
      })
    );
  };

  const handleAddWords = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            words: Math.min(p.words + amount, p.target * 2),
            updatedAt: "Just now",
          };
        }
        return p;
      })
    );
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const targetVal = parseInt(newProjectTarget) || 10000;
    const newProj: Project = {
      id: Date.now().toString(),
      title: newProjectTitle.trim(),
      genre: newProjectGenre,
      words: 0,
      target: targetVal,
      updatedAt: "Created just now",
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setNewProjectTitle("");
    setNewProjectGenre("Epic Fantasy");
    setNewProjectTarget("15000");
    setShowAddProject(false);
  };

  const resetWorkspace = () => {
    setProjects(INITIAL_PROJECTS);
    setActiveProjectId("1");
    setCandles(INITIAL_CANDLES.map(c => ({...c, meltLevel: Math.floor(Math.random() * 3)})));
    setIsMusicPlaying(false);
  };

  return (
    <div className="relative min-h-screen bg-[#e2e4d5] font-sans text-[#353d29] overflow-x-hidden selection:bg-[#49513e]/20 selection:text-[#2c3521]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#e2e4d5] via-[#dbdfca] to-[#ccd1bc] -z-10" />
      <div className="absolute top-[5%] left-[20%] w-[350px] h-[350px] rounded-full bg-white/40 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] rounded-full bg-[#cbd0b7]/30 blur-[120px] pointer-events-none -z-10" />

      {isMusicPlaying && (
        <div className="absolute inset-x-0 top-0 h-48 pointer-events-none overflow-hidden -z-10">
          {ambientTrack === "Forest Rain" ? (
            <div className="flex justify-around opacity-30 w-full h-full">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-[1.5px] bg-[#49513e] h-12 origin-top"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: [0, 220], opacity: [0, 0.7, 0] }}
                  transition={{
                    duration: 1.2 + Math.random() * 1.3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-around opacity-40 w-full h-full absolute bottom-0">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-600/60"
                  initial={{ y: 150, scale: 0.4, opacity: 0 }}
                  animate={{ y: [120, -10], x: [0, (Math.random() - 0.5) * 30], scale: [0.4, 1.1, 0.1], opacity: [0, 0.8, 0] }}
                  transition={{
                    duration: 2.2 + Math.random() * 1.5,
                    repeat: Infinity,
                    delay: Math.random() * 1.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* LOGO & NAVIGATION HEADER */}
        <header className="mb-10">
          <div className="glass-pane rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-[#b9bfa7]/40 mb-8">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#49513e] text-[#f4f5ec] rounded-xl">
                <Feather className="w-5 h-5" />
              </div>
              <span className="font-serif text-lg font-bold text-[#2c3521]">
                Writers&rsquo; Pub <span className="font-sans text-xs uppercase tracking-wider text-[#49513e]/70 ml-2 font-normal">Sanctuary</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs uppercase tracking-wider font-semibold text-[#49513e]/80">
              <span className="hover:text-[#2c3521] transition cursor-pointer">Studio</span>
              <span className="hover:text-[#2c3521] transition cursor-pointer">The Agora</span>
              <span className="hover:text-[#2c3521] transition cursor-pointer">Marketplace</span>
              <button 
                onClick={resetWorkspace}
                className="bg-[#49513e] hover:bg-[#3d4432] text-[#f4f5ec] px-4 py-2 rounded-xl transition duration-200 text-[11px] font-sans tracking-wide uppercase shadow-sm"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest font-mono text-[#49513e] font-bold">
                  Scribe Chamber
                </span>
                <span className="text-xs text-[#49513e]/40">•</span>
                <span className="text-xs font-serif italic text-[#49513e]/80">Active Atmosphere</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-[#2c3521] leading-tight">
                Welcome back, Dhruva <span className="animate-pulse">✨</span>
              </h2>
              <p className="text-[#4f5743] font-sans text-sm sm:text-base mt-1 font-light">
                Your sanctuary is perfectly warm. Your stories are waiting to be written.
              </p>
            </div>

            {/* Prompt Carousel / Literary Sparks */}
            <div className="md:max-w-xs xl:max-w-md w-full glass-pane p-4 rounded-2xl border-[#b9bfa7]/50 relative overflow-hidden">
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#49513e] mt-1 flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-[#49513e]/70 mb-0.5 block font-bold">Magical Outline Prompt</span>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={promptIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="text-xs text-[#2c3521] italic leading-relaxed"
                    >
                      &ldquo;{MAGICAL_PROMPTS[promptIndex]}&rdquo;
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE SECTORS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LOBBY SIDE */}
          <div className="lg:col-span-7 space-y-8">
            <section className="glass-pane rounded-3xl p-6 relative border-[#b9bfa7]/50 shadow-md">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#49513e] via-[#656d58] to-[#49513e]" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 text-[9px] uppercase font-mono font-bold tracking-wider bg-[#49513e]/10 text-[#49513e] rounded-full border border-[#49513e]/20">
                      Spotlight Manuscript
                    </span>
                    <span className="text-[11px] text-[#4f5743] font-mono flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      {activeProject.genre}
                    </span>
                  </div>
                  
                  <div className="relative group inline-block">
                    <select
                      value={activeProjectId}
                      onChange={(e) => {
                        setActiveProjectId(e.target.value);
                        setShowAddProject(false);
                      }}
                      className="text-2xl sm:text-3xl font-serif font-semibold text-[#2c3521] bg-transparent pr-8 border-none focus:outline-none focus:ring-0 cursor-pointer hover:text-[#49513e] transition-colors appearance-none"
                    >
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id} className="bg-[#e4e6d7] text-[#2c3521]">
                          {proj.title}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[#49513e]/70 pointer-events-none group-hover:text-[#2c3521] text-xs">▼</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="px-3 py-1.5 rounded-xl border border-[#b9bfa7] bg-white/40 text-[#49513e] hover:text-[#2c3521] hover:bg-[#f4f5ec] text-xs transition flex items-center gap-1.5 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>

              <AnimatePresence>
                {showAddProject && (
                  <motion.form
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onSubmit={handleCreateProject}
                    className="overflow-hidden bg-[#f4f5ec]/80 border border-[#b9bfa7]/60 rounded-2xl mb-6 p-4 space-y-4 shadow-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] text-[#4f5743] mb-1 font-bold">New Title</label>
                        <input
                          type="text"
                          required
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          className="w-full bg-[#fcfcf9] border border-[#b9bfa7] rounded-lg py-1.5 px-3 text-xs text-[#2c3521] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#4f5743] mb-1 font-bold">Genre</label>
                        <select
                          value={newProjectGenre}
                          onChange={(e) => setNewProjectGenre(e.target.value)}
                          className="w-full bg-[#fcfcf9] border border-[#b9bfa7] rounded-lg py-1.5 px-3 text-xs"
                        >
                          <option value="Epic Fantasy">Epic Fantasy</option>
                          <option value="Sci-Fi Thriller">Sci-Fi Thriller</option>
                          <option value="Cozy Romance">Cozy Romance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#4f5743] mb-1 font-bold">Goal Word Count</label>
                        <input
                          type="number"
                          value={newProjectTarget}
                          onChange={(e) => setNewProjectTarget(e.target.value)}
                          className="w-full bg-[#fcfcf9] border border-[#b9bfa7] rounded-lg py-1.5 px-3 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button type="submit" className="bg-[#49513e] text-[#f4f5ec] px-4 py-1.5 rounded-lg">Create</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* PROGRESS BAR */}
              <div className="space-y-4 mb-8 bg-[#f4f5ec]/50 p-4 rounded-2xl border border-[#b9bfa7]/30">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4f5743] font-bold">Written Progress</span>
                    <div className="text-3xl font-mono text-[#2c3521] mt-1 font-semibold">
                      {activeProject.words.toLocaleString()}{" "}
                      <span className="text-[#4f5743]/60 text-sm font-light">/ {activeProject.target.toLocaleString()} words</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#49513e] bg-[#49513e]/10 px-2 py-0.5 rounded-md font-mono">
                    {Math.round((activeProject.words / activeProject.target) * 100)}%
                  </span>
                </div>

                <div className="h-3 w-full bg-[#e2e4d5] rounded-full overflow-hidden p-[2px] border border-[#b9bfa7]/40">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#49513e] to-[#7f8872] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((activeProject.words / activeProject.target) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>

              {/* QUICK LOG ACCELERATION */}
              <div className="bg-[#f4f5ec] border border-[#b9bfa7]/50 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#49513e]/10 rounded-xl text-[#49513e]">
                      <Feather className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#2c3521]">Spilt some ink just now?</h4>
                      <p className="text-[11px] text-[#4f5743]">Log newly written words here directly.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={logWordAmount}
                      onChange={(e) => setLogWordAmount(e.target.value)}
                      className="w-20 bg-[#fbfbfa] border border-[#b9bfa7] rounded-xl py-1.5 px-2 text-xs text-center font-mono font-bold"
                    />
                    <button
                      onClick={() => handleAddWords(parseInt(logWordAmount))}
                      className="bg-[#49513e] text-[#f4f5ec] font-bold text-xs py-1.5 px-4 rounded-xl"
                    >
                      Log Words
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#b9bfa7]/30">
                  {[250, 500, 1000, 1667].map((chunk) => (
                    <button
                      key={chunk}
                      onClick={() => handleAddWords(chunk)}
                      className="px-2.5 py-1 text-[10px] font-mono text-[#49513e] hover:text-[#f4f5ec] bg-white/40 hover:bg-[#49513e] rounded-md transition duration-150 border border-[#b9bfa7]/45"
                    >
                      +{chunk}w
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* ARTIST INKWRITE NOTES */}
            <div className="glass-pane rounded-3xl p-6 border-[#b9bfa7]/50 shadow-md">
              <textarea
                value={inkwellNote}
                onChange={(e) => setInkwellNote(e.target.value)}
                placeholder="Type dynamic outlines or character fragments..."
                className="w-full h-28 bg-[#fcfcf9] text-[#2c3521] font-mono text-xs p-4 rounded-2xl border border-[#b9bfa7] focus:outline-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#4f5743] mt-2 font-mono">
                <span>{inkwellNote.length} characters</span>
                <span className="flex items-center gap-1 text-[#49513e]"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>
              </div>
            </div>
          </div>

          {/* SAGE SIDE (CANDLES & MUSIC) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* WRITING STREAK ANIMATED CANDLES */}
            <section className="glass-pane rounded-3xl p-6 border-[#b9bfa7]/50 shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#2c3521]">Sanctuary Candle Mantle</h3>
                  <p className="text-[#4f5743] text-xs">Lit candles show consecutive days. Tap customizable days.</p>
                </div>
                <div className="flex items-center gap-1.5 bg-[#49513e]/10 text-[#49513e] rounded-full px-2.5 py-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 animate-pulse" />
                  <span className="text-xs font-mono font-bold">{streakCount}d streak</span>
                </div>
              </div>

              {/* STREAK REWARD BADGES */}
              <div className="relative py-12 px-3 bg-[#fcfcf9]/80 rounded-2xl border border-[#b9bfa7]/45 my-6 shadow-inner">
                <div className="absolute bottom-10 inset-x-3 h-3 bg-gradient-to-r from-[#594d3e] to-[#594d3e] rounded-full z-10 shadow-sm" />
                
                <div className="grid grid-cols-7 gap-1.5 relative z-20">
                  {candles.map((c) => {
                    const waxHeights = ["h-16", "h-13", "h-10", "h-8"];
                    const waxHeight = waxHeights[c.meltLevel];

                    return (
                      <div key={c.id} onClick={() => toggleCandle(c.id)} className="flex flex-col items-center justify-end cursor-pointer group select-none">
                        <div className="w-8 flex flex-col justify-end items-center h-28 pb-10 transition-transform group-hover:scale-105">
                          <AnimatePresence>
                            {c.isLit && (
                              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="relative flex flex-col items-center pb-1">
                                <div className="w-2.5 h-5 rounded-full bg-gradient-to-t from-orange-600 via-amber-400 to-amber-100 animate-candle-flicker transform origin-bottom" />
                                <div className="absolute top-0.5 w-1.5 h-2.5 rounded-full bg-white opacity-80 blur-[0.5px]" />
                                <div className="absolute -top-4 w-8 h-8 bg-amber-500/10 rounded-full blur-[8px]" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className={`w-[2.5px] h-2 bg-neutral-600 ${c.isLit ? "bg-amber-400" : ""}`} />
                          <div className={`relative ${waxHeight} w-4.5 rounded-t-[3px] transition-all duration-500 shadow-sm ${
                            c.isLit ? "bg-gradient-to-b from-[#df8734] to-[#5a2e0a]" : "bg-gradient-to-b from-[#c0c2be] to-[#7f847c]"
                          }`}>
                            {c.isLit && <div className="absolute top-1 left-0.5 w-[2px] h-3 rounded-full bg-amber-300/40" />}
                            <div className="absolute bottom-0 w-full h-1 bg-black/20" />
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono mt-1 font-bold ${c.isLit ? "text-amber-700" : "text-[#4f5743]/50"}`}>{c.shortName}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#b9bfa7]/45 pt-4 text-xs">
                <span>Interactive Status:</span>
                <span className="font-semibold text-[#2c3521] uppercase font-mono tracking-wider font-bold">
                  {streakCount >= 7 ? "✨ Archon Scribe" : streakCount >= 4 ? "✒️ Novice Quill" : "⏳ Kindle-Stage"}
                </span>
              </div>
            </section>

            {/* AMBIENT AUDIO COZY */}
            <section className="glass-pane rounded-3xl p-6 border-[#b9bfa7]/50 shadow-md overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <div className="p-2 bg-[#49513e]/10 text-[#49513e] rounded-lg"><Music className="w-4 h-4" /></div>
                  <div>
                    <h3 className="font-serif text-base text-[#2c3521]">Ambient Music</h3>
                    <p className="text-[11px] text-[#4f5743]">Looped audio toggles</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#f4f5ec] border border-[#b9bfa7]/45 p-4 rounded-2xl space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#49513e] animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-[#2c3521]">{ambientTrack} Loop</h4>
                      <p className="text-[10px] text-[#4f5743]">Continuously soft loop</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#49513e] text-[#f4f5ec]"
                  >
                    {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full text-[#49513e] accent-[#49513e] h-1 bg-[#ccd0ba] rounded-lg"
                />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setAmbientTrack("Forest Rain")}
                    className={`py-2 px-3 rounded-xl border text-center ${ambientTrack === "Forest Rain" ? "bg-[#49513e] text-white" : "bg-white"}`}
                  >
                    🍃 Forest Rain
                  </button>
                  <button
                    onClick={() => setAmbientTrack("Fireplace Sounds")}
                    className={`py-2 px-3 rounded-xl border text-center ${ambientTrack === "Fireplace Sounds" ? "bg-[#49513e] text-white" : "bg-white"}`}
                  >
                    🔥 Cozy Hearths
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* BOTTOM STATS HISTORIC ARCHIVES */}
        <section className="mt-12 border-t border-[#b9bfa7]/50 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#49513e]" />
            <h3 className="font-serif text-xl font-medium text-[#2c3521]">Telemetry & Scribe Archives</h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="glass-pane rounded-2xl p-5 relative">
              <span className="text-[10px] font-mono block text-[#4f5743] uppercase font-bold mb-1">Total Words Penned</span>
              <div className="text-2xl font-mono text-[#2c3521] font-semibold">{totalWords.toLocaleString()} w</div>
            </div>
            <div className="glass-pane rounded-2xl p-5 relative">
              <span className="text-[10px] font-mono block text-[#4f5743] uppercase font-bold mb-1">Active Projects</span>
              <div className="text-2xl font-mono text-[#2c3521] font-semibold">{totalActiveProjects} items</div>
            </div>
            <div className="glass-pane rounded-2xl p-5 relative">
              <span className="text-[10px] font-mono block text-[#4f5743] uppercase font-bold mb-1">Avg Words Daily</span>
              <div className="text-2xl font-mono text-[#2c3521] font-semibold">{dailyAverageWords} w/d</div>
            </div>
            <div className="glass-pane rounded-2xl p-5 relative">
              <span className="text-[10px] font-mono block text-[#4f5743] uppercase font-bold mb-1">Weekly Streak</span>
              <div className="text-2xl font-mono text-amber-700 font-semibold">{streakCount} days</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}