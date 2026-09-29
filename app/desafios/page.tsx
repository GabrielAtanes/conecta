import LoggedHomeScreen from "@/views/home/LoggedHomeScreen";
import { getSessionUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DesafiosPage() {
  if (!(await getSessionUserId())) redirect("/login");

  return <LoggedHomeScreen />;
}