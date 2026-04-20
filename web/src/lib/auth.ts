"use client";

import { useSyncExternalStore } from "react";

interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  user?: {
    id?: string;
    role?: string;
    display_name?: string;
  };
}

const SESSION_EVENT = "writerspub:session-change";

function emitSessionChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function setSession(session: SessionPayload) {
  localStorage.setItem("access_token", session.accessToken);
  localStorage.setItem("refresh_token", session.refreshToken);
  if (session.user?.role) localStorage.setItem("user_role", session.user.role);
  if (session.user?.id) localStorage.setItem("user_id", session.user.id);
  if (session.user?.display_name) localStorage.setItem("user_name", session.user.display_name);
  emitSessionChange();
}

export function clearSession() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_name");
  emitSessionChange();
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getUserRole() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_role");
}

export function isAuthenticated() {
  return !!getAccessToken();
}

function subscribeSession(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const listener = () => callback();
  window.addEventListener(SESSION_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(SESSION_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function useIsAuthenticated() {
  const token = useSyncExternalStore(subscribeSession, getAccessToken, () => null);
  return !!token;
}

export function useUserRole() {
  return useSyncExternalStore(subscribeSession, getUserRole, () => null);
}
