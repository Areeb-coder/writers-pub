"use client";

import { SessionProvider } from "next-auth/react";
import { SessionSync } from "../auth/SessionSync";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync>
        {children}
      </SessionSync>
    </SessionProvider>
  );
}
