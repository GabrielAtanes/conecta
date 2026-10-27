import { redirect } from "next/navigation";
import { getPool } from "@/lib/db";
import { getSessionUserId } from "@/lib/auth";
import ReportsAdminPanel, { type ModerationReport } from "@/views/moderation/ReportsAdminPanel";

export default async function DenunciasPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const userRecord = await getPool().query<{ is_admin: boolean }>(
    "SELECT is_admin FROM users WHERE id = $1",
    [userId],
  );

  if (!userRecord.rows[0]?.is_admin) redirect("/minhas-denuncias");

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

  const reports: ModerationReport[] = result.rows.map((report) => ({
    id: report.id,
    challengeId: report.challenge_id,
    challengeTitle: report.challenge_title,
    reporterUsername: report.reporter_username,
    reporterEmail: report.reporter_email,
    reason: report.reason,
    details: report.details,
    status: report.status,
    adminResponse: report.admin_response,
    resolvedAt: report.resolved_at,
    createdAt: report.created_at,
  }));

  return <ReportsAdminPanel reports={reports} />;
}