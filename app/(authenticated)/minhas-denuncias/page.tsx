import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { getPool } from "@/lib/db";
import UserReportsPanel, { type UserReport } from "@/views/moderation/UserReportsPanel";

export default async function MinhasDenunciasPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const result = await getPool().query<{
    id: string;
    challenge_id: string;
    challenge_title: string;
    reason: string;
    details: string | null;
    status: string;
    admin_response: string | null;
    created_at: string;
    resolved_at: string | null;
  }>(`
    SELECT
      cr.id,
      cr.challenge_id,
      c.title AS challenge_title,
      cr.reason,
      cr.details,
      cr.status,
      cr.admin_response,
      cr.created_at,
      cr.resolved_at
    FROM challenge_reports cr
    JOIN challenges c ON c.id = cr.challenge_id
    WHERE cr.reporter_id = $1
    ORDER BY cr.created_at DESC
  `, [userId]);

  const reports: UserReport[] = result.rows.map((report) => ({
    id: report.id,
    challengeId: report.challenge_id,
    challengeTitle: report.challenge_title,
    reason: report.reason,
    details: report.details,
    status: report.status,
    adminResponse: report.admin_response,
    createdAt: report.created_at,
    resolvedAt: report.resolved_at,
  }));

  return <UserReportsPanel reports={reports} />;
}
