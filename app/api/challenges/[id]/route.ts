import { getSessionUserId } from "@/lib/auth";
import { getChallengeBoard } from "@/lib/challenges";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getSessionUserId();
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const board = await getChallengeBoard(id, userId);
  if (!board) return Response.json({ error: "Desafio não encontrado." }, { status: 404 });

  return Response.json({ board });
}