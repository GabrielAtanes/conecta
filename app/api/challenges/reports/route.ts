import { getPool } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  }

  const user = await getPool().query<{ is_admin: boolean }>(
    "SELECT is_admin FROM users WHERE id = $1",
    [userId],
  );

  const mineOnly = new URL(request.url).searchParams.get("mine") === "true";
  if (mineOnly) {
    const result = await getPool().query<{
      id: string;
      challenge_id: string;
      challenge_title: string;
      reason: string;
      details: string | null;
      status: string;
      admin_response: string | null;
      resolved_at: string | null;
      created_at: string;
    }>(`
      SELECT
        cr.id,
        cr.challenge_id,
        c.title AS challenge_title,
        cr.reason,
        cr.details,
        cr.status,
        cr.admin_response,
        cr.resolved_at,
        cr.created_at
      FROM challenge_reports cr
      JOIN challenges c ON c.id = cr.challenge_id
      WHERE cr.reporter_id = $1
      ORDER BY cr.created_at DESC
    `, [userId]);

    return Response.json({ reports: result.rows });
  }

  if (!user.rows[0]?.is_admin) {
    return Response.json({ error: "Acesso restrito à moderação." }, { status: 403 });
  }

  const result = await getPool().query<{
    id: string;
    challenge_id: string;
    challenge_title: string;
    reporter_username: string;
    reporter_email: string;
    reason: string;
    details: string | null;
    status: string;
    admin_response: string | null;
    resolved_at: string | null;
    created_at: string;
  }>(`
    SELECT
      cr.id,
      cr.challenge_id,
      c.title AS challenge_title,
      u.username AS reporter_username,
      u.email AS reporter_email,
      cr.reason,
      cr.details,
      cr.status,
      cr.admin_response,
      cr.resolved_at,
      cr.created_at
    FROM challenge_reports cr
    JOIN challenges c ON c.id = cr.challenge_id
    JOIN users u ON u.id = cr.reporter_id
    ORDER BY cr.created_at DESC
  `);

  return Response.json({ reports: result.rows });
}
