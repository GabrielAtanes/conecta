import { getPool } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export const runtime = "nodejs";

const allowedStatuses = new Set(["pending", "reviewed", "resolved", "rejected"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  }

  const adminCheck = await getPool().query<{ is_admin: boolean }>(
    "SELECT is_admin FROM users WHERE id = $1",
    [userId],
  );

  if (!adminCheck.rows[0]?.is_admin) {
    return Response.json({ error: "Acesso restrito à moderação." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    status?: unknown;
    adminResponse?: unknown;
  } | null;

  const status = typeof body?.status === "string" ? body.status : "pending";
  const adminResponse = typeof body?.adminResponse === "string" ? body.adminResponse.trim() : "";

  if (!allowedStatuses.has(status)) {
    return Response.json({ error: "Status inválido." }, { status: 400 });
  }

  if (adminResponse.length > 600) {
    return Response.json({ error: "A resposta da moderação deve ter até 600 caracteres." }, { status: 400 });
  }

  const { id } = await params;

  const resolvedAt = status === "resolved" || status === "rejected" ? "now()" : "NULL";

  const result = await getPool().query<{
    id: string;
    challenge_id: string;
    reporter_id: string;
    reason: string;
    details: string | null;
    status: string;
    admin_response: string | null;
    resolved_at: string | null;
    created_at: string;
  }>(`
    UPDATE challenge_reports
    SET
      status = $1,
      admin_response = $2,
      resolved_at = ${resolvedAt === "now()" ? "now()" : "NULL"}
    WHERE id = $3
    RETURNING
      id,
      challenge_id,
      reporter_id,
      reason,
      details,
      status,
      admin_response,
      resolved_at,
      created_at
  `, [status, adminResponse || null, id]);

  if (result.rowCount === 0) {
    return Response.json({ error: "Denúncia não encontrada." }, { status: 404 });
  }

  const report = result.rows[0];
  const reportAuthor = await getPool().query<{ username: string; email: string }>(
    "SELECT username, email FROM users WHERE id = $1",
    [report.reporter_id],
  );

  const challenge = await getPool().query<{ title: string }>(
    "SELECT title FROM challenges WHERE id = $1",
    [report.challenge_id],
  );

  return Response.json({
    report: {
      id: report.id,
      challengeId: report.challenge_id,
      challengeTitle: challenge.rows[0]?.title ?? "Desafio",
      reporterUsername: reportAuthor.rows[0]?.username ?? "Usuário",
      reporterEmail: reportAuthor.rows[0]?.email ?? "",
      reason: report.reason,
      details: report.details,
      status: report.status,
      adminResponse: report.admin_response,
      resolvedAt: report.resolved_at,
      createdAt: report.created_at,
    },
  });
}
