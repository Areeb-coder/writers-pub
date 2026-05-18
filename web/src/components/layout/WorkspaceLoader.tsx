"use client";

import { motion } from "framer-motion"; // Changed from "motion/react" to "framer-motion"
import { Feather, BookOpen, PenTool } from "lucide-react";

/**
 * WorkspaceLoader Component
 * 
 * A premium loading experience for Writers Pub.
 * Features elegant serif typography, muted olive accents, 
 * and cinematic animations.
 */
export const WorkspaceLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FDFCFB] p-6 text-[#4a5033]">
      {/* Background Ambient Effect */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #4a5033 0%, transparent 70%)`,
        }}
      />

      <div className="relative w-full max-w-lg flex flex-col items-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -2, 2, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Feather size={48} className="text-[#4a5033]" strokeWidth={1.5} />
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[1px] w-12 bg-[#4a5033]/30"
            />
          </div>
        </motion.div>

        {/* Skeleton Placeholders */}
        <div className="w-full space-y-4 mb-12">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.8 }}
              className="relative overflow-hidden rounded-sm bg-[#4a5033]/5 h-4 w-full"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-[#4a5033]/10 to-transparent"
              />
              {i === 3 && <div className="w-2/3 h-full bg-transparent" />}
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-center"
        >
          <p className="font-sans text-sm tracking-[0.2em] uppercase opacity-60 mb-4 animate-pulse">
            Preparing your workspace...
          </p>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 1.2 }}
            className="px-4"
          >
            <blockquote className="font-serif italic text-xl md:text-2xl text-[#4a5033]/90 leading-relaxed font-light">
              "Every masterpiece begins with a blank page."
            </blockquote>
          </motion.div>
        </motion.div>

        {/* Ambient Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute -left-12 top-0 text-[#4a5033]/20"
        >
          <BookOpen size={24} />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
          className="absolute -right-12 bottom-0 text-[#4a5033]/20"
        >
          <PenTool size={20} />
        </motion.div>
      </div>

      {/* Footer Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 font-serif italic text-xs tracking-widest"
      >
        Writers Pub &mdash; Est. 2026
      </motion.div>
    </div>
  );
};