import LoggedHomeScreen from "@/views/home/LoggedHomeScreen";
import { getPublishedChallenges } from "@/lib/challenges";

type DesafiosPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function DesafiosPage({ searchParams }: DesafiosPageProps) {
  const query = (await searchParams).q;
  const initialSearch = typeof query === "string" ? query : "";
  const challenges = await getPublishedChallenges();

  return <LoggedHomeScreen key={initialSearch} initialSearch={initialSearch} challenges={challenges} />;
}