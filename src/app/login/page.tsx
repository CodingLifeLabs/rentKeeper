import { createServerSupabaseClient } from "@/repo/supabase-server";
import { redirect } from "next/navigation";
import { LoginContent } from "./login-content";

export default async function LoginPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginContent />;
}
