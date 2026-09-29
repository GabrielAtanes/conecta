import { getSessionUserId } from "@/lib/auth";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const result = await getPool().query<{ id: string; email: string; username: string }>(
      "SELECT id, email, username FROM users WHERE id = $1",
      [userId],
    );
    const user = result.rows[0];
    if (!user) return Response.json({ error: "Não autenticado." }, { status: 401 });

    return Response.json({ user });
  } catch (error) {
    console.error("Falha ao consultar sessão:", error);
    return Response.json({ error: "Não foi possível consultar a sessão." }, { status: 500 });
  }
}