import { createServerClient } from "@supabase/ssr";

// Test mode flag - set to true in test setup
export const TEST_MODE = process.env.NEXT_PUBLIC_SUPABASE_TEST_MODE === "true";

export async function supabaseServer() {
  return createServerSupabaseClient();
}

export async function createServerSupabaseClient() {
  // In test mode, return a mock client
  if (TEST_MODE) {
    return (await import("./__mocks__/supabase-server")).createServerSupabaseClient();
  }

  // Production mode - create real Supabase client
  const { cookies } = await import("next/headers");

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}
