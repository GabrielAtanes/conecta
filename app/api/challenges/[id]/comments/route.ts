import { getSessionUserId } from "@/lib/auth";
import { addComment, listComments } from "@/lib/comments";
import { uuidPattern } from "@/lib/reactions";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  const { id: challengeId } = await params;
  if (!uuidPattern.test(challengeId)) {
    return Response.json({ error: "Desafio inválido." }, { status: 400 });
  }

  try {
    const result = await listComments(challengeId, userId);
    if (result === "not_completed") {
      return Response.json({ error: "Complete o desafio para ver os comentários." }, { status: 403 });
    }
    return Response.json({ comments: result });
  } catch (error) {
    console.error("Falha ao listar comentários:", error);
    return Response.json({ error: "Não foi possível carregar os comentários." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  const { id: challengeId } = await params;
  if (!uuidPattern.test(challengeId)) {
    return Response.json({ error: "Desafio inválido." }, { status: 400 });
  }

  const payload = (await request.json().catch(() => null)) as { body?: unknown } | null;
  const body = typeof payload?.body === "string" ? payload.body.trim() : "";
  if (body.length < 1 || body.length > 500) {
    return Response.json({ error: "O comentário deve ter de 1 a 500 caracteres." }, { status: 400 });
  }

  try {
    const result = await addComment(challengeId, userId, body);
    if (result === "not_completed") {
      return Response.json({ error: "Complete o desafio para comentar." }, { status: 403 });
    }
    return Response.json({ comment: result }, { status: 201 });
  } catch (error) {
    console.error("Falha ao salvar comentário:", error);
    return Response.json({ error: "Não foi possível salvar o comentário." }, { status: 500 });
  }
}