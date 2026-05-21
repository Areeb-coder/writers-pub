"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Search, Briefcase, Bell, User, Trophy, Menu, X, } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { clearSession, useIsAuthenticated, useUserRole } from "@/lib/auth";

const navItems = [
  { icon: PenTool, label: "Studio", href: "/studio" },
  { icon: Search, label: "The Agora", href: "/agora" },
  { icon: Trophy, label: "Leaderboard", href: "/agora/leaderboard" },
  { icon: Briefcase, label: "Marketplace", href: "/marketplace" },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authenticated = useIsAuthenticated();
  const role = useUserRole();
  const isEditor = role === "editor" || role === "admin";
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (isMounted && !authenticated) router.replace("/login");
  }, [authenticated, router, isMounted]);

  if (!isMounted || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center opacity-40 font-serif italic text-sm">
        Preparing workspace...
      </div>
    );
  }

  const items = isEditor
    ? [...navItems, { icon: User, label: "Editor", href: "/editor" }]
    : navItems;

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col relative text-[#4a5033]">
      {/* Floating Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 inset-x-0 z-50 p-6 flex justify-center"
      >
        <div className="glass-card w-full max-w-5xl px-4 sm:px-8 py-3 rounded-2xl flex items-center justify-between pointer-events-auto border-[#4a5033]/10 shadow-2xl shadow-[#4a5033]/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 ink-bg rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <PenTool size={16} className="text-[#daddc6]" />
            </div>
            <span className="font-serif font-black italic tracking-tighter text-lg">Pub</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all",
                  pathname === item.href ? "opacity-100 scale-105" : "opacity-40 hover:opacity-100"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-11 h-11 rounded-2xl glass-card flex items-center justify-center border border-[#4a5033]/10 text-[#4a5033] transition-all duration-300"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* User Section */}
          <div className="hidden md:flex items-center gap-4 pl-8 border-l border-[#4a5033]/10">
            <Link href="/notifications" className="opacity-40 hover:opacity-100 transition-opacity">
              <Bell size={18} />
            </Link>
            <Link href="/profile" className="w-8 h-8 rounded-full bg-[#4a5033]/10 flex items-center justify-center hover:bg-[#4a5033]/20 transition-colors">
              <User size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
              id="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.25 }}
                className="fixed top-24 left-6 right-6 md:hidden rounded-3xl p-6 border border-[#4a5033]/15 shadow-2xl shadow-[#4a5033]/10 z-[9999] bg-[#e8e7d8]/95 backdrop-blur-2xl max-h-[calc(100vh-120px)] overflow-y-auto"
              >
                <div className="flex flex-col gap-5 text-sm font-medium uppercase tracking-widest">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 border-b border-[#4a5033]/10 pb-3"
                    >
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  ))}

                  <Link
                    href="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 border-b border-[#4a5033]/10 pb-3"
                  >
                    <Bell size={16} />
                    Notifications
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 border-b border-[#4a5033]/10 pb-3"
                  >
                    <User size={16} />
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-left flex items-center gap-3 pt-2 text-red-600"
                  >
                    <X size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 pt-32 pb-24 px-6 lg:px-24 max-w-7xl mx-auto w-full z-10"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <footer className="py-12 border-t border-[#4a5033]/5 text-center text-[10px] font-bold uppercase tracking-widest opacity-30 mt-auto">
        &copy; 2026 Writers&apos; Pub &bull; The Digital Atelier &bull; Premium Creative Ecosystem
      </footer>
    </div>
  );
}
