"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { Send, Sparkles, User, Bot, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function BrainstormingHub() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Hello! I'm your creative writing assistant. I can help you brainstorm plots, develop characters, build worlds, or overcome writer's block. What shall we create today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const userMessage = overrideInput || input.trim();
    if (!userMessage || loading) return;

    if (!overrideInput) setInput("");
    
    // Only add to messages if it's not a retry (or if we want to duplicate it, but let's assume retry uses the last message)
    if (!overrideInput) {
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    }
    
    setLoading(true);

    try {
      const res = await api.post<{ response: string }>("/ai/brainstorm", {
        prompt: userMessage,
        history: overrideInput ? messages.slice(0, -1) : messages 
      });

      const responseText = res.data?.response;
      if (responseText) {
        setMessages(prev => [...prev, { role: "model", content: responseText }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        role: "model", 
        content: err.message || "I'm sorry, I encountered an error connecting to the Muse. Please try again." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Help me develop a villain for a fantasy novel.",
    "I need a plot twist for a murder mystery.",
    "Generate 3 interesting character names.",
    "Help me build a magic system based on colors."
  ];

  return (
    <MainLayout>
      <div className="flex flex-col min-h-[calc(100vh-224px)] max-w-4xl mx-auto w-full pb-32 relative">
        <div className="mb-6 flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-black italic text-[#4a5033]">The Brainstorming Hub</h1>
            <p className="opacity-50 text-sm font-medium uppercase tracking-widest">Collaborate with the AI Muse</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Chat History */}
          <div className="flex-1 space-y-6 pb-24">
            {messages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-[#4a5033] text-[#fdfcf8]" : "bg-amber-600/10 text-amber-600"
                }`}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "user" 
                    ? "bg-[#4a5033] text-[#fdfcf8] rounded-tr-none" 
                    : "bg-[#fdfcf8]/60 backdrop-blur-sm border border-[#4a5033]/5 text-[#4a5033] rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  
                  {msg.role === "model" && index === messages.length - 1 && msg.content.includes("error") && !loading && (
                    <button 
                      onClick={() => {
                        const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
                        if (lastUserMsg) {
                          setMessages(prev => prev.slice(0, -1)); // Remove the error message
                          handleSend(lastUserMsg.content);
                        }
                      }}
                      className="mt-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      <Sparkles size={12} />
                      Try asking again
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-600/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-[#fdfcf8]/60 backdrop-blur-sm border border-[#4a5033]/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm">
                  <Loader2 size={16} className="animate-spin opacity-50" />
                  <span className="text-sm opacity-50 italic">The Muse is thinking...</span>
                </div>
              </motion.div>
            )}
            {/* Invisible div for scrolling */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>
      </div>

      {/* Input Area (Fixed) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-[#daddc6] via-[#daddc6] to-transparent opacity-95" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-24 w-full pointer-events-auto pb-8 pt-12">
          <div className="max-w-4xl mx-auto">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#4a5033]/20 text-[#4a5033]/60 hover:bg-[#4a5033]/10 hover:text-[#4a5033] bg-[#daddc6]/80 backdrop-blur-md transition-all shadow-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 glass-card p-2 rounded-2xl shadow-xl shadow-[#4a5033]/5 border-[#4a5033]/10">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the Muse for ideas..."
                className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:outline-none resize-none h-[52px] text-[#4a5033] placeholder:text-[#4a5033]/40"
                rows={1}
              />
              <InkButton onClick={handleSend} disabled={!input.trim() || loading} className="h-[52px] w-[52px] shrink-0 p-0 flex items-center justify-center rounded-xl shadow-md">
                <Send size={18} />
              </InkButton>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
