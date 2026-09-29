import "server-only";

import { getPool } from "@/lib/db";
import { Challenge } from "@/models/challenge";
import { WordBoard } from "@/models/word-board";

export async function getPublishedChallenges(): Promise<Challenge[]> {
  const result = await getPool().query<{
    id: string;
    title: string;
    published_at: string;
    creator_username: string;
  }>(
    `SELECT c.id, c.title, c.published_at, u.username AS creator_username
     FROM challenges c
     JOIN users u ON u.id = c.author_id
     WHERE c.status = 'published'
     ORDER BY c.published_at DESC`,
  );

  return result.rows.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    publishedAt: challenge.published_at,
    errorCount: 0,
    words: [],
    creatorUsername: challenge.creator_username,
  }));
}

export async function getChallengeBoard(challengeId: string, userId: string): Promise<WordBoard | null> {
  const result = await getPool().query<{
    title: string;
    published_at: string;
    creator_username: string;
    attempt_error_count: number | null;
    attempt_completed_at: string | null;
    group_id: string;
    group_title: string;
    connection: string;
    color: WordBoard["groups"][number]["color"];
    word_id: string;
    word_label: string;
  }>(
    `SELECT c.title, c.published_at, u.username AS creator_username,
      ca.error_count AS attempt_error_count, ca.completed_at AS attempt_completed_at,
      cg.id AS group_id, cg.title AS group_title, cg.connection, cg.color,
      cw.id AS word_id, cw.label AS word_label
    FROM challenges c
    JOIN users u ON u.id = c.author_id
    JOIN challenge_groups cg ON cg.challenge_id = c.id
    JOIN challenge_words cw ON cw.group_id = cg.id
    LEFT JOIN challenge_attempts ca ON ca.challenge_id = c.id AND ca.user_id = $2
    WHERE c.id = $1 AND c.status = 'published'
    ORDER BY cg.position, cw.position`,
    [challengeId, userId],
  );

  const first = result.rows[0];
  if (!first) return null;

  const groups = result.rows
    .filter((row, index, rows) => rows.findIndex((candidate) => candidate.group_id === row.group_id) === index)
    .map((row) => ({
      id: row.group_id,
      title: row.group_title,
      color: row.color,
      connection: row.connection,
    }));

  return {
    id: challengeId,
    title: first.title,
    publishedAt: new Date(first.published_at).toLocaleDateString("pt-BR"),
    errorCountLabel: "Quantidade de erros",
    groups,
    words: result.rows.map((row) => ({ id: row.word_id, label: row.word_label, groupId: row.group_id })),
    creatorUsername: first.creator_username,
    attempt: {
      errorCount: first.attempt_error_count ?? 0,
      completed: first.attempt_completed_at !== null,
    },
  };
}