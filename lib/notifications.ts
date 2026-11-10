import "server-only";

import { getPool } from "@/lib/db";

export type NotificationItem = {
  id: string;
  type: "reaction" | "report_update";
  message: string;
  challengeId: string | null;
  read: boolean;
  createdAt: string;
};

export async function listNotifications(userId: string) {
  const result = await getPool().query<{
    id: string;
    type: "reaction" | "report_update";
    message: string;
    challenge_id: string | null;
    read_at: string | null;
    created_at: string;
  }>(
    `SELECT id, type, message, challenge_id, read_at, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 30`,
    [userId],
  );

  const notifications: NotificationItem[] = result.rows.map((row) => ({
    id: row.id,
    type: row.type,
    message: row.message,
    challengeId: row.challenge_id,
    read: row.read_at !== null,
    createdAt: row.created_at,
  }));

  const unread = await getPool().query<{ total: string }>(
    "SELECT COUNT(*) AS total FROM notifications WHERE user_id = $1 AND read_at IS NULL",
    [userId],
  );

  return { notifications, unreadCount: Number(unread.rows[0].total) };
}

export async function markAllAsRead(userId: string) {
  await getPool().query(
    "UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL",
    [userId],
  );
}