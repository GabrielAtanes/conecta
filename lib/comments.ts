import "server-only";

import { getPool } from "@/lib/db";

export type CommentItem = {
  id: string;
  username: string;
  body: string;
  createdAt: string;
  isMine: boolean;
};

async function hasCompleted(challengeId: string, userId: string) {
  const result = await getPool().query(
    `SELECT 1 FROM challenge_attempts ca
     JOIN challenges c ON c.id = ca.challenge_id
     WHERE ca.challenge_id = $1 AND ca.user_id = $2
       AND ca.completed_at IS NOT NULL AND c.status = 'published'`,
    [challengeId, userId],
  );
  return result.rowCount === 1;
}

export async function listComments(
  challengeId: string,
  userId: string,
): Promise<CommentItem[] | "not_completed"> {
  if (!(await hasCompleted(challengeId, userId))) return "not_completed";

  const result = await getPool().query<{
    id: string;
    username: string;
    body: string;
    created_at: string;
    user_id: string;
  }>(
    `SELECT cc.id, cc.body, cc.created_at, cc.user_id, u.username
     FROM challenge_comments cc
     JOIN users u ON u.id = cc.user_id
     WHERE cc.challenge_id = $1
     ORDER BY cc.created_at DESC
     LIMIT 100`,
    [challengeId],
  );

  return result.rows.map((row) => ({
    id: row.id,
    username: row.username,
    body: row.body,
    createdAt: row.created_at,
    isMine: row.user_id === userId,
  }));
}

export async function addComment(
  challengeId: string,
  userId: string,
  body: string,
): Promise<CommentItem | "not_completed"> {
  if (!(await hasCompleted(challengeId, userId))) return "not_completed";

  const result = await getPool().query<{ id: string; created_at: string; username: string }>(
    `WITH inserted AS (
       INSERT INTO challenge_comments (challenge_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, created_at, user_id
     )
     SELECT inserted.id, inserted.created_at, u.username
     FROM inserted JOIN users u ON u.id = inserted.user_id`,
    [challengeId, userId, body],
  );

  const row = result.rows[0];
  return { id: row.id, username: row.username, body, createdAt: row.created_at, isMine: true };
}