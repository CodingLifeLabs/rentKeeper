import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/service/auth";
import LandingPage from "@/app/(marketing)/page";

export default async function Home() {
  const user = await getAuthenticatedUser();
  if (user) redirect("/dashboard");
  return <LandingPage />;
}
