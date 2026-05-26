"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { setSession, isAuthenticated } from "@/lib/auth";

export function SessionSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("SessionSync hook state:", { status, hasSession: !!session });
    if (status === "authenticated" && session) {
      const anySession = session as any;
      console.log("Syncing NextAuth session to localStorage:", anySession.user);
      if (anySession.accessToken) {
        setSession({
          accessToken: anySession.accessToken,
          refreshToken: anySession.refreshToken,
          user: anySession.user,
        });
      }
    }
  }, [session, status]);

  return <>{children}</>;
}
