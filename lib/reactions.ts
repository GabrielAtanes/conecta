import "server-only";

import { getPool } from "@/lib/db";

export const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReactionValue = 1 | -1 | 0;

export type ReactionSummary = {
  likes: number;
  dislikes: number;
  userReaction: ReactionValue;
};

export async function getReactionSummary(
  challengeId: string,
  userId: string,
): Promise<ReactionSummary> {
  const result = await getPool().query<{
    likes: string;
    dislikes: string;
    user_reaction: number | null;
  }>(
    `SELECT COUNT(*) FILTER (WHERE value = 1) AS likes,
            COUNT(*) FILTER (WHERE value = -1) AS dislikes,
            MAX(value) FILTER (WHERE user_id = $2) AS user_reaction
     FROM challenge_reactions
     WHERE challenge_id = $1`,
    [challengeId, userId],
  );

  const row = result.rows[0];
  return {
    likes: Number(row.likes),
    dislikes: Number(row.dislikes),
    userReaction: (row.user_reaction ?? 0) as ReactionValue,
  };
}

export async function setReaction(
  challengeId: string,
  userId: string,
  value: ReactionValue,
): Promise<ReactionSummary | "not_found" | "not_completed"> {
  const pool = getPool();

  const check = await pool.query<{
    author_id: string;
    title: string;
    completed_at: string | null;
    reactor_username: string;
  }>(
    `SELECT c.author_id, c.title, ca.completed_at,
            (SELECT username FROM users WHERE id = $2) AS reactor_username
     FROM challenges c
     LEFT JOIN challenge_attempts ca
       ON ca.challenge_id = c.id AND ca.user_id = $2
     WHERE c.id = $1 AND c.status = 'published'`,
    [challengeId, userId],
  );

  const challenge = check.rows[0];
  if (!challenge) return "not_found";
  if (challenge.completed_at === null) return "not_completed";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (value === 0) {
      await client.query(
        "DELETE FROM challenge_reactions WHERE challenge_id = $1 AND user_id = $2",
        [challengeId, userId],
      );
    } else {
      const upsert = await client.query<{ inserted: boolean }>(
        `INSERT INTO challenge_reactions (challenge_id, user_id, value)
         VALUES ($1, $2, $3)
         ON CONFLICT (challenge_id, user_id) DO UPDATE SET value = EXCLUDED.value
         RETURNING (xmax = 0) AS inserted`,
        [challengeId, userId, value],
      );

      // Notifica o autor só na primeira curtida, para não gerar spam ao alternar.
      if (value === 1 && upsert.rows[0].inserted && challenge.author_id !== userId) {
        await client.query(
          `INSERT INTO notifications (user_id, type, message, challenge_id)
           VALUES ($1, 'reaction', $2, $3)`,
          [
            challenge.author_id,
            `${challenge.reactor_username} curtiu o seu desafio "${challenge.title}".`,
            challengeId,
          ],
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getReactionSummary(challengeId, userId);
}