import { createServerSupabaseClient } from "../supabase-server";

export function supabaseServer() {
  return createServerSupabaseClient();
}
