import { createServerSupabaseClient } from "@/repo/supabase-server";
import { getLandlordByUserId, createLandlord } from "@/repo/landlord";

export async function getAuthenticatedUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function getOrCreateLandlord(userId: string, email: string) {
  const existing = await getLandlordByUserId(userId);
  if (existing) return existing;

  return createLandlord({
    userId,
    name: email.split("@")[0],
  });
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Failed to sign out: ${error.message}`);
}
