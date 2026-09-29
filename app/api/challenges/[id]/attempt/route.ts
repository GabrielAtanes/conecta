import { getSessionUserId } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  const { id: challengeId } = await params;
  const body = (await request.json().catch(() => null)) as {
    errorCount?: unknown;
    completed?: unknown;
  } | null;
  const errorCount = typeof body?.errorCount === "number" && Number.isInteger(body.errorCount)
    ? body.errorCount
    : -1;
  const completed = body?.completed === true;

  if (errorCount < 0 || errorCount > 1000) {
    return Response.json({ error: "Quantidade de erros inválida." }, { status: 400 });
  }

  try {
    const result = await getPool().query<{ error_count: number; completed_at: string | null }>(
      `INSERT INTO challenge_attempts (user_id, challenge_id, error_count, completed_at)
       SELECT $1, id, $3, CASE WHEN $4 THEN now() ELSE NULL END
       FROM challenges
       WHERE id = $2 AND status = 'published'
       ON CONFLICT (user_id, challenge_id) DO UPDATE SET
         error_count = GREATEST(challenge_attempts.error_count, EXCLUDED.error_count),
         completed_at = CASE
           WHEN challenge_attempts.completed_at IS NOT NULL THEN challenge_attempts.completed_at
           WHEN EXCLUDED.completed_at IS NOT NULL THEN EXCLUDED.completed_at
           ELSE NULL
         END
       RETURNING error_count, completed_at`,
      [userId, challengeId, errorCount, completed],
    );

    if (!result.rows[0]) return Response.json({ error: "Desafio não encontrado." }, { status: 404 });
    return Response.json({
      errorCount: result.rows[0].error_count,
      completed: result.rows[0].completed_at !== null,
    });
  } catch (error) {
    console.error("Falha ao salvar progresso:", error);
    return Response.json({ error: "Não foi possível salvar o progresso." }, { status: 500 });
  }
}