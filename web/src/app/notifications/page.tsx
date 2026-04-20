"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { InkButton } from "@/components/ui/InkButton";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get<NotificationItem[]>("/notifications")
      .then((res) => {
        if (active && res.data) setItems(res.data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      });
    return () => {
      active = false;
    };
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`, {});
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all", {});
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <MainLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-serif font-black italic">Notifications</h1>
          <InkButton variant="outline" className="px-4 py-2 rounded-xl text-xs" onClick={markAllRead}>
            Mark all read
          </InkButton>
        </div>
        {error ? <GlassCard className="p-4 text-rose-600 text-sm">{error}</GlassCard> : null}
        {items.length ? items.map((item) => (
          <GlassCard key={item.id} className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{item.title}</h2>
              {!item.is_read ? (
                <button className="text-xs underline opacity-60 hover:opacity-100" onClick={() => markRead(item.id)}>
                  Mark read
                </button>
              ) : <span className="text-xs opacity-40">Read</span>}
            </div>
            <p className="text-sm opacity-70">{item.message}</p>
            <p className="text-[10px] opacity-40">{new Date(item.created_at).toLocaleString()}</p>
          </GlassCard>
        )) : <GlassCard className="p-6 text-sm opacity-50">No notifications yet.</GlassCard>}
      </div>
    </MainLayout>
  );
}
