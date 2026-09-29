import WordBoardScreen from "@/views/game/WordBoardScreen";
import { getChallengeBoard } from "@/lib/challenges";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

type GamePageProps = {
  searchParams: Promise<{ challenge?: string | string[] }>;
};

export default async function JogoPage({ searchParams }: GamePageProps) {
  const challenge = (await searchParams).challenge;
  const challengeId = typeof challenge === "string" ? challenge : "";
  if (!challengeId) redirect("/desafios");

  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const board = await getChallengeBoard(challengeId, userId);
  if (!board) redirect("/desafios");

  return <WordBoardScreen initialBoard={board} />;
}