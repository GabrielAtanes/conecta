import { getSessionUserId } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const allowedReasons = new Set([
  "palavras_ofensivas",
  "preconceituoso",
  "spam_propaganda",
  "conteudo_improprio",
  "outro",
]);

function invalid(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Você precisa estar autenticado para denunciar." }, { status: 401 });

  const { id: challengeId } = await params;
  const body = (await request.json().catch(() => null)) as {
    reason?: unknown;
    details?: unknown;
  } | null;

  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const details = typeof body?.details === "string" ? body.details.trim() : "";

  if (!allowedReasons.has(reason)) {
    return invalid("Motivo da denúncia inválido.");
  }

  if (details.length > 300) {
    return invalid("A descrição da denúncia deve ter até 300 caracteres.");
  }

  const pool = getPool();

  try {
    const challengeExists = await pool.query<{ id: string }>(
      "SELECT id FROM challenges WHERE id = $1 AND status = 'published'",
      [challengeId],
    );

    if (challengeExists.rowCount === 0) {
      return Response.json({ error: "Desafio não encontrado." }, { status: 404 });
    }

    await pool.query(
      `INSERT INTO challenge_reports (challenge_id, reporter_id, reason, details, status, admin_response, resolved_at)
       VALUES ($1, $2, $3, $4, 'pending', NULL, NULL)
       ON CONFLICT (challenge_id, reporter_id, reason) DO UPDATE SET
         details = EXCLUDED.details,
         status = 'pending',
         admin_response = NULL,
         resolved_at = NULL,
         created_at = now()`,
      [challengeId, userId, reason, details || null],
    );

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha ao registrar denúncia:", error);
    return Response.json({ error: "Não foi possível enviar a denúncia." }, { status: 500 });
  }
}
