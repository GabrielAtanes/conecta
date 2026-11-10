"use client";

import { useCallback, useEffect, useState } from "react";
import { Notification } from "@/models/notification";

const POLL_INTERVAL_MS = 30000;

export function useNotificationsController() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Falha ao carregar");
      const data = (await response.json()) as {
        notifications: Notification[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setError("");
    } catch {
      setError("Não foi possível carregar as notificações.");
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [load]);

  async function markAllAsRead() {
    if (unreadCount === 0) return;
    try {
      const response = await fetch("/api/notifications", { method: "PATCH" });
      if (!response.ok) throw new Error("Falha ao atualizar");
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      setError("Não foi possível marcar como lidas.");
    }
  }

  return { notifications, unreadCount, error, reload: load, markAllAsRead };
}