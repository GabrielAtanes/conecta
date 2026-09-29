import { getSessionUserId } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

type ChallengePayload = {
  title?: unknown;
  groups?: unknown;
};

const colors = ["blue", "green", "orange", "purple"] as const;

function invalid(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as ChallengePayload | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const groups = Array.isArray(body?.groups) ? body.groups : [];

  if (title.length < 3 || title.length > 80) {
    return invalid("O título precisa ter entre 3 e 80 caracteres.");
  }
  if (groups.length !== 4) {
    return invalid("O desafio precisa ter exatamente 4 grupos.");
  }

  const normalizedGroups = groups.map((group) => {
    const value = group as { title?: unknown; connection?: unknown; words?: unknown };
    const groupTitle = typeof value.title === "string" ? value.title.trim() : "";
    const connection = typeof value.connection === "string" ? value.connection.trim() : "";
    const words = Array.isArray(value.words)
      ? value.words.map((word) => typeof word === "string" ? word.trim() : "")
      : [];
    return { title: groupTitle, connection, words };
  });

  if (normalizedGroups.some((group) => group.title.length < 2 || group.title.length > 40)) {
    return invalid("Cada grupo precisa ter um nome entre 2 e 40 caracteres.");
  }
  if (normalizedGroups.some((group) => group.connection.length < 2 || group.connection.length > 80)) {
    return invalid("Cada grupo precisa ter uma conexão entre 2 e 80 caracteres.");
  }
  if (normalizedGroups.some((group) => group.words.length !== 4 || group.words.some((word) => word.length < 1 || word.length > 30))) {
    return invalid("Cada grupo precisa ter exatamente 4 palavras de até 30 caracteres.");
  }

  const allWords = normalizedGroups.flatMap((group) => group.words.map((word) => word.toLocaleLowerCase("pt-BR")));
  if (new Set(allWords).size !== 16) {
    return invalid("As 16 palavras precisam ser únicas.");
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const challengeResult = await client.query<{ id: string }>(
      "INSERT INTO challenges (author_id, title, status, published_at) VALUES ($1, $2, 'published', now()) RETURNING id",
      [userId, title],
    );
    const challengeId = challengeResult.rows[0].id;

    for (const [groupIndex, group] of normalizedGroups.entries()) {
      const groupResult = await client.query<{ id: string }>(
        "INSERT INTO challenge_groups (challenge_id, position, title, connection, color) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [challengeId, groupIndex, group.title, group.connection, colors[groupIndex]],
      );
      const groupId = groupResult.rows[0].id;

      for (const [wordIndex, word] of group.words.entries()) {
        await client.query(
          "INSERT INTO challenge_words (group_id, position, label) VALUES ($1, $2, $3)",
          [groupId, wordIndex, word],
        );
      }
    }

    await client.query("COMMIT");
    return Response.json({ id: challengeId }, { status: 201 });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Falha ao publicar desafio:", error);
    return Response.json({ error: "Não foi possível publicar o desafio." }, { status: 500 });
  } finally {
    client.release();
  }
}