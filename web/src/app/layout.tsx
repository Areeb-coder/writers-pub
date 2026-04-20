import type { Metadata } from "next";
import "./globals.css";
import { AmbientBackground } from "@/components/layout/AmbientBackground";

export const metadata: Metadata = {
  title: "Writers' Pub — A Premium Ecosystem for Creative Minds",
  description: "Connect writers, editors, and publishers in a structured ecosystem for writing, feedback, and publishing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans min-h-screen relative overflow-x-hidden selection:bg-[#4a5033]/20 selection:text-[#4a5033]">
        {/* Ambient background effect */}
        <AmbientBackground />
        
        {children}
      </body>
    </html>
  );
}
