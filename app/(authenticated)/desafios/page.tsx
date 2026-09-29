import LoggedHomeScreen from "@/views/home/LoggedHomeScreen";

type DesafiosPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function DesafiosPage({ searchParams }: DesafiosPageProps) {
  const query = (await searchParams).q;
  const initialSearch = typeof query === "string" ? query : "";

  return <LoggedHomeScreen key={initialSearch} initialSearch={initialSearch} />;
}