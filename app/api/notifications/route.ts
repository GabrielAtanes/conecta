import { getSessionUserId } from "@/lib/auth";
import { listNotifications, markAllAsRead } from "@/lib/notifications";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  try {
    return Response.json(await listNotifications(userId));
  } catch (error) {
    console.error("Falha ao listar notificações:", error);
    return Response.json({ error: "Não foi possível carregar as notificações." }, { status: 500 });
  }
}

export async function PATCH() {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  try {
    await markAllAsRead(userId);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Falha ao marcar notificações:", error);
    return Response.json({ error: "Não foi possível atualizar as notificações." }, { status: 500 });
  }
}