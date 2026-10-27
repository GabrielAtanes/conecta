import { redirect } from "next/navigation";
import AuthenticatedNavbar from "@/views/navigation/AuthenticatedNavbar";
import { getSessionUserId } from "@/lib/auth";
import { getPool } from "@/lib/db";

export default async function AuthenticatedLayout({
  children,
}: LayoutProps<"/">) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const result = await getPool().query<{ username: string; email: string; is_admin: boolean }>(
    "SELECT username, email, is_admin FROM users WHERE id = $1",
    [userId],
  );
  const user = result.rows[0];
  if (!user) redirect("/login");

  return (
    <>
      <AuthenticatedNavbar user={{ username: user.username, email: user.email, isAdmin: user.is_admin }} />
      <div className="authenticated-content">{children}</div>
    </>
  );
}