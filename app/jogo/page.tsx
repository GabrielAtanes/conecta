import WordBoardScreen from "@/views/game/WordBoardScreen";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function JogoPage() {
  if (!(await getSessionUserId())) redirect("/login");

  return <WordBoardScreen />;
}