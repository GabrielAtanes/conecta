import { getSessionUserId } from "@/lib/auth";
import {
  getReactionSummary,
  setReaction,
  uuidPattern,
  type ReactionValue,
} from "@/lib/reactions";

export const runtime = "nodejs";

async function handle(
  value: ReactionValue | null,
  params: Promise<{ id: string }>,
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  const { id: challengeId } = await params;
  if (!uuidPattern.test(challengeId)) {
    return Response.json({ error: "Desafio inválido." }, { status: 400 });
  }
  if (value === null) {
    return Response.json({ error: "Reação inválida." }, { status: 400 });
  }

  try {
    const result = await setReaction(challengeId, userId, value);
    if (result === "not_found") {
      return Response.json({ error: "Desafio não encontrado." }, { status: 404 });
    }
    if (result === "not_completed") {
      return Response.json({ error: "Complete o desafio para avaliar." }, { status: 403 });
    }
    return Response.json(result);
  } catch (error) {
    console.error("Falha ao salvar reação:", error);
    return Response.json({ error: "Não foi possível salvar a reação." }, { status: 500 });
  }
}

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
    return Response.json(await getReactionSummary(challengeId, userId));
  } catch (error) {
    console.error("Falha ao ler reações:", error);
    return Response.json({ error: "Não foi possível carregar as reações." }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = (await request.json().catch(() => null)) as { value?: unknown } | null;
  const value = body?.value === 1 || body?.value === -1 ? body.value : null;
  return handle(value, params);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return handle(0, params);
}